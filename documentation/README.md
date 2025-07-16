# DilSeDaan - Advanced Blockchain Charity Platform

🏥 **Complete transparency in charitable donations powered by Polygon blockchain with AI-driven features**

## 🌟 Project Overview

DilSeDaan is a cutting-edge charity donation platform that ensures complete transparency and accountability using blockchain technology. Every donation is tracked on the Polygon blockchain, providing donors with real-time insights into how their contributions are being used. The platform now includes advanced AI features, comprehensive security monitoring, and mobile PWA capabilities.

### ✨ Core Features

- **🔗 Blockchain Transparency**: All transactions recorded on Polygon network
- **💳 Multiple Payment Options**: Crypto wallet, UPI, cards, net banking
- **🌍 Multi-language Support**: English, Hindi, and 6 regional Indian languages
- **📱 Progressive Web App**: Full PWA with offline capabilities
- **🔐 MetaMask Integration**: Seamless wallet connection
- **📊 AI-Powered Analytics**: Machine learning insights and recommendations
- **📋 IPFS Document Storage**: Secure, decentralized document storage
- **🏆 Smart Milestone Tracking**: Automated progress with proof verification
- **🔍 Independent Audits**: Third-party verification system

### 🚀 Advanced Features (v2.0)

#### AI & Machine Learning
- **🤖 Smart Recommendations**: AI-powered campaign suggestions
- **📈 Predictive Analytics**: Success rate predictions and optimization
- **🎯 Personalized Experience**: ML-driven user personalization
- **📊 Real-time Insights**: Advanced data visualization and trends

#### Security & Monitoring
- **🛡️ Advanced Security Monitoring**: Real-time threat detection
- **🚨 Automated Alerts**: Security incident notifications
- **🔒 Rate Limiting**: DDoS protection and request throttling
- **📝 Comprehensive Audit Trail**: Complete activity logging

#### Mobile & PWA
- **📱 Native App Experience**: Install as mobile app
- **🔄 Offline Functionality**: Work without internet connection
- **🔔 Push Notifications**: Real-time updates and alerts
- **⚡ Background Sync**: Automatic data synchronization

#### Advanced Search & Discovery
- **🔍 Intelligent Search**: AI-powered search with filters
- **🏷️ Smart Categorization**: Automatic campaign classification
- **📍 Location-based Discovery**: Geographic campaign filtering
- **⭐ Relevance Scoring**: Personalized search results

#### Real-time Features
- **📡 Live Updates**: Real-time donation tracking
- **💬 Instant Notifications**: Push and in-app notifications
- **📊 Live Analytics**: Real-time dashboard updates
- **🔄 Auto-refresh**: Automatic data synchronization

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom warm color palette
- **State Management**: Zustand for global state
- **Blockchain**: Ethers.js for Polygon integration
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Translations**: React i18next

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **File Storage**: AWS S3 + IPFS (Pinata)
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate limiting

### Blockchain (Solidity + Polygon)
- **Network**: Polygon mainnet & Mumbai testnet
- **Contracts**: Donation, Milestone, Audit management
- **Tools**: Hardhat for development
- **Verification**: Polygonscan integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- MetaMask wallet
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd demo-master
```

2. **Install dependencies**
```bash
# Install workspace dependencies
pnpm install

# Or install for each app separately
cd apps/frontend && npm install
cd ../backend && npm install
```

3. **Environment Setup**
```bash
# Copy environment files
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env
cp apps/backend/.env.example apps/backend/.env
```

4. **Configure environment variables**
Edit the `.env` files with your actual values:
- MongoDB connection string
- JWT secret
- Polygon RPC URLs
- API keys (Polygonscan, Pinata, etc.)

5. **Start MongoDB**
```bash
# Using MongoDB Community
mongod

# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. **Deploy Smart Contracts** (Optional - for full functionality)
```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy-polygon.js --network mumbai

# Update contract addresses in environment files
```

7. **Start the application**
```bash
# Development mode (both frontend and backend)
pnpm dev

# Or start separately
cd apps/backend && npm run dev  # Port 5000
cd apps/frontend && npm run dev # Port 3000
```

### 📱 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **MongoDB**: mongodb://localhost:27017/dilsedaan

## 💳 Payment Integration

### Crypto Payments (Polygon)
- MetaMask wallet connection
- MATIC token support
- Real-time transaction tracking
- Blockchain verification

### Traditional Payments
- Credit/Debit cards via Razorpay
- UPI payments
- Net banking
- Digital wallets

## 🌍 Multi-language Support

The platform supports 8 languages:
- **English** (en)
- **Hindi** (hi) 
- **Tamil** (ta)
- **Telugu** (te)
- **Bengali** (bn)
- **Marathi** (mr)
- **Gujarati** (gu)
- **Kannada** (kn)

### Adding New Languages
1. Create a new JSON file in `apps/frontend/src/i18n/locales/`
2. Add the language code to the supported languages list
3. Update the language switcher component

## 🔐 Security Features

- **JWT Authentication**: Secure API access
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: HTTP security headers
- **Blockchain Verification**: Immutable transaction records

## 📊 Admin Dashboard

Admins have access to:
- **Campaign Management**: Create, edit, approve campaigns
- **User Management**: User verification and roles
- **Donation Analytics**: Real-time donation statistics
- **Blockchain Monitoring**: Transaction status and verification
- **Audit Reports**: Independent verification results
- **IPFS Document Management**: Secure document storage

## 🧪 Testing

### Frontend Testing
```bash
cd apps/frontend
npm run test
```

### Backend Testing
```bash
cd apps/backend
npm run test
```

### Smart Contract Testing
```bash
npx hardhat test
```

## 📦 Deployment

### Frontend (Vercel/Netlify)
```bash
cd apps/frontend
npm run build
# Deploy the dist/ folder
```

### Backend (Heroku/AWS/DigitalOcean)
```bash
cd apps/backend
npm run build
npm start
```

### Smart Contracts (Polygon)
```bash
# Deploy to Polygon mainnet
npx hardhat run scripts/deploy-polygon.js --network polygon

# Verify contracts
npx hardhat verify --network polygon <contract-address>
```

## 🛠️ Development Tools

### Available Scripts
```bash
# Development
pnpm dev              # Start all services
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only

# Building
pnpm build            # Build all apps
pnpm build:frontend   # Build frontend
pnpm build:backend    # Build backend

# Testing
pnpm test             # Run all tests
pnpm lint             # Lint all code
pnpm format           # Format code

# Blockchain
npm run compile       # Compile contracts
npm run deploy:mumbai # Deploy to testnet
npm run deploy:polygon # Deploy to mainnet
```

### Code Structure
```
demo-master/
├── apps/
│   ├── frontend/          # React application
│   │   ├── src/
│   │   │   ├── components/    # Reusable components
│   │   │   ├── pages/         # Page components
│   │   │   ├── store/         # Zustand stores
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # Utility functions
│   │   │   ├── i18n/          # Internationalization
│   │   │   └── types/         # TypeScript types
│   │   └── public/            # Static assets
│   └── backend/           # Express API server
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── models/        # Database models
│       │   ├── middleware/    # Express middleware
│       │   ├── utils/         # Utility functions
│       │   └── config/        # Configuration
├── contracts/             # Smart contracts
├── scripts/              # Deployment scripts
└── docs/                 # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Update documentation for new features
- Ensure accessibility compliance

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Campaign Endpoints
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Donation Endpoints
- `POST /api/donations` - Make a donation
- `GET /api/donations` - List donations
- `GET /api/donations/:id` - Get donation details

### Blockchain Endpoints
- `GET /api/blockchain/status` - Network status
- `POST /api/blockchain/verify` - Verify transaction
- `GET /api/blockchain/contracts` - Contract addresses

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_DONATION_CONTRACT_ADDRESS=0x...
VITE_POLYGON_RPC_URL=https://polygon-rpc.com
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

#### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dilsedaan
JWT_SECRET=your-secret-key
POLYGON_RPC_URL=https://polygon-rpc.com
RAZORPAY_KEY_SECRET=...
```

## 🚨 Troubleshooting

### Common Issues

**1. MetaMask not connecting**
- Ensure MetaMask is installed and unlocked
- Switch to Polygon network
- Check if the site is allowed in MetaMask

**2. Transactions failing**
- Check MATIC balance for gas fees
- Verify contract addresses are correct
- Ensure you're on the correct network

**3. Backend not starting**
- Verify MongoDB is running
- Check environment variables
- Ensure all dependencies are installed

**4. Frontend build failing**
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all environment variables

### Getting Help

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Security**: Email security@dilsedaan.org

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Polygon Network** - For fast and affordable blockchain transactions
- **OpenZeppelin** - For secure smart contract libraries
- **React Community** - For the amazing ecosystem
- **Contributors** - For making this platform possible

---

**Made with ❤️ for transparent charitable giving**

*DilSeDaan - Where every rupee counts and every donation matters*
