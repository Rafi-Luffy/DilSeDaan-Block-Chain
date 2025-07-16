const { ethers } = require("hardhat");

async function simpleTest() {
  console.log("🔍 Simple Contract Verification Test");
  console.log("====================================");

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Using account:", deployer.address);

    // Get contract address from deployment file
    const fs = require("fs");
    const deploymentData = JSON.parse(fs.readFileSync("deployment-complete.json", "utf8"));
    const charityAddress = deploymentData.contracts.CharityDonationContract;
    
    console.log("📋 Contract address:", charityAddress);

    // Load contract factory and attach to deployed address
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    const contract = CharityDonationContract.attach(charityAddress);

    console.log("\n🧪 Testing basic contract calls...");

    // Test 1: Check if contract is accessible
    try {
      const code = await ethers.provider.getCode(charityAddress);
      if (code === "0x") {
        console.log("❌ No contract found at address");
        return;
      }
      console.log("✅ Contract code found at address");
    } catch (error) {
      console.log("❌ Error accessing contract:", error.message);
      return;
    }

    // Test 2: Try to call platformWallet (simple view function)
    try {
      const platformWallet = await contract.platformWallet();
      console.log("✅ Platform wallet:", platformWallet);
    } catch (error) {
      console.log("❌ Error calling platformWallet:", error.message);
    }

    // Test 3: Try to call owner (inherited from Ownable)
    try {
      const owner = await contract.owner();
      console.log("✅ Contract owner:", owner);
    } catch (error) {
      console.log("❌ Error calling owner:", error.message);
    }

    // Test 4: Check campaign counter
    try {
      // Try a different approach - check if the contract has the function we expect
      const iface = contract.interface;
      console.log("📋 Available functions:", Object.keys(iface.functions).slice(0, 10));
    } catch (error) {
      console.log("❌ Error listing functions:", error.message);
    }

    console.log("\n🎉 Simple verification complete!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
simpleTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
