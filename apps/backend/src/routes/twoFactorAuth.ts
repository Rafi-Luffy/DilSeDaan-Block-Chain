import express from 'express';
import { protect } from '../middleware/auth';
import TwoFactorAuthService from '../utils/twoFactorAuth';
import { User } from '../models/User';
import { AppError } from '../types/index';
import { AuthenticatedRequest } from '../types/index';

const router = express.Router();

// @desc    Setup 2FA for user
// @route   POST /api/auth/2fa/setup
// @access  Private
router.post('/setup', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.twoFactorEnabled) {
      return next(new AppError('Two-factor authentication is already enabled', 400));
    }

    const setup = await TwoFactorAuthService.generateTwoFactorSetup(userId, user.email);

    res.status(200).json({
      success: true,
      data: {
        secret: setup.secret,
        qrCode: setup.qrCodeUrl,
        backupCodes: setup.backupCodes,
        message: 'Scan the QR code with your authenticator app and verify with a 6-digit code'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Enable 2FA for user
// @route   POST /api/auth/2fa/enable
// @access  Private
router.post('/enable', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { secret, token, backupCodes } = req.body;

    if (!secret || !token || !backupCodes) {
      return next(new AppError('Secret, token, and backup codes are required', 400));
    }

    await TwoFactorAuthService.enableTwoFactor(req.user!._id, secret, token, backupCodes);

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been enabled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Disable 2FA for user
// @route   POST /api/auth/2fa/disable
// @access  Private
router.post('/disable', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { password, token } = req.body;

    const user = await User.findById(req.user!._id).select('+password +twoFactorSecret');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid password', 401));
    }

    // Verify 2FA token if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!token) {
        return next(new AppError('2FA token is required', 400));
      }

      const isTokenValid = TwoFactorAuthService.verifyToken(user.twoFactorSecret, token);
      if (!isTokenValid) {
        return next(new AppError('Invalid 2FA token', 401));
      }
    }

    await TwoFactorAuthService.disableTwoFactor(req.user!._id);

    res.status(200).json({
      success: true,
      message: 'Two-factor authentication has been disabled'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify 2FA token during login
// @route   POST /api/auth/2fa/verify
// @access  Public (but requires valid user session)
router.post('/verify', async (req, res, next) => {
  try {
    const { userId, token, backupCode } = req.body;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const user = await User.findById(userId).select('+twoFactorSecret');
    
    if (!user || !user.twoFactorEnabled) {
      return next(new AppError('Two-factor authentication is not enabled for this user', 400));
    }

    let isValid = false;

    // Try regular 2FA token first
    if (token && user.twoFactorSecret) {
      isValid = TwoFactorAuthService.verifyToken(user.twoFactorSecret, token);
    }

    // If regular token fails, try backup code
    if (!isValid && backupCode) {
      isValid = await TwoFactorAuthService.verifyBackupCode(userId, backupCode);
    }

    if (!isValid) {
      return next(new AppError('Invalid verification code', 401));
    }

    // Generate JWT token for successful 2FA verification
    const jwtToken = user.generateAuthToken();

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: 'Two-factor authentication verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Regenerate backup codes
// @route   POST /api/auth/2fa/regenerate-backup-codes
// @access  Private
router.post('/regenerate-backup-codes', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { password, token } = req.body;

    const user = await User.findById(req.user!._id).select('+password +twoFactorSecret');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (!user.twoFactorEnabled) {
      return next(new AppError('Two-factor authentication is not enabled', 400));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid password', 401));
    }

    // Verify 2FA token
    if (!token || !user.twoFactorSecret) {
      return next(new AppError('2FA token is required', 400));
    }

    const isTokenValid = TwoFactorAuthService.verifyToken(user.twoFactorSecret, token);
    if (!isTokenValid) {
      return next(new AppError('Invalid 2FA token', 401));
    }

    const newBackupCodes = await TwoFactorAuthService.regenerateBackupCodes(req.user!._id);

    res.status(200).json({
      success: true,
      data: {
        backupCodes: newBackupCodes
      },
      message: 'New backup codes generated successfully. Please store them safely.'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get 2FA status
// @route   GET /api/auth/2fa/status
// @access  Private
router.get('/status', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.user!._id);
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        enabled: user.twoFactorEnabled || false,
        enabledAt: user.twoFactorEnabledAt || null,
        backupCodesCount: user.backupCodes ? user.backupCodes.length : 0
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
