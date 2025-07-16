import { WithdrawalRequest, IWithdrawalRequest } from '../models/WithdrawalRequest';
import { Campaign } from '../models/Campaign';
import { User } from '../models/User';
import { Donation } from '../models/Donation';
import { emailService } from './emailService';
import { AppError } from '../types/index';

export class WithdrawalRequestService {
  private emailService = emailService;

  constructor() {
    // Constructor can be empty now
  }

  // Create a new withdrawal request
  async createWithdrawalRequest(campaignId: string, requestedBy: string, data: any): Promise<IWithdrawalRequest> {
    // Validate campaign exists and requester is authorized
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    // Check if requester is campaign creator or admin
    const user = await User.findById(requestedBy);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (campaign.creator.toString() !== requestedBy && user.role !== 'admin') {
      throw new AppError('Not authorized to create withdrawal request for this campaign', 403);
    }

    // Calculate available balance
    const availableBalance = await this.calculateAvailableBalance(campaignId);
    
    if (data.amount > availableBalance) {
      throw new AppError(`Insufficient funds. Available balance: ₹${availableBalance}`, 400);
    }

    // Calculate fees
    const fees = this.calculateFees(data.amount);

    // Create withdrawal request
    const withdrawalRequest = new WithdrawalRequest({
      campaign: campaignId,
      requestedBy,
      amount: data.amount,
      purpose: data.purpose,
      status: 'pending',
      bankAccount: {
        accountNumber: data.bankAccount.accountNumber,
        ifscCode: data.bankAccount.ifscCode,
        accountHolderName: data.bankAccount.accountHolderName,
        bankName: data.bankAccount.bankName
      },
      documents: data.documents || [],
      milestoneId: data.milestoneId,
      fees,
      metadata: {
        priority: data.priority || 'medium',
        category: data.category || 'operational',
        notes: data.notes
      }
    });

    await withdrawalRequest.save();

    // Send notification to admins
    await this.emailService.sendWithdrawalRequestCreated(user, campaign, withdrawalRequest);

    return withdrawalRequest;
  }

  // Calculate available balance for withdrawal
  async calculateAvailableBalance(campaignId: string): Promise<number> {
    // Get total donations for the campaign
    const totalDonations = await Donation.aggregate([
      { $match: { campaign: campaignId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get total withdrawn amount
    const totalWithdrawn = await WithdrawalRequest.aggregate([
      { $match: { campaign: campaignId, status: { $in: ['approved', 'processed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const raised = totalDonations[0]?.total || 0;
    const withdrawn = totalWithdrawn[0]?.total || 0;
    
    return Math.max(0, raised - withdrawn);
  }

  // Calculate processing fees
  private calculateFees(amount: number): { processingFee: number; gstAmount: number; netAmount: number } {
    // Platform fee: 2% + GST (18%)
    const processingFeeRate = 0.02; // 2%
    const gstRate = 0.18; // 18%
    
    const processingFee = amount * processingFeeRate;
    const gstAmount = processingFee * gstRate;
    const netAmount = amount - processingFee - gstAmount;

    return {
      processingFee: Math.round(processingFee * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100
    };
  }

  // Approve withdrawal request
  async approveWithdrawalRequest(
    withdrawalRequestId: string, 
    approvedBy: string, 
    notes?: string
  ): Promise<IWithdrawalRequest> {
    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate('campaign')
      .populate('requestedBy');

    if (!withdrawalRequest) {
      throw new AppError('Withdrawal request not found', 404);
    }

    if (withdrawalRequest.status !== 'pending') {
      throw new AppError('Only pending withdrawal requests can be approved', 400);
    }

    // Check if there's still sufficient balance
    const availableBalance = await this.calculateAvailableBalance(withdrawalRequest.campaign._id.toString());
    if (withdrawalRequest.amount > availableBalance) {
      throw new AppError('Insufficient funds for approval', 400);
    }

    const updatedRequest = await WithdrawalRequest.findByIdAndUpdate(
      withdrawalRequestId,
      {
        $set: {
          status: 'approved',
          approvedBy,
          approvedAt: new Date(),
          'metadata.approvalNotes': notes
        }
      },
      { new: true }
    ).populate('campaign').populate('requestedBy').populate('approvedBy');

    // Send approval notification
    await this.emailService.sendWithdrawalRequestApproved(
      withdrawalRequest.requestedBy,
      withdrawalRequest.campaign,
      updatedRequest!
    );

    return updatedRequest!;
  }

  // Reject withdrawal request
  async rejectWithdrawalRequest(
    withdrawalRequestId: string, 
    rejectedBy: string, 
    rejectionReason: string
  ): Promise<IWithdrawalRequest> {
    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate('campaign')
      .populate('requestedBy');

    if (!withdrawalRequest) {
      throw new AppError('Withdrawal request not found', 404);
    }

    if (withdrawalRequest.status !== 'pending') {
      throw new AppError('Only pending withdrawal requests can be rejected', 400);
    }

    const updatedRequest = await WithdrawalRequest.findByIdAndUpdate(
      withdrawalRequestId,
      {
        $set: {
          status: 'rejected',
          rejectionReason,
          'metadata.rejectedBy': rejectedBy,
          'metadata.rejectedAt': new Date()
        }
      },
      { new: true }
    ).populate('campaign').populate('requestedBy');

    // Send rejection notification
    await this.emailService.sendWithdrawalRequestRejected(
      withdrawalRequest.requestedBy,
      withdrawalRequest.campaign,
      updatedRequest!,
      rejectionReason
    );

    return updatedRequest!;
  }

  // Process withdrawal request (mark as processed after bank transfer)
  async processWithdrawalRequest(
    withdrawalRequestId: string, 
    transactionId: string, 
    processedBy: string
  ): Promise<IWithdrawalRequest> {
    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate('campaign')
      .populate('requestedBy');

    if (!withdrawalRequest) {
      throw new AppError('Withdrawal request not found', 404);
    }

    if (withdrawalRequest.status !== 'approved') {
      throw new AppError('Only approved withdrawal requests can be processed', 400);
    }

    const updatedRequest = await WithdrawalRequest.findByIdAndUpdate(
      withdrawalRequestId,
      {
        $set: {
          status: 'processed',
          transactionId,
          processedAt: new Date(),
          'metadata.processedBy': processedBy
        }
      },
      { new: true }
    ).populate('campaign').populate('requestedBy');

    // Send processing confirmation
    await this.emailService.sendWithdrawalRequestProcessed(
      withdrawalRequest.requestedBy,
      withdrawalRequest.campaign,
      updatedRequest!
    );

    return updatedRequest!;
  }

  // Mark withdrawal request as failed
  async markWithdrawalRequestFailed(
    withdrawalRequestId: string, 
    failureReason: string
  ): Promise<IWithdrawalRequest> {
    const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId)
      .populate('campaign')
      .populate('requestedBy');

    if (!withdrawalRequest) {
      throw new AppError('Withdrawal request not found', 404);
    }

    const updatedRequest = await WithdrawalRequest.findByIdAndUpdate(
      withdrawalRequestId,
      {
        $set: {
          status: 'failed',
          'metadata.failureReason': failureReason,
          'metadata.failedAt': new Date()
        }
      },
      { new: true }
    ).populate('campaign').populate('requestedBy');

    // Send failure notification
    await this.emailService.sendWithdrawalRequestFailed(
      withdrawalRequest.requestedBy,
      withdrawalRequest.campaign,
      updatedRequest!,
      failureReason
    );

    return updatedRequest!;
  }

  // Get withdrawal requests with filters
  async getWithdrawalRequests(filters: any = {}, options: any = {}): Promise<{
    requests: IWithdrawalRequest[];
    total: number;
    pagination: any;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Build query
    const query = { ...filters };

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const requests = await WithdrawalRequest.find(query)
      .populate('campaign', 'title imageUrl creator')
      .populate('requestedBy', 'name email profile')
      .populate('approvedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await WithdrawalRequest.countDocuments(query);

    return {
      requests,
      total,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };
  }

  // Get withdrawal requests for a specific campaign
  async getCampaignWithdrawalRequests(campaignId: string, options: any = {}): Promise<{
    requests: IWithdrawalRequest[];
    total: number;
    availableBalance: number;
    totalWithdrawn: number;
  }> {
    const filters = { campaign: campaignId };
    const result = await this.getWithdrawalRequests(filters, options);
    
    const availableBalance = await this.calculateAvailableBalance(campaignId);
    
    const totalWithdrawn = await WithdrawalRequest.aggregate([
      { $match: { campaign: campaignId, status: { $in: ['approved', 'processed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      ...result,
      availableBalance,
      totalWithdrawn: totalWithdrawn[0]?.total || 0
    };
  }

  // Get withdrawal requests for a specific user
  async getUserWithdrawalRequests(userId: string, options: any = {}): Promise<{
    requests: IWithdrawalRequest[];
    total: number;
  }> {
    const filters = { requestedBy: userId };
    const result = await this.getWithdrawalRequests(filters, options);
    
    return {
      requests: result.requests,
      total: result.total
    };
  }

  // Get withdrawal statistics
  async getWithdrawalStats(campaignId?: string): Promise<any> {
    const matchStage = campaignId ? { campaign: campaignId } : {};
    
    const stats = await WithdrawalRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalApproved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          totalProcessed: {
            $sum: { $cond: [{ $eq: ['$status', 'processed'] }, 1, 0] }
          },
          totalRejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalRequestedAmount: { $sum: '$amount' },
          totalProcessedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'processed'] }, '$amount', 0] }
          },
          totalFees: { $sum: '$fees.processingFee' },
          totalGst: { $sum: '$fees.gstAmount' },
          averageProcessingTime: {
            $avg: {
              $cond: [
                { $and: [{ $ne: ['$approvedAt', null] }, { $ne: ['$createdAt', null] }] },
                { $subtract: ['$approvedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalPending: 0,
      totalApproved: 0,
      totalProcessed: 0,
      totalRejected: 0,
      totalFailed: 0,
      totalRequestedAmount: 0,
      totalProcessedAmount: 0,
      totalFees: 0,
      totalGst: 0,
      averageProcessingTime: 0
    };

    // Convert average processing time from milliseconds to days
    if (result.averageProcessingTime) {
      result.averageProcessingTime = Math.round(result.averageProcessingTime / (1000 * 60 * 60 * 24) * 100) / 100;
    }

    return result;
  }

  // Bulk approve withdrawal requests
  async bulkApproveWithdrawalRequests(
    withdrawalRequestIds: string[], 
    approvedBy: string, 
    notes?: string
  ): Promise<IWithdrawalRequest[]> {
    const results = [];
    
    for (const id of withdrawalRequestIds) {
      try {
        const approved = await this.approveWithdrawalRequest(id, approvedBy, notes);
        results.push(approved);
      } catch (error) {
        console.error(`Failed to approve withdrawal request ${id}:`, error.message);
      }
    }
    
    return results;
  }

  // Get pending withdrawal requests requiring urgent attention
  async getUrgentWithdrawalRequests(): Promise<IWithdrawalRequest[]> {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return await WithdrawalRequest.find({
      status: 'pending',
      $or: [
        { 'metadata.priority': 'urgent' },
        { 'metadata.priority': 'high' },
        { createdAt: { $lte: threeDaysAgo } }
      ]
    })
    .populate('campaign', 'title creator')
    .populate('requestedBy', 'name email')
    .sort({ createdAt: 1 });
  }
}

export default new WithdrawalRequestService();
