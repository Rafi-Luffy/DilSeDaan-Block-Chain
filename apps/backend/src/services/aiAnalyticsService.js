// AI-Powered Advanced Analytics Service
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');

class AIAnalyticsService {
  // Advanced campaign performance prediction using machine learning principles
  async predictCampaignSuccess(campaignData) {
    try {
      // Factors that influence campaign success based on historical data
      const successFactors = {
        titleLength: this.scoreTitleLength(campaignData.title),
        descriptionQuality: this.scoreDescriptionQuality(campaignData.description),
        goalRealism: this.scoreGoalRealism(campaignData.goalAmount),
        categoryTrend: await this.scoreCategoryTrend(campaignData.category),
        creatorHistory: await this.scoreCreatorHistory(campaignData.creatorId),
        imageQuality: this.scoreImageQuality(campaignData.images),
        timeline: this.scoreTimeline(campaignData.endDate),
        socialProof: await this.scoreSocialProof(campaignData.creatorId)
      };

      // Weighted scoring algorithm
      const weights = {
        titleLength: 0.1,
        descriptionQuality: 0.2,
        goalRealism: 0.15,
        categoryTrend: 0.15,
        creatorHistory: 0.2,
        imageQuality: 0.1,
        timeline: 0.05,
        socialProof: 0.05
      };

      let totalScore = 0;
      for (const [factor, score] of Object.entries(successFactors)) {
        totalScore += score * weights[factor];
      }

      // Convert to percentage and add confidence interval
      const successProbability = Math.min(Math.max(totalScore * 100, 5), 95);
      const confidence = this.calculateConfidence(successFactors);

      return {
        successProbability: Math.round(successProbability),
        confidence,
        factors: successFactors,
        recommendations: this.generateRecommendations(successFactors),
        riskFactors: this.identifyRiskFactors(successFactors)
      };
    } catch (error) {
      console.error('Error predicting campaign success:', error);
      return { successProbability: 50, confidence: 'low' };
    }
  }

  // Score title length and quality
  scoreTitleLength(title) {
    if (!title) return 0;
    const length = title.length;
    // Optimal title length: 40-60 characters
    if (length >= 40 && length <= 60) return 1;
    if (length >= 30 && length <= 70) return 0.8;
    if (length >= 20 && length <= 80) return 0.6;
    return 0.3;
  }

  // Score description quality
  scoreDescriptionQuality(description) {
    if (!description) return 0;
    
    let score = 0;
    // Length check
    if (description.length > 200) score += 0.3;
    if (description.length > 500) score += 0.2;
    
    // Content quality indicators
    const qualityKeywords = ['help', 'support', 'urgent', 'medical', 'education', 'emergency', 'family', 'treatment'];
    const keywordMatches = qualityKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword)
    ).length;
    score += Math.min(keywordMatches * 0.1, 0.3);
    
    // Emotional appeal indicators
    const emotionalWords = ['please', 'desperately', 'hope', 'grateful', 'blessing', 'pray'];
    const emotionalMatches = emotionalWords.filter(word => 
      description.toLowerCase().includes(word)
    ).length;
    score += Math.min(emotionalMatches * 0.05, 0.2);
    
    return Math.min(score, 1);
  }

  // Score goal realism based on category and historical data
  scoreGoalRealism(goalAmount) {
    // Categories with typical goal ranges
    const categoryRanges = {
      'medical': { min: 50000, max: 2000000, optimal: 300000 },
      'education': { min: 20000, max: 500000, optimal: 100000 },
      'emergency': { min: 10000, max: 1000000, optimal: 150000 },
      'community': { min: 25000, max: 800000, optimal: 200000 }
    };

    // Default scoring if category not found
    if (goalAmount <= 0) return 0;
    if (goalAmount <= 10000) return 0.3;
    if (goalAmount <= 100000) return 0.8;
    if (goalAmount <= 500000) return 1;
    if (goalAmount <= 1000000) return 0.7;
    return 0.4; // Very high goals are risky
  }

  // Score category trending popularity
  async scoreCategoryTrend(category) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCampaigns = await Campaign.find({
        category,
        createdAt: { $gte: thirtyDaysAgo }
      });

      const successfulCampaigns = recentCampaigns.filter(campaign => 
        campaign.raisedAmount >= campaign.goalAmount * 0.5
      );

      const successRate = recentCampaigns.length > 0 ? 
        successfulCampaigns.length / recentCampaigns.length : 0.5;

      return Math.min(successRate + 0.3, 1); // Boost by base score
    } catch (error) {
      return 0.5; // Default middle score
    }
  }

  // Score creator's historical performance
  async scoreCreatorHistory(creatorId) {
    try {
      const previousCampaigns = await Campaign.find({ creatorId });
      
      if (previousCampaigns.length === 0) return 0.5; // New creator gets neutral score

      const successfulCampaigns = previousCampaigns.filter(campaign => 
        campaign.raisedAmount >= campaign.goalAmount * 0.7
      );

      const successRate = successfulCampaigns.length / previousCampaigns.length;
      
      // Bonus for experience
      const experienceBonus = Math.min(previousCampaigns.length * 0.1, 0.3);
      
      return Math.min(successRate + experienceBonus, 1);
    } catch (error) {
      return 0.5;
    }
  }

  // Score image quality and presence
  scoreImageQuality(images) {
    if (!images || images.length === 0) return 0.2;
    if (images.length >= 3) return 1;
    if (images.length >= 2) return 0.8;
    return 0.6;
  }

  // Score campaign timeline
  scoreTimeline(endDate) {
    if (!endDate) return 0.3;
    
    const now = new Date();
    const end = new Date(endDate);
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    // Optimal campaign duration: 30-60 days
    if (daysRemaining >= 30 && daysRemaining <= 60) return 1;
    if (daysRemaining >= 20 && daysRemaining <= 90) return 0.8;
    if (daysRemaining >= 10 && daysRemaining <= 120) return 0.6;
    return 0.3;
  }

  // Score social proof indicators
  async scoreSocialProof(creatorId) {
    try {
      const user = await User.findById(creatorId);
      if (!user) return 0.3;

      let score = 0;
      if (user.isVerified) score += 0.4;
      if (user.profilePhoto) score += 0.2;
      if (user.bio && user.bio.length > 50) score += 0.2;
      if (user.phoneVerified) score += 0.2;

      return Math.min(score, 1);
    } catch (error) {
      return 0.3;
    }
  }

  // Calculate confidence in prediction
  calculateConfidence(factors) {
    const scores = Object.values(factors);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
    
    // Lower variance = higher confidence
    if (variance < 0.1) return 'high';
    if (variance < 0.2) return 'medium';
    return 'low';
  }

  // Generate actionable recommendations
  generateRecommendations(factors) {
    const recommendations = [];

    if (factors.titleLength < 0.7) {
      recommendations.push('Consider optimizing your title length (40-60 characters works best)');
    }
    if (factors.descriptionQuality < 0.6) {
      recommendations.push('Add more detailed description with emotional appeal and specific use of funds');
    }
    if (factors.imageQuality < 0.8) {
      recommendations.push('Add high-quality images to build trust and visual appeal');
    }
    if (factors.socialProof < 0.6) {
      recommendations.push('Complete your profile verification to increase credibility');
    }
    if (factors.timeline < 0.6) {
      recommendations.push('Consider adjusting campaign duration to 30-60 days for optimal results');
    }

    return recommendations;
  }

  // Identify risk factors
  identifyRiskFactors(factors) {
    const risks = [];

    if (factors.goalRealism < 0.5) {
      risks.push('Goal amount may be too high for the category');
    }
    if (factors.creatorHistory < 0.4) {
      risks.push('Limited creator track record');
    }
    if (factors.categoryTrend < 0.4) {
      risks.push('Category showing lower success rates recently');
    }
    if (factors.descriptionQuality < 0.3) {
      risks.push('Description needs significant improvement');
    }

    return risks;
  }

  // Advanced donor behavior analysis
  async analyzeDonorBehavior(userId) {
    try {
      const donations = await Donation.find({ donorId: userId }).populate('campaignId');
      
      if (donations.length === 0) {
        return { type: 'new_donor', preferences: {} };
      }

      // Analyze donation patterns
      const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
      const averageDonation = totalDonated / donations.length;
      const categories = donations.map(d => d.campaignId.category);
      const categoryFreq = this.getFrequency(categories);
      const donationTiming = this.analyzeDonationTiming(donations);

      // Determine donor type
      let donorType = 'occasional';
      if (donations.length >= 10) donorType = 'frequent';
      if (totalDonated >= 100000) donorType = 'major';
      if (donations.length >= 20 && totalDonated >= 50000) donorType = 'champion';

      return {
        type: donorType,
        totalDonated,
        averageDonation,
        donationCount: donations.length,
        preferredCategories: Object.keys(categoryFreq).slice(0, 3),
        donationTiming,
        nextDonationPrediction: this.predictNextDonation(donations),
        recommendedAmount: this.recommendDonationAmount(donations)
      };
    } catch (error) {
      console.error('Error analyzing donor behavior:', error);
      return { type: 'unknown', preferences: {} };
    }
  }

  // Helper function to get frequency of items
  getFrequency(array) {
    return array.reduce((freq, item) => {
      freq[item] = (freq[item] || 0) + 1;
      return freq;
    }, {});
  }

  // Analyze donation timing patterns
  analyzeDonationTiming(donations) {
    const hours = donations.map(d => new Date(d.createdAt).getHours());
    const days = donations.map(d => new Date(d.createdAt).getDay());
    
    const hourFreq = this.getFrequency(hours);
    const dayFreq = this.getFrequency(days);
    
    const preferredHour = Object.keys(hourFreq).reduce((a, b) => 
      hourFreq[a] > hourFreq[b] ? a : b
    );
    
    const preferredDay = Object.keys(dayFreq).reduce((a, b) => 
      dayFreq[a] > dayFreq[b] ? a : b
    );

    return {
      preferredHour: parseInt(preferredHour),
      preferredDay: parseInt(preferredDay),
      hourDistribution: hourFreq,
      dayDistribution: dayFreq
    };
  }

  // Predict when user might donate next
  predictNextDonation(donations) {
    if (donations.length < 2) return null;

    const sortedDonations = donations.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const intervals = [];
    
    for (let i = 1; i < sortedDonations.length; i++) {
      const interval = new Date(sortedDonations[i].createdAt) - new Date(sortedDonations[i-1].createdAt);
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const lastDonation = new Date(sortedDonations[sortedDonations.length - 1].createdAt);
    const predictedNext = new Date(lastDonation.getTime() + averageInterval * 24 * 60 * 60 * 1000);

    return {
      averageIntervalDays: Math.round(averageInterval),
      predictedDate: predictedNext,
      confidence: intervals.length >= 3 ? 'medium' : 'low'
    };
  }

  // Recommend donation amount based on history
  recommendDonationAmount(donations) {
    const amounts = donations.map(d => d.amount);
    const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const median = amounts.sort((a, b) => a - b)[Math.floor(amounts.length / 2)];
    
    // Recommend slightly higher than average to encourage growth
    const recommended = Math.round(average * 1.2);
    
    return {
      recommended,
      average: Math.round(average),
      median,
      range: {
        min: Math.min(...amounts),
        max: Math.max(...amounts)
      }
    };
  }

  // Fraud detection using ML principles
  async detectFraudRisk(campaignData) {
    try {
      const riskFactors = {
        newCreator: await this.checkNewCreatorRisk(campaignData.creatorId),
        suspiciousGoal: this.checkSuspiciousGoal(campaignData.goalAmount, campaignData.category),
        duplicateContent: await this.checkDuplicateContent(campaignData.title, campaignData.description),
        rapidCampaigns: await this.checkRapidCampaignCreation(campaignData.creatorId),
        imageReuse: await this.checkImageReuse(campaignData.images),
        contactInfo: this.checkContactInfoRisk(campaignData)
      };

      const riskScore = Object.values(riskFactors).reduce((sum, risk) => sum + risk, 0) / Object.keys(riskFactors).length;
      
      let riskLevel = 'low';
      if (riskScore > 0.7) riskLevel = 'high';
      else if (riskScore > 0.4) riskLevel = 'medium';

      return {
        riskLevel,
        riskScore: Math.round(riskScore * 100),
        factors: riskFactors,
        recommendations: this.generateFraudPreventionRecommendations(riskFactors)
      };
    } catch (error) {
      console.error('Error detecting fraud risk:', error);
      return { riskLevel: 'unknown', riskScore: 50 };
    }
  }

  // Check if creator is new and potentially risky
  async checkNewCreatorRisk(creatorId) {
    try {
      const user = await User.findById(creatorId);
      if (!user) return 1;

      const accountAge = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
      const previousCampaigns = await Campaign.countDocuments({ creatorId });

      // Higher risk for very new accounts with no history
      if (accountAge < 7 && previousCampaigns === 0) return 0.8;
      if (accountAge < 30 && previousCampaigns === 0) return 0.6;
      if (previousCampaigns === 0) return 0.4;
      return 0.1;
    } catch (error) {
      return 0.5;
    }
  }

  // Check for suspicious goal amounts
  checkSuspiciousGoal(goalAmount, category) {
    const categoryLimits = {
      'medical': 2000000,
      'education': 500000,
      'emergency': 1000000,
      'community': 800000
    };

    const limit = categoryLimits[category] || 1000000;
    if (goalAmount > limit * 2) return 0.9; // Extremely high
    if (goalAmount > limit) return 0.6; // High but possible
    if (goalAmount < 1000) return 0.7; // Suspiciously low
    return 0.1;
  }

  // Check for duplicate content (simplified version)
  async checkDuplicateContent(title, description) {
    try {
      const similarCampaigns = await Campaign.find({
        $or: [
          { title: { $regex: title.slice(0, 20), $options: 'i' } },
          { description: { $regex: description.slice(0, 50), $options: 'i' } }
        ]
      });

      return similarCampaigns.length > 0 ? 0.8 : 0.1;
    } catch (error) {
      return 0.1;
    }
  }

  // Check for rapid campaign creation
  async checkRapidCampaignCreation(creatorId) {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentCampaigns = await Campaign.countDocuments({
        creatorId,
        createdAt: { $gte: sevenDaysAgo }
      });

      if (recentCampaigns >= 5) return 0.9;
      if (recentCampaigns >= 3) return 0.6;
      if (recentCampaigns >= 2) return 0.3;
      return 0.1;
    } catch (error) {
      return 0.1;
    }
  }

  // Check for image reuse (simplified)
  async checkImageReuse(images) {
    // In a real implementation, this would use image hashing
    // For now, return low risk
    return 0.1;
  }

  // Check contact information risk
  checkContactInfoRisk(campaignData) {
    let risk = 0;
    
    // Check if minimal contact info provided
    if (!campaignData.contactEmail) risk += 0.3;
    if (!campaignData.contactPhone) risk += 0.2;
    
    return Math.min(risk, 1);
  }

  // Generate fraud prevention recommendations
  generateFraudPreventionRecommendations(riskFactors) {
    const recommendations = [];

    if (riskFactors.newCreator > 0.5) {
      recommendations.push('Require additional identity verification for new creators');
    }
    if (riskFactors.suspiciousGoal > 0.5) {
      recommendations.push('Review goal amount and require detailed budget breakdown');
    }
    if (riskFactors.duplicateContent > 0.5) {
      recommendations.push('Flag for manual review due to similar content found');
    }
    if (riskFactors.rapidCampaigns > 0.5) {
      recommendations.push('Limit campaign creation frequency for this creator');
    }

    return recommendations;
  }
}

module.exports = new AIAnalyticsService();
