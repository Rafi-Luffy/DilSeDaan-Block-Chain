const { ethers } = require("hardhat");

async function main() {
    console.log("🌐 Testing Mumbai testnet connection...");
    
    const [signer] = await ethers.getSigners();
    console.log(`📧 Account: ${signer.address}`);
    
    const balance = await signer.provider.getBalance(signer.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} MATIC`);
    
    const network = await ethers.provider.getNetwork();
    console.log(`📊 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    if (parseFloat(ethers.formatEther(balance)) < 0.1) {
        console.log("⚠️  Low balance! You may need testnet MATIC from https://faucet.polygon.technology/");
    } else {
        console.log("✅ Ready for deployment!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Connection failed:", error);
        process.exit(1);
    });
