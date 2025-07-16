const express = require('express');
const router = express.Router();
const ContractDeploymentService = require('../services/contractDeploymentService');

const deploymentService = new ContractDeploymentService();

// Get deployment status for a network
router.get('/status/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const status = await deploymentService.checkDeploymentStatus(network);
        
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get contract statistics
router.get('/stats/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const stats = await deploymentService.getContractStats(network);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Validate deployment
router.get('/validate/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const validation = await deploymentService.validateDeployment(network);
        
        res.json({
            success: true,
            data: validation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get contract addresses
router.get('/addresses/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const addresses = deploymentService.getContractAddresses(network);
        
        res.json({
            success: true,
            data: {
                network,
                contracts: addresses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate frontend configuration
router.get('/frontend-config/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const config = deploymentService.generateFrontendConfig(network);
        
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Generate backend configuration
router.get('/backend-config/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const config = deploymentService.generateBackendConfig(network);
        
        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all deployment information
router.get('/info', async (req, res) => {
    try {
        const info = {
            networks: ['testnet', 'mainnet'],
            deployment: {}
        };
        
        // Get info for both networks
        for (const network of ['testnet', 'mainnet']) {
            try {
                const status = await deploymentService.checkDeploymentStatus(network);
                const addresses = deploymentService.getContractAddresses(network);
                
                info.deployment[network] = {
                    status,
                    addresses,
                    explorerUrls: {
                        donation: deploymentService.getExplorerUrl(addresses.donation, network),
                        milestone: deploymentService.getExplorerUrl(addresses.milestone, network),
                        audit: deploymentService.getExplorerUrl(addresses.audit, network)
                    }
                };
            } catch (error) {
                info.deployment[network] = {
                    error: error.message,
                    deployed: false
                };
            }
        }
        
        res.json({
            success: true,
            data: info
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get explorer URLs for contracts
router.get('/explorer/:network?', async (req, res) => {
    try {
        const network = req.params.network || 'testnet';
        
        if (!['testnet', 'mainnet'].includes(network)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid network. Use "testnet" or "mainnet"'
            });
        }
        
        const addresses = deploymentService.getContractAddresses(network);
        const explorerUrls = {};
        
        for (const [type, address] of Object.entries(addresses)) {
            explorerUrls[type] = deploymentService.getExplorerUrl(address, network);
        }
        
        res.json({
            success: true,
            data: {
                network,
                urls: explorerUrls
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
