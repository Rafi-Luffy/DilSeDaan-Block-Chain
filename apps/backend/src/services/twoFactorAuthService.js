const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class TwoFactorAuthService {
  constructor() {
    this.serviceName = 'DilSeDaan';
    this.issuer = 'DilSeDaan Charity Platform';
  }

  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(userEmail, userName) {
    const secret = speakeasy.generateSecret({
      name: `${this.serviceName} (${userEmail})`,
      account: userEmail,
      issuer: this.issuer,
      length: 32
    });

    return {
      secret: secret.base32,
      manualEntryKey: secret.base32,
      qrCodeUrl: secret.otpauth_url
    };
  }

  /**
   * Generate QR code as data URL
   */
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }

  /**
   * Verify a TOTP token
   */
  verifyToken(secret, token, window = 2) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: window // Allow some time drift
      });
      return verified;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate backup codes for the user
   */
  generateBackupCodes(count = 8) {
    const backupCodes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
    }
    return backupCodes;
  }

  /**
   * Hash backup codes for secure storage
   */
  hashBackupCodes(codes) {
    return codes.map(code => ({
      hash: crypto.createHash('sha256').update(code).digest('hex'),
      used: false,
      createdAt: new Date()
    }));
  }

  /**
   * Verify a backup code
   */
  verifyBackupCode(providedCode, hashedCodes) {
    const hashedProvidedCode = crypto.createHash('sha256').update(providedCode.toUpperCase()).digest('hex');
    
    const matchingCode = hashedCodes.find(code => 
      code.hash === hashedProvidedCode && !code.used
    );

    if (matchingCode) {
      matchingCode.used = true;
      matchingCode.usedAt = new Date();
      return true;
    }
    
    return false;
  }

  /**
   * Generate current TOTP for testing/validation
   */
  generateToken(secret) {
    return speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
  }

  /**
   * Check if user has remaining backup codes
   */
  getRemainingBackupCodes(hashedCodes) {
    return hashedCodes.filter(code => !code.used).length;
  }

  /**
   * Generate new backup codes and invalidate old ones
   */
  regenerateBackupCodes() {
    const newCodes = this.generateBackupCodes();
    const hashedCodes = this.hashBackupCodes(newCodes);
    
    return {
      plainCodes: newCodes, // Show these to user once
      hashedCodes: hashedCodes // Store these in database
    };
  }

  /**
   * Validate 2FA setup by requiring a token verification
   */
  async validateSetup(secret, token) {
    // Verify the token works before enabling 2FA
    const isValid = this.verifyToken(secret, token);
    
    if (!isValid) {
      throw new Error('Invalid verification code. Please check your authenticator app and try again.');
    }

    return {
      success: true,
      message: '2FA setup completed successfully!'
    };
  }

  /**
   * Get 2FA status and recommendations
   */
  getSecurityStatus(user) {
    const status = {
      twoFactorEnabled: user.twoFactorAuth?.enabled || false,
      backupCodesRemaining: 0,
      securityScore: 0,
      recommendations: []
    };

    if (user.twoFactorAuth?.enabled) {
      status.securityScore += 50;
      status.backupCodesRemaining = this.getRemainingBackupCodes(
        user.twoFactorAuth.backupCodes || []
      );
      
      if (status.backupCodesRemaining < 3) {
        status.recommendations.push('Generate new backup codes - you have less than 3 remaining');
      }
    } else {
      status.recommendations.push('Enable Two-Factor Authentication for enhanced security');
    }

    // Additional security checks
    if (!user.emailVerified) {
      status.recommendations.push('Verify your email address');
    } else {
      status.securityScore += 25;
    }

    if (user.password && user.password.length >= 12) {
      status.securityScore += 25;
    } else {
      status.recommendations.push('Use a strong password (12+ characters)');
    }

    return status;
  }

  /**
   * Security event logging
   */
  logSecurityEvent(userId, event, details = {}) {
    const securityEvent = {
      userId,
      event,
      details,
      timestamp: new Date(),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    // In a real application, you'd store this in a security events collection
    console.log('Security Event:', securityEvent);
    
    return securityEvent;
  }
}

module.exports = TwoFactorAuthService;
