const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy testnet...");
  
  // Get the signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    console.error("❌ Insufficient balance! Please fund your account with Amoy testnet MATIC");
    console.log("🔗 Get testnet MATIC from: https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Deploy AuditContract first
  console.log("\n📋 Deploying AuditContract...");
  const AuditContract = await hre.ethers.getContractFactory("AuditContract");
  const auditContract = await AuditContract.deploy();
  await auditContract.waitForDeployment();
  const auditAddress = await auditContract.getAddress();
  console.log("✅ AuditContract deployed to:", auditAddress);

  // Deploy MilestoneContract
  console.log("\n🎯 Deploying MilestoneContract...");
  const MilestoneContract = await hre.ethers.getContractFactory("MilestoneContract");
  const milestoneContract = await MilestoneContract.deploy();
  await milestoneContract.waitForDeployment();
  const milestoneAddress = await milestoneContract.getAddress();
  console.log("✅ MilestoneContract deployed to:", milestoneAddress);

  // Deploy DilSeDaanContract (main donation contract)
  console.log("\n💝 Deploying DilSeDaanContract...");
  const DilSeDaanContract = await hre.ethers.getContractFactory("DilSeDaanContract");
  const dilSeDaanContract = await DilSeDaanContract.deploy(
    milestoneAddress,
    auditAddress
  );
  await dilSeDaanContract.waitForDeployment();
  const donationAddress = await dilSeDaanContract.getAddress();
  console.log("✅ DilSeDaanContract deployed to:", donationAddress);

  // Set up contract relationships
  console.log("\n🔗 Setting up contract relationships...");
  
  // Set the donation contract address in milestone contract
  const setDonationTx = await milestoneContract.setDonationContract(donationAddress);
  await setDonationTx.wait();
  console.log("✅ MilestoneContract linked to DilSeDaanContract");

  // Set the donation contract address in audit contract
  const setAuditTx = await auditContract.setDonationContract(donationAddress);
  await setAuditTx.wait();
  console.log("✅ AuditContract linked to DilSeDaanContract");

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Contract Summary:");
  console.log("─".repeat(50));
  console.log(`AuditContract:     ${auditAddress}`);
  console.log(`MilestoneContract: ${milestoneAddress}`);
  console.log(`DilSeDaanContract: ${donationAddress}`);
  console.log("─".repeat(50));

  console.log("\n📝 Update your .env file with these addresses:");
  console.log(`AUDIT_CONTRACT_ADDRESS=${auditAddress}`);
  console.log(`MILESTONE_CONTRACT_ADDRESS=${milestoneAddress}`);
  console.log(`DONATION_CONTRACT_ADDRESS=${donationAddress}`);
  
  console.log("\n🔍 Verify contracts on PolygonScan:");
  console.log(`https://amoy.polygonscan.com/address/${auditAddress}`);
  console.log(`https://amoy.polygonscan.com/address/${milestoneAddress}`);
  console.log(`https://amoy.polygonscan.com/address/${donationAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: "amoy",
    chainId: 80002,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      AuditContract: auditAddress,
      MilestoneContract: milestoneAddress,
      DilSeDaanContract: donationAddress
    }
  };

  const fs = require("fs");
  fs.writeFileSync(
    "deployment-amoy.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-amoy.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
