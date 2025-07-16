const express = require('express');
const { protect } = require('../middleware/auth');
const TwoFactorAuthService = require('../services/twoFactorAuthService');
const EnhancedEmailService = require('../services/enhancedEmailService');
const User = require('../models/User');

const router = express.Router();
const twoFactorService = new TwoFactorAuthService();
const emailService = new EnhancedEmailService();

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Initialize 2FA setup for user
 * @access  Private
 */
router.post('/setup', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if 2FA is already enabled
    if (user.twoFactorAuth?.enabled) {
      return res.status(400).json({ 
        message: '2FA is already enabled for this account',
        enabled: true
      });
    }

    // Generate new secret
    const secretData = twoFactorService.generateSecret(user.email, user.name);
    const qrCodeUrl = await twoFactorService.generateQRCode(secretData.qrCodeUrl);

    // Store the secret temporarily (not yet enabled)
    user.twoFactorAuth = {
      secret: secretData.secret,
      enabled: false,
      setupAt: new Date()
    };
    await user.save();

    // Send setup email
    try {
      await emailService.send2FASetupEmail(user, { base32: secretData.secret }, qrCodeUrl);
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
      // Continue with setup even if email fails
    }

    res.status(200).json({
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      manualEntryKey: secretData.secret,
      backupCodes: null // Will be generated after verification
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Failed to setup 2FA', error: error.message });
  }
});

/**
 * @route   POST /api/auth/2fa/verify-setup
 * @desc    Verify and enable 2FA
 * @access  Private
 */
router.post('/verify-setup', protect, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth?.secret) {
      return res.status(400).json({ message: '2FA setup not initiated. Please start setup first.' });
    }

    // Verify the token
    const isValid = twoFactorService.verifyToken(user.twoFactorAuth.secret, token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Generate backup codes
    const { plainCodes, hashedCodes } = twoFactorService.regenerateBackupCodes();

    // Enable 2FA
    user.twoFactorAuth.enabled = true;
    user.twoFactorAuth.enabledAt = new Date();
    user.twoFactorAuth.backupCodes = hashedCodes;
    await user.save();

    // Log security event
    twoFactorService.logSecurityEvent(user._id, '2FA_ENABLED', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: '2FA enabled successfully!',
      backupCodes: plainCodes,
      enabled: true
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Failed to verify 2FA setup', error: error.message });
  }
});

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify 2FA token during login
 * @access  Public (but requires valid login session)
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId, token, backupCode } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    if (!token && !backupCode) {
      return res.status(400).json({ message: 'Verification token or backup code is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    let isValid = false;
    let usingBackupCode = false;

    if (backupCode) {
      // Verify backup code
      isValid = twoFactorService.verifyBackupCode(backupCode, user.twoFactorAuth.backupCodes);
      usingBackupCode = true;
      
      if (isValid) {
        await user.save(); // Save the updated backup codes (marked as used)
      }
    } else {
      // Verify TOTP token
      isValid = twoFactorService.verifyToken(user.twoFactorAuth.secret, token);
    }

    if (!isValid) {
      // Log failed attempt
      twoFactorService.logSecurityEvent(user._id, '2FA_FAILED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        usingBackupCode
      });

      return res.status(400).json({ 
        message: usingBackupCode ? 'Invalid backup code' : 'Invalid verification code'
      });
    }

    // Log successful verification
    twoFactorService.logSecurityEvent(user._id, '2FA_SUCCESS', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      usingBackupCode
    });

    const remainingBackupCodes = twoFactorService.getRemainingBackupCodes(
      user.twoFactorAuth.backupCodes
    );

    res.status(200).json({
      message: '2FA verification successful',
      verified: true,
      remainingBackupCodes,
      warning: remainingBackupCodes < 3 ? 'You have less than 3 backup codes remaining' : null
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Failed to verify 2FA', error: error.message });
  }
});

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA for user
 * @access  Private
 */
router.post('/disable', protect, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Current 2FA token and password are required' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Verify 2FA token
    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    const isTokenValid = twoFactorService.verifyToken(user.twoFactorAuth.secret, token);
    if (!isTokenValid) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    // Disable 2FA
    user.twoFactorAuth = {
      enabled: false,
      disabledAt: new Date()
    };
    await user.save();

    // Log security event
    twoFactorService.logSecurityEvent(user._id, '2FA_DISABLED', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: '2FA disabled successfully',
      enabled: false
    });

  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ message: 'Failed to disable 2FA', error: error.message });
  }
});

/**
 * @route   POST /api/auth/2fa/regenerate-backup-codes
 * @desc    Generate new backup codes
 * @access  Private
 */
router.post('/regenerate-backup-codes', protect, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: '2FA token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    // Verify 2FA token
    const isValid = twoFactorService.verifyToken(user.twoFactorAuth.secret, token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    // Generate new backup codes
    const { plainCodes, hashedCodes } = twoFactorService.regenerateBackupCodes();

    // Update user with new backup codes
    user.twoFactorAuth.backupCodes = hashedCodes;
    user.twoFactorAuth.backupCodesGeneratedAt = new Date();
    await user.save();

    // Log security event
    twoFactorService.logSecurityEvent(user._id, 'BACKUP_CODES_REGENERATED', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      message: 'New backup codes generated successfully',
      backupCodes: plainCodes
    });

  } catch (error) {
    console.error('Backup codes regeneration error:', error);
    res.status(500).json({ message: 'Failed to regenerate backup codes', error: error.message });
  }
});

/**
 * @route   GET /api/auth/2fa/status
 * @desc    Get 2FA status and security recommendations
 * @access  Private
 */
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const securityStatus = twoFactorService.getSecurityStatus(user);

    res.status(200).json({
      ...securityStatus,
      message: 'Security status retrieved successfully'
    });

  } catch (error) {
    console.error('Security status error:', error);
    res.status(500).json({ message: 'Failed to get security status', error: error.message });
  }
});

module.exports = router;
