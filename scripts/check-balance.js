const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Deployment Wallet Balance...");
    
    try {
        const [deployer] = await ethers.getSigners();
        const balance = await deployer.provider.getBalance(deployer.address);
        
        console.log(`\n📧 Wallet Address: ${deployer.address}`);
        console.log(`💰 Balance: ${ethers.formatEther(balance)} MATIC`);
        console.log(`🔗 Network: ${hre.network.name}`);
        
        const balanceInWei = balance;
        const minRequired = ethers.parseEther("0.1"); // 0.1 MATIC minimum
        const recommended = ethers.parseEther("0.5"); // 0.5 MATIC recommended
        
        console.log(`\n📊 Balance Analysis:`);
        console.log(`   Current: ${ethers.formatEther(balanceInWei)} MATIC`);
        console.log(`   Minimum Required: ${ethers.formatEther(minRequired)} MATIC`);
        console.log(`   Recommended: ${ethers.formatEther(recommended)} MATIC`);
        
        if (balanceInWei >= recommended) {
            console.log(`✅ Status: READY FOR DEPLOYMENT (Recommended balance)`);
        } else if (balanceInWei >= minRequired) {
            console.log(`⚠️  Status: MINIMAL BALANCE (Deployment possible but limited)`);
        } else {
            console.log(`❌ Status: INSUFFICIENT BALANCE (Need more testnet MATIC)`);
            console.log(`\n🚰 Get testnet MATIC from faucets:`);
            console.log(`   • Polygon Faucet: https://faucet.polygon.technology/`);
            console.log(`   • Alchemy Faucet: https://www.alchemy.com/faucets/polygon-amoy`);
            console.log(`   • QuickNode Faucet: https://faucet.quicknode.com/polygon/amoy`);
        }
        
        // Gas price check
        console.log(`\n⛽ Current Gas Prices:`);
        const feeData = await deployer.provider.getFeeData();
        console.log(`   Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0, 'gwei')} gwei`);
        console.log(`   Max Fee Per Gas: ${ethers.formatUnits(feeData.maxFeePerGas || 0, 'gwei')} gwei`);
        console.log(`   Max Priority Fee: ${ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei')} gwei`);
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
