const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Complete Smart Contract Deployment to Polygon");
  console.log("📅 Date:", new Date().toISOString());
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
  
  if (parseFloat(ethers.formatEther(balance)) < 0.01) {
    console.log("⚠️  Warning: Low balance. Consider adding more MATIC for gas fees.");
  }

  const deployedContracts = {};

  try {
    // Define platform wallet (use deployer address as platform wallet)
    const platformWallet = deployer.address;
    console.log("🏦 Platform wallet address:", platformWallet);

    // STEP 1: Deploy CharityDonationContract
    console.log("\n=== STEP 1: Deploying CharityDonationContract ===");
    console.log("📦 Deploying CharityDonationContract with platform wallet...");
    
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    const charityContract = await CharityDonationContract.deploy(platformWallet, {
      gasLimit: 3000000, // Set reasonable gas limit
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await charityContract.waitForDeployment();
    
    const charityAddress = await charityContract.getAddress();
    deployedContracts.CharityDonationContract = charityAddress;
    console.log("✅ CharityDonationContract deployed to:", charityAddress);

    // STEP 2: Deploy MilestoneContract with CharityDonationContract address
    console.log("\n=== STEP 2: Deploying MilestoneContract ===");
    console.log("📦 Deploying MilestoneContract with donation contract address...");
    
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    const milestoneContract = await MilestoneContract.deploy(charityAddress, {
      gasLimit: 3000000,
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await milestoneContract.waitForDeployment();
    
    const milestoneAddress = await milestoneContract.getAddress();
    deployedContracts.MilestoneContract = milestoneAddress;
    console.log("✅ MilestoneContract deployed to:", milestoneAddress);

    // STEP 3: Deploy AuditContract
    console.log("\n=== STEP 3: Deploying AuditContract ===");
    console.log("📦 Deploying AuditContract with platform wallet...");
    
    const AuditContract = await ethers.getContractFactory("AuditContract");
    const auditContract = await AuditContract.deploy(platformWallet, {
      gasLimit: 3000000,
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await auditContract.waitForDeployment();
    
    const auditAddress = await auditContract.getAddress();
    deployedContracts.AuditContract = auditAddress;
    console.log("✅ AuditContract deployed to:", auditAddress);

    // STEP 4: Deploy DilSeDaanContract (main contract)
    console.log("\n=== STEP 4: Deploying DilSeDaanContract ===");
    console.log("📦 Deploying DilSeDaanContract with fee recipient...");
    
    const DilSeDaanContract = await ethers.getContractFactory("DilSeDaanContract");
    const dilSeDaanContract = await DilSeDaanContract.deploy(platformWallet, {
      gasLimit: 5000000, // Higher gas limit for main contract
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    await dilSeDaanContract.waitForDeployment();
    
    const dilSeDaanAddress = await dilSeDaanContract.getAddress();
    deployedContracts.DilSeDaanContract = dilSeDaanAddress;
    console.log("✅ DilSeDaanContract deployed to:", dilSeDaanAddress);

    // Check final balance
    const finalBalance = await deployer.provider.getBalance(deployer.address);
    const gasUsed = balance - finalBalance;
    console.log("\n💰 Final balance:", ethers.formatEther(finalBalance), "MATIC");
    console.log("⛽ Total gas used:", ethers.formatEther(gasUsed), "MATIC");

    // Save deployment information
    const deploymentInfo = {
      network: "polygon-mumbai",
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      platformWallet: platformWallet,
      gasUsed: ethers.formatEther(gasUsed),
      contracts: deployedContracts,
      chainId: (await deployer.provider.getNetwork()).chainId.toString(),
      blockNumber: await deployer.provider.getBlockNumber()
    };

    // Save to deployment file
    const deploymentFile = "deployment-complete.json";
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);

    // Create environment variables for backend
    const envVars = `
# Polygon Smart Contract Addresses - ${new Date().toISOString()}
CHARITY_CONTRACT_ADDRESS=${deployedContracts.CharityDonationContract}
MILESTONE_CONTRACT_ADDRESS=${deployedContracts.MilestoneContract}
AUDIT_CONTRACT_ADDRESS=${deployedContracts.AuditContract}
DILSEDAAN_CONTRACT_ADDRESS=${deployedContracts.DilSeDaanContract}
PLATFORM_WALLET_ADDRESS=${platformWallet}
POLYGON_NETWORK=mumbai
POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com/
`;

    fs.writeFileSync(".env.contracts", envVars);
    console.log("📄 Contract addresses saved to: .env.contracts");

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("📋 Contract Summary:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    console.log("\n✅ Next steps:");
    console.log("   1. Update your .env file with contract addresses");
    console.log("   2. Verify contracts on PolygonScan");
    console.log("   3. Test blockchain integration");
    console.log("   4. Launch platform! 🚀");

    return deployedContracts;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Solution: Add more MATIC to your wallet");
      console.log("   - Get testnet MATIC from: https://faucet.polygon.technology/");
    } else if (error.message.includes("gas")) {
      console.log("\n💡 Solution: Try increasing gas limit or reducing contract complexity");
    }
    
    process.exit(1);
  }
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
