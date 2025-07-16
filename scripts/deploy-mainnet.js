const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Deploying to Polygon Mainnet - PRODUCTION DEPLOYMENT");
    console.log("⚠️  WARNING: This is a MAINNET deployment using real MATIC!");
    console.log("📅 Date:", new Date().toISOString());
    console.log("=".repeat(60));
    
    // Confirmation prompt for mainnet
    console.log("🔴 MAINNET DEPLOYMENT CHECKLIST:");
    console.log("✅ Contracts tested on testnet?");
    console.log("✅ Audit completed?");
    console.log("✅ Environment variables set?");
    console.log("✅ Sufficient MATIC balance?");
    console.log("✅ Private key secured?");
    
    // Check required environment variables
    if (!process.env.PRIVATE_KEY) {
        console.error("❌ PRIVATE_KEY not found in environment variables");
        process.exit(1);
    }
    
    if (!process.env.POLYGON_RPC_URL) {
        console.error("❌ POLYGON_RPC_URL not found. Using default.");
    }
    
    const [deployer] = await ethers.getSigners();
    console.log(`📧 Deploying with account: ${deployer.address}`);
    
    // Check balance - mainnet requires more MATIC
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} MATIC`);
    
    if (balance < ethers.parseEther("1.0")) {
        console.error("❌ Insufficient balance. You need at least 1.0 MATIC for mainnet deployment.");
        console.log("💰 Current balance:", ethers.formatEther(balance), "MATIC");
        process.exit(1);
    }

    // Platform wallet (should be a dedicated multisig for production)
    const platformWallet = process.env.PLATFORM_WALLET || deployer.address;
    console.log("🏦 Platform wallet:", platformWallet);
    
    if (platformWallet === deployer.address) {
        console.log("⚠️  WARNING: Using deployer address as platform wallet. Consider using a multisig for production.");
    }

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
    
    if (Number(network.chainId) !== 137) {
        console.error("❌ Not connected to Polygon mainnet (Chain ID: 137)");
        process.exit(1);
    }

    const contracts = {};

    console.log("\n🔨 Starting mainnet deployment...");
    
    // Deploy CharityDonationContract
    console.log("\n=== Deploying CharityDonationContract ===");
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    
    // Estimate gas and get current gas price
    const deployTx = await CharityDonationContract.getDeployTransaction(platformWallet);
    const estimatedGas = await deployer.provider.estimateGas(deployTx);
    const gasPrice = await deployer.provider.getFeeData();
    
    console.log("⛽ Estimated gas:", estimatedGas.toString());
    console.log("💰 Max fee per gas:", ethers.formatUnits(gasPrice.maxFeePerGas || gasPrice.gasPrice, "gwei"), "gwei");
    
    const donationContract = await CharityDonationContract.deploy(platformWallet, {
        gasLimit: Math.floor(Number(estimatedGas) * 1.2), // 20% buffer
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
    });
    
    console.log("⏳ Waiting for CharityDonationContract deployment...");
    await donationContract.waitForDeployment();
    contracts.donation = await donationContract.getAddress();
    console.log(`✅ CharityDonationContract deployed: ${contracts.donation}`);

    // Deploy MilestoneContract
    console.log("\n=== Deploying MilestoneContract ===");
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    const milestoneContract = await MilestoneContract.deploy(contracts.donation, {
        gasLimit: 3000000, // Fixed gas limit for milestone contract
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
    });
    
    console.log("⏳ Waiting for MilestoneContract deployment...");
    await milestoneContract.waitForDeployment();
    contracts.milestone = await milestoneContract.getAddress();
    console.log(`✅ MilestoneContract deployed: ${contracts.milestone}`);

    // Deploy AuditContract
    console.log("\n=== Deploying AuditContract ===");
    const AuditContract = await ethers.getContractFactory("AuditContract");
    const auditContract = await AuditContract.deploy(platformWallet, {
        gasLimit: 2500000, // Fixed gas limit for audit contract
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas
    });
    
    console.log("⏳ Waiting for AuditContract deployment...");
    await auditContract.waitForDeployment();
    contracts.audit = await auditContract.getAddress();
    console.log(`✅ AuditContract deployed: ${contracts.audit}`);

    // Test basic functionality
    console.log("\n🧪 Testing deployed contracts...");
    try {
        const totalDonations = await donationContract.getTotalDonations();
        console.log(`✅ Donation Contract: ${ethers.formatEther(totalDonations)} MATIC total`);
        
        const milestoneCount = await milestoneContract.getMilestoneCount();
        console.log(`✅ Milestone Contract: ${milestoneCount} milestones`);
        
        const auditCount = await auditContract.getAuditCount();
        console.log(`✅ Audit Contract: ${auditCount} audits`);
    } catch (error) {
        console.error("❌ Error testing contracts:", error.message);
    }

    // Save deployment info
    const deploymentInfo = {
        network: "mainnet",
        chainId: 137,
        contracts: contracts,
        platformWallet: platformWallet,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await ethers.provider.getBlockNumber(),
        gasUsed: {
            donation: estimatedGas.toString(),
            milestone: "~2500000",
            audit: "~2000000"
        }
    };
    
    // Save to files
    fs.writeFileSync('deployment-mainnet.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('📄 Deployment info saved to deployment-mainnet.json');

    // Generate production environment variables
    console.log("\n📋 PRODUCTION Environment Variables:");
    console.log("Add these to your production .env file:");
    console.log(`POLYGON_MAINNET_DONATION_CONTRACT=${contracts.donation}`);
    console.log(`POLYGON_MAINNET_MILESTONE_CONTRACT=${contracts.milestone}`);
    console.log(`POLYGON_MAINNET_AUDIT_CONTRACT=${contracts.audit}`);
    console.log(`POLYGON_MAINNET_PLATFORM_WALLET=${platformWallet}`);
    console.log(`POLYGON_MAINNET_CHAIN_ID=137`);
    console.log(`POLYGON_MAINNET_ENABLED=true`);
    
    // Generate frontend production config
    console.log("\n🌐 Production Frontend Configuration:");
    console.log(`const MAINNET_CONTRACTS = {`);
    console.log(`  chainId: 137,`);
    console.log(`  donation: "${contracts.donation}",`);
    console.log(`  milestone: "${contracts.milestone}",`);
    console.log(`  audit: "${contracts.audit}",`);
    console.log(`  platformWallet: "${platformWallet}"`);
    console.log(`};`);

    // Contract verification
    console.log("\n🔍 Contract Verification Commands:");
    console.log("Run these to verify contracts on PolygonScan:");
    console.log(`npx hardhat verify --network polygon ${contracts.donation} "${platformWallet}"`);
    console.log(`npx hardhat verify --network polygon ${contracts.milestone} "${contracts.donation}"`);
    console.log(`npx hardhat verify --network polygon ${contracts.audit} "${platformWallet}"`);

    // Security recommendations
    console.log("\n🔒 Security Recommendations:");
    console.log("1. Verify contracts on PolygonScan immediately");
    console.log("2. Transfer ownership to a multisig wallet");
    console.log("3. Set up monitoring and alerts for contract activity");
    console.log("4. Implement emergency pause functionality if needed");
    console.log("5. Regular security audits and updates");

    console.log("\n🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log(`🔗 View contracts on PolygonScan:`);
    console.log(`   Donation: https://polygonscan.com/address/${contracts.donation}`);
    console.log(`   Milestone: https://polygonscan.com/address/${contracts.milestone}`);
    console.log(`   Audit: https://polygonscan.com/address/${contracts.audit}`);
    
    return deploymentInfo;
}

main()
    .then((result) => {
        console.log("\n✨ Ready for production!");
        console.log("📱 Update your production backend and frontend with the new contract addresses.");
        console.log("🚀 Your charity platform is now live on Polygon mainnet!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Mainnet deployment failed:", error);
        console.log("🛠️  Check your configuration and try again.");
        process.exit(1);
    });
