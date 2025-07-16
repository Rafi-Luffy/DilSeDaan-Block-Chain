const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const AdvancedAnalyticsService = require('../services/advancedAnalyticsService');

const router = express.Router();
const analyticsService = new AdvancedAnalyticsService();

/**
 * @route   GET /api/analytics/platform
 * @desc    Get comprehensive platform analytics
 * @access  Private (Admin only)
 */
router.get('/platform', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    if (!['24h', '7d', '30d', '90d', '1y'].includes(timeRange)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }

    const analytics = await analyticsService.getPlatformAnalytics(timeRange);

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch platform analytics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get real-time dashboard data
 * @access  Private (Admin only)
 */
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const dashboardData = await analyticsService.getRealTimeDashboard();

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/campaigns
 * @desc    Get campaign performance analytics
 * @access  Private (Admin only)
 */
router.get('/campaigns', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d', category, status } = req.query;
    
    const dateFilter = analyticsService.getDateFilter(timeRange);
    
    // Add additional filters
    if (category) {
      dateFilter.category = category;
    }
    if (status) {
      dateFilter.status = status;
    }

    const campaignAnalytics = await analyticsService.getCampaignPerformance(dateFilter);

    res.status(200).json({
      success: true,
      data: campaignAnalytics,
      filters: { timeRange, category, status }
    });

  } catch (error) {
    console.error('Campaign analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch campaign analytics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/donations
 * @desc    Get donation trends and analytics
 * @access  Private (Admin only)
 */
router.get('/donations', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const dateFilter = analyticsService.getDateFilter(timeRange);
    const donationTrends = await analyticsService.getDonationTrends(dateFilter);

    res.status(200).json({
      success: true,
      data: {
        trends: donationTrends,
        timeRange
      }
    });

  } catch (error) {
    console.error('Donation analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch donation analytics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/users
 * @desc    Get user growth and engagement analytics
 * @access  Private (Admin only)
 */
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const dateFilter = analyticsService.getDateFilter(timeRange);
    const [userGrowth, conversionMetrics, topDonors] = await Promise.all([
      analyticsService.getUserGrowth(dateFilter),
      analyticsService.getConversionMetrics(dateFilter),
      analyticsService.getTopDonors(10)
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        conversionMetrics,
        topDonors,
        timeRange
      }
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user analytics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get revenue and financial analytics
 * @access  Private (Admin only)
 */
router.get('/revenue', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const dateFilter = analyticsService.getDateFilter(timeRange);
    const revenueAnalytics = await analyticsService.getRevenueAnalytics(dateFilter);

    res.status(200).json({
      success: true,
      data: {
        ...revenueAnalytics,
        timeRange
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue analytics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/top-campaigns
 * @desc    Get top performing campaigns
 * @access  Private (Admin only)
 */
router.get('/top-campaigns', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d', limit = 10, sortBy = 'raisedAmount' } = req.query;
    
    const dateFilter = analyticsService.getDateFilter(timeRange);
    const topCampaigns = await analyticsService.getTopCampaigns(dateFilter, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        campaigns: topCampaigns,
        timeRange,
        limit: parseInt(limit),
        sortBy
      }
    });

  } catch (error) {
    console.error('Top campaigns analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top campaigns', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/recent-activity
 * @desc    Get recent platform activity
 * @access  Private (Admin only)
 */
router.get('/recent-activity', protect, authorize('admin'), async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const [recentDonations, topDonors] = await Promise.all([
      analyticsService.getRecentDonations(parseInt(limit)),
      analyticsService.getTopDonors(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentDonations,
        topDonors,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activity', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data
 * @access  Private (Admin only)
 */
router.get('/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;
    
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format. Use json or csv.' });
    }

    const analytics = await analyticsService.exportAnalytics(format, timeRange);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}-${Date.now()}.csv`);
      res.send(analytics);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}-${Date.now()}.json`);
      res.json({
        success: true,
        exportedAt: new Date(),
        timeRange,
        data: analytics
      });
    }

  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export analytics', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/summary
 * @desc    Get analytics summary for quick overview
 * @access  Private (Admin only)
 */
router.get('/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const dateFilter = analyticsService.getDateFilter(timeRange);
    
    const [
      totalStats,
      conversionMetrics,
      revenueData
    ] = await Promise.all([
      analyticsService.getTotalStats(dateFilter),
      analyticsService.getConversionMetrics(dateFilter),
      analyticsService.getRevenueAnalytics(dateFilter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStats,
        conversionMetrics,
        revenue: revenueData.total,
        timeRange,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics summary', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/analytics/my-campaigns
 * @desc    Get analytics for user's own campaigns
 * @access  Private (Campaign creators)
 */
router.get('/my-campaigns', protect, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const dateFilter = {
      ...analyticsService.getDateFilter(timeRange),
      creator: req.user.id
    };

    const campaignAnalytics = await analyticsService.getCampaignPerformance(dateFilter);

    res.status(200).json({
      success: true,
      data: {
        campaigns: campaignAnalytics.campaigns,
        timeRange,
        userId: req.user.id
      }
    });

  } catch (error) {
    console.error('User campaign analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch campaign analytics', 
      error: error.message 
    });
  }
});

module.exports = router;
