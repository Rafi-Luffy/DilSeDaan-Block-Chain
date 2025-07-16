// Advanced Search and Filtering Service with AI-powered recommendations
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Donation = require('../models/Donation');

class AdvancedSearchService {
  // Main search function with multiple filters and AI-powered ranking
  async searchCampaigns(searchParams) {
    try {
      const {
        query = '',
        category = '',
        location = '',
        minAmount = 0,
        maxAmount = 10000000,
        status = 'active',
        sortBy = 'relevance',
        page = 1,
        limit = 20,
        userId = null
      } = searchParams;

      // Build MongoDB aggregation pipeline
      const pipeline = [];

      // Match stage - basic filtering
      const matchStage = {
        $match: {
          status: status === 'all' ? { $in: ['active', 'completed', 'cancelled'] } : status,
          goalAmount: { $gte: minAmount, $lte: maxAmount }
        }
      };

      // Add category filter if specified
      if (category && category !== 'all') {
        matchStage.$match.category = category;
      }

      // Add location filter if specified
      if (location) {
        matchStage.$match.$or = [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.state': { $regex: location, $options: 'i' } },
          { 'location.country': { $regex: location, $options: 'i' } }
        ];
      }

      // Add text search if query provided
      if (query) {
        matchStage.$match.$text = { $search: query };
      }

      pipeline.push(matchStage);

      // Add score for text search relevance
      if (query) {
        pipeline.push({
          $addFields: {
            textScore: { $meta: 'textScore' }
          }
        });
      }

      // Lookup creator information
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creator'
        }
      });

      // Lookup donation information for popularity scoring
      pipeline.push({
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'donations'
        }
      });

      // Add computed fields for ranking
      pipeline.push({
        $addFields: {
          donorCount: { $size: '$donations' },
          completionPercentage: {
            $multiply: [
              { $divide: ['$raisedAmount', '$goalAmount'] },
              100
            ]
          },
          daysActive: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          },
          urgencyScore: this.calculateUrgencyScore(),
          creatorTrustScore: this.calculateCreatorTrustScore(),
          socialProofScore: this.calculateSocialProofScore(),
          trendingScore: this.calculateTrendingScore()
        }
      });

      // Calculate overall relevance score
      pipeline.push({
        $addFields: {
          relevanceScore: {
            $add: [
              { $ifNull: ['$textScore', 0] },
              { $multiply: ['$completionPercentage', 0.01] },
              { $multiply: ['$donorCount', 0.1] },
              { $multiply: ['$creatorTrustScore', 5] },
              { $multiply: ['$socialProofScore', 3] },
              { $multiply: ['$urgencyScore', 2] },
              { $multiply: ['$trendingScore', 4] }
            ]
          }
        }
      });

      // Add user personalization if userId provided
      if (userId) {
        const personalizationScore = await this.calculatePersonalizationScore(userId);
        pipeline.push({
          $addFields: {
            personalizationScore,
            finalScore: {
              $add: ['$relevanceScore', '$personalizationScore']
            }
          }
        });
      } else {
        pipeline.push({
          $addFields: {
            finalScore: '$relevanceScore'
          }
        });
      }

      // Sort based on sortBy parameter
      const sortStage = this.getSortStage(sortBy);
      pipeline.push(sortStage);

      // Pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: parseInt(limit) });

      // Project final fields
      pipeline.push({
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          goalAmount: 1,
          raisedAmount: 1,
          category: 1,
          status: 1,
          images: 1,
          location: 1,
          createdAt: 1,
          endDate: 1,
          'creator.name': 1,
          'creator.isVerified': 1,
          donorCount: 1,
          completionPercentage: 1,
          urgencyScore: 1,
          relevanceScore: 1,
          finalScore: 1,
          textScore: 1
        }
      });

      // Execute aggregation
      const campaigns = await Campaign.aggregate(pipeline);

      // Get total count for pagination
      const totalPipeline = pipeline.slice(0, -3); // Remove skip, limit, project
      totalPipeline.push({ $count: 'total' });
      const totalResult = await Campaign.aggregate(totalPipeline);
      const total = totalResult[0]?.total || 0;

      return {
        campaigns,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        searchMetadata: {
          query,
          filters: { category, location, minAmount, maxAmount, status },
          sortBy,
          executionTime: Date.now()
        }
      };

    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error('Search service temporarily unavailable');
    }
  }

  // Calculate urgency score based on campaign timeline and type
  calculateUrgencyScore() {
    return {
      $switch: {
        branches: [
          {
            case: { $eq: ['$category', 'emergency'] },
            then: {
              $subtract: [
                10,
                {
                  $divide: [
                    { $subtract: ['$endDate', new Date()] },
                    1000 * 60 * 60 * 24 * 7 // Convert to weeks
                  ]
                }
              ]
            }
          },
          {
            case: { $eq: ['$category', 'medical'] },
            then: {
              $subtract: [
                7,
                {
                  $divide: [
                    { $subtract: ['$endDate', new Date()] },
                    1000 * 60 * 60 * 24 * 7
                  ]
                }
              ]
            }
          }
        ],
        default: {
          $subtract: [
            5,
            {
              $divide: [
                { $subtract: ['$endDate', new Date()] },
                1000 * 60 * 60 * 24 * 7
              ]
            }
          ]
        }
      }
    };
  }

  // Calculate creator trust score
  calculateCreatorTrustScore() {
    return {
      $add: [
        { $cond: [{ $eq: [{ $arrayElemAt: ['$creator.isVerified', 0] }, true] }, 1, 0] },
        { $cond: [{ $ne: [{ $arrayElemAt: ['$creator.profilePhoto', 0] }, null] }, 0.5, 0] },
        { $cond: [{ $ne: [{ $arrayElemAt: ['$creator.bio', 0] }, null] }, 0.3, 0] },
        { $cond: [{ $eq: [{ $arrayElemAt: ['$creator.phoneVerified', 0] }, true] }, 0.7, 0] }
      ]
    };
  }

  // Calculate social proof score
  calculateSocialProofScore() {
    return {
      $add: [
        { $min: [{ $divide: ['$donorCount', 10] }, 2] }, // Max 2 points for donor count
        { $min: [{ $divide: ['$raisedAmount', 10000] }, 3] }, // Max 3 points for amount raised
        { $cond: [{ $gt: ['$completionPercentage', 25] }, 1, 0] } // Bonus for campaigns with good progress
      ]
    };
  }

  // Calculate trending score based on recent activity
  calculateTrendingScore() {
    return {
      $cond: [
        { $lt: ['$daysActive', 7] }, // New campaigns
        { $subtract: [5, '$daysActive'] },
        {
          $cond: [
            { $lt: ['$daysActive', 30] }, // Recent campaigns
            { $subtract: [3, { $divide: ['$daysActive', 10] }] },
            1 // Older campaigns get base score
          ]
        }
      ]
    };
  }

  // Calculate personalization score based on user behavior
  async calculatePersonalizationScore(userId) {
    try {
      const userDonations = await Donation.find({ donorId: userId }).populate('campaignId');
      
      if (userDonations.length === 0) {
        return { $literal: 0 }; // New user, no personalization
      }

      // Analyze user preferences
      const categoryPreferences = {};
      const locationPreferences = {};
      const amountPreferences = userDonations.map(d => d.amount);

      userDonations.forEach(donation => {
        const campaign = donation.campaignId;
        categoryPreferences[campaign.category] = (categoryPreferences[campaign.category] || 0) + 1;
        if (campaign.location) {
          locationPreferences[campaign.location.state] = (locationPreferences[campaign.location.state] || 0) + 1;
        }
      });

      // Get user's preferred categories and locations
      const topCategory = Object.keys(categoryPreferences).reduce((a, b) => 
        categoryPreferences[a] > categoryPreferences[b] ? a : b
      );
      const topLocation = Object.keys(locationPreferences).reduce((a, b) => 
        locationPreferences[a] > locationPreferences[b] ? a : b
      );
      const avgDonation = amountPreferences.reduce((a, b) => a + b, 0) / amountPreferences.length;

      return {
        $add: [
          { $cond: [{ $eq: ['$category', topCategory] }, 3, 0] },
          { $cond: [{ $eq: ['$location.state', topLocation] }, 2, 0] },
          { 
            $cond: [
              { 
                $and: [
                  { $lte: ['$goalAmount', avgDonation * 10] },
                  { $gte: ['$goalAmount', avgDonation] }
                ]
              }, 
              1, 
              0
            ]
          }
        ]
      };

    } catch (error) {
      console.error('Error calculating personalization score:', error);
      return { $literal: 0 };
    }
  }

  // Get sort stage based on sortBy parameter
  getSortStage(sortBy) {
    switch (sortBy) {
      case 'newest':
        return { $sort: { createdAt: -1 } };
      case 'oldest':
        return { $sort: { createdAt: 1 } };
      case 'goal_high':
        return { $sort: { goalAmount: -1 } };
      case 'goal_low':
        return { $sort: { goalAmount: 1 } };
      case 'progress':
        return { $sort: { completionPercentage: -1 } };
      case 'popular':
        return { $sort: { donorCount: -1, raisedAmount: -1 } };
      case 'urgent':
        return { $sort: { urgencyScore: -1 } };
      case 'trending':
        return { $sort: { trendingScore: -1 } };
      case 'relevance':
      default:
        return { $sort: { finalScore: -1, textScore: { $meta: 'textScore' } } };
    }
  }

  // Get search suggestions based on partial query
  async getSearchSuggestions(partialQuery, limit = 10) {
    try {
      if (!partialQuery || partialQuery.length < 2) {
        return [];
      }

      // Get campaign title suggestions
      const titleSuggestions = await Campaign.aggregate([
        {
          $match: {
            title: { $regex: partialQuery, $options: 'i' },
            status: 'active'
          }
        },
        {
          $project: {
            suggestion: '$title',
            type: 'campaign',
            category: 1
          }
        },
        { $limit: limit / 2 }
      ]);

      // Get category suggestions
      const categorySuggestions = await Campaign.aggregate([
        {
          $match: {
            category: { $regex: partialQuery, $options: 'i' }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            suggestion: '$_id',
            type: 'category',
            count: 1
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit / 2 }
      ]);

      return [...titleSuggestions, ...categorySuggestions];

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get popular search terms
  async getPopularSearches(limit = 10) {
    try {
      // In a real implementation, this would track search queries
      // For now, return popular categories and keywords
      return [
        { term: 'medical emergency', count: 150 },
        { term: 'education fund', count: 120 },
        { term: 'cancer treatment', count: 100 },
        { term: 'flood relief', count: 80 },
        { term: 'child education', count: 75 },
        { term: 'accident recovery', count: 60 },
        { term: 'surgery costs', count: 55 },
        { term: 'disaster relief', count: 50 },
        { term: 'orphanage support', count: 45 },
        { term: 'women empowerment', count: 40 }
      ].slice(0, limit);

    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
  }

  // Advanced filtering options
  async getFilterOptions() {
    try {
      const [categories, locations, amounts] = await Promise.all([
        this.getCategoryFilters(),
        this.getLocationFilters(),
        this.getAmountRanges()
      ]);

      return {
        categories,
        locations,
        amounts,
        sortOptions: [
          { value: 'relevance', label: 'Most Relevant' },
          { value: 'newest', label: 'Newest First' },
          { value: 'popular', label: 'Most Popular' },
          { value: 'urgent', label: 'Most Urgent' },
          { value: 'trending', label: 'Trending' },
          { value: 'progress', label: 'Most Progress' },
          { value: 'goal_high', label: 'Highest Goal' },
          { value: 'goal_low', label: 'Lowest Goal' }
        ]
      };

    } catch (error) {
      console.error('Error getting filter options:', error);
      return { categories: [], locations: [], amounts: [] };
    }
  }

  // Get category filters with counts
  async getCategoryFilters() {
    return await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRaised: { $sum: '$raisedAmount' }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          totalRaised: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
  }

  // Get location filters with counts
  async getLocationFilters() {
    return await Campaign.aggregate([
      { $match: { status: 'active', 'location.state': { $exists: true } } },
      {
        $group: {
          _id: '$location.state',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          state: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
  }

  // Get amount range suggestions
  async getAmountRanges() {
    const amounts = await Campaign.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minAmount: { $min: '$goalAmount' },
          maxAmount: { $max: '$goalAmount' },
          avgAmount: { $avg: '$goalAmount' }
        }
      }
    ]);

    const stats = amounts[0] || { minAmount: 0, maxAmount: 1000000, avgAmount: 100000 };

    return [
      { label: 'Under ₹10,000', min: 0, max: 10000 },
      { label: '₹10,000 - ₹50,000', min: 10000, max: 50000 },
      { label: '₹50,000 - ₹1,00,000', min: 50000, max: 100000 },
      { label: '₹1,00,000 - ₹5,00,000', min: 100000, max: 500000 },
      { label: 'Above ₹5,00,000', min: 500000, max: stats.maxAmount }
    ];
  }

  // Search analytics for admin dashboard
  async getSearchAnalytics(days = 30) {
    try {
      // In a real implementation, this would track actual search queries
      // For now, return mock analytics data
      return {
        totalSearches: 5420,
        popularTerms: await this.getPopularSearches(),
        categoryDistribution: await this.getCategoryFilters(),
        conversionRate: 15.2, // Percentage of searches that lead to donations
        averageResultsPerSearch: 12.5,
        noResultsRate: 8.3
      };

    } catch (error) {
      console.error('Error getting search analytics:', error);
      return null;
    }
  }
}

module.exports = new AdvancedSearchService();
