const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class EmailVerificationService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com',
                pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD
            }
        });
        
        this.verificationTokens = new Map(); // In production, use Redis
        this.verificationCodeLength = 6;
    }

    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateVerificationToken(userId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        this.verificationTokens.set(token, {
            userId,
            expiresAt,
            used: false
        });
        
        return token;
    }

    async sendVerificationEmail(user, verificationType = 'signup') {
        try {
            const verificationCode = this.generateVerificationCode();
            const verificationToken = this.generateVerificationToken(user._id);
            
            // Store verification data
            this.verificationTokens.set(`code_${user._id}`, {
                code: verificationCode,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                attempts: 0,
                maxAttempts: 3
            });
            
            const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
            
            const emailTemplate = this.getVerificationTemplate(user, verificationCode, verificationLink, verificationType);
            
            const mailOptions = {
                from: {
                    name: 'DilSeDaan - Charity Platform',
                    address: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com'
                },
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text
            };
            
            await this.transporter.sendMail(mailOptions);
            
            return {
                success: true,
                verificationToken,
                message: 'Verification email sent successfully',
                expiresIn: '15 minutes'
            };
            
        } catch (error) {
            console.error('Email verification send error:', error);
            throw new Error('Failed to send verification email');
        }
    }

    async verifyEmailCode(userId, code) {
        try {
            const verificationData = this.verificationTokens.get(`code_${userId}`);
            
            if (!verificationData) {
                return {
                    success: false,
                    message: 'No verification code found. Please request a new one.'
                };
            }
            
            if (new Date() > verificationData.expiresAt) {
                this.verificationTokens.delete(`code_${userId}`);
                return {
                    success: false,
                    message: 'Verification code expired. Please request a new one.'
                };
            }
            
            if (verificationData.attempts >= verificationData.maxAttempts) {
                this.verificationTokens.delete(`code_${userId}`);
                return {
                    success: false,
                    message: 'Too many failed attempts. Please request a new verification code.'
                };
            }
            
            if (verificationData.code !== code) {
                verificationData.attempts++;
                return {
                    success: false,
                    message: `Invalid verification code. ${verificationData.maxAttempts - verificationData.attempts} attempts remaining.`
                };
            }
            
            // Success - cleanup
            this.verificationTokens.delete(`code_${userId}`);
            
            return {
                success: true,
                message: 'Email verified successfully!'
            };
            
        } catch (error) {
            console.error('Email verification error:', error);
            throw new Error('Failed to verify email');
        }
    }

    async verifyEmailToken(token) {
        try {
            const verificationData = this.verificationTokens.get(token);
            
            if (!verificationData) {
                return {
                    success: false,
                    message: 'Invalid or expired verification token'
                };
            }
            
            if (new Date() > verificationData.expiresAt || verificationData.used) {
                this.verificationTokens.delete(token);
                return {
                    success: false,
                    message: 'Verification token expired or already used'
                };
            }
            
            // Mark as used
            verificationData.used = true;
            
            return {
                success: true,
                userId: verificationData.userId,
                message: 'Email verified successfully!'
            };
            
        } catch (error) {
            console.error('Token verification error:', error);
            throw new Error('Failed to verify token');
        }
    }

    async sendPasswordResetEmail(user) {
        try {
            const resetCode = this.generateVerificationCode();
            const resetToken = this.generateVerificationToken(user._id);
            
            // Store reset data
            this.verificationTokens.set(`reset_${user._id}`, {
                code: resetCode,
                token: resetToken,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                attempts: 0,
                maxAttempts: 3
            });
            
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            
            const emailTemplate = this.getPasswordResetTemplate(user, resetCode, resetLink);
            
            const mailOptions = {
                from: {
                    name: 'DilSeDaan - Security Alert',
                    address: process.env.EMAIL_USER || 'dilsedaan.platform@gmail.com'
                },
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text
            };
            
            await this.transporter.sendMail(mailOptions);
            
            return {
                success: true,
                message: 'Password reset email sent successfully',
                expiresIn: '30 minutes'
            };
            
        } catch (error) {
            console.error('Password reset email error:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    getVerificationTemplate(user, code, link, type) {
        const templates = {
            signup: {
                subject: '🔐 Verify Your DilSeDaan Account',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Verify Your Email</title>
                        <style>
                            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                            .content { padding: 30px; }
                            .code-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
                            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                            .security { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🙏 Welcome to DilSeDaan!</h1>
                                <p>India's Most Trusted Charity Platform</p>
                            </div>
                            <div class="content">
                                <h2>Hello ${user.name}!</h2>
                                <p>Thank you for joining DilSeDaan, where every donation creates a meaningful impact. Please verify your email address to activate your account.</p>
                                
                                <div class="code-box">
                                    <p><strong>Your Verification Code:</strong></p>
                                    <div class="code">${code}</div>
                                    <p><small>Enter this code in the verification page</small></p>
                                </div>
                                
                                <p>Or click the button below to verify automatically:</p>
                                <a href="${link}" class="button">Verify Email Address</a>
                                
                                <div class="security">
                                    <strong>🔒 Security Note:</strong> This verification code expires in 15 minutes and can only be used once. Never share this code with anyone.
                                </div>
                                
                                <p>If you didn't create this account, please ignore this email.</p>
                            </div>
                            <div class="footer">
                                <p>© 2025 DilSeDaan - Making Charity Transparent</p>
                                <p>Need help? Contact us at support@dilsedaan.org</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                text: `Welcome to DilSeDaan!\n\nVerification Code: ${code}\n\nOr verify at: ${link}\n\nThis code expires in 15 minutes.`
            }
        };
        
        return templates[type] || templates.signup;
    }

    getPasswordResetTemplate(user, code, link) {
        return {
            subject: '🔐 Reset Your DilSeDaan Password',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Password Reset</title>
                    <style>
                        body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; }
                        .content { padding: 30px; }
                        .code-box { background: #f8f9fa; border: 2px dashed #e74c3c; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                        .code { font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 8px; margin: 10px 0; }
                        .button { display: inline-block; background: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                        .warning { background: #ffebee; border: 1px solid #ffcdd2; border-radius: 6px; padding: 15px; margin: 20px 0; color: #c62828; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset Request</h1>
                            <p>DilSeDaan Security</p>
                        </div>
                        <div class="content">
                            <h2>Hello ${user.name},</h2>
                            <p>We received a request to reset your password for your DilSeDaan account.</p>
                            
                            <div class="code-box">
                                <p><strong>Your Reset Code:</strong></p>
                                <div class="code">${code}</div>
                                <p><small>Enter this code to reset your password</small></p>
                            </div>
                            
                            <p>Or click the button below to reset automatically:</p>
                            <a href="${link}" class="button">Reset Password</a>
                            
                            <div class="warning">
                                <strong>⚠️ Security Warning:</strong> This reset code expires in 30 minutes. If you didn't request this reset, please ignore this email and contact our support team immediately.
                            </div>
                            
                            <p>For security reasons, this link can only be used once.</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 DilSeDaan Security Team</p>
                            <p>Need help? Contact us at security@dilsedaan.org</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `Password Reset Request\n\nReset Code: ${code}\n\nOr reset at: ${link}\n\nThis code expires in 30 minutes.\n\nIf you didn't request this, please ignore this email.`
        };
    }

    // Cleanup expired tokens (run periodically)
    cleanupExpiredTokens() {
        const now = new Date();
        for (const [key, data] of this.verificationTokens.entries()) {
            if (now > data.expiresAt) {
                this.verificationTokens.delete(key);
            }
        }
    }

    // Get verification statistics
    getVerificationStats() {
        const stats = {
            totalTokens: this.verificationTokens.size,
            activeVerifications: 0,
            expiredTokens: 0,
            usedTokens: 0
        };
        
        const now = new Date();
        for (const [key, data] of this.verificationTokens.entries()) {
            if (data.used) {
                stats.usedTokens++;
            } else if (now > data.expiresAt) {
                stats.expiredTokens++;
            } else {
                stats.activeVerifications++;
            }
        }
        
        return stats;
    }
}

module.exports = EmailVerificationService;
