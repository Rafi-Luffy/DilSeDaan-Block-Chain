import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { AppError } from '../types/index';
import { sendTokenResponse, verifyRefreshToken, generateAccessToken } from '../utils/jwt';
import { protect } from '../middleware/auth';
import { AuthenticatedRequest } from '../types/index';
import { emailService } from '../utils/emailService';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, walletAddress } = req.body;

    console.log(`🔥 NEW REGISTRATION REQUEST - Email: ${email}, Name: ${name}`);

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { walletAddress: walletAddress || null }]
    });

    if (existingUser) {
      console.log(`⚠️ Registration failed - User already exists: ${email}`);
      return next(new AppError('User already exists with this email or wallet address', 400));
    }

    // Create user
    console.log(`👤 Creating new user account for: ${email}`);
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'donor',
      walletAddress,
      profile: {
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            showDonations: false,
            showProfile: true
          }
        }
      }
    });

    console.log(`✅ User account created successfully - ID: ${user._id}, Email: ${user.email}`);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    console.log(`🔐 Email verification token generated for: ${user.email}`);

    // Send both welcome email and verification email
    console.log(`🚀 Starting email sending process for user: ${user.email}`);
    
    try {
      // Send welcome email first
      console.log(`📧 Sending welcome email to: ${user.email}`);
      const welcomeResult = await emailService.sendWelcomeEmail({
        name: user.name,
        email: user.email,
        loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard`
      });
      
      if (welcomeResult) {
        console.log('✅ Welcome email sent successfully');
      } else {
        console.log('⚠️ Welcome email failed to send (returned false)');
      }

      // Send email verification
      console.log(`🔐 Sending verification email to: ${user.email}`);
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${emailVerificationToken}`;
      const verificationResult = await emailService.sendEmailVerification(user.email, user.name, verificationUrl);
      
      if (verificationResult) {
        console.log('✅ Verification email sent successfully');
      } else {
        console.log('⚠️ Verification email failed to send (returned false)');
      }
      
      console.log('🎯 Email sending process completed');
    } catch (emailError) {
      console.error('❌ Email sending failed with error:', emailError);
      console.error('❌ Error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
      // Don't fail registration if emails fail, but log the error for debugging
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new AppError('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Wallet login
// @route   POST /api/auth/wallet-login
// @access  Public
router.post('/wallet-login', async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return next(new AppError('Wallet address, signature, and message are required', 400));
    }

    // Find user by wallet address
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      // Create new user with wallet
      user = await User.create({
        name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        email: `${walletAddress}@wallet.local`,
        password: crypto.randomBytes(32).toString('hex'), // Random password
        role: 'donor',
        walletAddress: walletAddress.toLowerCase(),
        isEmailVerified: false,
        profile: {
          preferences: {
            language: 'en',
            notifications: {
              email: false,
              sms: false,
              push: true
            },
            privacy: {
              showDonations: false,
              showProfile: true
            }
          }
        }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put('/updatedetails', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const fieldsToUpdate: Record<string, any> = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      'profile.bio': req.body.bio,
      'profile.location': req.body.location,
      'profile.website': req.body.website,
      'profile.socialLinks': req.body.socialLinks,
      'profile.preferences': req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user?.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new AppError('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400));
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new AppError('Invalid refresh token', 401));
      }

      const accessToken = generateAccessToken(user._id);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          expiresIn: 3600
        }
      });
    } catch (error) {
      return next(new AppError('Invalid refresh token', 401));
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Please provide an email address', 400));
    }

    // Get user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal whether a user exists
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset email.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set expiry
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name
      );

      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, you will receive a password reset email.'
      });
    } catch (emailError) {
      console.error('Password reset email error:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the email. Please try again later.', 500));
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return next(new AppError('Please provide password and confirm password', 400));
    }

    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }

    // Get user by token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Send response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: 'User logged out successfully'
  });
});

export default router;
