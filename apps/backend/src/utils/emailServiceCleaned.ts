import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { User } from '../models/User';

// Ensure environment variables are loaded
dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  loginUrl?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('🔧 Initializing email service with credentials...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Password Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'NOT SET');
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      authMethod: 'PLAIN',
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      }
    });

    // Verify email configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      console.log(`📧 Sending email to: ${options.to}`);
      console.log(`📝 Subject: ${options.subject}`);
      
      const result = await this.transporter.sendMail(options);
      console.log('✅ Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const subject = 'Welcome to DilSeDaan - Your Charity Platform 🙏';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>${this.getEmailStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🙏 Welcome to DilSeDaan!</h1>
          <p class="hindi">दिल से दान - From the Heart</p>
        </div>
        <div class="content">
          <h2>Welcome ${data.name}!</h2>
          <p>Thank you for joining DilSeDaan, India's trusted charity platform where every rupee makes a difference.</p>
          
          <div class="features">
            <h3>What you can do:</h3>
            <ul>
              <li>✅ Donate to verified campaigns</li>
              <li>📊 Track your donation impact</li>
              <li>🎯 Create your own fundraising campaigns</li>
              <li>🔍 Browse categories: Education, Healthcare, Environment & more</li>
            </ul>
          </div>
          
          <div class="cta-section">
            <a href="${data.loginUrl || process.env.FRONTEND_URL + '/login'}" class="cta-button">
              Start Making a Difference
            </a>
          </div>
          
          <p>Need help? We're here for you at <a href="mailto:support@dilsedaan.com">support@dilsedaan.com</a></p>
        </div>
        <div class="footer">
          <p>Together, we can create positive change across India.</p>
          <p>DilSeDaan Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return await this.sendEmail({
      to: data.email,
      subject,
      html,
      text: `Welcome to DilSeDaan, ${data.name}! Start making a difference today.`
    });
  }

  // Post-submission enhancement: Campaign Approval Email
  async sendCampaignApprovalEmail(to: string, campaignData: any): Promise<boolean> {
    try {
      const subject = `✅ Campaign Approved: ${campaignData.title}`;
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${this.getEmailStyles()}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Campaign Approved!</h1>
            </div>
            <div class="content">
              <div class="success-alert">
                <h2>Congratulations! Your campaign has been approved</h2>
                <p>Your campaign "${campaignData.title}" has been reviewed and approved by our team.</p>
              </div>
              
              <div class="campaign-details">
                <h3>Campaign Summary</h3>
                <div class="detail-row">
                  <span><strong>Campaign:</strong></span>
                  <span>${campaignData.title}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Target Amount:</strong></span>
                  <span>₹${campaignData.targetAmount?.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Category:</strong></span>
                  <span>${campaignData.category}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Duration:</strong></span>
                  <span>${campaignData.duration || '30 days'}</span>
                </div>
              </div>

              <div class="action-section">
                <h3>What happens next?</h3>
                <ul>
                  <li>✅ Your campaign is now live and accepting donations</li>
                  <li>📢 Share your campaign with friends and family</li>
                  <li>📊 Track your progress in the dashboard</li>
                  <li>📝 Post regular updates to keep donors engaged</li>
                </ul>
              </div>

              <div class="cta-section">
                <a href="${process.env.FRONTEND_URL}/campaigns/${campaignData._id}" class="cta-button">
                  View Your Campaign
                </a>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button secondary">
                  Go to Dashboard
                </a>
              </div>

              <div class="tips-section">
                <h3>💡 Tips for Campaign Success</h3>
                <ul>
                  <li>Share regular updates about your progress</li>
                  <li>Thank your donors personally when possible</li>
                  <li>Use social media to spread awareness</li>
                  <li>Post photos and videos to show transparency</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for using DilSeDaan to make a difference!</p>
              <p>Need help? Contact us at support@dilsedaan.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({
        to,
        subject,
        html,
        text: `Your campaign "${campaignData.title}" has been approved and is now live!`
      });
    } catch (error) {
      console.error('Failed to send campaign approval email:', error);
      return false;
    }
  }

  // Post-submission enhancement: Password Reset Email
  async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const subject = '🔐 Password Reset Request - DilSeDaan';
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${this.getEmailStyles()}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <div class="info-alert">
                <h2>Password Reset Request</h2>
                <p>Hello ${userName},</p>
                <p>We received a request to reset your DilSeDaan account password.</p>
              </div>

              <div class="action-section">
                <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                <div class="cta-section">
                  <a href="${resetUrl}" class="cta-button">
                    Reset Password
                  </a>
                </div>
                <p><small>If the button doesn't work, copy and paste this link: ${resetUrl}</small></p>
              </div>

              <div class="warning-alert">
                <h3>⚠️ Security Notice</h3>
                <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>For security reasons, never share this reset link with anyone.</p>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent because a password reset was requested for your account.</p>
              <p>If you need help, contact us at support@dilsedaan.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({
        to,
        subject,
        html,
        text: `Password reset requested. Visit: ${resetUrl}`
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Post-submission enhancement: Enhanced Donation Confirmation Email
  async sendDonationConfirmationEmail(to: string, donationData: any): Promise<boolean> {
    try {
      const subject = `🙏 Thank you for your donation to ${donationData.campaignTitle}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${this.getEmailStyles()}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🙏 Thank You for Your Generosity!</h1>
            </div>
            <div class="content">
              <div class="success-alert">
                <h2>Your donation has been received</h2>
                <p>Thank you for supporting "${donationData.campaignTitle}". Your kindness will make a real difference!</p>
              </div>

              <div class="donation-receipt">
                <h3>📄 Donation Receipt</h3>
                <div class="detail-row">
                  <span><strong>Donation ID:</strong></span>
                  <span>${donationData.donationId}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Amount:</strong></span>
                  <span>₹${donationData.amount?.toLocaleString()}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Payment Method:</strong></span>
                  <span>${donationData.paymentMethod}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Date:</strong></span>
                  <span>${new Date(donationData.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Transaction ID:</strong></span>
                  <span>${donationData.transactionId}</span>
                </div>
              </div>

              <div class="impact-section">
                <h3>🌟 Your Impact</h3>
                <p>Your donation of ₹${donationData.amount?.toLocaleString()} brings this campaign closer to its goal!</p>
                
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${donationData.campaignProgress || 0}%"></div>
                </div>
                
                <div class="progress-stats">
                  <div class="stat-item">
                    <div class="stat-number">₹${donationData.campaignRaised?.toLocaleString()}</div>
                    <div class="stat-label">Total Raised</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">${donationData.donorCount || 0}</div>
                    <div class="stat-label">Donors</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">${donationData.campaignProgress?.toFixed(1) || 0}%</div>
                    <div class="stat-label">Progress</div>
                  </div>
                </div>
              </div>

              <div class="action-section">
                <h3>Stay Connected</h3>
                <p>Follow the campaign progress and see how your donation is making a difference:</p>
                <div class="cta-section">
                  <a href="${process.env.FRONTEND_URL}/campaigns/${donationData.campaignId}" class="cta-button">
                    View Campaign Updates
                  </a>
                  <a href="${process.env.FRONTEND_URL}/dashboard/donations" class="cta-button secondary">
                    My Donations
                  </a>
                </div>
              </div>

              <div class="tips-section">
                <h3>📢 Spread the Word</h3>
                <p>Help this campaign reach more people by sharing it with your network!</p>
                <div class="social-buttons">
                  <a href="https://twitter.com/intent/tweet?text=I just donated to ${encodeURIComponent(donationData.campaignTitle)} on @DilSeDaan. Join me in making a difference! ${process.env.FRONTEND_URL}/campaigns/${donationData.campaignId}" class="social-button">Share on Twitter</a>
                  <a href="https://www.facebook.com/sharer/sharer.php?u=${process.env.FRONTEND_URL}/campaigns/${donationData.campaignId}" class="social-button">Share on Facebook</a>
                </div>
              </div>
            </div>
            <div class="footer">
              <p>This receipt serves as confirmation of your donation for tax purposes.</p>
              <p>Questions? Contact us at support@dilsedaan.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({
        to,
        subject,
        html,
        text: `Thank you for donating ₹${donationData.amount} to ${donationData.campaignTitle}. Donation ID: ${donationData.donationId}`
      });
    } catch (error) {
      console.error('Failed to send donation confirmation email:', error);
      return false;
    }
  }

  // Post-submission enhancement: Campaign Progress Update Email
  async sendCampaignProgressEmail(to: string, progressData: any): Promise<boolean> {
    try {
      const subject = `📈 Great news! ${progressData.campaignTitle} reached ${progressData.milestone}% funding`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>${this.getEmailStyles()}</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Milestone Achieved!</h1>
            </div>
            <div class="content">
              <div class="success-alert">
                <h2>Your campaign reached ${progressData.milestone}% funding!</h2>
                <p>"${progressData.campaignTitle}" is making excellent progress thanks to generous supporters like our donors.</p>
              </div>

              <div class="progress-section">
                <h3>📊 Current Progress</h3>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progressData.currentProgress}%"></div>
                </div>
                
                <div class="progress-stats">
                  <div class="stat-item">
                    <div class="stat-number">₹${progressData.raisedAmount?.toLocaleString()}</div>
                    <div class="stat-label">Raised</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">₹${progressData.targetAmount?.toLocaleString()}</div>
                    <div class="stat-label">Goal</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">${progressData.donorCount}</div>
                    <div class="stat-label">Supporters</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-number">${progressData.daysLeft}</div>
                    <div class="stat-label">Days Left</div>
                  </div>
                </div>
              </div>

              <div class="update-section">
                <h3>📝 Latest Update from Campaign Creator</h3>
                <div class="update-card">
                  <p>"${progressData.latestUpdate || 'Thank you all for your amazing support! We are getting closer to our goal every day.'}"</p>
                  <p><small>- ${progressData.creatorName}</small></p>
                </div>
              </div>

              <div class="action-section">
                <h3>🚀 Keep the Momentum Going</h3>
                <p>Help us reach the final goal by sharing with your network:</p>
                <div class="cta-section">
                  <a href="${process.env.FRONTEND_URL}/campaigns/${progressData.campaignId}" class="cta-button">
                    View Full Campaign
                  </a>
                  <a href="${process.env.FRONTEND_URL}/campaigns/${progressData.campaignId}/share" class="cta-button secondary">
                    Share Campaign
                  </a>
                </div>
              </div>

              <div class="impact-section">
                <h3>🌟 Impact So Far</h3>
                <ul>
                  ${progressData.impacts?.map((impact: string) => `<li>${impact}</li>`).join('') || '<li>Making a positive difference in the community</li>'}
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for being part of this journey!</p>
              <p>Stay updated: <a href="${process.env.FRONTEND_URL}/campaigns/${progressData.campaignId}">Campaign Page</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await this.sendEmail({
        to,
        subject,
        html,
        text: `Great news! ${progressData.campaignTitle} has reached ${progressData.milestone}% of its funding goal. Total raised: ₹${progressData.raisedAmount?.toLocaleString()}`
      });
    } catch (error) {
      console.error('Failed to send campaign progress email:', error);
      return false;
    }
  }

  // Enhanced email styles with additional components
  private getEmailStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #f97316 0%, #16a34a 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      .header h1 {
        font-size: 28px;
        margin-bottom: 10px;
        font-weight: 700;
      }
      .hindi {
        font-style: italic;
        opacity: 0.9;
      }
      .content {
        padding: 40px 30px;
      }
      .success-alert, .info-alert, .warning-alert {
        border-radius: 15px;
        padding: 25px;
        margin: 25px 0;
        border-left: 5px solid;
      }
      .success-alert {
        background: #f0fdf4;
        border-color: #16a34a;
        color: #166534;
      }
      .info-alert {
        background: #eff6ff;
        border-color: #3b82f6;
        color: #1e40af;
      }
      .warning-alert {
        background: #fefbef;
        border-color: #f59e0b;
        color: #92400e;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #f97316 0%, #16a34a 100%);
        color: white;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 600;
        margin: 10px 10px 10px 0;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
      }
      .cta-button.secondary {
        background: #6b7280;
        box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
      }
      .cta-section {
        text-align: center;
        margin: 30px 0;
      }
      .action-section, .update-section, .progress-section {
        margin: 30px 0;
      }
      .donation-receipt, .campaign-details, .update-card {
        background: #f8fafc;
        border-radius: 15px;
        padding: 25px;
        margin: 25px 0;
      }
      .detail-item, .detail-row {
        padding: 8px 0;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
      }
      .detail-row:last-child {
        border-bottom: none;
      }
      .progress-bar {
        width: 100%;
        height: 20px;
        background: #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
        margin: 15px 0;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #f97316 0%, #16a34a 100%);
        border-radius: 10px;
        transition: width 0.3s ease;
      }
      .progress-stats {
        display: flex;
        justify-content: space-around;
        margin: 20px 0;
        flex-wrap: wrap;
      }
      .stat-item {
        text-align: center;
        min-width: 100px;
        margin: 10px 5px;
      }
      .stat-number {
        font-size: 24px;
        font-weight: bold;
        color: #f97316;
      }
      .stat-label {
        font-size: 14px;
        color: #6b7280;
      }
      .tips-section, .impact-section {
        background: #f0fdf4;
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
      }
      .social-buttons {
        text-align: center;
        margin: 20px 0;
      }
      .social-button {
        display: inline-block;
        background: #1d4ed8;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 25px;
        margin: 5px;
        font-size: 14px;
      }
      .footer {
        background: #f9fafb;
        padding: 30px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
      }
      .features ul {
        padding-left: 20px;
      }
      .features li {
        margin: 8px 0;
      }
      ul {
        padding-left: 20px;
      }
      li {
        margin: 8px 0;
      }
      @media (max-width: 600px) {
        .container {
          margin: 10px;
          border-radius: 15px;
        }
        .header, .content {
          padding: 20px;
        }
        .progress-stats {
          flex-direction: column;
          align-items: center;
        }
        .stat-item {
          margin: 5px 0;
        }
      }
    `;
  }
}

export const emailService = new EmailService();
