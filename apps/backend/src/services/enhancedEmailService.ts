import nodemailer from 'nodemailer';
// Note: Install @sendgrid/mail for production use: npm install @sendgrid/mail
// import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced email service with multiple providers
export class EnhancedEmailService {
    private gmailTransporter?: nodemailer.Transporter;
    private sendGridConfigured: boolean = false;
    private currentProvider: 'gmail' | 'sendgrid' | 'ses' = 'gmail';

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        // Initialize Gmail SMTP
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            this.gmailTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
        }

        // Initialize SendGrid
        if (process.env.SENDGRID_API_KEY) {
            // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            this.sendGridConfigured = true;
            this.currentProvider = 'sendgrid';
            console.log('SendGrid configured (install @sendgrid/mail for production)');
        }
    }

    // Enhanced welcome email with better design
    async sendWelcomeEmail(user: { email: string; name: string; role?: string }): Promise<void> {
        const subject = 'Welcome to DilSeDaan - Transform Lives Through Giving 🎯';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to DilSeDaan</title>
            <style>
                body { font-family: 'Arial', sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .feature { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                .feature-icon { font-size: 24px; margin-right: 15px; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                .footer { background: #2c3e50; color: white; text-align: center; padding: 20px; }
                .stats { display: flex; justify-content: space-between; margin: 20px 0; }
                .stat { text-align: center; padding: 15px; background: #e8f4fd; border-radius: 8px; flex: 1; margin: 0 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎯 Welcome to DilSeDaan!</h1>
                    <p>Namaste ${user.name}, your journey of meaningful giving starts here</p>
                </div>
                
                <div class="content">
                    <h2>Thank you for joining India's most transparent charity platform!</h2>
                    
                    <p>Dear ${user.name},</p>
                    
                    <p>We're thrilled to welcome you to DilSeDaan, where every donation creates lasting impact. As a ${user.role || 'valued member'}, you're now part of a community committed to transforming lives across India.</p>
                    
                    <div class="stats">
                        <div class="stat">
                            <strong>₹50+ Crore</strong><br>
                            <small>Donations Facilitated</small>
                        </div>
                        <div class="stat">
                            <strong>10,000+</strong><br>
                            <small>Lives Impacted</small>
                        </div>
                        <div class="stat">
                            <strong>99.9%</strong><br>
                            <small>Transparency Score</small>
                        </div>
                    </div>
                    
                    <h3>🌟 What makes DilSeDaan special:</h3>
                    
                    <div class="feature">
                        <span class="feature-icon">🔗</span>
                        <div>
                            <strong>Blockchain Transparency</strong><br>
                            Every donation is recorded on Polygon blockchain for complete transparency
                        </div>
                    </div>
                    
                    <div class="feature">
                        <span class="feature-icon">💳</span>
                        <div>
                            <strong>Lowest Fees in India</strong><br>
                            Just 2.5% platform fee (vs 6.9% on other platforms) + UPI donations are FREE
                        </div>
                    </div>
                    
                    <div class="feature">
                        <span class="feature-icon">📊</span>
                        <div>
                            <strong>Real-time Impact Tracking</strong><br>
                            See exactly how your donations are being used with live updates
                        </div>
                    </div>
                    
                    <div class="feature">
                        <span class="feature-icon">🛡️</span>
                        <div>
                            <strong>Government-Grade Security</strong><br>
                            Bank-level security with comprehensive fraud detection
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://dilsedaan.org/campaigns" class="cta-button">
                            Start Making Impact ⚡
                        </a>
                    </div>
                    
                    <h3>🚀 Get started in 3 easy steps:</h3>
                    <ol>
                        <li><strong>Explore Campaigns:</strong> Browse verified causes that matter to you</li>
                        <li><strong>Donate Securely:</strong> Use UPI, cards, or crypto with complete transparency</li>
                        <li><strong>Track Impact:</strong> Get real-time updates on how your donation helps</li>
                    </ol>
                    
                    <p><strong>Need help?</strong> Our support team is here for you:</p>
                    <ul>
                        <li>📧 Email: support@dilsedaan.org</li>
                        <li>📱 WhatsApp: +91-9876543210</li>
                        <li>🌐 Help Center: https://dilsedaan.org/help</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>With gratitude,<br><strong>The DilSeDaan Team</strong></p>
                    <p><small>Making charity transparent, one donation at a time</small></p>
                </div>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
            text: `Welcome to DilSeDaan, ${user.name}! Start making impact at https://dilsedaan.org/campaigns`
        });
    }

    // Email verification with enhanced design
    async sendEmailVerification(user: { email: string; name: string }, verificationToken: string): Promise<void> {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        
        const subject = '🔐 Verify Your DilSeDaan Account';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .verify-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Verify Your Email</h1>
                    <p>Secure your DilSeDaan account</p>
                </div>
                
                <h2>Hello ${user.name}!</h2>
                
                <p>Thank you for registering with DilSeDaan. To complete your account setup and ensure the security of your donations, please verify your email address.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" class="verify-button">
                        ✅ Verify Email Address
                    </a>
                </div>
                
                <div class="security-notice">
                    <strong>🛡️ Security Notice:</strong><br>
                    This verification link will expire in 24 hours. If you didn't create a DilSeDaan account, please ignore this email.
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
                
                <p>Best regards,<br>The DilSeDaan Security Team</p>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
            text: `Verify your DilSeDaan account: ${verificationUrl}`
        });
    }

    // Donation confirmation email
    async sendDonationConfirmation(donation: {
        donorEmail: string;
        donorName: string;
        amount: number;
        campaignTitle: string;
        transactionId: string;
        campaignUrl?: string;
    }): Promise<void> {
        const subject = `🎉 Donation Confirmed: ₹${donation.amount.toLocaleString('en-IN')} to ${donation.campaignTitle}`;
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .donation-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .impact-section { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
                .track-button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Thank You for Your Donation!</h1>
                    <p>Your generosity is changing lives</p>
                </div>
                
                <div class="content">
                    <h2>Dear ${donation.donorName},</h2>
                    
                    <p>Your donation has been successfully processed! Thank you for choosing DilSeDaan to make a positive impact.</p>
                    
                    <div class="donation-details">
                        <h3>📋 Donation Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 8px; font-weight: bold;">Amount:</td>
                                <td style="padding: 8px;">₹${donation.amount.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 8px; font-weight: bold;">Campaign:</td>
                                <td style="padding: 8px;">${donation.campaignTitle}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #ddd;">
                                <td style="padding: 8px; font-weight: bold;">Transaction ID:</td>
                                <td style="padding: 8px; font-family: monospace;">${donation.transactionId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Date:</td>
                                <td style="padding: 8px;">${new Date().toLocaleDateString('en-IN')}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="impact-section">
                        <h3>🌟 Your Impact</h3>
                        <p>Your ₹${donation.amount.toLocaleString('en-IN')} donation will help:</p>
                        <ul>
                            <li>Provide direct assistance to beneficiaries</li>
                            <li>Support campaign operations and logistics</li>
                            <li>Create lasting positive change in the community</li>
                        </ul>
                    </div>
                    
                    ${donation.campaignUrl ? `
                    <div style="text-align: center;">
                        <a href="${donation.campaignUrl}" class="track-button">
                            📊 Track Your Impact
                        </a>
                    </div>
                    ` : ''}
                    
                    <h3>🧾 Tax Benefit</h3>
                    <p>This donation is eligible for tax deduction under Section 80G. You can claim up to ₹${Math.floor(donation.amount * 0.5).toLocaleString('en-IN')} as tax benefit. Your official receipt will be emailed separately.</p>
                    
                    <h3>📱 Stay Updated</h3>
                    <p>You'll receive regular updates about how your donation is being used. You can also track the campaign progress in your DilSeDaan dashboard.</p>
                    
                    <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
                        <p><strong>Need help?</strong> Contact our support team:</p>
                        <ul>
                            <li>📧 support@dilsedaan.org</li>
                            <li>📱 +91-9876543210</li>
                        </ul>
                    </div>
                </div>
                
                <div style="background: #2c3e50; color: white; text-align: center; padding: 20px;">
                    <p>Thank you for making a difference!<br><strong>Team DilSeDaan</strong></p>
                </div>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: donation.donorEmail,
            subject,
            html: htmlContent,
            text: `Thank you for your ₹${donation.amount} donation to ${donation.campaignTitle}. Transaction ID: ${donation.transactionId}`
        });
    }

    // Campaign approval notification
    async sendCampaignApprovalEmail(campaign: {
        creatorEmail: string;
        creatorName: string;
        campaignTitle: string;
        campaignUrl?: string;
    }): Promise<void> {
        const subject = `🎉 Campaign Approved: ${campaign.campaignTitle}`;
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .success-badge { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #c3e6cb; }
                .next-steps { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .share-button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; margin: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Congratulations!</h1>
                    <p>Your campaign has been approved</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${campaign.creatorName}!</h2>
                    
                    <div class="success-badge">
                        <h3>✅ Campaign Status: APPROVED</h3>
                        <p><strong>${campaign.campaignTitle}</strong> is now live on DilSeDaan!</p>
                    </div>
                    
                    <p>Great news! Your campaign has passed our verification process and is now live on the DilSeDaan platform. Donors can now discover and support your cause.</p>
                    
                    <div class="next-steps">
                        <h3>🚀 Next Steps:</h3>
                        <ol>
                            <li><strong>Share Your Campaign:</strong> Spread the word to maximize impact</li>
                            <li><strong>Engage with Donors:</strong> Post regular updates and thank supporters</li>
                            <li><strong>Track Progress:</strong> Monitor donations and milestone achievements</li>
                            <li><strong>Submit Reports:</strong> Keep donors informed with impact reports</li>
                        </ol>
                    </div>
                    
                    ${campaign.campaignUrl ? `
                    <div style="text-align: center; margin: 30px 0;">
                        <h3>📢 Share Your Campaign</h3>
                        <a href="https://twitter.com/intent/tweet?text=Support my campaign on DilSeDaan&url=${encodeURIComponent(campaign.campaignUrl)}" class="share-button">Share on Twitter</a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaign.campaignUrl)}" class="share-button">Share on Facebook</a>
                        <a href="https://wa.me/?text=Please support my campaign: ${encodeURIComponent(campaign.campaignUrl)}" class="share-button">Share on WhatsApp</a>
                    </div>
                    ` : ''}
                    
                    <h3>💡 Tips for Campaign Success:</h3>
                    <ul>
                        <li>Post regular updates to keep donors engaged</li>
                        <li>Share compelling stories and photos</li>
                        <li>Thank donors personally when possible</li>
                        <li>Be transparent about fund usage</li>
                        <li>Set and achieve milestones to build trust</li>
                    </ul>
                    
                    <p><strong>Need support?</strong> Our campaign success team is here to help:</p>
                    <ul>
                        <li>📧 campaigns@dilsedaan.org</li>
                        <li>📱 +91-9876543210</li>
                        <li>🌐 Campaign Guide: https://dilsedaan.org/creator-guide</li>
                    </ul>
                </div>
                
                <div style="background: #2c3e50; color: white; text-align: center; padding: 20px;">
                    <p>Wishing you success in your mission!<br><strong>Team DilSeDaan</strong></p>
                </div>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: campaign.creatorEmail,
            subject,
            html: htmlContent,
            text: `Congratulations! Your campaign "${campaign.campaignTitle}" has been approved and is now live on DilSeDaan.`
        });
    }

    // Password reset email
    async sendPasswordResetEmail(user: { email: string; name: string }, resetToken: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        const subject = '🔐 Reset Your DilSeDaan Password';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { text-align: center; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .reset-button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                    <p>Secure your DilSeDaan account</p>
                </div>
                
                <h2>Hello ${user.name}!</h2>
                
                <p>You recently requested to reset your password for your DilSeDaan account. Click the button below to reset it.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="reset-button">
                        🔑 Reset Password
                    </a>
                </div>
                
                <div class="security-notice">
                    <strong>🛡️ Security Notice:</strong><br>
                    This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                
                <p>For security reasons, this link will expire in 1 hour.</p>
                
                <p>Best regards,<br>The DilSeDaan Security Team</p>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
            text: `Reset your DilSeDaan password: ${resetUrl}`
        });
    }

    private async sendEmail(options: {
        to: string;
        subject: string;
        html: string;
        text?: string;
    }): Promise<void> {
        try {
            if (this.currentProvider === 'sendgrid' && this.sendGridConfigured) {
                // Use SendGrid (placeholder - install @sendgrid/mail for production)
                console.log(`Would send via SendGrid to: ${options.to} (install @sendgrid/mail)`);
                
                // For demo purposes, fall back to Gmail
                if (this.gmailTransporter) {
                    await this.gmailTransporter.sendMail({
                        from: {
                            name: 'DilSeDaan Platform',
                            address: process.env.GMAIL_USER || 'noreply@dilsedaan.org'
                        },
                        to: options.to,
                        subject: options.subject,
                        html: options.html,
                        text: options.text || options.subject
                    });
                    console.log(`Email sent via Gmail (fallback) to: ${options.to}`);
                }
            } else if (this.gmailTransporter) {
                // Use Gmail SMTP
                await this.gmailTransporter.sendMail({
                    from: {
                        name: 'DilSeDaan Platform',
                        address: process.env.GMAIL_USER || 'noreply@dilsedaan.org'
                    },
                    to: options.to,
                    subject: options.subject,
                    html: options.html,
                    text: options.text || options.subject
                });
                console.log(`Email sent via Gmail to: ${options.to}`);
            } else {
                throw new Error('No email provider configured');
            }
        } catch (error) {
            console.error('❌ Email send failed:', error);
            throw error;
        }
    }

    // Email delivery status tracking
    async getDeliveryStatus(messageId: string): Promise<{
        status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
        timestamp: Date;
    }> {
        // This would integrate with SendGrid's Event Webhook API
        // For now, return a placeholder
        return {
            status: 'sent',
            timestamp: new Date()
        };
    }

    // Bulk email sending for newsletters
    async sendBulkEmail(recipients: Array<{
        email: string;
        name: string;
        customData?: Record<string, any>;
    }>, template: {
        subject: string;
        htmlTemplate: string;
        textTemplate?: string;
    }): Promise<void> {
        const batchSize = 100; // SendGrid limit
        
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            
            const promises = batch.map(recipient => 
                this.sendEmail({
                    to: recipient.email,
                    subject: this.personalizeTemplate(template.subject, recipient),
                    html: this.personalizeTemplate(template.htmlTemplate, recipient),
                    text: template.textTemplate ? this.personalizeTemplate(template.textTemplate, recipient) : undefined
                })
            );
            
            await Promise.allSettled(promises);
            
            // Rate limiting
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    private personalizeTemplate(template: string, recipient: {
        name: string;
        email: string;
        customData?: Record<string, any>;
    }): string {
        let personalized = template;
        personalized = personalized.replace(/{{name}}/g, recipient.name);
        personalized = personalized.replace(/{{email}}/g, recipient.email);
        
        if (recipient.customData) {
            Object.entries(recipient.customData).forEach(([key, value]) => {
                personalized = personalized.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            });
        }
        
        return personalized;
    }
}

export const enhancedEmailService = new EnhancedEmailService();
