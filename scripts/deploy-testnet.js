const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying to Polygon Amoy Testnet");
  console.log("📅 Date:", new Date().toISOString());
  console.log("=".repeat(60));

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("🔑 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
  
  if (parseFloat(ethers.formatEther(balance)) < 0.1) {
    console.log("❌ Insufficient balance for deployment!");
    console.log("💡 Get testnet MATIC from: https://faucet.polygon.technology/");
    console.log("💡 You need at least 0.1 MATIC for deployment");
    process.exit(1);
  }

  const deployedContracts = {};

  try {
    // Define platform wallet (use deployer address as platform wallet)
    const platformWallet = deployer.address;
    console.log("🏦 Platform wallet address:", platformWallet);

    // Get network info
    const network = await deployer.provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

    // STEP 1: Deploy CharityDonationContract
    console.log("\n=== STEP 1: Deploying CharityDonationContract ===");
    console.log("📦 Deploying CharityDonationContract with platform wallet...");
    
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    
    // Estimate gas first
    const deployTx = await CharityDonationContract.getDeployTransaction(platformWallet);
    const estimatedGas = await deployer.provider.estimateGas(deployTx);
    console.log("⛽ Estimated gas:", estimatedGas.toString());
    
    const charityContract = await CharityDonationContract.deploy(platformWallet, {
      gasLimit: Math.floor(Number(estimatedGas) * 1.2), // 20% buffer
    });
    
    console.log("⏳ Transaction sent, waiting for confirmation...");
    console.log("📋 Transaction hash:", charityContract.deploymentTransaction().hash);
    
    await charityContract.waitForDeployment();
    
    const charityAddress = await charityContract.getAddress();
    deployedContracts.CharityDonationContract = charityAddress;
    console.log("✅ CharityDonationContract deployed to:", charityAddress);

    // Wait a bit between deployments to avoid nonce issues
    console.log("⏳ Waiting 5 seconds before next deployment...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // STEP 2: Deploy MilestoneContract
    console.log("\n=== STEP 2: Deploying MilestoneContract ===");
    console.log("📦 Deploying MilestoneContract with donation contract address...");
    
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    const milestoneDeployTx = await MilestoneContract.getDeployTransaction(charityAddress);
    const milestoneEstimatedGas = await deployer.provider.estimateGas(milestoneDeployTx);
    console.log("⛽ Estimated gas:", milestoneEstimatedGas.toString());
    
    const milestoneContract = await MilestoneContract.deploy(charityAddress, {
      gasLimit: Math.floor(Number(milestoneEstimatedGas) * 1.2),
    });
    
    console.log("⏳ Transaction sent, waiting for confirmation...");
    console.log("📋 Transaction hash:", milestoneContract.deploymentTransaction().hash);
    
    await milestoneContract.waitForDeployment();
    
    const milestoneAddress = await milestoneContract.getAddress();
    deployedContracts.MilestoneContract = milestoneAddress;
    console.log("✅ MilestoneContract deployed to:", milestoneAddress);

    // Wait between deployments
    console.log("⏳ Waiting 5 seconds before next deployment...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // STEP 3: Deploy AuditContract
    console.log("\n=== STEP 3: Deploying AuditContract ===");
    console.log("📦 Deploying AuditContract with platform wallet...");
    
    const AuditContract = await ethers.getContractFactory("AuditContract");
    const auditDeployTx = await AuditContract.getDeployTransaction(platformWallet);
    const auditEstimatedGas = await deployer.provider.estimateGas(auditDeployTx);
    console.log("⛽ Estimated gas:", auditEstimatedGas.toString());
    
    const auditContract = await AuditContract.deploy(platformWallet, {
      gasLimit: Math.floor(Number(auditEstimatedGas) * 1.2),
    });
    
    console.log("⏳ Transaction sent, waiting for confirmation...");
    console.log("📋 Transaction hash:", auditContract.deploymentTransaction().hash);
    
    await auditContract.waitForDeployment();
    
    const auditAddress = await auditContract.getAddress();
    deployedContracts.AuditContract = auditAddress;
    console.log("✅ AuditContract deployed to:", auditAddress);

    // Wait between deployments
    console.log("⏳ Waiting 5 seconds before next deployment...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // STEP 4: Deploy DilSeDaanContract
    console.log("\n=== STEP 4: Deploying DilSeDaanContract ===");
    console.log("📦 Deploying DilSeDaanContract with fee recipient...");
    
    const DilSeDaanContract = await ethers.getContractFactory("DilSeDaanContract");
    const dilsedaanDeployTx = await DilSeDaanContract.getDeployTransaction(platformWallet);
    const dilsedaanEstimatedGas = await deployer.provider.estimateGas(dilsedaanDeployTx);
    console.log("⛽ Estimated gas:", dilsedaanEstimatedGas.toString());
    
    const dilSeDaanContract = await DilSeDaanContract.deploy(platformWallet, {
      gasLimit: Math.floor(Number(dilsedaanEstimatedGas) * 1.2),
    });
    
    console.log("⏳ Transaction sent, waiting for confirmation...");
    console.log("📋 Transaction hash:", dilSeDaanContract.deploymentTransaction().hash);
    
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
      network: network.name,
      chainId: network.chainId.toString(),
      timestamp: new Date().toISOString(),
      deployer: deployer.address,
      platformWallet: platformWallet,
      gasUsed: ethers.formatEther(gasUsed),
      contracts: deployedContracts,
      blockNumber: await deployer.provider.getBlockNumber()
    };

    // Save to deployment file
    const deploymentFile = `deployment-${network.chainId}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);

    // Create environment variables for backend
    const envVars = `
# Polygon Smart Contract Addresses - ${new Date().toISOString()}
# Network: ${network.name} (Chain ID: ${network.chainId})
CHARITY_CONTRACT_ADDRESS=${deployedContracts.CharityDonationContract}
MILESTONE_CONTRACT_ADDRESS=${deployedContracts.MilestoneContract}
AUDIT_CONTRACT_ADDRESS=${deployedContracts.AuditContract}
DILSEDAAN_CONTRACT_ADDRESS=${deployedContracts.DilSeDaanContract}
PLATFORM_WALLET_ADDRESS=${platformWallet}
POLYGON_NETWORK=${network.chainId === 80002n ? 'amoy' : 'mumbai'}
POLYGON_RPC_URL=${network.chainId === 80002n ? 'https://rpc-amoy.polygon.technology' : 'https://rpc-mumbai.maticvigil.com/'}
`;

    fs.writeFileSync(`.env.contracts.${network.chainId}`, envVars);
    console.log(`📄 Contract addresses saved to: .env.contracts.${network.chainId}`);

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY TO TESTNET!");
    console.log("=".repeat(60));
    console.log("📋 Contract Summary:");
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${address}`);
    });
    
    console.log(`\n🔍 Verify contracts on PolygonScan:`);
    const explorerUrl = network.chainId === 80002n ? 'https://amoy.polygonscan.com' : 'https://mumbai.polygonscan.com';
    Object.entries(deployedContracts).forEach(([name, address]) => {
      console.log(`   ${name}: ${explorerUrl}/address/${address}`);
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
    } else if (error.message.includes("nonce")) {
      console.log("\n💡 Solution: Wait a moment and try again (nonce issue)");
    }
    
    console.log("\n📋 Full error details:", error);
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
