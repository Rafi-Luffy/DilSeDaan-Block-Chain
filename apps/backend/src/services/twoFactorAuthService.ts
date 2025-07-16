import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { enhancedEmailService } from './enhancedEmailService';

export interface TwoFactorSetup {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
    tempSecret: string;
}

export interface TwoFactorVerification {
    isValid: boolean;
    type: 'totp' | 'backup' | 'sms' | 'email';
    remainingBackupCodes?: number;
}

export class TwoFactorAuthService {
    
    // Generate 2FA setup for a user
    async generateTwoFactorSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
        // Generate secret
        const secret = speakeasy.generateSecret({
            name: `DilSeDaan (${userEmail})`,
            issuer: 'DilSeDaan Platform',
            length: 32
        });

        // Generate QR code
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

        // Generate backup codes
        const backupCodes = this.generateBackupCodes();

        // Store temporary secret (not activated until verified)
        await User.findByIdAndUpdate(userId, {
            $set: {
                'twoFactor.tempSecret': secret.base32,
                'twoFactor.backupCodes': backupCodes.map(code => ({
                    code: this.hashBackupCode(code),
                    used: false,
                    createdAt: new Date()
                }))
            }
        });

        return {
            secret: secret.base32,
            qrCodeUrl,
            backupCodes,
            tempSecret: secret.base32
        };
    }

    // Verify and activate 2FA
    async verifyAndActivateTwoFactor(userId: string, token: string): Promise<boolean> {
        const user = await User.findById(userId);
        if (!user || !user.twoFactorTempSecret) {
            throw new Error('No pending 2FA setup found');
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorTempSecret,
            encoding: 'base32',
            token,
            window: 2 // Allow 2 time steps (60 seconds)
        });

        if (isValid) {
            // Activate 2FA
            await User.findByIdAndUpdate(userId, {
                $set: {
                    'twoFactorEnabled': true,
                    'twoFactorSecret': user.twoFactorTempSecret,
                    'twoFactorEnabledAt': new Date()
                },
                $unset: {
                    'twoFactorTempSecret': 1
                }
            });

            return true;
        }

        return false;
    }

    // Verify 2FA token during login
    async verifyTwoFactorToken(userId: string, token: string, type: 'totp' | 'backup' | 'sms' | 'email' = 'totp'): Promise<TwoFactorVerification> {
        const user = await User.findById(userId);
        if (!user || !user.twoFactorEnabled) {
            throw new Error('2FA not enabled for this user');
        }

        switch (type) {
            case 'totp':
                return this.verifyTOTPToken(user, token);
            case 'backup':
                return this.verifyBackupCode(user, token);
            case 'sms':
                return this.verifySMSToken(user, token);
            case 'email':
                return this.verifyEmailToken(user, token);
            default:
                throw new Error('Invalid 2FA verification type');
        }
    }

    private async verifyTOTPToken(user: any, token: string): Promise<TwoFactorVerification> {
        if (!user.twoFactor?.secret) {
            throw new Error('TOTP not configured for this user');
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactor.secret,
            encoding: 'base32',
            token,
            window: 2
        });

        if (isValid) {
            // Update last used timestamp
            await User.findByIdAndUpdate(user._id, {
                $set: { 'twoFactor.lastUsed': new Date() }
            });
        }

        return {
            isValid,
            type: 'totp'
        };
    }

    private async verifyBackupCode(user: any, code: string): Promise<TwoFactorVerification> {
        if (!user.twoFactor?.backupCodes) {
            throw new Error('Backup codes not configured for this user');
        }

        const hashedCode = this.hashBackupCode(code);
        const backupCodeIndex = user.twoFactor.backupCodes.findIndex(
            (bc: any) => bc.code === hashedCode && !bc.used
        );

        if (backupCodeIndex === -1) {
            return {
                isValid: false,
                type: 'backup'
            };
        }

        // Mark backup code as used
        await User.findByIdAndUpdate(user._id, {
            $set: {
                [`twoFactor.backupCodes.${backupCodeIndex}.used`]: true,
                [`twoFactor.backupCodes.${backupCodeIndex}.usedAt`]: new Date(),
                'twoFactor.lastUsed': new Date()
            }
        });

        const remainingCodes = user.twoFactor.backupCodes.filter((bc: any) => !bc.used).length - 1;

        // Send warning if running low on backup codes
        if (remainingCodes <= 2) {
            await this.sendLowBackupCodesWarning(user);
        }

        return {
            isValid: true,
            type: 'backup',
            remainingBackupCodes: remainingCodes
        };
    }

    private async verifySMSToken(user: any, token: string): Promise<TwoFactorVerification> {
        // This would integrate with SMS service (Twilio, AWS SNS, etc.)
        // For now, placeholder implementation
        const isValid = user.twoFactor?.smsToken === token && 
                        user.twoFactor?.smsTokenExpires > new Date();

        if (isValid) {
            await User.findByIdAndUpdate(user._id, {
                $unset: {
                    'twoFactor.smsToken': 1,
                    'twoFactor.smsTokenExpires': 1
                },
                $set: { 'twoFactor.lastUsed': new Date() }
            });
        }

        return {
            isValid,
            type: 'sms'
        };
    }

    private async verifyEmailToken(user: any, token: string): Promise<TwoFactorVerification> {
        const isValid = user.twoFactor?.emailToken === token && 
                        user.twoFactor?.emailTokenExpires > new Date();

        if (isValid) {
            await User.findByIdAndUpdate(user._id, {
                $unset: {
                    'twoFactor.emailToken': 1,
                    'twoFactor.emailTokenExpires': 1
                },
                $set: { 'twoFactor.lastUsed': new Date() }
            });
        }

        return {
            isValid,
            type: 'email'
        };
    }

    // Send SMS token (placeholder)
    async sendSMSToken(userId: string, phoneNumber: string): Promise<void> {
        const token = this.generateNumericToken(6);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await User.findByIdAndUpdate(userId, {
            $set: {
                'twoFactor.smsToken': token,
                'twoFactor.smsTokenExpires': expiresAt
            }
        });

        // In production, integrate with SMS service
        console.log(`SMS Token for ${phoneNumber}: ${token} (expires at ${expiresAt})`);
    }

    // Send email token
    async sendEmailToken(userId: string): Promise<void> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const token = this.generateNumericToken(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await User.findByIdAndUpdate(userId, {
            $set: {
                'twoFactor.emailToken': token,
                'twoFactor.emailTokenExpires': expiresAt
            }
        });

        await enhancedEmailService.sendTwoFactorEmailToken({
            email: user.email,
            name: user.name || user.email,
            token,
            expiresIn: '10 minutes'
        });
    }

    // Disable 2FA
    async disableTwoFactor(userId: string, currentPassword: string): Promise<boolean> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password (implement based on your password verification method)
        // const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        // if (!isPasswordValid) {
        //     throw new Error('Invalid password');
        // }

        await User.findByIdAndUpdate(userId, {
            $unset: {
                'twoFactor.enabled': 1,
                'twoFactor.secret': 1,
                'twoFactor.backupCodes': 1,
                'twoFactor.activatedAt': 1,
                'twoFactor.lastUsed': 1
            }
        });

        // Send security notification
        await enhancedEmailService.sendTwoFactorDisabledEmail({
            email: user.email,
            name: user.name || user.email
        });

        return true;
    }

    // Regenerate backup codes
    async regenerateBackupCodes(userId: string): Promise<string[]> {
        const newBackupCodes = this.generateBackupCodes();

        await User.findByIdAndUpdate(userId, {
            $set: {
                'twoFactor.backupCodes': newBackupCodes.map(code => ({
                    code: this.hashBackupCode(code),
                    used: false,
                    createdAt: new Date()
                }))
            }
        });

        return newBackupCodes;
    }

    // Get 2FA status
    async getTwoFactorStatus(userId: string): Promise<{
        enabled: boolean;
        backupCodesCount: number;
        lastUsed?: Date;
        activatedAt?: Date;
    }> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const backupCodesCount = user.twoFactorBackupCodes?.filter((bc: any) => !bc.used).length || 0;

        return {
            enabled: user.twoFactorEnabled || false,
            backupCodesCount,
            lastUsed: user.twoFactorLastUsed,
            activatedAt: user.twoFactorEnabledAt
        };
    }

    private generateBackupCodes(): string[] {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(this.generateAlphanumericCode(8));
        }
        return codes;
    }

    private generateAlphanumericCode(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private generateNumericToken(length: number): string {
        let token = '';
        for (let i = 0; i < length; i++) {
            token += Math.floor(Math.random() * 10).toString();
        }
        return token;
    }

    private hashBackupCode(code: string): string {
        // In production, use proper hashing (bcrypt, scrypt, etc.)
        // For demo, using simple hash
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(code + 'dilsedaan_salt').digest('hex');
    }

    private async sendLowBackupCodesWarning(user: any): Promise<void> {
        await enhancedEmailService.sendLowBackupCodesWarning({
            email: user.email,
            name: user.name || user.email
        });
    }
}

// Add methods to enhanced email service
declare module './enhancedEmailService' {
    interface EnhancedEmailService {
        sendTwoFactorActivationEmail(user: { email: string; name: string }): Promise<void>;
        sendTwoFactorEmailToken(data: { email: string; name: string; token: string; expiresIn: string }): Promise<void>;
        sendTwoFactorDisabledEmail(user: { email: string; name: string }): Promise<void>;
        sendLowBackupCodesWarning(user: { email: string; name: string }): Promise<void>;
    }
}

// Extend the enhanced email service with 2FA methods
Object.assign(enhancedEmailService.constructor.prototype, {
    async sendTwoFactorActivationEmail(user: { email: string; name: string }): Promise<void> {
        const subject = '🔐 Two-Factor Authentication Activated';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .security-tips { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 2FA Activated!</h1>
                    <p>Your account is now more secure</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${user.name}!</h2>
                    
                    <p>Two-factor authentication has been successfully activated for your DilSeDaan account. Your donations and data are now protected with an additional layer of security.</p>
                    
                    <div class="security-tips">
                        <h3>🛡️ Security Tips:</h3>
                        <ul>
                            <li>Keep your backup codes in a safe place</li>
                            <li>Don't share your authenticator app with anyone</li>
                            <li>Regularly review your account activity</li>
                            <li>Contact support if you notice any suspicious activity</li>
                        </ul>
                    </div>
                    
                    <p>If you didn't activate 2FA or have concerns about your account security, please contact our support team immediately.</p>
                    
                    <p>Best regards,<br>The DilSeDaan Security Team</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
            text: `Two-factor authentication has been activated for your DilSeDaan account.`
        });
    },

    async sendTwoFactorEmailToken(data: { email: string; name: string; token: string; expiresIn: string }): Promise<void> {
        const subject = `🔑 Your DilSeDaan Login Code: ${data.token}`;
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { text-align: center; background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; margin: -20px -20px 20px -20px; }
                .token-display { background: #f8f9fa; border: 2px solid #007bff; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
                .token { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔑 Login Verification</h1>
                    <p>Your DilSeDaan security code</p>
                </div>
                
                <h2>Hello ${data.name}!</h2>
                
                <p>Here's your verification code to complete your DilSeDaan login:</p>
                
                <div class="token-display">
                    <div class="token">${data.token}</div>
                    <p><small>Enter this code in your login screen</small></p>
                </div>
                
                <p><strong>⏱️ This code expires in ${data.expiresIn}</strong></p>
                
                <p>If you didn't request this code, please ignore this email and ensure your account password is secure.</p>
                
                <p>Best regards,<br>The DilSeDaan Security Team</p>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: data.email,
            subject,
            html: htmlContent,
            text: `Your DilSeDaan verification code is: ${data.token} (expires in ${data.expiresIn})`
        });
    },

    async sendTwoFactorDisabledEmail(user: { email: string; name: string }): Promise<void> {
        const subject = '⚠️ Two-Factor Authentication Disabled';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ 2FA Disabled</h1>
                    <p>Account security update</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${user.name}!</h2>
                    
                    <p>Two-factor authentication has been disabled for your DilSeDaan account.</p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong><br>
                        Your account is now protected only by your password. We strongly recommend re-enabling 2FA to keep your donations and data secure.
                    </div>
                    
                    <p>If you didn't disable 2FA, please contact our support team immediately and change your password.</p>
                    
                    <p>To re-enable 2FA, visit your account settings at any time.</p>
                    
                    <p>Best regards,<br>The DilSeDaan Security Team</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
            text: `Two-factor authentication has been disabled for your DilSeDaan account.`
        });
    },

    async sendLowBackupCodesWarning(user: { email: string; name: string }): Promise<void> {
        const subject = '⚠️ Low Backup Codes - Generate New Ones';
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f7f9fc; }
                .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .action-button { display: inline-block; background: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 20px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Low Backup Codes</h1>
                    <p>Action required for account security</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${user.name}!</h2>
                    
                    <p>You're running low on backup codes for your DilSeDaan account. You have 2 or fewer backup codes remaining.</p>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong><br>
                        Backup codes are essential for accessing your account if you lose your authenticator device. Generate new backup codes to maintain account security.
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/settings/security" class="action-button">
                            🔄 Generate New Backup Codes
                        </a>
                    </div>
                    
                    <p>Keep your new backup codes in a safe place and never share them with anyone.</p>
                    
                    <p>Best regards,<br>The DilSeDaan Security Team</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await this.sendEmail({
            to: user.email,
            subject,
            html: htmlContent,
            text: `You're running low on backup codes for your DilSeDaan account. Please generate new ones at ${process.env.FRONTEND_URL}/settings/security`
        });
    }
});

export const twoFactorAuthService = new TwoFactorAuthService();
