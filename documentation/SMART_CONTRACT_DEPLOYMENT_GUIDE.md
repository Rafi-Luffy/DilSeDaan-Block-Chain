# 🚀 Smart Contract Deployment - DilSeDaan Platform

## 📋 Deployment Checklist

### Prerequisites
- [x] Smart contracts compiled successfully
- [x] Hardhat configuration ready
- [x] Amoy testnet RPC configured
- [x] Deployment script created
- [ ] Private key for deployment wallet
- [ ] Testnet MATIC tokens for gas fees

---

## 🔧 Network Configuration

### Polygon Amoy Testnet
- **Network Name**: Polygon Amoy Testnet
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Chain ID**: 80002
- **Currency Symbol**: MATIC
- **Block Explorer**: https://amoy.polygonscan.com/

---

## 📝 Smart Contracts to Deploy

### 1. AuditContract.sol
- **Purpose**: Transparent auditing and verification
- **Features**: Campaign audits, milestone verification
- **Dependencies**: None

### 2. MilestoneContract.sol  
- **Purpose**: Project milestone tracking
- **Features**: Milestone creation, verification, fund release
- **Dependencies**: AuditContract address

### 3. DilSeDaanContract.sol (Main Contract)
- **Purpose**: Core donation functionality
- **Features**: Donations, campaigns, fund management
- **Dependencies**: MilestoneContract, AuditContract addresses

---

## 🔑 Wallet Setup Guide

### Step 1: Create/Import Deployment Wallet
1. Use MetaMask or any Ethereum wallet
2. Generate a new wallet for deployment (recommended)
3. Export the private key securely

### Step 2: Add Polygon Amoy Testnet
1. Open MetaMask
2. Add Custom Network:
   - Network Name: `Polygon Amoy Testnet`
   - RPC URL: `https://rpc-amoy.polygon.technology`
   - Chain ID: `80002`
   - Symbol: `MATIC`
   - Explorer: `https://amoy.polygonscan.com/`

### Step 3: Get Testnet MATIC
1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy" network
3. Enter your wallet address
4. Request testnet MATIC (minimum 0.1 MATIC needed)

---

## ⚙️ Deployment Process

### Option 1: With Your Own Wallet
```bash
# Set your private key (keep this secure!)
export PRIVATE_KEY="your-wallet-private-key-here"

# Deploy to Amoy testnet
npx hardhat run scripts/deploy-amoy.js --network amoy
```

### Option 2: Using Test Wallet (Demo Mode)
```bash
# We can create a demo wallet with public testnet funds
npm run deploy:demo
```

---

## 📊 Expected Deployment Output

```bash
🚀 Starting deployment to Polygon Amoy testnet...
📝 Deploying contracts with account: 0x...
💰 Account balance: 0.5 MATIC

📋 Deploying AuditContract...
✅ AuditContract deployed to: 0x...

🎯 Deploying MilestoneContract...
✅ MilestoneContract deployed to: 0x...

💝 Deploying DilSeDaanContract...
✅ DilSeDaanContract deployed to: 0x...

🔗 Setting up contract relationships...
✅ Contracts linked successfully

🎉 Deployment completed successfully!
```

---

## 🔍 Verification Process

### Automatic Verification
The deployment script will automatically verify contracts on PolygonScan using the API key.

### Manual Verification (if needed)
```bash
npx hardhat verify --network amoy CONTRACT_ADDRESS
```

---

## 📋 Post-Deployment Tasks

### 1. Update Backend Configuration
```bash
# Update apps/backend/.env
AUDIT_CONTRACT_ADDRESS=0x...
MILESTONE_CONTRACT_ADDRESS=0x...
DONATION_CONTRACT_ADDRESS=0x...
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

### 2. Update Frontend Configuration  
```bash
# Update apps/frontend/.env
VITE_AUDIT_CONTRACT_ADDRESS=0x...
VITE_MILESTONE_CONTRACT_ADDRESS=0x...
VITE_DONATION_CONTRACT_ADDRESS=0x...
VITE_NETWORK_CHAIN_ID=80002
```

### 3. Test Contract Interactions
- Test donation functionality
- Test milestone creation
- Test audit processes
- Verify transaction tracking

---

## 🚨 Security Considerations

### Private Key Management
- ✅ Never commit private keys to version control
- ✅ Use environment variables only
- ✅ Consider using a dedicated deployment wallet
- ✅ Rotate keys after deployment if needed

### Contract Security
- ✅ All contracts have been reviewed
- ✅ Standard OpenZeppelin patterns used
- ✅ Access controls implemented
- ✅ Emergency pause functionality included

---

## 🌐 Testnet vs Mainnet

### Current: Amoy Testnet (Development)
- **Purpose**: Testing and government submission
- **Cost**: Free (testnet MATIC)
- **Explorer**: https://amoy.polygonscan.com/
- **Suitable for**: Demo, testing, government review

### Future: Polygon Mainnet (Production)
- **Purpose**: Live platform
- **Cost**: Real MATIC required
- **Explorer**: https://polygonscan.com/
- **Suitable for**: Production deployment

---

## 🎯 Government Submission Requirements

For government submission, we need:
- [x] Compiled smart contracts
- [x] Deployment scripts
- [x] Network configuration
- [ ] Deployed contract addresses
- [ ] Verification on block explorer
- [ ] Test transaction examples

---

## 🔧 Troubleshooting

### Common Issues:

**"Insufficient funds for gas"**
- Solution: Get more testnet MATIC from faucet

**"Network connection failed"**
- Solution: Check RPC URL and internet connection

**"Private key not found"**
- Solution: Set PRIVATE_KEY environment variable

**"Contract verification failed"**
- Solution: Check API key and contract source code

---

## ✨ Ready to Deploy!

Once you have:
1. ✅ Private key for deployment wallet
2. ✅ Testnet MATIC for gas fees
3. ✅ Environment variables configured

Run the deployment command and the DilSeDaan smart contracts will be live on Polygon Amoy testnet! 🚀
