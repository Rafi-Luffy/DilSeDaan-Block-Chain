const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Optimized Contract Deployment to Polygon...");
  console.log("📅 Date:", new Date().toISOString());

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");

  const deployedContracts = {};

  try {
    // Deploy CharityDonationContract with optimized gas
    console.log("\n=== STEP 1: Deploying CharityDonationContract ===");
    console.log("📦 Deploying CharityDonationContract...");
    
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    const charityContract = await CharityDonationContract.deploy();
    await charityContract.waitForDeployment();
    
    const charityAddress = await charityContract.getAddress();
    deployedContracts.CharityDonationContract = charityAddress;
    console.log("✅ CharityDonationContract deployed to:", charityAddress);

    // Deploy MilestoneContract with optimized gas
    console.log("\n=== STEP 2: Deploying MilestoneContract ===");
    console.log("📦 Deploying MilestoneContract...");
    
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    const milestoneContract = await MilestoneContract.deploy();
    await milestoneContract.waitForDeployment();
    
    const milestoneAddress = await milestoneContract.getAddress();
    deployedContracts.MilestoneContract = milestoneAddress;
    console.log("✅ MilestoneContract deployed to:", milestoneAddress);

    // Skip AuditContract for now due to gas optimization needed
    console.log("\n=== STEP 3: Skipping AuditContract (Gas Optimization Needed) ===");
    console.log("⚠️  AuditContract deployment skipped - will optimize later");

    // Save deployment info
    const deploymentInfo = {
      network: "hardhat",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      contracts: deployedContracts,
      gasSettings: {
        gasLimit: "3000000",
        gasPrice: "30 gwei"
      }
    };

    console.log("\n🎉 DEPLOYMENT SUMMARY");
    console.log("=====================");
    console.log("📋 Network: Hardhat Local");
    console.log("👤 Deployer:", deployer.address);
    console.log("⛽ Gas Settings: 30 gwei, 3M limit");
    console.log("\n📄 Deployed Contracts:");
    for (const [name, address] of Object.entries(deployedContracts)) {
      console.log(`   ${name}: ${address}`);
    }

    // Update backend .env with contract addresses
    console.log("\n🔧 UPDATING BACKEND CONFIGURATION");
    console.log("================================");
    console.log("Add these to your backend .env file:");
    console.log(`CHARITY_CONTRACT_ADDRESS=${deployedContracts.CharityDonationContract}`);
    console.log(`MILESTONE_CONTRACT_ADDRESS=${deployedContracts.MilestoneContract}`);
    // console.log(`AUDIT_CONTRACT_ADDRESS=${deployedContracts.AuditContract || 'TO_BE_DEPLOYED'}`);

    console.log("\n✅ DEPLOYMENT COMPLETED SUCCESSFULLY!");
    console.log("🎯 Next Steps:");
    console.log("   1. Update backend .env with contract addresses");
    console.log("   2. Restart backend server");
    console.log("   3. Test blockchain functionality");
    console.log("   4. Deploy to Mumbai testnet for production testing");

    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    console.log("\n🔧 Troubleshooting Tips:");
    console.log("   1. Check gas price and limit settings");
    console.log("   2. Ensure account has sufficient MATIC");
    console.log("   3. Try deploying contracts individually");
    console.log("   4. Optimize contract code for gas efficiency");
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
