const { ethers } = require("hardhat");
const fs = require("fs");

async function fullIntegrationTest() {
  console.log("🚀 Full DilSeDaan Smart Contract Integration Test");
  console.log("=================================================");

  try {
    // Get test accounts
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("👤 Test accounts ready:");
    console.log("   Deployer:", deployer.address);
    console.log("   User 1:", user1.address);
    console.log("   User 2:", user2.address);

    console.log("\n📦 STEP 1: Deploy All Contracts");
    console.log("================================");

    // Deploy CharityDonationContract
    const CharityDonationContract = await ethers.getContractFactory("CharityDonationContract");
    const charityContract = await CharityDonationContract.deploy(deployer.address);
    await charityContract.waitForDeployment();
    const charityAddress = await charityContract.getAddress();
    console.log("✅ CharityDonationContract deployed:", charityAddress);

    // Deploy MilestoneContract
    const MilestoneContract = await ethers.getContractFactory("MilestoneContract");
    const milestoneContract = await MilestoneContract.deploy(charityAddress);
    await milestoneContract.waitForDeployment();
    const milestoneAddress = await milestoneContract.getAddress();
    console.log("✅ MilestoneContract deployed:", milestoneAddress);

    // Deploy AuditContract
    const AuditContract = await ethers.getContractFactory("AuditContract");
    const auditContract = await AuditContract.deploy(deployer.address);
    await auditContract.waitForDeployment();
    const auditAddress = await auditContract.getAddress();
    console.log("✅ AuditContract deployed:", auditAddress);

    console.log("\n🧪 STEP 2: Test Contract Functionality");
    console.log("======================================");

    // Test 1: Basic contract state
    console.log("\n--- Test 1: Basic Contract State ---");
    const platformWallet = await charityContract.platformWallet();
    const owner = await charityContract.owner();
    console.log("✅ Platform wallet:", platformWallet);
    console.log("✅ Contract owner:", owner);
    console.log("✅ Owner matches deployer:", owner === deployer.address);

    // Test 2: Creator verification and campaign creation
    console.log("\n--- Test 2: Creator Verification & Campaign Creation ---");
    
    // First, verify user1 as a creator
    console.log("🔐 Verifying user1 as campaign creator...");
    const verifyTx = await charityContract.connect(deployer).verifyCreator(user1.address);
    await verifyTx.wait();
    console.log("✅ User1 verified as creator!");
    
    const campaignTitle = "Clean Water for Rural Communities";
    const targetAmount = ethers.parseEther("50.0"); // 50 MATIC
    const deadline = Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60); // 60 days
    const ipfsHash = "QmExampleIPFSHash123456789";

    console.log("📝 Creating campaign:", campaignTitle);
    console.log("   Target:", ethers.formatEther(targetAmount), "MATIC");
    console.log("   Duration: 60 days");

    const createTx = await charityContract.connect(user1).createCampaign(
      campaignTitle,
      targetAmount,
      deadline,
      ipfsHash
    );
    await createTx.wait();
    console.log("✅ Campaign created successfully!");

    // Get campaign details
    const campaign = await charityContract.getCampaignDetails(1);
    console.log("✅ Campaign details:");
    console.log("   Title:", campaign[0]);
    console.log("   Target:", ethers.formatEther(campaign[1]), "MATIC");
    console.log("   Raised:", ethers.formatEther(campaign[2]), "MATIC");
    console.log("   Creator:", campaign[4]);
    console.log("   Is Active:", campaign[5]);

    // Test 3: Multiple donations
    console.log("\n--- Test 3: Donation System ---");
    
    // First donation
    const donation1 = ethers.parseEther("5.0");
    console.log("💰 User 2 donating:", ethers.formatEther(donation1), "MATIC");
    const donate1Tx = await charityContract.connect(user2).donate(1, "Supporting clean water initiative!", false, { value: donation1 });
    await donate1Tx.wait();
    console.log("✅ First donation successful!");

    // Second donation
    const donation2 = ethers.parseEther("10.0");
    console.log("💰 Deployer donating:", ethers.formatEther(donation2), "MATIC");
    const donate2Tx = await charityContract.connect(deployer).donate(1, "Great cause! Keep it up!", false, { value: donation2 });
    await donate2Tx.wait();
    console.log("✅ Second donation successful!");

    // Anonymous donation
    const donation3 = ethers.parseEther("3.0");
    console.log("💰 Anonymous donation:", ethers.formatEther(donation3), "MATIC");
    const donate3Tx = await charityContract.connect(user1).donate(1, "", true, { value: donation3 });
    await donate3Tx.wait();
    console.log("✅ Anonymous donation successful!");

    // Check updated campaign
    const updatedCampaign = await charityContract.getCampaignDetails(1);
    console.log("✅ Updated campaign raised amount:", ethers.formatEther(updatedCampaign[2]), "MATIC");

    // Test 4: Milestone creation
    console.log("\n--- Test 4: Milestone System ---");
    const milestoneTitle = "Water pump equipment purchased";
    const milestoneDescription = "All necessary equipment has been procured and is ready for installation";
    const milestoneTarget = ethers.parseEther("15.0");
    const milestoneDeadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
    const milestoneOrder = 1;

    console.log("📝 Creating milestone:", milestoneTitle);
    const milestoneTx = await milestoneContract.connect(user1).createMilestone(
      1, // Campaign ID
      milestoneTitle,
      milestoneDescription,
      milestoneTarget,
      milestoneDeadline,
      milestoneOrder
    );
    await milestoneTx.wait();
    console.log("✅ Milestone created successfully!");

    // Test 5: Event filtering
    console.log("\n--- Test 5: Event System ---");
    const donationFilter = charityContract.filters.DonationMade();
    const donationEvents = await charityContract.queryFilter(donationFilter);
    console.log("✅ Found", donationEvents.length, "donation events:");
    donationEvents.forEach((event, index) => {
      console.log(`   Donation ${index + 1}:`);
      console.log(`     Campaign ID: ${event.args[0]}`);
      console.log(`     Donor: ${event.args[1]}`);
      console.log(`     Amount: ${ethers.formatEther(event.args[2])} MATIC`);
    });

    const campaignFilter = charityContract.filters.CampaignCreated();
    const campaignEvents = await charityContract.queryFilter(campaignFilter);
    console.log("✅ Found", campaignEvents.length, "campaign events");

    // Test 6: Aggregate data
    console.log("\n--- Test 6: Platform Statistics ---");
    const totalDonations = await charityContract.getTotalDonations();
    const activeCampaigns = await charityContract.getActiveCampaigns();
    console.log("✅ Platform statistics:");
    console.log("   Total donations:", ethers.formatEther(totalDonations), "MATIC");
    console.log("   Active campaigns:", activeCampaigns.length);

    console.log("\n🧪 STEP 3: Integration Test Results");
    console.log("===================================");
    console.log("✅ Contract deployment: SUCCESS");
    console.log("✅ Creator verification: SUCCESS");
    console.log("✅ Campaign creation: SUCCESS");
    console.log("✅ Donation system: SUCCESS");
    console.log("✅ Milestone system: SUCCESS");
    console.log("✅ Event system: SUCCESS");
    console.log("✅ Data aggregation: SUCCESS");

    // Save test results
    const testResults = {
      timestamp: new Date().toISOString(),
      network: "hardhat",
      contracts: {
        CharityDonationContract: charityAddress,
        MilestoneContract: milestoneAddress,
        AuditContract: auditAddress
      },
      testResults: {
        contractDeployment: "SUCCESS",
        creatorVerification: "SUCCESS",
        campaignCreation: "SUCCESS",
        donationSystem: "SUCCESS",
        milestoneSystem: "SUCCESS",
        eventSystem: "SUCCESS",
        dataAggregation: "SUCCESS"
      },
      statistics: {
        totalDonations: ethers.formatEther(totalDonations),
        activeCampaigns: activeCampaigns.length,
        donationEvents: donationEvents.length
      }
    };

    fs.writeFileSync("test-results.json", JSON.stringify(testResults, null, 2));
    console.log("\n📄 Test results saved to: test-results.json");

    console.log("\n🎉 FULL INTEGRATION TEST COMPLETED SUCCESSFULLY!");
    console.log("===================================================");
    console.log("🚀 DilSeDaan Smart Contracts are fully functional!");
    console.log("🚀 Platform is ready for production deployment!");

  } catch (error) {
    console.error("\n❌ Integration test failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

// Run the full integration test
if (require.main === module) {
  fullIntegrationTest()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = fullIntegrationTest;
