import cron from 'node-cron';
import { RecurringDonation, IRecurringDonation } from '../models/RecurringDonation';
import { Donation } from '../models/Donation';
import { Campaign } from '../models/Campaign';
import { User } from '../models/User';
import { emailService } from './emailService';
import { AppError } from '../types/index';

export class RecurringDonationService {
  private emailService = emailService;

  constructor() {
    this.initializeScheduler();
  }

  // Initialize cron scheduler for recurring donations
  private initializeScheduler(): void {
    // Run every day at 9 AM to process recurring donations
    cron.schedule('0 9 * * *', async () => {
      await this.processRecurringDonations();
    });
  }

  // Create a new recurring donation
  async createRecurringDonation(donorId: string, campaignId: string, data: any): Promise<IRecurringDonation> {
    // Validate campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }
    
    if (campaign.status !== 'active') {
      throw new AppError('Cannot create recurring donation for inactive campaign', 400);
    }

    // Validate donor exists
    const donor = await User.findById(donorId);
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    // Calculate next payment date based on frequency
    const nextPaymentDate = this.calculateNextPaymentDate(new Date(), data.frequency);

    const recurringDonation = new RecurringDonation({
      donor: donorId,
      campaign: campaignId,
      amount: data.amount,
      frequency: data.frequency,
      status: 'active',
      startDate: new Date(),
      endDate: data.endDate,
      maxOccurrences: data.maxOccurrences,
      currentOccurrence: 0,
      nextPaymentDate,
      paymentMethod: data.paymentMethod,
      totalPaid: 0,
      failedAttempts: 0,
      metadata: data.metadata || {}
    });

    await recurringDonation.save();

    // Send confirmation email
    await this.emailService.sendRecurringDonationConfirmation(donor, campaign, recurringDonation);

    return recurringDonation;
  }

  // Process all due recurring donations
  async processRecurringDonations(): Promise<void> {
    try {
      const dueRecurringDonations = await RecurringDonation.find({
        status: 'active',
        nextPaymentDate: { $lte: new Date() }
      }).populate('donor').populate('campaign');

      for (const recurringDonation of dueRecurringDonations) {
        await this.processRecurringDonation(recurringDonation);
      }
    } catch (error) {
      console.error('Error processing recurring donations:', error);
    }
  }

  // Process a single recurring donation
  private async processRecurringDonation(recurringDonation: IRecurringDonation): Promise<void> {
    try {
      // Check if campaign is still active
      const campaign = await Campaign.findById(recurringDonation.campaign);
      if (!campaign || campaign.status !== 'active') {
        await this.pauseRecurringDonation(recurringDonation._id, 'Campaign is no longer active');
        return;
      }

      // Check if max occurrences reached
      if (recurringDonation.maxOccurrences && 
          recurringDonation.currentOccurrence >= recurringDonation.maxOccurrences) {
        await this.completeRecurringDonation(recurringDonation._id);
        return;
      }

      // Check if end date reached
      if (recurringDonation.endDate && new Date() > recurringDonation.endDate) {
        await this.completeRecurringDonation(recurringDonation._id);
        return;
      }

      // Process payment
      const paymentResult = await this.processPayment(recurringDonation);
      
      if (paymentResult.success) {
        // Create donation record
        const donation = new Donation({
          donor: recurringDonation.donor,
          campaign: recurringDonation.campaign,
          amount: recurringDonation.amount,
          paymentMethod: recurringDonation.paymentMethod,
          status: 'completed',
          transactionId: paymentResult.transactionId,
          recurringDonationId: recurringDonation._id,
          metadata: {
            type: 'recurring',
            occurrence: recurringDonation.currentOccurrence + 1
          }
        });
        
        await donation.save();

        // Update recurring donation
        await RecurringDonation.findByIdAndUpdate(recurringDonation._id, {
          $inc: { currentOccurrence: 1, totalPaid: recurringDonation.amount },
          $set: {
            lastPaymentDate: new Date(),
            lastPaymentStatus: 'success',
            nextPaymentDate: this.calculateNextPaymentDate(new Date(), recurringDonation.frequency),
            failedAttempts: 0
          }
        });

        // Update campaign raised amount
        await Campaign.findByIdAndUpdate(recurringDonation.campaign, {
          $inc: { raisedAmount: recurringDonation.amount }
        });

        // Send success notification
        await this.emailService.sendRecurringDonationSuccess(
          recurringDonation.donor, 
          campaign, 
          recurringDonation, 
          donation
        );

      } else {
        // Handle payment failure
        await this.handlePaymentFailure(recurringDonation, paymentResult.error);
      }

    } catch (error) {
      console.error(`Error processing recurring donation ${recurringDonation._id}:`, error);
      await this.handlePaymentFailure(recurringDonation, error.message);
    }
  }

  // Handle payment failure
  private async handlePaymentFailure(recurringDonation: IRecurringDonation, errorMessage: string): Promise<void> {
    const failedAttempts = recurringDonation.failedAttempts + 1;
    const maxRetries = 3;

    if (failedAttempts >= maxRetries) {
      // Pause recurring donation after max retries
      await RecurringDonation.findByIdAndUpdate(recurringDonation._id, {
        $set: {
          status: 'paused',
          lastPaymentStatus: 'failed',
          failedAttempts: failedAttempts,
          metadata: {
            ...recurringDonation.metadata,
            pauseReason: `Payment failed after ${maxRetries} attempts: ${errorMessage}`
          }
        }
      });

      // Send failure notification
      await this.emailService.sendRecurringDonationFailed(
        recurringDonation.donor,
        recurringDonation.campaign,
        recurringDonation,
        errorMessage
      );
    } else {
      // Retry in 2 days
      const retryDate = new Date();
      retryDate.setDate(retryDate.getDate() + 2);

      await RecurringDonation.findByIdAndUpdate(recurringDonation._id, {
        $set: {
          lastPaymentStatus: 'failed',
          failedAttempts: failedAttempts,
          nextPaymentDate: retryDate
        }
      });
    }
  }

  // Mock payment processing (replace with actual payment gateway integration)
  private async processPayment(recurringDonation: IRecurringDonation): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // TODO: Integrate with actual payment gateway (Razorpay, Stripe, etc.)
      // For now, simulate payment processing
      
      // 95% success rate for simulation
      const isSuccess = Math.random() > 0.05;
      
      if (isSuccess) {
        return {
          success: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        return {
          success: false,
          error: 'Payment gateway error: Insufficient funds or card declined'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate next payment date based on frequency
  private calculateNextPaymentDate(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
    }
    
    return nextDate;
  }

  // Pause recurring donation
  async pauseRecurringDonation(recurringDonationId: string, reason?: string): Promise<IRecurringDonation> {
    const recurringDonation = await RecurringDonation.findByIdAndUpdate(
      recurringDonationId,
      {
        $set: {
          status: 'paused',
          metadata: {
            pauseReason: reason || 'Paused by user'
          }
        }
      },
      { new: true }
    );

    if (!recurringDonation) {
      throw new AppError('Recurring donation not found', 404);
    }

    return recurringDonation;
  }

  // Resume recurring donation
  async resumeRecurringDonation(recurringDonationId: string): Promise<IRecurringDonation> {
    const recurringDonation = await RecurringDonation.findById(recurringDonationId);
    
    if (!recurringDonation) {
      throw new AppError('Recurring donation not found', 404);
    }

    // Validate campaign is still active
    const campaign = await Campaign.findById(recurringDonation.campaign);
    if (!campaign || campaign.status !== 'active') {
      throw new AppError('Cannot resume - campaign is no longer active', 400);
    }

    const updatedRecurringDonation = await RecurringDonation.findByIdAndUpdate(
      recurringDonationId,
      {
        $set: {
          status: 'active',
          nextPaymentDate: this.calculateNextPaymentDate(new Date(), recurringDonation.frequency),
          failedAttempts: 0
        },
        $unset: {
          'metadata.pauseReason': 1
        }
      },
      { new: true }
    );

    return updatedRecurringDonation!;
  }

  // Cancel recurring donation
  async cancelRecurringDonation(recurringDonationId: string, reason?: string): Promise<IRecurringDonation> {
    const recurringDonation = await RecurringDonation.findByIdAndUpdate(
      recurringDonationId,
      {
        $set: {
          status: 'cancelled',
          metadata: {
            cancelReason: reason || 'Cancelled by user'
          }
        }
      },
      { new: true }
    );

    if (!recurringDonation) {
      throw new AppError('Recurring donation not found', 404);
    }

    return recurringDonation;
  }

  // Complete recurring donation
  async completeRecurringDonation(recurringDonationId: string): Promise<IRecurringDonation> {
    const recurringDonation = await RecurringDonation.findByIdAndUpdate(
      recurringDonationId,
      {
        $set: {
          status: 'completed'
        }
      },
      { new: true }
    );

    if (!recurringDonation) {
      throw new AppError('Recurring donation not found', 404);
    }

    return recurringDonation;
  }

  // Get recurring donations for a user
  async getUserRecurringDonations(userId: string, filters: any = {}): Promise<IRecurringDonation[]> {
    const query = { donor: userId, ...filters };
    
    return await RecurringDonation.find(query)
      .populate('campaign', 'title imageUrl creator status')
      .sort({ createdAt: -1 });
  }

  // Get recurring donations for a campaign
  async getCampaignRecurringDonations(campaignId: string, filters: any = {}): Promise<IRecurringDonation[]> {
    const query = { campaign: campaignId, ...filters };
    
    return await RecurringDonation.find(query)
      .populate('donor', 'name email profile.avatar')
      .sort({ createdAt: -1 });
  }

  // Get recurring donation statistics
  async getRecurringDonationStats(campaignId?: string): Promise<any> {
    const matchStage = campaignId ? { campaign: campaignId } : {};
    
    const stats = await RecurringDonation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalActive: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalPaused: {
            $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] }
          },
          totalCancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalCompleted: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalMonthlyValue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'active'] }, { $eq: ['$frequency', 'monthly'] }] },
                '$amount',
                0
              ]
            }
          },
          totalYearlyValue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'active'] },
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ['$frequency', 'weekly'] }, then: { $multiply: ['$amount', 52] } },
                      { case: { $eq: ['$frequency', 'monthly'] }, then: { $multiply: ['$amount', 12] } },
                      { case: { $eq: ['$frequency', 'quarterly'] }, then: { $multiply: ['$amount', 4] } },
                      { case: { $eq: ['$frequency', 'yearly'] }, then: '$amount' }
                    ],
                    default: 0
                  }
                },
                0
              ]
            }
          },
          totalPaid: { $sum: '$totalPaid' }
        }
      }
    ]);

    return stats[0] || {
      totalActive: 0,
      totalPaused: 0,
      totalCancelled: 0,
      totalCompleted: 0,
      totalMonthlyValue: 0,
      totalYearlyValue: 0,
      totalPaid: 0
    };
  }
}

export default new RecurringDonationService();
