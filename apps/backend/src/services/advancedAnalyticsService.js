const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');

class AdvancedAnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Get comprehensive platform analytics
   */
  async getPlatformAnalytics(timeRange = '30d') {
    const cacheKey = `platform_analytics_${timeRange}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const dateFilter = this.getDateFilter(timeRange);
    
    const analytics = await Promise.all([
      this.getTotalStats(dateFilter),
      this.getDonationTrends(dateFilter),
      this.getCampaignPerformance(dateFilter),
      this.getUserGrowth(dateFilter),
      this.getTopCampaigns(dateFilter),
      this.getConversionMetrics(dateFilter),
      this.getRevenueAnalytics(dateFilter)
    ]);

    const result = {
      totalStats: analytics[0],
      donationTrends: analytics[1],
      campaignPerformance: analytics[2],
      userGrowth: analytics[3],
      topCampaigns: analytics[4],
      conversionMetrics: analytics[5],
      revenueAnalytics: analytics[6],
      lastUpdated: new Date(),
      timeRange
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Get total platform statistics
   */
  async getTotalStats(dateFilter = {}) {
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalAmount,
      activeCampaigns,
      completedCampaigns
    ] = await Promise.all([
      User.countDocuments(dateFilter),
      Campaign.countDocuments(dateFilter),
      Donation.countDocuments(dateFilter),
      Donation.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Campaign.countDocuments({ ...dateFilter, status: 'active' }),
      Campaign.countDocuments({ ...dateFilter, status: 'completed' })
    ]);

    return {
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      activeCampaigns,
      completedCampaigns,
      averageDonation: totalDonations > 0 ? (totalAmount[0]?.total || 0) / totalDonations : 0
    };
  }

  /**
   * Get donation trends over time
   */
  async getDonationTrends(dateFilter = {}) {
    const trends = await Donation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          count: 1,
          amount: 1,
          avgAmount: 1
        }
      }
    ]);

    return trends;
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignPerformance(dateFilter = {}) {
    const performance = await Campaign.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'donations'
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          targetAmount: 1,
          raisedAmount: 1,
          status: 1,
          donationCount: { $size: '$donations' },
          successRate: {
            $multiply: [
              { $divide: ['$raisedAmount', '$targetAmount'] },
              100
            ]
          },
          avgDonation: {
            $cond: {
              if: { $gt: [{ $size: '$donations' }, 0] },
              then: { $divide: ['$raisedAmount', { $size: '$donations' }] },
              else: 0
            }
          },
          createdAt: 1
        }
      },
      { $sort: { successRate: -1 } }
    ]);

    // Category performance
    const categoryPerformance = await Campaign.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalRaised: { $sum: '$raisedAmount' },
          totalTarget: { $sum: '$targetAmount' },
          avgSuccessRate: {
            $avg: {
              $multiply: [
                { $divide: ['$raisedAmount', '$targetAmount'] },
                100
              ]
            }
          }
        }
      },
      { $sort: { totalRaised: -1 } }
    ]);

    return {
      campaigns: performance,
      categoryPerformance
    };
  }

  /**
   * Get user growth metrics
   */
  async getUserGrowth(dateFilter = {}) {
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          newUsers: { $sum: 1 },
          donors: {
            $sum: {
              $cond: [{ $ne: ['$totalDonations', 0] }, 1, 0]
            }
          },
          campaignCreators: {
            $sum: {
              $cond: [{ $eq: ['$role', 'creator'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);

    return userGrowth;
  }

  /**
   * Get top performing campaigns
   */
  async getTopCampaigns(dateFilter = {}, limit = 10) {
    const topCampaigns = await Campaign.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'campaignId',
          as: 'donations'
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          targetAmount: 1,
          raisedAmount: 1,
          creator: 1,
          donationCount: { $size: '$donations' },
          successRate: {
            $multiply: [
              { $divide: ['$raisedAmount', '$targetAmount'] },
              100
            ]
          },
          daysActive: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      { $sort: { raisedAmount: -1 } },
      { $limit: limit }
    ]);

    return topCampaigns;
  }

  /**
   * Get conversion metrics
   */
  async getConversionMetrics(dateFilter = {}) {
    const [totalVisitors, donors, campaignCreators] = await Promise.all([
      User.countDocuments(dateFilter),
      User.countDocuments({ ...dateFilter, totalDonations: { $gt: 0 } }),
      User.countDocuments({ ...dateFilter, role: 'creator' })
    ]);

    const donorConversionRate = totalVisitors > 0 ? (donors / totalVisitors) * 100 : 0;
    const creatorConversionRate = totalVisitors > 0 ? (campaignCreators / totalVisitors) * 100 : 0;

    // Average time to first donation
    const firstDonationTimes = await User.aggregate([
      {
        $match: {
          ...dateFilter,
          totalDonations: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'donorId',
          as: 'donations'
        }
      },
      {
        $project: {
          timeToFirstDonation: {
            $divide: [
              {
                $subtract: [
                  { $min: '$donations.createdAt' },
                  '$createdAt'
                ]
              },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTimeToFirstDonation: { $avg: '$timeToFirstDonation' }
        }
      }
    ]);

    return {
      totalVisitors,
      donors,
      campaignCreators,
      donorConversionRate,
      creatorConversionRate,
      avgTimeToFirstDonation: firstDonationTimes[0]?.avgTimeToFirstDonation || 0
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(dateFilter = {}) {
    const revenueData = await Donation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          platformFees: { $sum: '$platformFee' },
          processingFees: { $sum: '$processingFee' },
          netRevenue: { $sum: { $subtract: ['$amount', '$platformFee', '$processingFee'] } },
          transactionCount: { $sum: 1 }
        }
      }
    ]);

    const monthlyRevenue = await Donation.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          fees: { $sum: { $add: ['$platformFee', '$processingFee'] } },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return {
      total: revenueData[0] || {
        totalRevenue: 0,
        platformFees: 0,
        processingFees: 0,
        netRevenue: 0,
        transactionCount: 0
      },
      monthly: monthlyRevenue
    };
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboard() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      todayDonations,
      weeklyGrowth,
      activeCampaigns,
      recentDonations,
      topDonors
    ] = await Promise.all([
      this.getTotalStats({ createdAt: { $gte: last24Hours } }),
      this.getUserGrowth({ createdAt: { $gte: last7Days } }),
      Campaign.countDocuments({ status: 'active' }),
      this.getRecentDonations(10),
      this.getTopDonors(5)
    ]);

    return {
      todayDonations,
      weeklyGrowth,
      activeCampaigns,
      recentDonations,
      topDonors,
      lastUpdated: new Date()
    };
  }

  /**
   * Get recent donations
   */
  async getRecentDonations(limit = 10) {
    return await Donation.find()
      .populate('campaignId', 'title')
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get top donors
   */
  async getTopDonors(limit = 10) {
    return await User.aggregate([
      { $match: { totalDonations: { $gt: 0 } } },
      {
        $lookup: {
          from: 'donations',
          localField: '_id',
          foreignField: 'donorId',
          as: 'donations'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalDonated: { $sum: '$donations.amount' },
          donationCount: { $size: '$donations' },
          avgDonation: {
            $cond: {
              if: { $gt: [{ $size: '$donations' }, 0] },
              then: { $divide: [{ $sum: '$donations.amount' }, { $size: '$donations' }] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalDonated: -1 } },
      { $limit: limit }
    ]);
  }

  /**
   * Helper method to get date filter based on time range
   */
  getDateFilter(timeRange) {
    const now = new Date();
    const filters = {
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    };

    const startDate = filters[timeRange];
    return startDate ? { createdAt: { $gte: startDate } } : {};
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(format = 'json', timeRange = '30d') {
    const analytics = await this.getPlatformAnalytics(timeRange);
    
    if (format === 'csv') {
      return this.convertToCSV(analytics);
    }
    
    return analytics;
  }

  /**
   * Convert analytics to CSV format
   */
  convertToCSV(analytics) {
    // Implement CSV conversion logic
    const csv = [];
    csv.push(['Metric', 'Value']);
    csv.push(['Total Users', analytics.totalStats.totalUsers]);
    csv.push(['Total Campaigns', analytics.totalStats.totalCampaigns]);
    csv.push(['Total Donations', analytics.totalStats.totalDonations]);
    csv.push(['Total Amount', analytics.totalStats.totalAmount]);
    
    return csv.map(row => row.join(',')).join('\n');
  }
}

module.exports = AdvancedAnalyticsService;
