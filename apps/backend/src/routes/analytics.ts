import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { Campaign } from '../models/Campaign';
import { Donation } from '../models/Donation';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types/index';
import { validateAnalyticsQuery } from '../middleware/validation';
import { advancedAnalyticsService } from '../services/advancedAnalyticsService';

const router = Router();

// Real-time donation tracking
router.get('/real-time', async (req: Request, res: Response) => {
  try {
    const recentDonations = await Donation.find()
      .populate('campaignId', 'title imageUrl')
      .populate('donorId', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .select('amount campaignId donorId createdAt paymentMethod');

    const totalToday = await Donation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const hourlyStats = await Donation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$createdAt' },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1, '_id.hour': 1 }
      }
    ]);

    res.json({
      recentDonations,
      todayStats: totalToday[0] || { total: 0, count: 0 },
      hourlyStats,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Campaign performance metrics
router.get('/campaigns/:id/performance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    let dateFilter = new Date();
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get donation trends
    const donationTrends = await Donation.aggregate([
      {
        $match: {
          campaignId: campaign._id,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get donor demographics
    const donorDemographics = await Donation.aggregate([
      {
        $match: {
          campaignId: campaign._id,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'donorId',
          foreignField: '_id',
          as: 'donor'
        }
      },
      {
        $unwind: '$donor'
      },
      {
        $group: {
          _id: '$donor.profile.location',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Payment method breakdown
    const paymentMethodStats = await Donation.aggregate([
      {
        $match: {
          campaignId: campaign._id,
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Conversion metrics
    const totalViews = campaign.views || 0;
    const totalShares = campaign.shares || 0;
    const totalDonations = await Donation.countDocuments({ campaignId: campaign._id });
    const conversionRate = totalViews > 0 ? (totalDonations / totalViews * 100) : 0;

    res.json({
      campaign: {
        id: campaign._id,
        title: campaign.title,
        targetAmount: campaign.targetAmount,
        raisedAmount: campaign.raisedAmount,
        donorCount: campaign.donorCount,
        progress: (campaign.raisedAmount / campaign.targetAmount * 100)
      },
      metrics: {
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        avgDonationAmount: campaign.raisedAmount / (campaign.donorCount || 1),
        totalViews,
        totalShares,
        engagementRate: totalViews > 0 ? ((totalShares + totalDonations) / totalViews * 100) : 0
      },
      trends: {
        donations: donationTrends,
        demographics: donorDemographics,
        paymentMethods: paymentMethodStats
      },
      period,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Campaign performance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User behavior analytics
router.get('/user-behavior', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // User donation patterns
    const userStats = await Donation.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'donorId',
          foreignField: '_id',
          as: 'donor'
        }
      },
      {
        $unwind: '$donor'
      },
      {
        $group: {
          _id: '$donorId',
          totalDonated: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          avgDonation: { $avg: '$amount' },
          firstDonation: { $min: '$createdAt' },
          lastDonation: { $max: '$createdAt' },
          favoriteCategories: { $push: '$category' },
          paymentMethods: { $addToSet: '$paymentMethod' }
        }
      },
      {
        $sort: { totalDonated: -1 }
      },
      {
        $limit: 100
      }
    ]);

    // Retention analysis
    const retentionData = await Donation.aggregate([
      {
        $group: {
          _id: '$donorId',
          donations: {
            $push: {
              date: '$createdAt',
              amount: '$amount'
            }
          }
        }
      },
      {
        $project: {
          donorId: '$_id',
          donationCount: { $size: '$donations' },
          isReturning: { $gt: [{ $size: '$donations' }, 1] },
          daysBetweenDonations: {
            $cond: {
              if: { $gt: [{ $size: '$donations' }, 1] },
              then: {
                $divide: [
                  { $subtract: [
                    { $max: '$donations.date' },
                    { $min: '$donations.date' }
                  ]},
                  86400000 // Convert to days
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDonors: { $sum: 1 },
          returningDonors: {
            $sum: { $cond: ['$isReturning', 1, 0] }
          },
          avgRetentionDays: { $avg: '$daysBetweenDonations' }
        }
      }
    ]);

    const retentionRate = retentionData[0] ? 
      (retentionData[0].returningDonors / retentionData[0].totalDonors * 100) : 0;

    res.json({
      topDonors: userStats.slice(0, 10),
      retentionMetrics: {
        rate: parseFloat(retentionRate.toFixed(2)),
        avgRetentionDays: retentionData[0]?.avgRetentionDays || 0,
        totalDonors: retentionData[0]?.totalDonors || 0,
        returningDonors: retentionData[0]?.returningDonors || 0
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('User behavior analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Financial reporting for NGOs
router.get('/financial-report', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    // Only NGOs and admins can access financial reports
    const user = await User.findById(req.user?.id);
    if (!user || (user.role !== 'charity' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let matchCondition: any = {};
    if (user.role === 'charity') {
      // NGOs can only see their own campaigns
      const userCampaigns = await Campaign.find({ creator: user._id }).select('_id');
      matchCondition.campaignId = { $in: userCampaigns.map(c => c._id) };
    }

    // Add date filter
    matchCondition.createdAt = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${Number(year) + 1}-01-01`)
    };

    const groupBy = period === 'monthly' ? 
      { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } } :
      { quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } }, year: { $year: '$createdAt' } };

    const financialData = await Donation.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      {
        $group: {
          _id: groupBy,
          totalReceived: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          avgDonation: { $avg: '$amount' },
          campaignCount: { $addToSet: '$campaignId' },
          categories: { $addToSet: '$campaign.category' }
        }
      },
      {
        $project: {
          period: '$_id',
          totalReceived: 1,
          donationCount: 1,
          avgDonation: 1,
          campaignCount: { $size: '$campaignCount' },
          categories: 1
        }
      },
      { $sort: { 'period.year': 1, 'period.month': 1, 'period.quarter': 1 } }
    ]);

    // Calculate platform fees
    const platformFees = financialData.map(item => ({
      ...item,
      platformFee: item.totalReceived * 0.025, // 2.5% default
      netAmount: item.totalReceived * 0.975
    }));

    // Category breakdown
    const categoryBreakdown = await Donation.aggregate([
      { $match: matchCondition },
      {
        $lookup: {
          from: 'campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign'
        }
      },
      { $unwind: '$campaign' },
      {
        $group: {
          _id: '$campaign.category',
          totalAmount: { $sum: '$amount' },
          donationCount: { $sum: 1 },
          avgDonation: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json({
      summary: {
        totalReceived: platformFees.reduce((sum, item) => sum + item.totalReceived, 0),
        totalNetAmount: platformFees.reduce((sum, item) => sum + item.netAmount, 0),
        totalPlatformFees: platformFees.reduce((sum, item) => sum + item.platformFee, 0),
        totalDonations: platformFees.reduce((sum, item) => sum + item.donationCount, 0),
        period: `${period} - ${year}`
      },
      timeline: platformFees,
      categoryBreakdown,
      reportGenerated: new Date(),
      reportType: 'Financial Report',
      organizationId: user.role === 'charity' ? user._id : 'All Organizations'
    });
  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Platform-wide analytics dashboard
router.get('/platform-overview', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Admin only
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Overall platform metrics
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalAmount,
      recentUsers,
      recentCampaigns,
      recentDonations,
      recentAmount
    ] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments(),
      Donation.countDocuments(),
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Campaign.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Donation.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Donation.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    // Growth metrics
    const growthMetrics = await Donation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          donations: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $limit: 12
      }
    ]);

    // Top performing campaigns
    const topCampaigns = await Campaign.find()
      .sort({ raisedAmount: -1 })
      .limit(10)
      .select('title raisedAmount targetAmount donorCount category');

    res.json({
      overview: {
        totalUsers,
        totalCampaigns,
        totalDonations,
        totalAmount: totalAmount[0]?.total || 0,
        recentUsers,
        recentCampaigns,
        recentDonations,
        recentAmount: recentAmount[0]?.total || 0
      },
      growth: {
        monthly: growthMetrics
      },
      topCampaigns,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Platform overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced dashboard analytics using advanced analytics service
router.get('/dashboard/enhanced', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const timeframe = req.query.timeframe as string || '30d'
    
    // Validate timeframe
    const validTimeframes = ['7d', '30d', '90d', '1y'];
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({ message: 'Invalid timeframe' });
    }
    
    const analytics = await advancedAnalyticsService.getDashboardAnalytics(timeframe as '7d' | '30d' | '90d' | '1y')
    res.json(analytics)
  } catch (error) {
    console.error('Enhanced dashboard analytics error:', error)
    res.status(500).json({ message: 'Failed to fetch enhanced dashboard analytics' })
  }
})

// Enhanced campaign analytics
router.get('/campaigns/:campaignId/enhanced', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { campaignId } = req.params
    const timeframe = req.query.timeframe as string || '30d'
    
    // Check if user is campaign creator or admin
    const campaign = await Campaign.findById(campaignId)
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' })
    }
    
    if (campaign.creator.toString() !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    const analytics = await advancedAnalyticsService.getCampaignAnalytics(campaignId, timeframe)
    res.json(analytics)
  } catch (error) {
    console.error('Enhanced campaign analytics error:', error)
    res.status(500).json({ message: 'Failed to fetch enhanced campaign analytics' })
  }
})

// Enhanced donor analytics
router.get('/donors/:donorId/enhanced', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { donorId } = req.params
    const timeframe = req.query.timeframe as string || '30d'
    
    // Check if user is requesting their own data or is admin
    if (donorId !== req.user?._id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' })
    }
    
    const startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    const analytics = await advancedAnalyticsService.getDonorAnalyticsForUser(donorId, startDate)
    res.json(analytics)
  } catch (error) {
    console.error('Enhanced donor analytics error:', error)
    res.status(500).json({ message: 'Failed to fetch enhanced donor analytics' })
  }
})

// Export analytics data
router.get('/export/:type', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const { type } = req.params
    const format = req.query.format as string || 'json'
    const timeframe = req.query.timeframe as string || '30d'
    
    // Validate timeframe for dashboard exports
    const validTimeframes = ['7d', '30d', '90d', '1y'];
    
    let data
    switch (type) {
      case 'dashboard':
        if (!validTimeframes.includes(timeframe)) {
          return res.status(400).json({ message: 'Invalid timeframe for dashboard' });
        }
        data = await advancedAnalyticsService.getDashboardAnalytics(timeframe as '7d' | '30d' | '90d' | '1y')
        break
      case 'campaigns':
        data = await advancedAnalyticsService.exportCampaignData(timeframe)
        break
      case 'donations':
        data = await advancedAnalyticsService.exportDonationData(timeframe)
        break
      case 'users':
        data = await advancedAnalyticsService.exportUserData(timeframe)
        break
      default:
        return res.status(400).json({ message: 'Invalid export type' })
    }
    
    const exported = await advancedAnalyticsService.exportData(data, format)
    
    // Set appropriate headers for file download
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${type}_analytics_${timestamp}.${format}`
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    }
    
    res.send(exported)
  } catch (error) {
    console.error('Export analytics error:', error)
    res.status(500).json({ message: 'Failed to export analytics data' })
  }
})

// Real-time enhanced metrics
router.get('/realtime/enhanced', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const metrics = await advancedAnalyticsService.getRealTimeMetrics()
    res.json(metrics)
  } catch (error) {
    console.error('Enhanced real-time metrics error:', error)
    res.status(500).json({ message: 'Failed to fetch enhanced real-time metrics' })
  }
})

// Performance metrics
router.get('/performance', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    
    const timeframe = req.query.timeframe as string || '7d'
    const metrics = await advancedAnalyticsService.getPerformanceMetricsForUser(timeframe)
    res.json(metrics)
  } catch (error) {
    console.error('Performance metrics error:', error)
    res.status(500).json({ message: 'Failed to fetch performance metrics' })
  }
})

// NEW: Advanced Campaign Performance Analytics
router.get('/campaigns/:id/performance', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const campaignId = req.params.id;
    
    const [campaign, donations, conversionData, socialMetrics] = await Promise.all([
      Campaign.findById(campaignId),
      
      Donation.find({ campaignId }).sort({ createdAt: -1 }),
      
      // Calculate conversion metrics
      Donation.aggregate([
        { $match: { campaignId: campaignId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            dailyDonations: { $sum: 1 },
            dailyAmount: { $sum: '$amount' },
            uniqueDonors: { $addToSet: '$donorId' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Mock social metrics (in real app, integrate with social APIs)
      {
        shares: Math.floor(Math.random() * 100) + 50,
        likes: Math.floor(Math.random() * 200) + 100,
        comments: Math.floor(Math.random() * 50) + 20,
        views: Math.floor(Math.random() * 1000) + 500
      }
    ]);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check authorization
    if (campaign.creator.toString() !== req.user!._id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this campaign analytics'
      });
    }

    const performance = {
      overview: {
        totalRaised: campaign.raisedAmount,
        goalAmount: campaign.targetAmount,
        progressPercentage: (campaign.raisedAmount / campaign.targetAmount) * 100,
        donorCount: donations.length,
        averageDonation: donations.length > 0 ? campaign.raisedAmount / donations.length : 0,
        daysActive: Math.ceil((new Date().getTime() - campaign.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        daysRemaining: Math.max(0, Math.ceil((campaign.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      },
      trends: conversionData,
      social: socialMetrics,
      topDonations: donations.slice(0, 10).map(d => ({
        amount: d.amount,
        date: d.createdAt,
        message: d.message
      })),
      milestones: [
        { percentage: 25, reached: campaign.raisedAmount >= campaign.targetAmount * 0.25, date: null },
        { percentage: 50, reached: campaign.raisedAmount >= campaign.targetAmount * 0.50, date: null },
        { percentage: 75, reached: campaign.raisedAmount >= campaign.targetAmount * 0.75, date: null },
        { percentage: 100, reached: campaign.raisedAmount >= campaign.targetAmount, date: null }
      ]
    };

    res.status(200).json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Campaign performance analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving campaign performance data'
    });
  }
});

// NEW: Platform Health Metrics
router.get('/health', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      systemMetrics,
      userActivity,
      campaignHealth,
      transactionHealth
    ] = await Promise.all([
      // System-wide metrics
      Promise.all([
        User.countDocuments(),
        Campaign.countDocuments(),
        Donation.countDocuments(),
        Campaign.countDocuments({ status: 'active' })
      ]).then(([users, campaigns, donations, activeCampaigns]) => ({
        totalUsers: users,
        totalCampaigns: campaigns,
        totalDonations: donations,
        activeCampaigns
      })),
      
      // User activity
      Promise.all([
        User.countDocuments({ lastLogin: { $gte: last24Hours } }),
        User.countDocuments({ lastLogin: { $gte: lastWeek } }),
        User.countDocuments({ createdAt: { $gte: last24Hours } })
      ]).then(([daily, weekly, newUsers]) => ({
        dailyActiveUsers: daily,
        weeklyActiveUsers: weekly,
        newUsersToday: newUsers
      })),
      
      // Campaign health
      Promise.all([
        Campaign.countDocuments({ createdAt: { $gte: last24Hours } }),
        Campaign.countDocuments({ status: 'pending' }),
        Campaign.countDocuments({ 
          deadline: { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
          status: 'active'
        })
      ]).then(([newCampaigns, pending, expiringSoon]) => ({
        newCampaignsToday: newCampaigns,
        pendingApproval: pending,
        expiringSoon
      })),
      
      // Transaction health
      Donation.aggregate([
        { $match: { createdAt: { $gte: last24Hours } } },
        {
          $group: {
            _id: null,
            todaysDonations: { $sum: 1 },
            todaysAmount: { $sum: '$amount' },
            avgDonation: { $avg: '$amount' }
          }
        }
      ]).then(result => result[0] || { todaysDonations: 0, todaysAmount: 0, avgDonation: 0 })
    ]);

    const healthScore = calculateHealthScore({
      userActivity: userActivity.dailyActiveUsers,
      newCampaigns: campaignHealth.newCampaignsToday,
      donations: transactionHealth.todaysDonations,
      pendingApprovals: campaignHealth.pendingApproval
    });

    res.status(200).json({
      success: true,
      data: {
        healthScore,
        system: systemMetrics,
        users: userActivity,
        campaigns: campaignHealth,
        transactions: transactionHealth,
        lastUpdated: now
      }
    });
  } catch (error) {
    console.error('Platform health metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving platform health metrics'
    });
  }
});

// NEW: Revenue Analytics
router.get('/revenue', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [
      monthlyRevenue,
      platformFees,
      paymentMethodBreakdown,
      projectedRevenue
    ] = await Promise.all([
      // Monthly revenue trends
      Donation.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalDonations: { $sum: '$amount' },
            donationCount: { $sum: 1 },
            // Platform fee calculation (2.5% default)
            platformFees: { $sum: { $multiply: ['$amount', 0.025] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Total platform fees collected
      Donation.aggregate([
        {
          $group: {
            _id: null,
            totalFees: { $sum: { $multiply: ['$amount', 0.025] } },
            totalVolume: { $sum: '$amount' }
          }
        }
      ]),
      
      // Payment method breakdown
      Donation.aggregate([
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            amount: { $sum: '$amount' },
            fees: { $sum: { $multiply: ['$amount', 0.025] } }
          }
        }
      ]),
      
      // Projected revenue (based on current month growth)
      Donation.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          }
        },
        {
          $group: {
            _id: null,
            monthToDateFees: { $sum: { $multiply: ['$amount', 0.025] } },
            donations: { $sum: 1 }
          }
        }
      ])
    ]);

    const currentMonthProjection = projectedRevenue[0];
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayOfMonth = new Date().getDate();
    const projectedMonthlyRevenue = currentMonthProjection 
      ? (currentMonthProjection.monthToDateFees / dayOfMonth) * daysInMonth 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalFeesCollected: platformFees[0]?.totalFees || 0,
          totalVolumeProcessed: platformFees[0]?.totalVolume || 0,
          averageFeePerTransaction: platformFees[0] ? platformFees[0].totalFees / (platformFees[0].totalVolume / 100) : 0
        },
        trends: monthlyRevenue,
        paymentMethods: paymentMethodBreakdown,
        projections: {
          thisMonth: projectedMonthlyRevenue,
          nextMonth: projectedMonthlyRevenue * 1.1, // 10% growth assumption
          thisYear: projectedMonthlyRevenue * 12
        }
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving revenue analytics'
    });
  }
});

// Helper function to calculate platform health score
function calculateHealthScore(metrics: any): number {
  let score = 0;
  
  // User activity score (0-25 points)
  if (metrics.userActivity > 100) score += 25;
  else if (metrics.userActivity > 50) score += 20;
  else if (metrics.userActivity > 20) score += 15;
  else if (metrics.userActivity > 10) score += 10;
  else if (metrics.userActivity > 0) score += 5;
  
  // New campaigns score (0-25 points)
  if (metrics.newCampaigns > 10) score += 25;
  else if (metrics.newCampaigns > 5) score += 20;
  else if (metrics.newCampaigns > 2) score += 15;
  else if (metrics.newCampaigns > 0) score += 10;
  
  // Donations score (0-25 points)
  if (metrics.donations > 50) score += 25;
  else if (metrics.donations > 20) score += 20;
  else if (metrics.donations > 10) score += 15;
  else if (metrics.donations > 5) score += 10;
  else if (metrics.donations > 0) score += 5;
  
  // Pending approvals penalty (0-25 points, fewer pending = higher score)
  if (metrics.pendingApprovals === 0) score += 25;
  else if (metrics.pendingApprovals < 5) score += 20;
  else if (metrics.pendingApprovals < 10) score += 15;
  else if (metrics.pendingApprovals < 20) score += 10;
  else score += 5;
  
  return Math.min(100, score);
}

export default router;
