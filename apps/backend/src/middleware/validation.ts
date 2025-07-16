import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index';

// Handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: 'path' in error ? error.path : 'unknown',
      message: error.msg,
      value: 'value' in error ? error.value : undefined
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// User registration validation
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email too long'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['donor', 'creator', 'admin'])
    .withMessage('Role must be donor, creator, or admin'),
  
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Campaign creation validation
export const validateCampaign = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?]+$/)
    .withMessage('Title contains invalid characters'),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  body('targetAmount')
    .isFloat({ min: 100, max: 10000000 })
    .withMessage('Target amount must be between ₹100 and ₹1,00,00,000'),
  
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      const maxDeadline = new Date();
      maxDeadline.setFullYear(now.getFullYear() + 2); // Max 2 years
      
      if (deadline <= now) {
        throw new Error('Deadline must be in the future');
      }
      if (deadline > maxDeadline) {
        throw new Error('Deadline cannot be more than 2 years from now');
      }
      return true;
    }),
  
  body('category')
    .isIn(['education', 'healthcare', 'disaster-relief', 'poverty', 'environment', 'animal-welfare', 'community', 'other'])
    .withMessage('Invalid category'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location too long'),
  
  handleValidationErrors
];

// Donation validation
export const validateDonation = [
  body('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  
  body('amount')
    .isFloat({ min: 10, max: 1000000 })
    .withMessage('Donation amount must be between ₹10 and ₹10,00,000'),
  
  body('paymentMethod')
    .isIn(['upi', 'card', 'crypto', 'net-banking', 'wallet'])
    .withMessage('Invalid payment method'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message too long'),
  
  handleValidationErrors
];

// Payment validation
export const validatePayment = [
  body('amount')
    .isFloat({ min: 10, max: 1000000 })
    .withMessage('Payment amount must be between ₹10 and ₹10,00,000'),
  
  body('method')
    .isIn(['upi', 'card', 'net-banking', 'wallet'])
    .withMessage('Invalid payment method'),
  
  body('campaignId')
    .optional()
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be a positive integer up to 1000'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Search validation
export const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,]+$/)
    .withMessage('Search query contains invalid characters'),
  
  handleValidationErrors
];

// Blockchain address validation
export const validateBlockchainAddress = [
  body('address')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),
  
  handleValidationErrors
];

// File upload validation
export const validateFileUpload = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('File title too long'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('File description too long'),
  
  handleValidationErrors
];

// Admin action validation
export const validateAdminAction = [
  body('action')
    .isIn(['approve', 'reject', 'suspend', 'activate', 'verify'])
    .withMessage('Invalid admin action'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason too long'),
  
  handleValidationErrors
];

// Email verification validation
export const validateEmailVerification = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

export const validateVerifyEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid verification token'),
  handleValidationErrors
];

// Two-factor authentication validation
export const validateTwoFactorSetup = [
  body('secret')
    .isLength({ min: 16, max: 32 })
    .withMessage('Invalid 2FA secret'),
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('2FA token must be 6 digits'),
  handleValidationErrors
];

export const validateTwoFactorVerify = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('2FA token must be 6 digits'),
  handleValidationErrors
];

// Payment gateway validation
export const validatePaymentOrder = [
  body('amount')
    .isFloat({ min: 10, max: 1000000 })
    .withMessage('Amount must be between ₹10 and ₹10,00,000'),
  body('currency')
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('gateway')
    .isIn(['paytm', 'phonepe', 'gpay', 'upi'])
    .withMessage('Invalid payment gateway'),
  body('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  handleValidationErrors
];

export const validatePaymentVerification = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('signature')
    .notEmpty()
    .withMessage('Payment signature is required'),
  body('gateway')
    .isIn(['paytm', 'phonepe', 'gpay', 'upi'])
    .withMessage('Invalid payment gateway'),
  handleValidationErrors
];

// Social sharing validation
export const validateSocialShare = [
  body('platform')
    .isIn(['facebook', 'twitter', 'whatsapp', 'linkedin'])
    .withMessage('Invalid social platform'),
  body('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  handleValidationErrors
];

// Push notification validation
export const validatePushSubscription = [
  body('subscription')
    .isObject()
    .withMessage('Subscription must be an object'),
  body('subscription.endpoint')
    .isURL()
    .withMessage('Invalid subscription endpoint'),
  body('subscription.keys')
    .isObject()
    .withMessage('Subscription keys must be an object'),
  body('subscription.keys.p256dh')
    .notEmpty()
    .withMessage('p256dh key is required'),
  body('subscription.keys.auth')
    .notEmpty()
    .withMessage('auth key is required'),
  handleValidationErrors
];

export const validatePushNotification = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .isLength({ min: 1, max: 300 })
    .withMessage('Message must be between 1 and 300 characters'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
  handleValidationErrors
];

export const validateNotificationPreferences = [
  body('emailNotifications')
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('pushNotifications')
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  body('smsNotifications')
    .isBoolean()
    .withMessage('SMS notifications must be a boolean'),
  body('marketingEmails')
    .isBoolean()
    .withMessage('Marketing emails must be a boolean'),
  body('donationAlerts')
    .isBoolean()
    .withMessage('Donation alerts must be a boolean'),
  body('campaignUpdates')
    .isBoolean()
    .withMessage('Campaign updates must be a boolean'),
  handleValidationErrors
];

// Analytics validation
export const validateAnalyticsQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  query('campaignId')
    .optional()
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  handleValidationErrors
];

// Password reset validation
export const validatePasswordResetRequest = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

export const validatePasswordReset = [
  body('token')
    .isLength({ min: 32, max: 128 })
    .withMessage('Invalid reset token'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

// Advanced fraud detection validation
export const validateSuspiciousActivity = [
  body('activityType')
    .isIn(['multiple_donations', 'rapid_donations', 'large_donation', 'unusual_pattern'])
    .withMessage('Invalid activity type'),
  body('threshold')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Threshold must be a positive number'),
  handleValidationErrors
];

// KYC document validation
export const validateKYCDocument = [
  body('documentType')
    .isIn(['aadhar', 'pan', 'passport', 'voter_id', 'driving_license'])
    .withMessage('Invalid document type'),
  body('documentNumber')
    .isLength({ min: 5, max: 20 })
    .withMessage('Document number must be between 5 and 20 characters'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date'),
  handleValidationErrors
];

// Tax exemption validation
export const validateTaxExemption = [
  body('exemptionType')
    .isIn(['80G', '12A', 'FCRA'])
    .withMessage('Invalid exemption type'),
  body('certificateNumber')
    .isLength({ min: 5, max: 50 })
    .withMessage('Certificate number required'),
  body('validUntil')
    .isISO8601()
    .withMessage('Valid until date required'),
  handleValidationErrors
];

// Recurring donation validation
export const validateRecurringDonation = [
  body('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  body('amount')
    .isFloat({ min: 10, max: 100000 })
    .withMessage('Amount must be between ₹10 and ₹1,00,000'),
  body('frequency')
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid frequency'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date'),
  body('maxOccurrences')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Max occurrences must be between 1 and 120'),
  handleValidationErrors
];

// Withdrawal request validation  
export const validateWithdrawalRequest = [
  body('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  body('amount')
    .isFloat({ min: 100 })
    .withMessage('Minimum withdrawal amount is ₹100'),
  body('bankAccount')
    .isObject()
    .withMessage('Bank account details required'),
  body('bankAccount.accountNumber')
    .isLength({ min: 9, max: 18 })
    .withMessage('Invalid account number'),
  body('bankAccount.ifscCode')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .withMessage('Invalid IFSC code'),
  body('purpose')
    .isLength({ min: 10, max: 500 })
    .withMessage('Purpose must be between 10 and 500 characters'),
  handleValidationErrors
];

// Corporate CSR validation
export const validateCSRDonation = [
  body('companyName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name required'),
  body('cin')
    .matches(/^[LUF][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/)
    .withMessage('Invalid CIN format'),
  body('csrAmount')
    .isFloat({ min: 10000 })
    .withMessage('Minimum CSR amount is ₹10,000'),
  body('financialYear')
    .matches(/^[0-9]{4}-[0-9]{2}$/)
    .withMessage('Invalid financial year format (e.g., 2024-25)'),
  body('authorizedPerson')
    .isObject()
    .withMessage('Authorized person details required'),
  handleValidationErrors
];
