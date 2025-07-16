const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class EnhancedEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Enhanced email templates
  static EMAIL_TEMPLATES = {
    WELCOME: 'welcome',
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    DONATION_CONFIRMATION: 'donation_confirmation',
    CAMPAIGN_APPROVED: 'campaign_approved',
    MILESTONE_REACHED: 'milestone_reached',
    TWO_FACTOR_SETUP: 'two_factor_setup'
  };

  async sendWelcomeEmail(user) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to DilSeDaan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .social-links { text-align: center; margin: 30px 0; }
        .social-links a { margin: 0 10px; }
        .footer { text-align: center; color: #666; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤝 Welcome to DilSeDaan!</h1>
          <p>India's Most Transparent Charity Platform</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name}! 👋</h2>
          <p>Thank you for joining DilSeDaan - where every donation creates real, trackable impact!</p>
          
          <h3>🎯 What makes DilSeDaan special:</h3>
          <ul>
            <li>✅ <strong>100% Transparency:</strong> Track every rupee with blockchain technology</li>
            <li>✅ <strong>Lowest Fees:</strong> 57-83% lower than competitors</li>
            <li>✅ <strong>Verified Campaigns:</strong> Government-grade verification process</li>
            <li>✅ <strong>Real Impact:</strong> See photos and updates of your donations at work</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">🚀 Start Exploring Campaigns</a>
          </div>

          <h3>🔐 Secure Your Account:</h3>
          <p>For maximum security, we recommend enabling Two-Factor Authentication:</p>
          <a href="${process.env.FRONTEND_URL}/settings/security" class="button">Enable 2FA</a>

          <div class="social-links">
            <p>📱 Share DilSeDaan with friends:</p>
            <a href="https://twitter.com/intent/tweet?text=I%20just%20joined%20DilSeDaan%20-%20India%27s%20most%20transparent%20charity%20platform!&url=${process.env.FRONTEND_URL}">Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${process.env.FRONTEND_URL}">Facebook</a>
            <a href="https://wa.me/?text=Check%20out%20DilSeDaan%20-%20India%27s%20most%20transparent%20charity%20platform!%20${process.env.FRONTEND_URL}">WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          <p>Questions? Reply to this email or contact support@dilsedaan.org</p>
          <p>&copy; 2025 DilSeDaan. Making charity transparent and impactful.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: `"DilSeDaan" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🤝 Welcome to DilSeDaan - Start Making Transparent Impact!',
      html
    });
  }

  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email - DilSeDaan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .security-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name}!</h2>
          <p>Thanks for registering with DilSeDaan! To complete your account setup and start making transparent donations, please verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">✅ Verify Email Address</a>
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Notice:</strong>
            <ul>
              <li>This link expires in 24 hours</li>
              <li>If you didn't create this account, please ignore this email</li>
              <li>Never share this verification link with anyone</li>
            </ul>
          </div>

          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>✅ Create and manage campaigns</li>
            <li>✅ Make secure donations</li>
            <li>✅ Track donation impact</li>
            <li>✅ Access exclusive features</li>
          </ul>

          <p><strong>Alternative:</strong> Copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: `"DilSeDaan Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Verify Your DilSeDaan Account - Action Required',
      html
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - DilSeDaan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name},</h2>
          <p>We received a request to reset your DilSeDaan account password. If this was you, click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">🔄 Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Information:</strong>
            <ul>
              <li>This link expires in 15 minutes for security</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password remains unchanged until you create a new one</li>
              <li>Consider enabling 2FA after resetting your password</li>
            </ul>
          </div>

          <p><strong>Alternative method:</strong> Copy and paste this link:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 5px;">${resetUrl}</p>

          <p><strong>Need help?</strong> Contact our support team at security@dilsedaan.org</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: `"DilSeDaan Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔒 Password Reset Request - DilSeDaan',
      html
    });
  }

  async sendDonationConfirmation(donation, campaign, donor) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Donation Confirmation - DilSeDaan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .donation-details { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50; }
        .impact-section { background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; background: #2196F3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💚 Thank You for Your Donation!</h1>
          <p>Your generosity is making a real difference</p>
        </div>
        <div class="content">
          <h2>Dear ${donor.name},</h2>
          <p>🎉 Your donation has been successfully processed! Thank you for supporting "${campaign.title}".</p>
          
          <div class="donation-details">
            <h3>📋 Donation Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Campaign:</strong></td><td>${campaign.title}</td></tr>
              <tr><td><strong>Amount:</strong></td><td>₹${donation.amount.toLocaleString('en-IN')}</td></tr>
              <tr><td><strong>Date:</strong></td><td>${new Date(donation.createdAt).toLocaleDateString('en-IN')}</td></tr>
              <tr><td><strong>Transaction ID:</strong></td><td>${donation.transactionId}</td></tr>
              <tr><td><strong>Payment Method:</strong></td><td>${donation.paymentMethod}</td></tr>
            </table>
          </div>

          <div class="impact-section">
            <h3>🌟 Your Impact:</h3>
            <p>Campaign Progress: ${campaign.raisedAmount} of ₹${campaign.targetAmount} raised (${Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}%)</p>
            <div style="background: #ddd; border-radius: 10px; overflow: hidden;">
              <div style="width: ${Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)}%; background: #4CAF50; height: 20px; border-radius: 10px;"></div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/campaigns/${campaign._id}" class="button">📊 Track Impact</a>
            <a href="${process.env.FRONTEND_URL}/donations/${donation._id}/receipt" class="button">📄 Download Receipt</a>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>✅ Your donation is secured on the blockchain for transparency</li>
            <li>✅ You'll receive updates as the campaign progresses</li>
            <li>✅ Campaign creator will share impact photos and reports</li>
            <li>✅ You can track every rupee's journey</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <p>📱 Share your good deed:</p>
            <a href="https://twitter.com/intent/tweet?text=I%20just%20donated%20₹${donation.amount}%20to%20${encodeURIComponent(campaign.title)}%20via%20@DilSeDaan!%20Every%20rupee%20is%20tracked%20with%20blockchain%20transparency.&url=${process.env.FRONTEND_URL}/campaigns/${campaign._id}">Share on Twitter</a> |
            <a href="https://wa.me/?text=I%20just%20made%20a%20transparent%20donation%20via%20DilSeDaan!%20Check%20it%20out:%20${process.env.FRONTEND_URL}/campaigns/${campaign._id}">Share on WhatsApp</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: `"DilSeDaan" <${process.env.EMAIL_USER}>`,
      to: donor.email,
      subject: `💚 Donation Confirmation - ₹${donation.amount.toLocaleString('en-IN')} for ${campaign.title}`,
      html
    });
  }

  async sendCampaignApprovalEmail(campaign, creator) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Campaign Approved - DilSeDaan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .celebration { text-align: center; font-size: 48px; margin: 20px 0; }
        .button { display: inline-block; background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px; font-weight: bold; }
        .tips { background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Campaign Approved!</h1>
          <p>Your campaign is now live on DilSeDaan</p>
        </div>
        <div class="content">
          <div class="celebration">🎊🎉🎊</div>
          
          <h2>Congratulations ${creator.name}!</h2>
          <p>Great news! Your campaign "<strong>${campaign.title}</strong>" has been approved and is now live on DilSeDaan!</p>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/campaigns/${campaign._id}" class="button">🚀 View Your Campaign</a>
            <a href="${process.env.FRONTEND_URL}/dashboard/my-campaigns" class="button">📊 Manage Campaigns</a>
          </div>

          <div class="tips">
            <h3>💡 Tips to maximize your campaign success:</h3>
            <ul>
              <li>📱 <strong>Share widely:</strong> Use social media, WhatsApp, and email</li>
              <li>📸 <strong>Add updates:</strong> Regular photos and progress updates increase donations</li>
              <li>🎯 <strong>Set milestones:</strong> Break your goal into smaller, achievable targets</li>
              <li>💬 <strong>Engage donors:</strong> Respond to comments and thank supporters</li>
              <li>📊 <strong>Track progress:</strong> Monitor your analytics dashboard</li>
            </ul>
          </div>

          <h3>📋 Campaign Details:</h3>
          <ul>
            <li><strong>Goal:</strong> ₹${campaign.targetAmount.toLocaleString('en-IN')}</li>
            <li><strong>Category:</strong> ${campaign.category}</li>
            <li><strong>Campaign URL:</strong> ${process.env.FRONTEND_URL}/campaigns/${campaign._id}</li>
          </ul>

          <h3>🚀 Quick Actions:</h3>
          <div style="text-align: center;">
            <a href="https://twitter.com/intent/tweet?text=My%20campaign%20%22${encodeURIComponent(campaign.title)}%22%20is%20now%20live%20on%20@DilSeDaan!%20Help%20me%20reach%20₹${campaign.targetAmount.toLocaleString('en-IN')}%20goal.&url=${process.env.FRONTEND_URL}/campaigns/${campaign._id}" class="button">Share on Twitter</a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${process.env.FRONTEND_URL}/campaigns/${campaign._id}" class="button">Share on Facebook</a>
            <a href="https://wa.me/?text=My%20campaign%20is%20live!%20Please%20support:%20${process.env.FRONTEND_URL}/campaigns/${campaign._id}" class="button">Share on WhatsApp</a>
          </div>

          <p><strong>Need help?</strong> Our support team is here to assist you at campaigns@dilsedaan.org</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: `"DilSeDaan Team" <${process.env.EMAIL_USER}>`,
      to: creator.email,
      subject: `🎉 Campaign Approved: "${campaign.title}" is now LIVE!`,
      html
    });
  }

  // Two-Factor Authentication Email
  async send2FASetupEmail(user, secret, qrCodeUrl) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Two-Factor Authentication Setup - DilSeDaan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .qr-section { text-align: center; background: white; padding: 30px; border-radius: 10px; margin: 20px 0; }
        .security-note { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .backup-codes { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Two-Factor Authentication Setup</h1>
        </div>
        <div class="content">
          <h2>Hi ${user.name}!</h2>
          <p>Great choice! Two-Factor Authentication (2FA) significantly increases your account security.</p>
          
          <div class="qr-section">
            <h3>📱 Step 1: Scan QR Code</h3>
            <p>Use Google Authenticator, Authy, or any TOTP app to scan this QR code:</p>
            <img src="${qrCodeUrl}" alt="2FA QR Code" style="max-width: 200px;">
            
            <h3>🔑 Manual Entry (if QR doesn't work):</h3>
            <p>Secret Key: <code style="background: #f1f1f1; padding: 5px; border-radius: 3px;">${secret.base32}</code></p>
          </div>

          <div class="security-note">
            <h3>🛡️ Security Best Practices:</h3>
            <ul>
              <li>Save this email in a secure location</li>
              <li>Never share your secret key with anyone</li>
              <li>Generate backup codes and store them safely</li>
              <li>Use a trusted authenticator app</li>
            </ul>
          </div>

          <h3>📋 Setup Instructions:</h3>
          <ol>
            <li>Download Google Authenticator or Authy on your phone</li>
            <li>Scan the QR code above with the app</li>
            <li>Enter the 6-digit code from the app to verify setup</li>
            <li>Save your backup codes in a secure location</li>
          </ol>

          <p><strong>Need help?</strong> Contact security@dilsedaan.org for assistance.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.transporter.sendMail({
      from: `"DilSeDaan Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Two-Factor Authentication Setup - DilSeDaan',
      html
    });
  }
}

module.exports = EnhancedEmailService;
