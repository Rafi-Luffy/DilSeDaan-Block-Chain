import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { AppError } from '../types/index';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class TwoFactorAuthService {
  
  /**
   * Generate 2FA setup for a user
   */
  static async generateTwoFactorSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `DilSeDaan (${userEmail})`,
      issuer: 'DilSeDaan Charity Platform',
      length: 32
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify 2FA token
   */
  static verifyToken(secret: string, token: string, window: number = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window
    });
  }

  /**
   * Enable 2FA for user
   */
  static async enableTwoFactor(userId: string, secret: string, token: string, backupCodes: string[]): Promise<void> {
    // Verify the token first
    if (!this.verifyToken(secret, token)) {
      throw new AppError('Invalid verification code', 400);
    }

    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Update user with 2FA settings
    await User.findByIdAndUpdate(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      backupCodes: hashedBackupCodes,
      twoFactorEnabledAt: new Date()
    });
  }

  /**
   * Disable 2FA for user
   */
  static async disableTwoFactor(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $unset: {
        twoFactorSecret: 1,
        backupCodes: 1,
        twoFactorEnabledAt: 1
      },
      twoFactorEnabled: false
    });
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user || !user.backupCodes) {
      return false;
    }

    const hashedCode = crypto.createHash('sha256').update(backupCode.toUpperCase()).digest('hex');
    const codeIndex = user.backupCodes.indexOf(hashedCode);
    
    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    user.backupCodes.splice(codeIndex, 1);
    await user.save();

    return true;
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const newBackupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    const hashedCodes = newBackupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    await User.findByIdAndUpdate(userId, {
      backupCodes: hashedCodes
    });

    return newBackupCodes;
  }
}

export default TwoFactorAuthService;
