// Advanced Search API Routes
const express = require('express');
const router = express.Router();
const advancedSearchService = require('../services/advancedSearchService');
const aiAnalyticsService = require('../services/aiAnalyticsService');
const { protect: auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for search endpoints
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many search requests, please try again later.'
});

// Main advanced search endpoint
router.get('/campaigns', searchLimiter, async (req, res) => {
  try {
    const searchParams = {
      query: req.query.q || '',
      category: req.query.category || '',
      location: req.query.location || '',
      minAmount: parseInt(req.query.minAmount) || 0,
      maxAmount: parseInt(req.query.maxAmount) || 10000000,
      status: req.query.status || 'active',
      sortBy: req.query.sortBy || 'relevance',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      userId: req.user?.id || null
    };

    // Validate search parameters
    if (searchParams.page < 1) searchParams.page = 1;
    if (searchParams.limit < 1 || searchParams.limit > 50) searchParams.limit = 20;
    if (searchParams.minAmount < 0) searchParams.minAmount = 0;
    if (searchParams.maxAmount < searchParams.minAmount) {
      searchParams.maxAmount = searchParams.minAmount + 1000000;
    }

    const results = await advancedSearchService.searchCampaigns(searchParams);

    res.json({
      success: true,
      data: results.campaigns,
      pagination: results.pagination,
      metadata: results.searchMetadata
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search service temporarily unavailable'
    });
  }
});

// Search suggestions endpoint
router.get('/suggestions', searchLimiter, async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 10;

    if (query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await advancedSearchService.getSearchSuggestions(query, limit);

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch search suggestions'
    });
  }
});

// Popular searches endpoint
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const popularSearches = await advancedSearchService.getPopularSearches(limit);

    res.json({
      success: true,
      data: popularSearches
    });

  } catch (error) {
    console.error('Popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch popular searches'
    });
  }
});

// Filter options endpoint
router.get('/filters', async (req, res) => {
  try {
    const filterOptions = await advancedSearchService.getFilterOptions();

    res.json({
      success: true,
      data: filterOptions
    });

  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch filter options'
    });
  }
});

// Campaign success prediction endpoint (AI-powered)
router.post('/predict-success', auth, async (req, res) => {
  try {
    const campaignData = req.body;

    // Validate required fields
    if (!campaignData.title || !campaignData.description || !campaignData.goalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and goal amount are required for prediction'
      });
    }

    const prediction = await aiAnalyticsService.predictCampaignSuccess(campaignData);

    res.json({
      success: true,
      data: prediction
    });

  } catch (error) {
    console.error('Campaign prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to predict campaign success'
    });
  }
});

// Fraud detection endpoint
router.post('/detect-fraud', auth, async (req, res) => {
  try {
    const campaignData = req.body;

    // Add creator ID from authenticated user
    campaignData.creatorId = req.user.id;

    const fraudAnalysis = await aiAnalyticsService.detectFraudRisk(campaignData);

    res.json({
      success: true,
      data: fraudAnalysis
    });

  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to analyze fraud risk'
    });
  }
});

// Donor behavior analysis endpoint
router.get('/donor-behavior/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user is requesting their own data or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const behavior = await aiAnalyticsService.analyzeDonorBehavior(userId);

    res.json({
      success: true,
      data: behavior
    });

  } catch (error) {
    console.error('Donor behavior analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to analyze donor behavior'
    });
  }
});

// Search analytics endpoint (admin only)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const days = parseInt(req.query.days) || 30;
    const analytics = await advancedSearchService.getSearchAnalytics(days);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch search analytics'
    });
  }
});

// Advanced filtering with AI recommendations
router.post('/smart-filter', auth, async (req, res) => {
  try {
    const { preferences, history } = req.body;
    const userId = req.user.id;

    // Combine user preferences with search
    const searchParams = {
      ...preferences,
      userId
    };

    const results = await advancedSearchService.searchCampaigns(searchParams);

    // Get AI-powered recommendations based on user behavior
    const donorBehavior = await aiAnalyticsService.analyzeDonorBehavior(userId);

    res.json({
      success: true,
      data: {
        campaigns: results.campaigns,
        pagination: results.pagination,
        recommendations: {
          preferredCategories: donorBehavior.preferredCategories,
          recommendedAmount: donorBehavior.recommendedAmount,
          nextDonationPrediction: donorBehavior.nextDonationPrediction
        }
      }
    });

  } catch (error) {
    console.error('Smart filter error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to apply smart filter'
    });
  }
});

// Real-time search trends
router.get('/trends', async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '24h';
    
    // Mock trending data - in real implementation, this would analyze recent searches
    const trends = [
      { term: 'medical emergency', growth: 45.2, volume: 234 },
      { term: 'flood relief kerala', growth: 123.5, volume: 189 },
      { term: 'child education', growth: 28.7, volume: 156 },
      { term: 'cancer treatment', growth: 15.3, volume: 298 },
      { term: 'covid relief', growth: -12.4, volume: 87 }
    ];

    res.json({
      success: true,
      data: {
        timeframe,
        trends,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Search trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch search trends'
    });
  }
});

// Export search results
router.post('/export', auth, async (req, res) => {
  try {
    const searchParams = req.body;
    const format = req.query.format || 'json';

    // Admin access required for export
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required for export'
      });
    }

    // Get search results without pagination for export
    const exportParams = {
      ...searchParams,
      page: 1,
      limit: 10000 // Large limit for export
    };

    const results = await advancedSearchService.searchCampaigns(exportParams);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=search-results.csv');
      
      // Convert to CSV format
      const csv = results.campaigns.map(campaign => ({
        title: campaign.title,
        category: campaign.category,
        goalAmount: campaign.goalAmount,
        raisedAmount: campaign.raisedAmount,
        status: campaign.status,
        createdAt: campaign.createdAt,
        location: campaign.location?.city || '',
        creatorName: campaign.creator?.name || ''
      }));

      res.json(csv); // In real implementation, use CSV library
    } else {
      res.json({
        success: true,
        data: results.campaigns,
        exportedAt: new Date().toISOString(),
        totalResults: results.pagination.totalResults
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to export search results'
    });
  }
});

module.exports = router;
