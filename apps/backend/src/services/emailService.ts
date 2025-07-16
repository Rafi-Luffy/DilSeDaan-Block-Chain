import nodemailer from 'nodemailer';
import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { Donation } from '../models/Donation';

// Email service configuration
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Can be changed to SendGrid, AWS SES, etc.
      auth: {
        user: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  // Send email verification
  async sendEmailVerification(user: any, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '🙏 Welcome to DilSeDaan - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to DilSeDaan! 🙏</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for joining our mission to make charity transparent and impactful. Please verify your email address to complete your registration.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Where hearts connect with hope<br>
            Building trust through blockchain transparency
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: email,
      subject: '🔐 DilSeDaan - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request 🔐</h2>
          <p>Dear ${userName},</p>
          <p>We received a request to reset your password for your DilSeDaan account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email or contact our support team.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This reset link will expire in 10 minutes for security reasons.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan Security Team<br>
            If you have concerns, contact us at security@dilsedaan.org
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send password reset email
  async sendPasswordReset(user: any, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '🔐 DilSeDaan - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Password Reset Request 🔐</h2>
          <p>Dear ${user.name},</p>
          <p>We received a request to reset your password for your DilSeDaan account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email or contact our support team.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This reset link will expire in 1 hour for security reasons.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan Security Team<br>
            If you have concerns, contact us at security@dilsedaan.org
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send donation confirmation
  async sendDonationConfirmation(donation: any, campaign: any, donor: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: donor.email,
      subject: `💝 Thank you for your donation to "${campaign.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Thank You for Your Generous Donation! 💝</h2>
          <p>Dear ${donor.name},</p>
          <p>Your donation has been successfully processed. Here are the details:</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Donation Details</h3>
            <p><strong>Campaign:</strong> ${campaign.title}</p>
            <p><strong>Amount:</strong> ₹${donation.amount.toLocaleString()}</p>
            <p><strong>Transaction ID:</strong> ${donation._id}</p>
            <p><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString('en-IN')}</p>
            <p><strong>Payment Method:</strong> ${donation.paymentMethod}</p>
          </div>
          
          <p>Your donation is making a real difference! You'll receive updates on how your contribution is being used.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/transparency" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Your Donation
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Tax Benefits:</strong> This donation is eligible for 80G tax deduction. Your receipt has been generated and can be downloaded from your dashboard.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Transparent. Trustworthy. Transformational.<br>
            Track your donation on blockchain: ${process.env.FRONTEND_URL}/transparency
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send campaign approval notification
  async sendCampaignApproval(campaign: any, creator: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: creator.email,
      subject: `🎉 Your campaign "${campaign.title}" has been approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Congratulations! Your Campaign is Live! 🎉</h2>
          <p>Dear ${creator.name},</p>
          <p>Great news! Your campaign has been approved and is now live on DilSeDaan.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #15803d;">Campaign Details</h3>
            <p><strong>Title:</strong> ${campaign.title}</p>
            <p><strong>Target Amount:</strong> ₹${campaign.targetAmount.toLocaleString()}</p>
            <p><strong>Category:</strong> ${campaign.category}</p>
            <p><strong>Status:</strong> Active and receiving donations</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/campaigns/${campaign._id}" 
               style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Your Campaign
            </a>
          </div>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Share your campaign with friends and family</li>
            <li>Post regular updates about your progress</li>
            <li>Upload photos and videos showing impact</li>
            <li>Respond to donor messages and questions</li>
          </ul>
          
          <p style="color: #666; font-size: 14px;">
            Remember: All donations are tracked on blockchain for complete transparency. Donors can see exactly how their money is being used.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan Campaign Team<br>
            Need help? Contact us at support@dilsedaan.org
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send campaign rejection notification
  async sendCampaignRejection(campaign: any, creator: any, reason: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: creator.email,
      subject: `Campaign Review Update: "${campaign.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Campaign Review Update</h2>
          <p>Dear ${creator.name},</p>
          <p>Thank you for submitting your campaign "${campaign.title}" to DilSeDaan.</p>
          
          <p>After careful review, we need some modifications before we can approve your campaign:</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Review Feedback:</h3>
            <p>${reason}</p>
          </div>
          
          <h3>How to Proceed:</h3>
          <ol>
            <li>Log into your DilSeDaan account</li>
            <li>Go to your campaign dashboard</li>
            <li>Make the necessary changes based on our feedback</li>
            <li>Resubmit for review</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/campaigns" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Edit Campaign
            </a>
          </div>
          
          <p>We're here to help you succeed! Don't hesitate to reach out if you have questions.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan Review Team<br>
            Questions? Contact us at review@dilsedaan.org
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send weekly campaign update to donors
  async sendCampaignUpdate(campaign: any, donors: any[], updateMessage: string): Promise<void> {
    const promises = donors.map(donor => {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
        to: donor.email,
        subject: `📈 Update from "${campaign.title}" - Your Impact in Action!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Campaign Update: Your Impact in Action! 📈</h2>
            <p>Dear ${donor.name},</p>
            <p>Here's an update from "${campaign.title}" - a campaign you generously supported.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Latest Update</h3>
              <p>${updateMessage}</p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Campaign Progress</h3>
              <p><strong>Raised:</strong> ₹${campaign.raisedAmount.toLocaleString()} of ₹${campaign.targetAmount.toLocaleString()}</p>
              <p><strong>Progress:</strong> ${Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}%</p>
              <p><strong>Donors:</strong> ${campaign.donorCount} amazing people like you</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/campaigns/${campaign._id}" 
                 style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Full Update
              </a>
            </div>
            
            <p>Thank you for being part of this incredible journey of positive change!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              DilSeDaan - Your transparency partner<br>
              Track this campaign: ${process.env.FRONTEND_URL}/campaigns/${campaign._id}
            </p>
          </div>
        `
      };
      return this.transporter.sendMail(mailOptions);
    });

    await Promise.all(promises);
  }

  // Send recurring donation confirmation
  async sendRecurringDonationConfirmation(user: any, campaign: any, recurringDonation: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '🔄 Recurring Donation Setup Confirmed - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Recurring Donation Setup Confirmed! 🔄</h2>
          <p>Dear ${user.name},</p>
          <p>Thank you for setting up a recurring donation to support <strong>${campaign.title}</strong>.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Donation Details:</h3>
            <p><strong>Amount:</strong> ₹${recurringDonation.amount}</p>
            <p><strong>Frequency:</strong> ${recurringDonation.frequency}</p>
            <p><strong>Next Payment:</strong> ${new Date(recurringDonation.nextPaymentDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p>Your recurring donation will be automatically processed according to your chosen frequency. You can modify or cancel this at any time from your dashboard.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/recurring-donations" 
               style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Manage Recurring Donations
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Consistent support, lasting impact
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send recurring donation success notification
  async sendRecurringDonationSuccess(user: any, campaign: any, recurringDonation: any, donation: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '✅ Recurring Donation Processed Successfully - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Recurring Donation Processed! ✅</h2>
          <p>Dear ${user.name},</p>
          <p>Your recurring donation to <strong>${campaign.title}</strong> has been successfully processed.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Payment Details:</h3>
            <p><strong>Amount:</strong> ₹${donation.amount}</p>
            <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
            <p><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</p>
            <p><strong>Occurrence:</strong> ${donation.metadata?.occurrence || 1} of ${recurringDonation.maxOccurrences || '∞'}</p>
          </div>
          
          <p>Next payment will be processed on: <strong>${new Date(recurringDonation.nextPaymentDate).toLocaleDateString()}</strong></p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/campaigns/${campaign._id}" 
               style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Campaign
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Thank you for your continued support!
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send recurring donation failure notification
  async sendRecurringDonationFailed(user: any, campaign: any, recurringDonation: any, errorMessage: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '⚠️ Recurring Donation Payment Failed - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Recurring Donation Payment Failed ⚠️</h2>
          <p>Dear ${user.name},</p>
          <p>We were unable to process your recurring donation to <strong>${campaign.title}</strong>.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Payment Details:</h3>
            <p><strong>Amount:</strong> ₹${recurringDonation.amount}</p>
            <p><strong>Failed Attempts:</strong> ${recurringDonation.failedAttempts}</p>
            <p><strong>Reason:</strong> ${errorMessage}</p>
          </div>
          
          <p>Your recurring donation has been ${recurringDonation.failedAttempts >= 3 ? 'paused' : 'scheduled for retry'}. Please check your payment method and update if necessary.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/recurring-donations" 
               style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Update Payment Method
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - We're here to help resolve any issues
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send withdrawal request created notification
  async sendWithdrawalRequestCreated(user: any, campaign: any, withdrawalRequest: any): Promise<void> {
    // Send to admins
    const admins = await User.find({ role: 'admin', 'preferences.emailNotifications': true });
    
    const promises = admins.map(async (admin) => {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
        to: admin.email,
        subject: '🏦 New Withdrawal Request - Admin Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">New Withdrawal Request 🏦</h2>
            <p>Dear Admin,</p>
            <p>A new withdrawal request has been submitted and requires your review.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Request Details:</h3>
              <p><strong>Campaign:</strong> ${campaign.title}</p>
              <p><strong>Requested By:</strong> ${user.name} (${user.email})</p>
              <p><strong>Amount:</strong> ₹${withdrawalRequest.amount}</p>
              <p><strong>Purpose:</strong> ${withdrawalRequest.purpose}</p>
              <p><strong>Priority:</strong> ${withdrawalRequest.metadata?.priority || 'Medium'}</p>
              <p><strong>Net Amount:</strong> ₹${withdrawalRequest.fees.netAmount}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/admin/withdrawal-requests/${withdrawalRequest._id}" 
                 style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Review Request
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              DilSeDaan Admin Panel - Withdrawal Management
            </p>
          </div>
        `
      };
      return this.transporter.sendMail(mailOptions);
    });

    await Promise.all(promises);
  }

  // Send withdrawal request approved notification
  async sendWithdrawalRequestApproved(user: any, campaign: any, withdrawalRequest: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '✅ Withdrawal Request Approved - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Withdrawal Request Approved! ✅</h2>
          <p>Dear ${user.name},</p>
          <p>Great news! Your withdrawal request for <strong>${campaign.title}</strong> has been approved.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Approved Request Details:</h3>
            <p><strong>Amount:</strong> ₹${withdrawalRequest.amount}</p>
            <p><strong>Processing Fee:</strong> ₹${withdrawalRequest.fees.processingFee}</p>
            <p><strong>GST:</strong> ₹${withdrawalRequest.fees.gstAmount}</p>
            <p><strong>Net Amount:</strong> ₹${withdrawalRequest.fees.netAmount}</p>
            <p><strong>Approved On:</strong> ${new Date(withdrawalRequest.approvedAt).toLocaleDateString()}</p>
          </div>
          
          <p>The funds will be transferred to your registered bank account within 3-5 business days.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/withdrawals" 
               style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Withdrawal
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Funds will be transferred shortly
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send withdrawal request rejected notification
  async sendWithdrawalRequestRejected(user: any, campaign: any, withdrawalRequest: any, rejectionReason: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '❌ Withdrawal Request Rejected - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Withdrawal Request Rejected ❌</h2>
          <p>Dear ${user.name},</p>
          <p>We regret to inform you that your withdrawal request for <strong>${campaign.title}</strong> has been rejected.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Rejection Details:</h3>
            <p><strong>Amount:</strong> ₹${withdrawalRequest.amount}</p>
            <p><strong>Reason:</strong> ${rejectionReason}</p>
            <p><strong>Rejected On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Please review the rejection reason and feel free to submit a new request addressing the concerns raised.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/withdrawals" 
               style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Create New Request
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Contact support if you need assistance
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send withdrawal request processed notification
  async sendWithdrawalRequestProcessed(user: any, campaign: any, withdrawalRequest: any): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '💰 Withdrawal Processed Successfully - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Withdrawal Processed Successfully! 💰</h2>
          <p>Dear ${user.name},</p>
          <p>Your withdrawal request for <strong>${campaign.title}</strong> has been successfully processed.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">Transaction Details:</h3>
            <p><strong>Amount Transferred:</strong> ₹${withdrawalRequest.fees.netAmount}</p>
            <p><strong>Transaction ID:</strong> ${withdrawalRequest.transactionId}</p>
            <p><strong>Processed On:</strong> ${new Date(withdrawalRequest.processedAt).toLocaleDateString()}</p>
            <p><strong>Bank Account:</strong> ***${withdrawalRequest.bankAccount.accountNumber.slice(-4)}</p>
          </div>
          
          <p>The funds should reflect in your bank account within 24-48 hours. Please check your bank statement for confirmation.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/withdrawals/${withdrawalRequest._id}" 
               style="background-color: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Details
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - Transfer completed successfully
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send withdrawal request failed notification
  async sendWithdrawalRequestFailed(user: any, campaign: any, withdrawalRequest: any, failureReason: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
      to: user.email,
      subject: '⚠️ Withdrawal Processing Failed - DilSeDaan',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Withdrawal Processing Failed ⚠️</h2>
          <p>Dear ${user.name},</p>
          <p>We encountered an issue while processing your withdrawal request for <strong>${campaign.title}</strong>.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Failure Details:</h3>
            <p><strong>Amount:</strong> ₹${withdrawalRequest.amount}</p>
            <p><strong>Reason:</strong> ${failureReason}</p>
            <p><strong>Failed On:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Our team is working to resolve this issue. We will contact you shortly with an update. You may also reach out to our support team for immediate assistance.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/support" 
               style="background-color: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contact Support
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            DilSeDaan - We apologize for the inconvenience
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
