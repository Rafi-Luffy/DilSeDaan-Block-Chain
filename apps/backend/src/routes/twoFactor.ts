import { Router, Response } from 'express';
import { protect } from '../middleware/auth';
import { User } from '../models/User';
import { TwoFactorService } from '../services/securityService';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/index';
import { validateTwoFactorSetup, validateTwoFactorVerify } from '../middleware/validation';

const router = Router();

// Setup 2FA
router.post('/setup', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA already enabled' });
    }

    // Generate secret and QR code
    const { secret, qrCode, manualKey } = TwoFactorService.generateSecret(user.email);
    const qrCodeImage = await TwoFactorService.generateQRCodeImage(qrCode);

    // Temporarily store secret (not saved until verified)
    res.json({
      secret: secret,
      qrCodeImage,
      manualKey,
      message: 'Scan QR code with your authenticator app'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify and enable 2FA
router.post('/verify', [
  protect,
  body('token').isLength({ min: 6, max: 6 }).withMessage('Token must be 6 digits'),
  body('secret').notEmpty().withMessage('Secret is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, secret } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify token
    const isValid = TwoFactorService.verifyToken(secret, token);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Generate backup codes
    const backupCodes = TwoFactorService.generateBackupCodes();

    // Save 2FA settings
    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    user.backupCodes = backupCodes;
    await user.save();

    res.json({
      message: '2FA enabled successfully',
      backupCodes,
      warning: 'Store backup codes safely - they cannot be recovered'
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable 2FA
router.post('/disable', [
  protect,
  body('password').notEmpty().withMessage('Password is required'),
  body('token').optional().isLength({ min: 6, max: 6 })
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password, token, backupCode } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Verify 2FA token or backup code
    let isValid = false;
    if (token && user.twoFactorSecret) {
      isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
    } else if (backupCode) {
      isValid = await TwoFactorService.verifyBackupCode(user._id.toString(), backupCode);
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token or backup code' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.backupCodes = undefined;
    await user.save();

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get 2FA status
router.get('/status', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      enabled: user.twoFactorEnabled,
      backupCodesCount: user.backupCodes?.length || 0
    });
  } catch (error) {
    console.error('2FA status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new backup codes
router.post('/backup-codes', [
  protect,
  body('password').notEmpty().withMessage('Password is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA not enabled' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate new backup codes
    const backupCodes = TwoFactorService.generateBackupCodes();
    user.backupCodes = backupCodes;
    await user.save();

    res.json({
      backupCodes,
      message: 'New backup codes generated',
      warning: 'Old backup codes are now invalid'
    });
  } catch (error) {
    console.error('Backup codes generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
