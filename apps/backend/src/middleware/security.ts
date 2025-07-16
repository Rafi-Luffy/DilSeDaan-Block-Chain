import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login/register attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const donationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 donation requests per minute
  message: {
    error: 'Too many donation attempts, please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const campaignLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 campaign creations per hour
  message: {
    error: 'Too many campaign creation attempts, please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helmet security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://polygon-rpc.com", "https://rpc.ankr.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for payment gateways
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }))
    });
  }
  next();
};

// User registration validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name must contain only letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['donor', 'charity', 'admin'])
    .withMessage('Role must be donor, charity, or admin'),
  
  validateInput
];

// User login validation rules
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  validateInput
];

// Campaign creation validation rules
export const validateCampaignCreation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('Campaign title must be between 10 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Campaign description must be between 50 and 2000 characters'),
  
  body('targetAmount')
    .isFloat({ min: 100, max: 10000000 })
    .withMessage('Target amount must be between ₹100 and ₹1,00,00,000'),
  
  body('category')
    .isIn(['medical', 'education', 'disaster', 'animal', 'environment', 'social', 'other'])
    .withMessage('Invalid campaign category'),
  
  body('endDate')
    .isISO8601()
    .custom((value) => {
      const endDate = new Date(value);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1); // Max 1 year
      
      if (endDate <= now) {
        throw new Error('End date must be in the future');
      }
      if (endDate > maxDate) {
        throw new Error('Campaign cannot run for more than 1 year');
      }
      return true;
    }),
  
  validateInput
];

// Donation validation rules
export const validateDonation = [
  body('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
  
  body('amount')
    .isFloat({ min: 10, max: 1000000 })
    .withMessage('Donation amount must be between ₹10 and ₹10,00,000'),
  
  body('paymentMethod')
    .isIn(['crypto', 'upi', 'card', 'netbanking', 'wallet'])
    .withMessage('Invalid payment method'),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters'),
  
  validateInput
];

// Sanitization middleware to prevent XSS
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic HTML entity encoding for string fields
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

// CORS security middleware
export const secureCors = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// Request logging middleware for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'unknown';
  const method = req.method;
  const url = req.originalUrl;
  
  // Log suspicious activity patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // XSS
    /vbscript:/i,  // XSS
    /onload/i,  // XSS
    /onerror/i  // XSS
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(JSON.stringify(req.body))
  );
  
  if (isSuspicious) {
    console.warn(`🚨 SUSPICIOUS REQUEST: ${timestamp} - ${ip} - ${method} ${url} - ${userAgent}`);
  }
  
  // Log high-frequency requests from same IP
  const requestKey = `${ip}-${method}-${url}`;
  if (!req.app.locals.requestCounts) {
    req.app.locals.requestCounts = new Map();
  }
  
  const count = req.app.locals.requestCounts.get(requestKey) || 0;
  req.app.locals.requestCounts.set(requestKey, count + 1);
  
  // Reset counts every hour
  if (!req.app.locals.lastReset || Date.now() - req.app.locals.lastReset > 3600000) {
    req.app.locals.requestCounts.clear();
    req.app.locals.lastReset = Date.now();
  }
  
  next();
};
