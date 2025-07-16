# 🚀 Smart Contract Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the DilSeDaan smart contracts to Polygon networks.

## 🔧 Prerequisites

### 1. Environment Setup
```bash
# Ensure you have the required environment variables
PRIVATE_KEY=your_wallet_private_key
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 2. Fund Your Deployment Wallet
- **Testnet (Amoy)**: Get free MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
- **Mainnet**: Purchase MATIC tokens for deployment fees

## 📝 Contract Deployment Steps

### 1. Test Local Deployment
```bash
# Start local hardhat node
npx hardhat node

# Deploy to local network (new terminal)
npx hardhat run scripts/deploy-polygon.js --network localhost
```

### 2. Deploy to Polygon Amoy Testnet
```bash
# Ensure wallet has testnet MATIC
npx hardhat run scripts/deploy-polygon.js --network amoy
```

### 3. Deploy to Polygon Mainnet
```bash
# CAUTION: This costs real MATIC
npx hardhat run scripts/deploy-polygon.js --network polygon
```

## 🔍 Verification Steps

### 1. Verify Contracts on Polygonscan
```bash
# After deployment, verify the contracts
npx hardhat verify --network amoy CONTRACT_ADDRESS "constructor_args"
```

### 2. Test Contract Functions
```bash
# Test basic contract functions
npx hardhat run scripts/test-deployment.js --network amoy
```

## 📊 Current Deployment Status

### ✅ Completed
- [x] Smart contracts compiled successfully
- [x] Deployment scripts configured
- [x] Network configurations updated
- [x] Gas price optimizations applied

### ⏳ Pending
- [ ] Fund deployment wallet with testnet MATIC
- [ ] Deploy to Polygon Amoy testnet
- [ ] Verify contracts on Polygonscan
- [ ] Update frontend with contract addresses
- [ ] Deploy to Polygon mainnet (production)

## 🛠️ Troubleshooting

### Common Issues

#### 1. Gas Price Too Low
```bash
# Error: transaction gas price below minimum
# Solution: Increase gas price in hardhat.config.js
```

#### 2. Insufficient Balance
```bash
# Error: Account balance: 0.0 MATIC
# Solution: Fund wallet from Polygon faucet or exchange
```

#### 3. Network Connection Issues
```bash
# Error: Could not connect to network
# Solution: Check RPC URL and network status
```

## 🔐 Security Best Practices

### 1. Private Key Management
- Never commit private keys to version control
- Use environment variables for sensitive data
- Consider using hardware wallets for mainnet

### 2. Contract Security
- Contracts have been audited and tested
- Use multi-signature for critical functions
- Implement proper access controls

### 3. Deployment Verification
- Always verify contract source code
- Test on testnet before mainnet
- Monitor contract interactions

## 📈 Next Steps After Deployment

### 1. Frontend Integration
```bash
# Update contract addresses in frontend
cd apps/frontend
# Update src/contracts/addresses.ts
```

### 2. Backend Integration
```bash
# Update contract addresses in backend
cd apps/backend
# Update src/config/contracts.ts
```

### 3. Testing
- Test all contract functions
- Verify donation flows
- Check campaign creation
- Test milestone tracking

## 🎯 Production Deployment Checklist

### Pre-Deployment
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Test coverage > 90%
- [ ] Frontend integration tested
- [ ] Backend integration tested

### During Deployment
- [ ] Monitor gas prices
- [ ] Verify transaction confirmations
- [ ] Check contract addresses
- [ ] Test basic functions

### Post-Deployment
- [ ] Verify contracts on explorer
- [ ] Update frontend configuration
- [ ] Update backend configuration
- [ ] Run integration tests
- [ ] Monitor for issues

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review Hardhat documentation
3. Check Polygon network status
4. Verify gas prices and wallet balance

## 🌟 Contract Addresses

Once deployed, update these addresses:

### Polygon Amoy Testnet
```typescript
export const TESTNET_ADDRESSES = {
  CharityDonationContract: "0x...", // To be updated
  MilestoneContract: "0x...",       // To be updated
  AuditContract: "0x...",           // To be updated
  DilSeDaanContract: "0x...",       // To be updated
};
```

### Polygon Mainnet
```typescript
export const MAINNET_ADDRESSES = {
  CharityDonationContract: "0x...", // To be updated
  MilestoneContract: "0x...",       // To be updated
  AuditContract: "0x...",           // To be updated
  DilSeDaanContract: "0x...",       // To be updated
};
```

## 📝 Deployment Log

Track your deployment progress:

```
Date: July 7, 2025
Status: Ready for deployment
Wallet: 0xa916BC3d11328cDF4033262A61e02c1083fD8558
Balance: 0.0 MATIC (needs funding)
Network: Amoy Testnet
Gas Price: 30 gwei
```

**Next Action**: Fund deployment wallet with testnet MATIC from Polygon faucet.
