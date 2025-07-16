import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { User } from '../models/User';

export class TwoFactorService {
  // Generate 2FA secret for user
  static generateSecret(userEmail: string): { secret: string; qrCode: string; manualKey: string } {
    const secret = speakeasy.generateSecret({
      name: `DilSeDaan (${userEmail})`,
      issuer: 'DilSeDaan',
      length: 32
    });

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
      manualKey: secret.base32
    };
  }

  // Verify 2FA token
  static verifyToken(secret: string, token: string, window = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window // Allow for time drift
    });
  }

  // Generate backup codes
  static generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Verify backup code
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user || !user.backupCodes) return false;

    const codeIndex = user.backupCodes.indexOf(code.toUpperCase());
    if (codeIndex === -1) return false;

    // Remove used backup code
    user.backupCodes.splice(codeIndex, 1);
    await user.save();

    return true;
  }

  // Generate QR code image
  static async generateQRCodeImage(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }
}

export class FraudDetectionService {
  private static readonly MAX_DONATION_AMOUNT = 500000; // ₹5 lakh
  private static readonly MAX_DAILY_DONATIONS = 10;
  private static readonly SUSPICIOUS_KEYWORDS = [
    'urgent', 'emergency', 'immediately', 'within hours', 'dying', 'critical'
  ];

  // Check for suspicious donation patterns
  static async checkDonationFraud(donationData: any, userHistory: any[]): Promise<{
    isSuspicious: boolean;
    riskScore: number;
    flags: string[];
  }> {
    const flags: string[] = [];
    let riskScore = 0;

    // Check amount
    if (donationData.amount > this.MAX_DONATION_AMOUNT) {
      flags.push('Unusually high donation amount');
      riskScore += 40;
    }

    // Check daily donation frequency
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDonations = userHistory.filter(d => 
      new Date(d.createdAt) >= today
    ).length;

    if (todayDonations >= this.MAX_DAILY_DONATIONS) {
      flags.push('Excessive daily donations');
      riskScore += 30;
    }

    // Check for rapid successive donations
    const lastDonation = userHistory[0];
    if (lastDonation && 
        (Date.now() - new Date(lastDonation.createdAt).getTime()) < 60000) {
      flags.push('Rapid successive donations');
      riskScore += 25;
    }

    // Check donation pattern (same amounts)
    const recentAmounts = userHistory.slice(0, 5).map(d => d.amount);
    const uniqueAmounts = new Set(recentAmounts);
    if (recentAmounts.length >= 3 && uniqueAmounts.size === 1) {
      flags.push('Repeated identical amounts');
      riskScore += 20;
    }

    return {
      isSuspicious: riskScore >= 50,
      riskScore,
      flags
    };
  }

  // Check for suspicious campaign creation
  static checkCampaignFraud(campaignData: any): {
    isSuspicious: boolean;
    riskScore: number;
    flags: string[];
  } {
    const flags: string[] = [];
    let riskScore = 0;

    // Check for suspicious keywords in title/description
    const text = `${campaignData.title} ${campaignData.description}`.toLowerCase();
    const suspiciousKeywords = this.SUSPICIOUS_KEYWORDS.filter(keyword => 
      text.includes(keyword)
    );

    if (suspiciousKeywords.length > 2) {
      flags.push('Multiple urgency keywords detected');
      riskScore += 30;
    }

    // Check target amount
    if (campaignData.targetAmount > 1000000) { // ₹10 lakh
      flags.push('Very high target amount');
      riskScore += 20;
    }

    // Check description length (too short might be suspicious)
    if (campaignData.description.length < 100) {
      flags.push('Very short description');
      riskScore += 15;
    }

    // Check for lack of verification documents
    if (!campaignData.documents || campaignData.documents.length === 0) {
      flags.push('No supporting documents provided');
      riskScore += 25;
    }

    return {
      isSuspicious: riskScore >= 40,
      riskScore,
      flags
    };
  }

  // Rate limiting check
  static checkRateLimit(userActivity: any[], timeWindow = 3600000): boolean { // 1 hour
    const now = Date.now();
    const recentActivity = userActivity.filter(activity => 
      (now - new Date(activity.timestamp).getTime()) < timeWindow
    );

    return recentActivity.length > 50; // Max 50 actions per hour
  }
}
