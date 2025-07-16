const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Enhanced Deployment to Polygon Mumbai Testnet...");
    console.log("📅 Date:", new Date().toISOString());
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Deploying contracts with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "MATIC");
    
    if (balance < ethers.parseEther("0.1")) {
        console.warn("⚠️  Low balance! You may need more MATIC for deployment");
    }
    
    console.log("\n=== STEP 1: Deploying CharityDonationContract ===");
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    console.log("📦 Deploying CharityDonationContract...");
    
    const charityContract = await CharityDonationContract.deploy(
        deployer.address, // Initial owner
        {
            gasLimit: 3000000,
            gasPrice: ethers.parseUnits("30", "gwei")
        }
    );
    
    await charityContract.waitForDeployment();
    const charityAddress = await charityContract.getAddress();
    console.log("✅ CharityDonationContract deployed to:", charityAddress);
    
    console.log("\n=== STEP 2: Deploying MilestoneContract ===");
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    console.log("📦 Deploying MilestoneContract...");
    
    const milestoneContract = await MilestoneContract.deploy(
        deployer.address, // Initial owner
        {
            gasLimit: 2500000,
            gasPrice: ethers.parseUnits("30", "gwei")
        }
    );
    
    await milestoneContract.waitForDeployment();
    const milestoneAddress = await milestoneContract.getAddress();
    console.log("✅ MilestoneContract deployed to:", milestoneAddress);
    
    console.log("\n=== STEP 3: Deploying AuditContract ===");
    const AuditContract = await ethers.getContractFactory("AuditContract");
    console.log("📦 Deploying AuditContract...");
    
    const auditContract = await AuditContract.deploy(
        deployer.address, // Initial owner
        {
            gasLimit: 2000000,
            gasPrice: ethers.parseUnits("30", "gwei")
        }
    );
    
    await auditContract.waitForDeployment();
    const auditAddress = await auditContract.getAddress();
    console.log("✅ AuditContract deployed to:", auditAddress);
    
    console.log("\n=== STEP 4: Contract Verification ===");
    console.log("🔍 Testing contract interactions...");
    
    // Test charity contract
    try {
        const owner = await charityContract.owner();
        console.log("✅ CharityContract owner:", owner);
    } catch (error) {
        console.error("❌ Error testing CharityContract:", error.message);
    }
    
    // Test milestone contract
    try {
        const owner = await milestoneContract.owner();
        console.log("✅ MilestoneContract owner:", owner);
    } catch (error) {
        console.error("❌ Error testing MilestoneContract:", error.message);
    }
    
    // Test audit contract
    try {
        const owner = await auditContract.owner();
        console.log("✅ AuditContract owner:", owner);
    } catch (error) {
        console.error("❌ Error testing AuditContract:", error.message);
    }
    
    console.log("\n=== STEP 5: Saving Deployment Information ===");
    
    const deploymentInfo = {
        network: "mumbai",
        chainId: 80001,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            CharityDonationContract: {
                address: charityAddress,
                transactionHash: charityContract.deploymentTransaction()?.hash
            },
            MilestoneContract: {
                address: milestoneAddress,
                transactionHash: milestoneContract.deploymentTransaction()?.hash
            },
            AuditContract: {
                address: auditAddress,
                transactionHash: auditContract.deploymentTransaction()?.hash
            }
        }
    };
    
    // Save to multiple locations
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info
    const deploymentFile = path.join(deploymentsDir, "mumbai-deployment.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);
    
    // Update frontend contracts config
    const frontendContractsPath = path.join(__dirname, "..", "apps", "frontend", "src", "config", "contracts.ts");
    const contractsConfig = `export const CONTRACTS = {
  donation: "${charityAddress}",
  milestone: "${milestoneAddress}",
  audit: "${auditAddress}"
};

export const NETWORK_CONFIG = {
  chainId: 80001,
  name: "mumbai",
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  blockExplorerUrl: "https://mumbai.polygonscan.com"
};

export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)};
`;
    
    fs.writeFileSync(frontendContractsPath, contractsConfig);
    console.log("🔄 Frontend contracts config updated");
    
    // Update backend contracts config
    const backendContractsPath = path.join(__dirname, "..", "apps", "backend", "src", "config", "contracts.json");
    const backendDir = path.dirname(backendContractsPath);
    if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
    }
    
    fs.writeFileSync(backendContractsPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("🔄 Backend contracts config updated");
    
    console.log("\n=== DEPLOYMENT SUMMARY ===");
    console.log("🌐 Network: Polygon Mumbai Testnet");
    console.log("⛽ Gas Used: Check individual transaction receipts");
    console.log("📊 Block Explorer Links:");
    console.log(`   CharityDonationContract: https://mumbai.polygonscan.com/address/${charityAddress}`);
    console.log(`   MilestoneContract: https://mumbai.polygonscan.com/address/${milestoneAddress}`);
    console.log(`   AuditContract: https://mumbai.polygonscan.com/address/${auditAddress}`);
    
    console.log("\n=== NEXT STEPS ===");
    console.log("1. 🔍 Verify contracts on Polygonscan");
    console.log("2. 🧪 Run integration tests");
    console.log("3. 🔄 Update environment variables");
    console.log("4. 📱 Test frontend integration");
    
    return deploymentInfo;
}

main()
    .then((deploymentInfo) => {
        console.log("\n🎉 Mumbai deployment completed successfully!");
        console.log("📋 Deployment Info:", JSON.stringify(deploymentInfo.contracts, null, 2));
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
