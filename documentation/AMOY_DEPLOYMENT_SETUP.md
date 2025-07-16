# Polygon Amoy Testnet Deployment Setup

## 📋 Deployment Wallet Created

**Wallet Address:** `0xa916BC3d11328cDF4033262A61e02c1083fD8558`

**Private Key:** `0xc3958dab794c49bd1bc02b5d9efb303b1e02dcea432a2222c579fbc9a6e1a393`

**Mnemonic:** `tissue witness lion win minimum matrix service multiply hand badge transfer inside`

⚠️ **Important:** This is a testnet-only wallet. Never use for mainnet or real funds.

## 🚰 Funding the Wallet

**Step 1:** Get Amoy testnet MATIC from the official faucet:
- **Polygon Faucet:** https://faucet.polygon.technology/
- **Alternative Faucet:** https://www.alchemy.com/faucets/polygon-amoy
- **QuickNode Faucet:** https://faucet.quicknode.com/polygon/amoy

**Step 2:** Request MATIC for address: `0xa916BC3d11328cDF4033262A61e02c1083fD8558`

**Step 3:** Verify the balance on Amoy PolygonScan:
- https://amoy.polygonscan.com/address/0xa916BC3d11328cDF4033262A61e02c1083fD8558

## 🚀 Deploy Contracts

Once the wallet is funded with at least 0.1 MATIC, run:

```bash
npx hardhat run scripts/deploy-amoy.js --network amoy
```

## 📊 Expected Gas Costs

- **AuditContract:** ~0.005 MATIC
- **MilestoneContract:** ~0.007 MATIC  
- **DilSeDaanContract:** ~0.015 MATIC
- **Setup Transactions:** ~0.003 MATIC
- **Total:** ~0.03 MATIC

## 📝 Post-Deployment

After successful deployment:

1. Contract addresses will be saved to `deployment-amoy.json`
2. Update frontend and backend `.env` files with new addresses
3. Verify contracts on Amoy PolygonScan
4. Test contract interactions

## 🔗 Useful Links

- **Amoy PolygonScan:** https://amoy.polygonscan.com/
- **Amoy RPC:** https://rpc-amoy.polygon.technology
- **Chain ID:** 80002
- **Network Name:** Polygon Amoy Testnet
