import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { emailService } from '../utils/emailService';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { protect } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/index';
import { validateEmailVerification, validateVerifyEmail } from '../middleware/validation';
const EmailVerificationService = require('../services/emailVerificationService');
const PasswordResetService = require('../services/passwordResetService');

const emailVerificationService = new EmailVerificationService();
const passwordResetService = new PasswordResetService();

const router = Router();

// Send email verification using enhanced service
router.post('/send-verification', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already verified' 
      });
    }

    // Send verification email using enhanced service
    const result = await emailVerificationService.sendVerificationEmail(user, 'signup');
    
    if (result.success) {
      res.json({ 
        success: true,
        message: result.message,
        expiresIn: result.expiresIn
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Failed to send verification email' 
      });
    }
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// Verify email token
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Token is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Valid email is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const emailSent = await emailService.sendEmailVerification(user.email, user.name, verificationUrl);
    
    if (emailSent) {
      res.json({ message: 'Verification email resent successfully' });
    } else {
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/request-password-reset', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset email has been sent.'
      });
    }

    // Create reset request
    const resetResult = await passwordResetService.createPasswordResetRequest(user, clientIp);
    
    if (!resetResult.success) {
      return res.status(429).json({
        success: false,
        error: resetResult.message,
        retryAfter: resetResult.retryAfter
      });
    }

    // Send reset email
    const emailResult = await emailVerificationService.sendPasswordResetEmail(user);
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Password reset email sent successfully',
        expiresIn: resetResult.expiresIn
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify password reset code
router.post('/verify-reset-code', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const verificationResult = await passwordResetService.verifyResetCode(user._id, code);
    
    res.json(verificationResult);

  } catch (error) {
    console.error('Reset code verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reset password with token
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').notEmpty().withMessage('Password confirmation is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { token, password, confirmPassword } = req.body;

    const resetResult = await passwordResetService.resetPassword(token, password, confirmPassword);
    
    if (!resetResult.success) {
      return res.status(400).json(resetResult);
    }

    // Update user password in database
    const user = await User.findById(resetResult.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.password = resetResult.hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify email with code
router.post('/verify-code', [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { code } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const verificationResult = await emailVerificationService.verifyEmailCode(userId, code);
    
    if (verificationResult.success) {
      // Update user verification status
      await User.findByIdAndUpdate(userId, {
        emailVerified: true,
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      });
    }

    res.json(verificationResult);

  } catch (error) {
    console.error('Email code verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get verification service statistics (admin only)
router.get('/stats', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const verificationStats = emailVerificationService.getVerificationStats();
    const resetStats = passwordResetService.getResetStats();

    res.json({
      success: true,
      data: {
        emailVerification: verificationStats,
        passwordReset: resetStats,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
