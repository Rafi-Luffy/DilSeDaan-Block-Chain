import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/charity_platform');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https:"],
    },
  },
}));

// CORS configuration optimized for Polygon mainnet/testnet
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://your-domain.com', // Add your production domain
    /^https:\/\/.*\.vercel\.app$/, // Vercel deployments
    /^https:\/\/.*\.netlify\.app$/, // Netlify deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    blockchain: {
      connected: false,
      network: 'polygon',
      contract: false
    }
  });
});

// Basic API endpoints
app.get('/api', (req, res) => {
  res.json({
    message: 'DilSeDaan Charity Platform API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      campaigns: '/api/campaigns',
      donations: '/api/donations',
      users: '/api/users',
      blockchain: '/api/blockchain'
    }
  });
});

// Placeholder auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    success: true,
    message: 'User registration endpoint - under development',
    user: {
      id: 'user_123',
      email: req.body.email,
      name: req.body.name
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true,
    message: 'User login endpoint - under development',
    user: {
      id: 'user_123',
      email: req.body.email || 'demo@example.com',
      name: 'Demo User'
    },
    token: 'demo_jwt_token_123'
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({ 
    success: true,
    message: 'User profile endpoint - under development',
    user: {
      id: 'user_123',
      email: 'demo@example.com',
      name: 'Demo User'
    }
  });
});

// Placeholder campaign endpoints
app.get('/api/campaigns', (req, res) => {
  res.json({ 
    success: true,
    message: 'Campaigns endpoint - working',
    campaigns: [
      {
        id: 'camp_1',
        title: 'Education for Rural Children',
        description: 'Providing quality education to children in rural areas',
        targetAmount: 100000,
        raisedAmount: 45000,
        status: 'active',
        category: 'education',
        creator: 'Demo User',
        endDate: '2024-12-31T23:59:59.000Z'
      },
      {
        id: 'camp_2',
        title: 'Healthcare for All',
        description: 'Medical support for underprivileged communities',
        targetAmount: 150000,
        raisedAmount: 78000,
        status: 'active',
        category: 'healthcare',
        creator: 'Demo User',
        endDate: '2024-12-31T23:59:59.000Z'
      }
    ]
  });
});

app.post('/api/campaigns', (req, res) => {
  res.json({ 
    success: true,
    message: 'Create campaign endpoint - working',
    campaign: {
      id: 'camp_' + Date.now(),
      ...req.body,
      creator: 'Demo User',
      status: 'pending_review',
      raisedAmount: 0,
      createdAt: new Date().toISOString()
    }
  });
});

app.get('/api/campaigns/:id', (req, res) => {
  res.json({ 
    success: true,
    message: `Campaign ${req.params.id} endpoint - working`,
    campaign: {
      id: req.params.id,
      title: 'Education for Rural Children',
      description: 'Providing quality education to children in rural areas',
      targetAmount: 100000,
      raisedAmount: 45000,
      status: 'active',
      category: 'education',
      creator: 'Demo User',
      endDate: '2024-12-31T23:59:59.000Z'
    }
  });
});

// Placeholder donation endpoints
app.get('/api/donations', (req, res) => {
  res.json({ 
    success: true,
    message: 'Donations endpoint - working',
    donations: [
      {
        id: 'don_1',
        campaignId: 'camp_1',
        amount: 5000,
        donorName: 'Anonymous',
        message: 'Great cause!',
        timestamp: new Date().toISOString()
      },
      {
        id: 'don_2',
        campaignId: 'camp_2',
        amount: 10000,
        donorName: 'Demo Donor',
        message: 'Happy to contribute',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/donations', (req, res) => {
  res.json({ 
    success: true,
    message: 'Create donation endpoint - working',
    donation: {
      id: 'don_' + Date.now(),
      ...req.body,
      timestamp: new Date().toISOString(),
      status: 'completed'
    }
  });
});

// Placeholder blockchain endpoints
app.get('/api/blockchain/status', (req, res) => {
  res.json({
    status: 'connected',
    network: 'polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    contractAddress: process.env.DONATION_CONTRACT_ADDRESS || 'not_deployed'
  });
});

app.get('/api/blockchain/campaigns', (req, res) => {
  res.json({ 
    message: 'Blockchain campaigns endpoint - under development',
    contracts: []
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

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
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 API endpoints: http://localhost:${PORT}/api`);
});

export default app;
