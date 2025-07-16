# 🚀 Testnet Deployment Guide - DilSeDaan Platform

## 📋 Prerequisites for Polygon Amoy Testnet Deployment

### 1. 💰 Fund Your Deployment Wallet

**Your deployment wallet address:** `0xa916BC3d11328cDF4033262A61e02c1083fD8558`

**Current balance:** `0.0 MATIC` ❌

### 2. 🔗 Polygon Amoy Testnet Faucets

To get testnet MATIC for deployment, use these faucets:

#### Option 1: Official Polygon Faucet
- **URL:** https://faucet.polygon.technology/
- **Steps:**
  1. Visit the faucet website
  2. Select "Polygon Amoy" network
  3. Connect your wallet or enter address: `0xa916BC3d11328cDF4033262A61e02c1083fD8558`
  4. Complete verification (usually Twitter/Discord)
  5. Request testnet MATIC

#### Option 2: Alchemy Faucet
- **URL:** https://www.alchemy.com/faucets/polygon-amoy
- **Steps:**
  1. Visit Alchemy faucet
  2. Enter wallet address: `0xa916BC3d11328cDF4033262A61e02c1083fD8558`
  3. Complete verification
  4. Request 0.5 MATIC

#### Option 3: QuickNode Faucet
- **URL:** https://faucet.quicknode.com/polygon/amoy
- **Steps:**
  1. Visit QuickNode faucet
  2. Enter wallet address: `0xa916BC3d11328cDF4033262A61e02c1083fD8558`
  3. Complete verification
  4. Request testnet MATIC

### 3. 🔧 Required Amount

**Minimum required:** 0.1 MATIC (recommended: 0.5 MATIC)
- Contract deployment: ~0.05 MATIC
- Gas buffer: ~0.05 MATIC
- Additional transactions: ~0.4 MATIC

## 🚀 Deployment Process

### Step 1: Verify Balance
```bash
# Check if wallet has sufficient balance
npx hardhat run scripts/check-balance.js --network amoy
```

### Step 2: Deploy Contracts
```bash
# Deploy all contracts to Amoy testnet
npx hardhat run scripts/deploy-polygon.js --network amoy
```

### Step 3: Verify Contracts (Optional)
```bash
# Verify contracts on PolygonScan
npx hardhat verify --network amoy [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
```

## 📝 Current Deployment Status

### ✅ Ready for Deployment
- [x] Smart contracts compiled successfully
- [x] Deployment scripts configured
- [x] Hardhat configuration updated
- [x] Gas settings optimized for Amoy testnet
- [x] Environment variables configured

### ❌ Pending Requirements
- [ ] Deployment wallet funded with testnet MATIC
- [ ] Contract deployment to Amoy testnet
- [ ] Contract verification on PolygonScan
- [ ] Post-deployment testing

## 🛠️ Troubleshooting

### Gas Price Issues
If you encounter gas price errors:
1. Current gas settings are optimized for Amoy testnet
2. MaxPriorityFeePerGas: 40 gwei
3. MaxFeePerGas: 60 gwei

### Network Issues
- RPC URL: https://rpc-amoy.polygon.technology
- Chain ID: 80002
- Block Explorer: https://amoy.polygonscan.com/

## 📊 Expected Gas Costs

| Contract | Estimated Gas | Cost (MATIC) |
|----------|---------------|--------------|
| CharityDonationContract | ~2,500,000 | ~0.025 |
| MilestoneContract | ~1,500,000 | ~0.015 |
| AuditContract | ~1,000,000 | ~0.010 |
| **Total** | **~5,000,000** | **~0.050** |

## 🔄 Next Steps

1. **Fund the deployment wallet** with testnet MATIC using the faucets above
2. **Run the deployment script** once funding is complete
3. **Verify contracts** on PolygonScan for transparency
4. **Update environment variables** with deployed contract addresses
5. **Test the deployment** using the demo script

## 📞 Support

If you encounter issues:
- Check Polygon Amoy network status
- Verify faucet availability
- Ensure private key is correctly set in environment variables
- Contact support if persistent issues occur

---

**Note:** This is a testnet deployment. No real funds are required or at risk.
