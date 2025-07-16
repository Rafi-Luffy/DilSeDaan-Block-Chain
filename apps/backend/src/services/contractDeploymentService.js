const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class ContractDeploymentService {
    constructor() {
        this.networks = {
            amoy: {
                chainId: 80002,
                name: 'Polygon Amoy Testnet',
                rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
                scanUrl: 'https://amoy.polygonscan.com'
            },
            polygon: {
                chainId: 137,
                name: 'Polygon Mainnet',
                rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
                scanUrl: 'https://polygonscan.com'
            }
        };
        
        this.contractAddresses = this.loadContractAddresses();
    }

    loadContractAddresses() {
        const addresses = {};
        
        // Load testnet addresses
        try {
            const testnetPath = path.join(process.cwd(), 'deployment-testnet.json');
            if (fs.existsSync(testnetPath)) {
                const testnetData = JSON.parse(fs.readFileSync(testnetPath, 'utf8'));
                addresses.testnet = testnetData.contracts;
            }
        } catch (error) {
            console.log('No testnet deployment found');
        }
        
        // Load mainnet addresses
        try {
            const mainnetPath = path.join(process.cwd(), 'deployment-mainnet.json');
            if (fs.existsSync(mainnetPath)) {
                const mainnetData = JSON.parse(fs.readFileSync(mainnetPath, 'utf8'));
                addresses.mainnet = mainnetData.contracts;
            }
        } catch (error) {
            console.log('No mainnet deployment found');
        }
        
        return addresses;
    }

    getContractAddresses(network = 'testnet') {
        const addresses = this.contractAddresses[network];
        if (!addresses) {
            throw new Error(`No contract addresses found for ${network}`);
        }
        return addresses;
    }

    getProvider(network = 'testnet') {
        const networkConfig = this.networks[network === 'testnet' ? 'amoy' : 'polygon'];
        return new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    }

    async getContractInstance(contractType, network = 'testnet') {
        const addresses = this.getContractAddresses(network);
        const provider = this.getProvider(network);
        
        // Load contract ABI
        const contractName = this.getContractName(contractType);
        const artifactPath = path.join(process.cwd(), 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
        
        if (!fs.existsSync(artifactPath)) {
            throw new Error(`Contract artifact not found: ${artifactPath}`);
        }
        
        const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
        const contractAddress = addresses[contractType];
        
        if (!contractAddress) {
            throw new Error(`Contract address not found for ${contractType} on ${network}`);
        }
        
        return new ethers.Contract(contractAddress, artifact.abi, provider);
    }

    getContractName(contractType) {
        const nameMap = {
            donation: 'CharityDonationContract',
            milestone: 'MilestoneContract',
            audit: 'AuditContract'
        };
        return nameMap[contractType];
    }

    async checkDeploymentStatus(network = 'testnet') {
        try {
            const addresses = this.getContractAddresses(network);
            const provider = this.getProvider(network);
            
            const status = {
                network: network,
                chainId: await provider.getNetwork().then(n => Number(n.chainId)),
                contracts: {}
            };
            
            for (const [type, address] of Object.entries(addresses)) {
                try {
                    const code = await provider.getCode(address);
                    status.contracts[type] = {
                        address: address,
                        deployed: code !== '0x',
                        verified: false // This would need API call to scanner
                    };
                } catch (error) {
                    status.contracts[type] = {
                        address: address,
                        deployed: false,
                        error: error.message
                    };
                }
            }
            
            return status;
        } catch (error) {
            throw new Error(`Failed to check deployment status: ${error.message}`);
        }
    }

    async getContractStats(network = 'testnet') {
        try {
            const donationContract = await this.getContractInstance('donation', network);
            const milestoneContract = await this.getContractInstance('milestone', network);
            const auditContract = await this.getContractInstance('audit', network);
            
            const stats = {
                donations: {
                    total: await donationContract.getTotalDonations(),
                    count: await donationContract.getCampaignCount ? await donationContract.getCampaignCount() : 0
                },
                milestones: {
                    count: await milestoneContract.getMilestoneCount()
                },
                audits: {
                    count: await auditContract.getAuditCount()
                }
            };
            
            // Format amounts
            stats.donations.totalFormatted = ethers.formatEther(stats.donations.total);
            
            return stats;
        } catch (error) {
            throw new Error(`Failed to get contract stats: ${error.message}`);
        }
    }

    async validateDeployment(network = 'testnet') {
        try {
            const status = await this.checkDeploymentStatus(network);
            const stats = await this.getContractStats(network);
            
            const validation = {
                network: network,
                isValid: true,
                issues: [],
                contracts: status.contracts,
                stats: stats
            };
            
            // Check if all contracts are deployed
            for (const [type, contract] of Object.entries(status.contracts)) {
                if (!contract.deployed) {
                    validation.isValid = false;
                    validation.issues.push(`${type} contract not deployed or has no code`);
                }
            }
            
            // Check basic functionality
            try {
                await this.getContractStats(network);
            } catch (error) {
                validation.isValid = false;
                validation.issues.push(`Contract functionality test failed: ${error.message}`);
            }
            
            return validation;
        } catch (error) {
            return {
                network: network,
                isValid: false,
                issues: [`Validation failed: ${error.message}`]
            };
        }
    }

    getExplorerUrl(address, network = 'testnet') {
        const networkConfig = this.networks[network === 'testnet' ? 'amoy' : 'polygon'];
        return `${networkConfig.scanUrl}/address/${address}`;
    }

    generateFrontendConfig(network = 'testnet') {
        try {
            const addresses = this.getContractAddresses(network);
            const networkConfig = this.networks[network === 'testnet' ? 'amoy' : 'polygon'];
            
            return {
                chainId: networkConfig.chainId,
                networkName: networkConfig.name,
                rpcUrl: networkConfig.rpcUrl,
                scanUrl: networkConfig.scanUrl,
                contracts: addresses
            };
        } catch (error) {
            throw new Error(`Failed to generate frontend config: ${error.message}`);
        }
    }

    generateBackendConfig(network = 'testnet') {
        try {
            const addresses = this.getContractAddresses(network);
            const networkConfig = this.networks[network === 'testnet' ? 'amoy' : 'polygon'];
            
            const envPrefix = network === 'testnet' ? 'POLYGON_TESTNET' : 'POLYGON_MAINNET';
            
            return {
                [`${envPrefix}_DONATION_CONTRACT`]: addresses.donation,
                [`${envPrefix}_MILESTONE_CONTRACT`]: addresses.milestone,
                [`${envPrefix}_AUDIT_CONTRACT`]: addresses.audit,
                [`${envPrefix}_CHAIN_ID`]: networkConfig.chainId,
                [`${envPrefix}_RPC_URL`]: networkConfig.rpcUrl,
                [`${envPrefix}_ENABLED`]: true
            };
        } catch (error) {
            throw new Error(`Failed to generate backend config: ${error.message}`);
        }
    }
}

module.exports = ContractDeploymentService;
