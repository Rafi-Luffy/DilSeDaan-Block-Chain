# 🚀 DilSeDaan Deployment Guide

This guide covers deploying DilSeDaan to various platforms including GitHub Pages, cloud providers, and self-hosted environments.

## 📋 Quick Start

### One-Command Local Setup
```bash
git clone https://github.com/your-username/DilSeDaan.git
cd DilSeDaan
./start-dilsedaan.sh
```

Visit `http://localhost:3000` to see your local deployment!

---

## 🌐 GitHub Pages Deployment

### Automatic Deployment (Recommended)

1. **Fork the Repository**
   - Go to https://github.com/your-username/DilSeDaan
   - Click "Fork" to create your copy

2. **Enable GitHub Pages**
   ```bash
   # In your forked repository settings:
   # Settings → Pages → Source → GitHub Actions
   ```

3. **Configure Secrets**
   In your repository settings, add these secrets:
   ```
   INFURA_PROJECT_ID=your_infura_project_id
   CONTRACT_ADDRESS=your_deployed_contract_address
   DOCKER_USERNAME=your_docker_username (optional)
   DOCKER_PASSWORD=your_docker_password (optional)
   ```

4. **Deploy**
   - Push to `main` branch
   - GitHub Actions will automatically build and deploy
   - Your site will be available at: `https://your-username.github.io/DilSeDaan`

### Manual GitHub Pages Deployment

```bash
# Build the frontend
cd apps/frontend
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

---

## ☁️ Cloud Platform Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd apps/frontend
   vercel --prod
   ```

3. **Configure Environment Variables**
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_CONTRACT_ADDRESS
   # Add other environment variables
   ```

### Netlify Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd apps/frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add all VITE_ variables

### Railway Deployment (Backend)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy Backend**
   ```bash
   cd apps/backend
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set MONGODB_URI=your_mongodb_uri
   railway variables set JWT_SECRET=your_jwt_secret
   # Add other variables
   ```

---

## 🐳 Docker Deployment

### Local Docker Setup

1. **Build and Run**
   ```bash
   docker-compose up -d
   ```

2. **View Logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop Services**
   ```bash
   docker-compose down
   ```

### Production Docker Deployment

1. **Build Production Images**
   ```bash
   docker build -t dilsedaan-backend --target backend .
   docker build -t dilsedaan-frontend --target frontend .
   ```

2. **Run with Environment File**
   ```bash
   docker run -d \
     --name dilsedaan-backend \
     --env-file .env.production \
     -p 5001:5001 \
     dilsedaan-backend
   
   docker run -d \
     --name dilsedaan-frontend \
     -p 3000:80 \
     dilsedaan-frontend
   ```

### Docker Hub Deployment

```bash
# Tag images
docker tag dilsedaan-backend your-username/dilsedaan-backend:latest
docker tag dilsedaan-frontend your-username/dilsedaan-frontend:latest

# Push to Docker Hub
docker push your-username/dilsedaan-backend:latest
docker push your-username/dilsedaan-frontend:latest
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create Cluster**
   - Go to https://mongodb.com/atlas
   - Create free cluster
   - Get connection string

2. **Configure Access**
   ```bash
   # In your .env file
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dilsedaan
   ```

3. **Seed Database**
   ```bash
   ./start-dilsedaan.sh seed
   ```

### Self-hosted MongoDB

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb-community
   
   # Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

2. **Configure Connection**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/dilsedaan
   ```

---

## ⛓️ Blockchain Setup

### Polygon Network Configuration

1. **Get Infura API Key**
   - Visit https://infura.io
   - Create new project
   - Get API key for Polygon

2. **Deploy Smart Contracts**
   ```bash
   # Compile contracts
   npm run compile
   
   # Deploy to Polygon Mumbai (testnet)
   npm run deploy:mumbai
   
   # Deploy to Polygon mainnet
   npm run deploy:polygon
   ```

3. **Configure Frontend**
   ```bash
   VITE_WEB3_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/YOUR_API_KEY
   VITE_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
   VITE_CHAIN_ID=137
   ```

### MetaMask Integration

1. **Add Polygon Network to MetaMask**
   ```javascript
   // Network details for Polygon
   {
     "chainId": "0x89",
     "chainName": "Polygon Mainnet",
     "rpcUrls": ["https://polygon-rpc.com/"],
     "nativeCurrency": {
       "name": "MATIC",
       "symbol": "MATIC",
       "decimals": 18
     },
     "blockExplorerUrls": ["https://polygonscan.com/"]
   }
   ```

---

## 📧 Email Service Setup

### Gmail SMTP Configuration

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password**
   - Google Account → Security → App passwords
   - Generate password for "Mail"

3. **Configure Environment**
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-digit-app-password
   ```

### SendGrid Setup (Production)

1. **Get SendGrid API Key**
   - Visit https://sendgrid.com
   - Create account and get API key

2. **Configure Environment**
   ```bash
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

---

## 💳 Payment Gateway Setup

### Razorpay Configuration

1. **Create Razorpay Account**
   - Visit https://razorpay.com
   - Complete KYC verification

2. **Get API Keys**
   - Dashboard → Settings → API Keys
   - Get Key ID and Secret

3. **Configure Environment**
   ```bash
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_secret_key
   ```

4. **Setup Webhooks**
   ```bash
   # Webhook URL (replace with your domain)
   https://your-domain.com/api/payments/webhook
   
   # Events to subscribe:
   - payment.captured
   - payment.failed
   - order.paid
   ```

---

## 🔐 Environment Variables

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=https://your-api-domain.com/api
VITE_BACKEND_URL=https://your-api-domain.com

# App Configuration
VITE_APP_NAME=DilSeDaan
VITE_APP_DESCRIPTION=India's Blockchain-Powered Charity Platform

# Blockchain Configuration
VITE_WEB3_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_CHAIN_ID=137

# IPFS Configuration
VITE_IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Social Media
VITE_TWITTER_HANDLE=@DilSeDaan
VITE_FACEBOOK_PAGE=DilSeDaanIndia

# Feature Flags
VITE_ENABLE_BLOCKCHAIN=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_PWA=true
```

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dilsedaan

# Server
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SENDGRID_API_KEY=your-sendgrid-key

# Payments
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your-secret

# Blockchain
WEB3_PROVIDER_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your-private-key-for-deployment
CONTRACT_ADDRESS=your-deployed-contract-address

# IPFS
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/

# Security
CORS_ORIGIN=https://your-frontend-domain.com
SESSION_SECRET=your-session-secret

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

---

## 🚀 Production Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database seeded with initial data
- [ ] Smart contracts deployed and verified
- [ ] Email service tested
- [ ] Payment gateway configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured

### Post-deployment
- [ ] Health checks passing
- [ ] Application functionality tested
- [ ] Payment flow tested
- [ ] Email notifications working
- [ ] Blockchain integration verified
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented

### Security Checklist
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Regular security updates scheduled

---

## 📊 Monitoring & Maintenance

### Health Monitoring
```bash
# Check application health
curl https://your-domain.com/api/health

# Monitor server status
./start-dilsedaan.sh health
```

### Log Management
```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check error logs
tail -f /var/log/dilsedaan/error.log
```

### Performance Monitoring
- Set up Google Analytics
- Configure error tracking (Sentry)
- Monitor API performance
- Track user engagement

### Regular Maintenance
- Weekly security updates
- Monthly dependency updates
- Quarterly performance reviews
- Annual security audits

---

## 🆘 Troubleshooting

### Common Issues

1. **Application Won't Start**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear cache and reinstall
   ./start-dilsedaan.sh clean
   ./start-dilsedaan.sh install
   ```

2. **Database Connection Failed**
   ```bash
   # Check MongoDB URI
   echo $MONGODB_URI
   
   # Test connection
   mongosh "$MONGODB_URI"
   ```

3. **Payment Integration Issues**
   ```bash
   # Verify Razorpay credentials
   curl -u $RAZORPAY_KEY_ID:$RAZORPAY_KEY_SECRET \
     https://api.razorpay.com/v1/payments
   ```

4. **Blockchain Connection Failed**
   ```bash
   # Check network connectivity
   curl https://polygon-rpc.com/
   
   # Verify contract address
   echo $VITE_CONTRACT_ADDRESS
   ```

### Getting Help

- **GitHub Issues**: Report bugs and issues
- **Discussions**: Ask questions and get help
- **Email**: support@dilsedaan.com
- **Discord**: Join our community chat

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Multiple backend instances
- Database read replicas
- CDN for static assets

### Performance Optimization
- Database indexing
- API response caching
- Image optimization
- Code splitting

### Cost Optimization
- Resource monitoring
- Auto-scaling policies
- Database optimization
- CDN usage optimization

---

**🎉 Congratulations! Your DilSeDaan platform is now ready to serve India's charitable community!**

For additional support, visit our [GitHub repository](https://github.com/your-username/DilSeDaan) or contact our support team.
