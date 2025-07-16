const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying DilSeDaan Contracts to Polygon Mumbai Testnet...");
    console.log("=" .repeat(60));
    
    const [deployer] = await ethers.getSigners();
    console.log(`📧 Deploying with account: ${deployer.address}`);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} MATIC`);
    
    if (balance < ethers.parseEther("0.01")) {
        console.log("⚠️  Warning: Low balance! Get Mumbai MATIC from https://faucet.polygon.technology/");
        console.log("   You need at least 0.01 MATIC for deployment");
    }

    // Platform wallet (can be same as deployer for testing)
    const platformWallet = deployer.address;
    console.log(`🏢 Platform wallet: ${platformWallet}`);

    // Deployment results
    const deploymentResults = {
        network: "mumbai",
        chainId: 80001,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    console.log("\n" + "=".repeat(60));
    console.log("🔨 STEP 1: Deploying CharityDonationContract...");
    try {
        const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
        const donationContract = await CharityDonationContract.deploy(platformWallet);
        
        console.log("⏳ Waiting for deployment confirmation...");
        await donationContract.waitForDeployment();
        
        const donationAddress = await donationContract.getAddress();
        console.log(`✅ CharityDonationContract deployed successfully!`);
        console.log(`📍 Address: ${donationAddress}`);
        
        deploymentResults.contracts.donationContract = donationAddress;
    } catch (error) {
        console.log(`❌ Failed to deploy CharityDonationContract:`, error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔨 STEP 2: Deploying MilestoneContract...");
    try {
        const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
        const milestoneContract = await MilestoneContract.deploy(deploymentResults.contracts.donationContract);
        
        console.log("⏳ Waiting for deployment confirmation...");
        await milestoneContract.waitForDeployment();
        
        const milestoneAddress = await milestoneContract.getAddress();
        console.log(`✅ MilestoneContract deployed successfully!`);
        console.log(`📍 Address: ${milestoneAddress}`);
        
        deploymentResults.contracts.milestoneContract = milestoneAddress;
    } catch (error) {
        console.log(`❌ Failed to deploy MilestoneContract:`, error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔨 STEP 3: Deploying AuditContract...");
    try {
        const AuditContract = await ethers.getContractFactory("AuditContract");
        const auditContract = await AuditContract.deploy(platformWallet);
        
        console.log("⏳ Waiting for deployment confirmation...");
        await auditContract.waitForDeployment();
        
        const auditAddress = await auditContract.getAddress();
        console.log(`✅ AuditContract deployed successfully!`);
        console.log(`📍 Address: ${auditAddress}`);
        
        deploymentResults.contracts.auditContract = auditAddress;
    } catch (error) {
        console.log(`❌ Failed to deploy AuditContract:`, error.message);
        throw error;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🔍 DEPLOYMENT VERIFICATION");
    console.log("=" .repeat(60));

    // Test basic functionality
    console.log("\n🧪 Testing deployed contracts...");
    try {
        const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
        const donationContract = CharityDonationContract.attach(deploymentResults.contracts.donationContract);
        
        // Test basic read function
        const totalDonations = await donationContract.getTotalDonations();
        console.log(`✅ Donation Contract: Total donations = ${ethers.formatEther(totalDonations)} MATIC`);
        
        const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
        const milestoneContract = MilestoneContract.attach(deploymentResults.contracts.milestoneContract);
        
        // Test milestone contract connection
        const donationContractFromMilestone = await milestoneContract.donationContract();
        console.log(`✅ Milestone Contract: Connected to donation contract = ${donationContractFromMilestone}`);
        
        const AuditContract = await ethers.getContractFactory("AuditContract");
        const auditContract = AuditContract.attach(deploymentResults.contracts.auditContract);
        
        // Test audit contract
        const platformWalletFromAudit = await auditContract.platformWallet();
        console.log(`✅ Audit Contract: Platform wallet = ${platformWalletFromAudit}`);
        
    } catch (error) {
        console.log(`⚠️  Warning: Contract testing failed:`, error.message);
    }

    // Save deployment results
    console.log("\n💾 Saving deployment results...");
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }
    
    const deploymentFile = path.join(deploymentsDir, `mumbai-${Date.now()}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResults, null, 2));
    console.log(`📄 Deployment saved to: ${deploymentFile}`);

    // Generate .env update instructions
    console.log("\n" + "=".repeat(60));
    console.log("📝 ENVIRONMENT VARIABLE UPDATES");
    console.log("=" .repeat(60));
    console.log("Add these to your .env file:");
    console.log("");
    console.log(`MUMBAI_DONATION_CONTRACT_ADDRESS=${deploymentResults.contracts.donationContract}`);
    console.log(`MUMBAI_MILESTONE_CONTRACT_ADDRESS=${deploymentResults.contracts.milestoneContract}`);
    console.log(`MUMBAI_AUDIT_CONTRACT_ADDRESS=${deploymentResults.contracts.auditContract}`);
    
    // Generate backend update instructions
    console.log("\n" + "=".repeat(60));
    console.log("🔧 BACKEND CONFIGURATION");
    console.log("=" .repeat(60));
    console.log("Update your backend .env with Mumbai testnet addresses:");
    console.log("1. Copy the addresses above to your backend .env file");
    console.log("2. Update frontend to use Mumbai testnet in MetaMask");
    console.log("3. Test donation flow with Mumbai MATIC");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(60));
    console.log("📊 Summary:");
    console.log(`   Network: Polygon Mumbai Testnet (Chain ID: 80001)`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Gas Used: Check transaction hashes on Mumbai Polygonscan`);
    console.log(`   CharityDonationContract: ${deploymentResults.contracts.donationContract}`);
    console.log(`   MilestoneContract: ${deploymentResults.contracts.milestoneContract}`);
    console.log(`   AuditContract: ${deploymentResults.contracts.auditContract}`);
    
    console.log("\n🔗 Verify contracts on Mumbai Polygonscan:");
    console.log(`   https://mumbai.polygonscan.com/address/${deploymentResults.contracts.donationContract}`);
    console.log(`   https://mumbai.polygonscan.com/address/${deploymentResults.contracts.milestoneContract}`);
    console.log(`   https://mumbai.polygonscan.com/address/${deploymentResults.contracts.auditContract}`);
    
    console.log("\n🚀 Next Steps:");
    console.log("   1. Update .env with Mumbai contract addresses");
    console.log("   2. Update backend configuration");
    console.log("   3. Test donation flow on Mumbai testnet");
    console.log("   4. Verify contracts on Mumbai Polygonscan (optional)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
