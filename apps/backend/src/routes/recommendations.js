const express = require('express');
const router = express.Router();
const RecommendationEngine = require('../services/recommendationEngine');
const { protect } = require('../middleware/auth');
const { Campaign } = require('../models/Campaign');

const recommendationEngine = new RecommendationEngine();

// Get personalized recommendations for authenticated user
router.get('/personalized', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        
        const recommendations = await recommendationEngine.getPersonalizedRecommendations(userId, limit);
        
        res.json({
            success: true,
            data: {
                recommendations,
                count: recommendations.length,
                userId,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Personalized recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get personalized recommendations'
        });
    }
});

// Get popular campaigns (for non-authenticated users)
router.get('/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const popularCampaigns = await recommendationEngine.getPopularCampaigns(limit);
        
        res.json({
            success: true,
            data: {
                campaigns: popularCampaigns,
                count: popularCampaigns.length,
                type: 'popular'
            }
        });
    } catch (error) {
        console.error('Popular campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get popular campaigns'
        });
    }
});

// Get similar campaigns to a specific campaign
router.get('/similar/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const limit = parseInt(req.query.limit) || 5;
        
        const similarCampaigns = await recommendationEngine.getSimilarCampaigns(campaignId, limit);
        
        res.json({
            success: true,
            data: {
                campaigns: similarCampaigns,
                count: similarCampaigns.length,
                baseCampaignId: campaignId
            }
        });
    } catch (error) {
        console.error('Similar campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get similar campaigns'
        });
    }
});

// Get category-based recommendations
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        
        const campaigns = await Campaign.find({
            category: category,
            status: 'active',
            isVerified: true,
            endDate: { $gt: new Date() }
        })
        .sort({ raisedAmount: -1, createdAt: -1 })
        .limit(limit)
        .populate('creator');
        
        res.json({
            success: true,
            data: {
                campaigns,
                count: campaigns.length,
                category
            }
        });
    } catch (error) {
        console.error('Category recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get category recommendations'
        });
    }
});

// Get trending campaigns (high activity recently)
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const days = parseInt(req.query.days) || 7;
        
        // Get campaigns with recent high donation activity
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - days);
        
        const { Donation } = require('../models/Donation');
        
        // Aggregate donations by campaign for trending calculation
        const trendingData = await Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: recentDate }
                }
            },
            {
                $group: {
                    _id: '$campaign',
                    recentDonations: { $sum: 1 },
                    recentAmount: { $sum: '$amount' }
                }
            },
            {
                $sort: { recentDonations: -1, recentAmount: -1 }
            },
            {
                $limit: limit
            }
        ]);
        
        // Get full campaign details
        const campaignIds = trendingData.map(item => item._id);
        const campaigns = await Campaign.find({
            _id: { $in: campaignIds },
            status: 'active',
            isVerified: true
        }).populate('creator');
        
        // Merge trending data with campaign details
        const trendingCampaigns = campaigns.map(campaign => {
            const trendData = trendingData.find(item => item._id.equals(campaign._id));
            return {
                ...campaign.toObject(),
                trendingData: {
                    recentDonations: trendData.recentDonations,
                    recentAmount: trendData.recentAmount,
                    trendingScore: trendData.recentDonations * 0.7 + (trendData.recentAmount / 1000) * 0.3
                }
            };
        }).sort((a, b) => b.trendingData.trendingScore - a.trendingData.trendingScore);
        
        res.json({
            success: true,
            data: {
                campaigns: trendingCampaigns,
                count: trendingCampaigns.length,
                period: `${days} days`
            }
        });
    } catch (error) {
        console.error('Trending campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get trending campaigns'
        });
    }
});

// Get urgent campaigns (ending soon and not fully funded)
router.get('/urgent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const maxDays = parseInt(req.query.maxDays) || 7;
        
        const urgentDate = new Date();
        urgentDate.setDate(urgentDate.getDate() + maxDays);
        
        const urgentCampaigns = await Campaign.find({
            status: 'active',
            isVerified: true,
            endDate: { $lte: urgentDate, $gt: new Date() },
            $expr: { $lt: ['$raisedAmount', { $multiply: ['$targetAmount', 0.8] }] } // Less than 80% funded
        })
        .sort({ endDate: 1 }) // Soonest ending first
        .limit(limit)
        .populate('creator');
        
        // Add urgency scores
        const campaignsWithUrgency = urgentCampaigns.map(campaign => {
            const daysRemaining = (new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24);
            const fundingRatio = campaign.raisedAmount / campaign.targetAmount;
            const urgencyScore = (1 - fundingRatio) * (1 - daysRemaining / maxDays);
            
            return {
                ...campaign.toObject(),
                urgencyData: {
                    daysRemaining: Math.ceil(daysRemaining),
                    fundingRatio,
                    urgencyScore,
                    amountNeeded: campaign.targetAmount - campaign.raisedAmount
                }
            };
        });
        
        res.json({
            success: true,
            data: {
                campaigns: campaignsWithUrgency,
                count: campaignsWithUrgency.length,
                maxDaysFilter: maxDays
            }
        });
    } catch (error) {
        console.error('Urgent campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get urgent campaigns'
        });
    }
});

// Get location-based recommendations
router.get('/nearby', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const { User } = require('../models/User');
        
        const user = await User.findById(userId);
        if (!user || !user.profile?.location) {
            return res.status(400).json({
                success: false,
                error: 'User location not available'
            });
        }
        
        const userLocation = user.profile.location;
        
        // Find campaigns in same city/state
        const nearbyCampaigns = await Campaign.find({
            status: 'active',
            isVerified: true,
            endDate: { $gt: new Date() },
            $or: [
                { 'location.city': userLocation.city },
                { 'location.state': userLocation.state }
            ]
        })
        .sort({ 
            'location.city': userLocation.city ? -1 : 0, // Prioritize same city
            createdAt: -1 
        })
        .limit(limit)
        .populate('creator');
        
        // Add distance information
        const campaignsWithDistance = nearbyCampaigns.map(campaign => ({
            ...campaign.toObject(),
            locationData: {
                sameCity: campaign.location?.city === userLocation.city,
                sameState: campaign.location?.state === userLocation.state,
                distance: campaign.location?.city === userLocation.city ? 'Same city' : 
                         campaign.location?.state === userLocation.state ? 'Same state' : 'Different region'
            }
        }));
        
        res.json({
            success: true,
            data: {
                campaigns: campaignsWithDistance,
                count: campaignsWithDistance.length,
                userLocation
            }
        });
    } catch (error) {
        console.error('Nearby campaigns error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get nearby campaigns'
        });
    }
});

// Track recommendation interaction (for ML improvement)
router.post('/interaction', protect, async (req, res) => {
    try {
        const { campaignId, action, recommendationType } = req.body;
        const userId = req.user.id;
        
        // Store interaction for ML training (could be in separate collection)
        const interaction = {
            userId,
            campaignId,
            action, // 'view', 'click', 'donate', 'share'
            recommendationType, // 'personalized', 'popular', 'similar', etc.
            timestamp: new Date()
        };
        
        // TODO: Store in interactions collection for ML training
        console.log('Recommendation interaction:', interaction);
        
        res.json({
            success: true,
            message: 'Interaction tracked'
        });
    } catch (error) {
        console.error('Interaction tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track interaction'
        });
    }
});

// Get recommendation statistics (admin only)
router.get('/stats', protect, async (req, res) => {
    try {
        const { User } = require('../models/User');
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        
        // Calculate recommendation statistics
        const totalCampaigns = await Campaign.countDocuments({ status: 'active', isVerified: true });
        const totalUsers = await User.countDocuments();
        
        // TODO: Add more detailed stats from interactions collection
        
        res.json({
            success: true,
            data: {
                totalActiveCampaigns: totalCampaigns,
                totalUsers,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Recommendation stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recommendation statistics'
        });
    }
});

module.exports = router;
