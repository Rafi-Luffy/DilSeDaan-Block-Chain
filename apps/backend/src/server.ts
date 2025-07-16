import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Middleware
import errorHandler from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Routes
import authRoutes from './routes/auth-real';
import campaignRoutes from './routes/campaigns-real';
import donationRoutes from './routes/donations';
import adminRoutes from './routes/admin';
import blockchainRoutes from './routes/blockchain-polygon';
import paymentRoutes from './routes/payments';
import ipfsRoutes from './routes/ipfs';
import auditRoutes from './routes/audits';
import userRoutes from './routes/users';
import testEmailRoutes from './routes/testEmail';
import analyticsRoutes from './routes/analytics';
import twoFactorAuthRoutes from './routes/twoFactorAuth';

// Advanced routes
import advancedSearchRoutes from './routes/advancedSearch';
import notificationRoutes from './routes/notifications';
import mobileRoutes from './routes/mobile';
import recommendationRoutes from './routes/recommendations';
import contractDeploymentRoutes from './routes/contractDeployment';
import emailVerificationRoutes from './routes/emailVerification';
import securityRoutes from './routes/security';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('DilSeDaan API Server starting...');

// DB setup
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dilsedaan');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://polygon-rpc.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email test endpoint
app.get('/test-email', async (req, res) => {
  try {
    const { emailService } = require('./utils/emailService');
    
    const result = await emailService.sendWelcomeEmail({
      name: 'Test User',
      email: 'dilsedaan.charity@gmail.com',
      loginUrl: `${process.env.FRONTEND_URL}/dashboard`
    });

    res.json({
      success: true,
      emailSent: result,
      message: result ? 'Test email sent successfully!' : 'Failed to send test email',
      config: {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

console.log('Registering API routes...');

// API setup
app.use('/api/auth', authRoutes);
console.log('Auth routes registered');

app.use('/api/campaigns', campaignRoutes);
console.log('Campaign routes registered');

app.use('/api/donations', donationRoutes);
console.log('Donation routes registered');

app.use('/api/users', userRoutes);
console.log('User routes registered');

app.use('/api/admin', adminRoutes);
console.log('Admin routes registered');

app.use('/api/blockchain', blockchainRoutes);
console.log('Blockchain routes registered');

app.use('/api/payments', paymentRoutes);
console.log('Payment routes registered');

app.use('/api/ipfs', ipfsRoutes);
console.log('IPFS routes registered');

app.use('/api/audits', auditRoutes);
console.log('Audit routes registered');

app.use('/api/test/email', testEmailRoutes);
console.log('Test email routes registered');

app.use('/api/analytics', analyticsRoutes);
console.log('Analytics routes registered');

app.use('/api/auth', twoFactorAuthRoutes);
console.log('Two-Factor Authentication routes registered');

// Advanced feature routes
app.use('/api/advanced-search', advancedSearchRoutes);
console.log('Advanced Search routes registered');

app.use('/api/notifications', notificationRoutes);
console.log('Notification routes registered');

app.use('/api/mobile', mobileRoutes);
console.log('Mobile routes registered');

app.use('/api/recommendations', recommendationRoutes);
console.log('Recommendation routes registered');

app.use('/api/contract-deployment', contractDeploymentRoutes);
console.log('Contract Deployment routes registered');

app.use('/api/email-verification', emailVerificationRoutes);
console.log('Email Verification routes registered');

app.use('/api/security', securityRoutes);
console.log('Security Monitoring routes registered');

console.log('All routes registered successfully');

// Catch 404 and forward to error handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
