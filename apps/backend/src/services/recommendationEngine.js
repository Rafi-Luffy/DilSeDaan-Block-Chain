const { Campaign } = require('../models/Campaign');
const { User } = require('../models/User');
const { Donation } = require('../models/Donation');

class RecommendationEngine {
    constructor() {
        this.weights = {
            userHistory: 0.3,
            categoryPreference: 0.25,
            donationAmount: 0.15,
            geographicProximity: 0.15,
            campaignPopularity: 0.1,
            recency: 0.05
        };
        
        this.categoryMapping = {
            'education': ['children', 'youth', 'school', 'scholarship'],
            'healthcare': ['medical', 'hospital', 'treatment', 'health'],
            'disaster-relief': ['emergency', 'flood', 'earthquake', 'crisis'],
            'poverty': ['hunger', 'food', 'shelter', 'basic-needs'],
            'environment': ['tree', 'clean', 'nature', 'conservation'],
            'animals': ['animal', 'pets', 'wildlife', 'rescue']
        };
    }

    async getPersonalizedRecommendations(userId, limit = 10) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return this.getPopularCampaigns(limit);
            }

            // Get user's donation history
            const userDonations = await Donation.find({ donor: userId })
                .populate('campaign')
                .sort({ createdAt: -1 })
                .limit(50);

            // Get user preferences
            const userPreferences = await this.analyzeUserPreferences(userDonations);
            
            // Get all active campaigns
            const allCampaigns = await Campaign.find({ 
                status: 'active',
                isVerified: true,
                endDate: { $gt: new Date() }
            }).populate('creator');

            // Score each campaign
            const scoredCampaigns = await Promise.all(
                allCampaigns.map(campaign => this.scoreCampaign(campaign, user, userPreferences))
            );

            // Sort by score and return top recommendations
            return scoredCampaigns
                .sort((a, b) => b.score - a.score)
                .slice(0, limit)
                .map(item => ({
                    ...item.campaign.toObject(),
                    recommendationScore: item.score,
                    recommendationReasons: item.reasons
                }));

        } catch (error) {
            console.error('Recommendation engine error:', error);
            return this.getPopularCampaigns(limit);
        }
    }

    async analyzeUserPreferences(userDonations) {
        const preferences = {
            categories: {},
            averageDonation: 0,
            donationFrequency: 0,
            preferredRegions: {},
            timeOfDay: {},
            totalDonated: 0
        };

        if (userDonations.length === 0) {
            return preferences;
        }

        let totalAmount = 0;
        const donationTimes = [];
        
        for (const donation of userDonations) {
            const campaign = donation.campaign;
            if (!campaign) continue;

            // Category preferences
            const category = campaign.category || 'other';
            preferences.categories[category] = (preferences.categories[category] || 0) + 1;

            // Amount analysis
            totalAmount += donation.amount;

            // Geographic preferences
            if (campaign.location) {
                const region = campaign.location.state || campaign.location.city;
                if (region) {
                    preferences.preferredRegions[region] = (preferences.preferredRegions[region] || 0) + 1;
                }
            }

            // Time analysis
            const hour = new Date(donation.createdAt).getHours();
            const timeSlot = this.getTimeSlot(hour);
            preferences.timeOfDay[timeSlot] = (preferences.timeOfDay[timeSlot] || 0) + 1;

            donationTimes.push(donation.createdAt);
        }

        preferences.averageDonation = totalAmount / userDonations.length;
        preferences.totalDonated = totalAmount;
        preferences.donationFrequency = this.calculateDonationFrequency(donationTimes);

        // Normalize category preferences
        const totalCategoryDonations = Object.values(preferences.categories).reduce((a, b) => a + b, 0);
        for (const category in preferences.categories) {
            preferences.categories[category] = preferences.categories[category] / totalCategoryDonations;
        }

        return preferences;
    }

    async scoreCampaign(campaign, user, userPreferences) {
        let score = 0;
        const reasons = [];

        // 1. Category preference score
        const categoryScore = this.getCategoryScore(campaign, userPreferences);
        score += categoryScore * this.weights.categoryPreference;
        if (categoryScore > 0.5) {
            reasons.push(`Matches your interest in ${campaign.category}`);
        }

        // 2. Donation amount compatibility
        const amountScore = this.getAmountCompatibilityScore(campaign, userPreferences);
        score += amountScore * this.weights.donationAmount;

        // 3. Geographic proximity score
        const geoScore = this.getGeographicScore(campaign, user);
        score += geoScore * this.weights.geographicProximity;
        if (geoScore > 0.7) {
            reasons.push(`Near your location`);
        }

        // 4. Campaign popularity score
        const popularityScore = await this.getCampaignPopularityScore(campaign);
        score += popularityScore * this.weights.campaignPopularity;
        if (popularityScore > 0.8) {
            reasons.push(`Highly supported by community`);
        }

        // 5. Recency score (newer campaigns get slight boost)
        const recencyScore = this.getRecencyScore(campaign);
        score += recencyScore * this.weights.recency;

        // 6. Urgency boost
        const urgencyScore = this.getUrgencyScore(campaign);
        if (urgencyScore > 0.8) {
            score += 0.1; // Emergency boost
            reasons.push(`Urgent need`);
        }

        // 7. Success probability score
        const successScore = this.getSuccessProbabilityScore(campaign);
        score += successScore * 0.1;
        if (successScore > 0.8) {
            reasons.push(`Likely to reach goal`);
        }

        return {
            campaign,
            score: Math.min(score, 1), // Cap at 1
            reasons
        };
    }

    getCategoryScore(campaign, userPreferences) {
        const campaignCategory = campaign.category;
        if (!campaignCategory || !userPreferences.categories) {
            return 0.1; // Default low score
        }

        // Direct category match
        if (userPreferences.categories[campaignCategory]) {
            return userPreferences.categories[campaignCategory];
        }

        // Semantic matching
        const campaignKeywords = this.extractKeywords(campaign.title + ' ' + campaign.description);
        const relatedCategories = this.categoryMapping[campaignCategory] || [];
        
        let semanticScore = 0;
        for (const keyword of campaignKeywords) {
            for (const [category, weight] of Object.entries(userPreferences.categories)) {
                const categoryKeywords = this.categoryMapping[category] || [];
                if (categoryKeywords.some(ck => keyword.toLowerCase().includes(ck))) {
                    semanticScore += weight * 0.5; // Partial match
                }
            }
        }

        return Math.min(semanticScore, 0.8);
    }

    getAmountCompatibilityScore(campaign, userPreferences) {
        if (!userPreferences.averageDonation || userPreferences.averageDonation === 0) {
            return 0.5; // Neutral score
        }

        const campaignTarget = campaign.targetAmount;
        const averageDonationForCampaign = campaignTarget / 100; // Estimate
        const userAverage = userPreferences.averageDonation;

        // Score based on how close the campaign's typical donation is to user's average
        const ratio = Math.min(averageDonationForCampaign, userAverage) / Math.max(averageDonationForCampaign, userAverage);
        return ratio;
    }

    getGeographicScore(campaign, user) {
        if (!campaign.location || !user.profile?.location) {
            return 0.3; // Neutral score for unknown locations
        }

        const campaignLocation = campaign.location;
        const userLocation = user.profile.location;

        // Same city
        if (campaignLocation.city === userLocation.city) {
            return 1.0;
        }

        // Same state
        if (campaignLocation.state === userLocation.state) {
            return 0.7;
        }

        // Same country
        if (campaignLocation.country === userLocation.country) {
            return 0.4;
        }

        return 0.1; // Different country
    }

    async getCampaignPopularityScore(campaign) {
        try {
            const donationCount = await Donation.countDocuments({ campaign: campaign._id });
            const daysSinceCreation = (Date.now() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            
            // Donations per day as popularity metric
            const donationsPerDay = donationCount / Math.max(daysSinceCreation, 1);
            
            // Normalize to 0-1 scale (assuming 5 donations per day is very popular)
            return Math.min(donationsPerDay / 5, 1);
        } catch (error) {
            return 0.5;
        }
    }

    getRecencyScore(campaign) {
        const daysSinceCreation = (Date.now() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // Score decreases over time, but slowly
        if (daysSinceCreation <= 7) return 1.0;      // Very new
        if (daysSinceCreation <= 30) return 0.8;     // Recent
        if (daysSinceCreation <= 90) return 0.6;     // Somewhat old
        return 0.4;                                   // Old
    }

    getUrgencyScore(campaign) {
        const now = new Date();
        const endDate = new Date(campaign.endDate);
        const daysRemaining = (endDate - now) / (1000 * 60 * 60 * 24);
        
        // Higher urgency for campaigns ending soon but not yet successful
        const progressRatio = campaign.raisedAmount / campaign.targetAmount;
        
        if (daysRemaining <= 3 && progressRatio < 0.8) return 1.0;  // Very urgent
        if (daysRemaining <= 7 && progressRatio < 0.6) return 0.8;  // Urgent
        if (daysRemaining <= 14 && progressRatio < 0.4) return 0.6; // Somewhat urgent
        
        return 0.2; // Not urgent
    }

    getSuccessProbabilityScore(campaign) {
        const progressRatio = campaign.raisedAmount / campaign.targetAmount;
        const now = new Date();
        const totalDays = (new Date(campaign.endDate) - new Date(campaign.createdAt)) / (1000 * 60 * 60 * 24);
        const daysElapsed = (now - new Date(campaign.createdAt)) / (1000 * 60 * 60 * 24);
        const timeRatio = daysElapsed / totalDays;

        // Campaign ahead of schedule
        if (progressRatio > timeRatio * 1.2) return 1.0;
        if (progressRatio > timeRatio) return 0.8;
        if (progressRatio > timeRatio * 0.8) return 0.6;
        if (progressRatio > timeRatio * 0.5) return 0.4;
        
        return 0.2;
    }

    extractKeywords(text) {
        // Simple keyword extraction
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
    }

    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
    }

    calculateDonationFrequency(donationTimes) {
        if (donationTimes.length < 2) return 0;
        
        const sortedTimes = donationTimes.sort((a, b) => new Date(a) - new Date(b));
        const totalSpan = new Date(sortedTimes[sortedTimes.length - 1]) - new Date(sortedTimes[0]);
        const days = totalSpan / (1000 * 60 * 60 * 24);
        
        return donationTimes.length / Math.max(days, 1); // Donations per day
    }

    async getPopularCampaigns(limit = 10) {
        try {
            return await Campaign.find({ 
                status: 'active',
                isVerified: true,
                endDate: { $gt: new Date() }
            })
            .sort({ raisedAmount: -1, createdAt: -1 })
            .limit(limit)
            .populate('creator');
        } catch (error) {
            console.error('Error getting popular campaigns:', error);
            return [];
        }
    }

    async getSimilarCampaigns(campaignId, limit = 5) {
        try {
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) return [];

            const similarCampaigns = await Campaign.find({
                _id: { $ne: campaignId },
                category: campaign.category,
                status: 'active',
                isVerified: true,
                endDate: { $gt: new Date() }
            })
            .limit(limit * 2) // Get more to filter
            .populate('creator');

            // Score similarity based on keywords and location
            const scored = similarCampaigns.map(c => ({
                campaign: c,
                similarity: this.calculateSimilarity(campaign, c)
            }))
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit);

            return scored.map(item => item.campaign);
        } catch (error) {
            console.error('Error getting similar campaigns:', error);
            return [];
        }
    }

    calculateSimilarity(campaign1, campaign2) {
        let similarity = 0;

        // Category match
        if (campaign1.category === campaign2.category) {
            similarity += 0.4;
        }

        // Location similarity
        if (campaign1.location && campaign2.location) {
            if (campaign1.location.state === campaign2.location.state) {
                similarity += 0.3;
            }
            if (campaign1.location.city === campaign2.location.city) {
                similarity += 0.2;
            }
        }

        // Target amount similarity
        const amount1 = campaign1.targetAmount;
        const amount2 = campaign2.targetAmount;
        const amountRatio = Math.min(amount1, amount2) / Math.max(amount1, amount2);
        similarity += amountRatio * 0.1;

        return similarity;
    }

    // Machine learning enhancement placeholder
    async trainModel(userInteractions) {
        // This would implement actual ML training
        // For now, we'll use rule-based recommendations
        console.log('Training recommendation model with', userInteractions.length, 'interactions');
    }
}

module.exports = RecommendationEngine;
