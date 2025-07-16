import express from 'express';
import { User } from '../models/User';
import { protect, authorize } from '../middleware/auth';
import { AppError } from '../types/index';
import { AuthenticatedRequest } from '../types/index';

const router = express.Router();

// Apply protection and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// @desc    Get dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req: AuthenticatedRequest, res, next) => {
  try {
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      pendingVerifications
    ] = await Promise.all([
      User.countDocuments(),
      // Campaign.countDocuments(),
      // Donation.countDocuments({ status: 'confirmed' }),
      // Campaign.countDocuments({ isVerified: false, status: 'pending_approval' })
      0, 0, 0 // Temporary until models are fully implemented
    ]);

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities (mock data for now)
    const recentActivities = [
      {
        type: 'user_registered',
        description: 'New user registered',
        timestamp: new Date(),
        details: { role: 'donor' }
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCampaigns,
          totalDonations,
          pendingVerifications
        },
        userRoles: userRoles.reduce((acc, role) => {
          acc[role._id] = role.count;
          return acc;
        }, {}),
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      kycStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build query
    const query: any = {};
    if (role) query.role = role;
    if (kycStatus) query.kycStatus = kycStatus;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
router.put('/users/:id/status', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { kycStatus, isEmailVerified, isPhoneVerified } = req.body;

    const updateFields: any = {};
    if (kycStatus) updateFields.kycStatus = kycStatus;
    if (isEmailVerified !== undefined) updateFields.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined) updateFields.isPhoneVerified = isPhoneVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent deletion of admin users (except self)
    if (user.role === 'admin' && user._id.toString() !== req.user?.id) {
      return next(new AppError('Cannot delete other admin users', 403));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { timeframe = '30d' } = req.query as any;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // User registration stats
    const userStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Mock campaign and donation stats
    const campaignStats = [];
    const donationStats = [];

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        userRegistrations: userStats,
        campaigns: campaignStats,
        donations: donationStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin only)
router.put('/settings', async (req: AuthenticatedRequest, res, next) => {
  try {
    const settings = req.body;

    // In production, store these in a settings collection
    // For now, return the settings as confirmation
    res.status(200).json({
      success: true,
      data: {
        ...settings,
        updatedBy: req.user?.id,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (Admin only)
router.get('/health', async (req: AuthenticatedRequest, res, next) => {
  try {
    // Check database connection
    const dbHealth = await User.findOne().select('_id').lean();
    
    // Mock blockchain health check
    const blockchainHealth = {
      ethereum: { connected: true, latency: 150 },
      polygon: { connected: true, latency: 80 }
    };

    // Mock IPFS health check
    const ipfsHealth = {
      connected: true,
      peerCount: 45,
      storageUsed: '2.4 GB'
    };

    res.status(200).json({
      success: true,
      data: {
        database: {
          connected: !!dbHealth,
          status: 'healthy'
        },
        blockchain: blockchainHealth,
        ipfs: ipfsHealth,
        api: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0'
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send system notification
// @route   POST /api/admin/notifications
// @access  Private (Admin only)
router.post('/notifications', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { type, title, message, targetUsers, priority = 'medium' } = req.body;

    // In production, this would create notifications and send them
    const notification = {
      type,
      title,
      message,
      priority,
      targetUsers: targetUsers || 'all',
      sentBy: req.user?.id,
      sentAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get comprehensive admin dashboard data
// @route   GET /api/admin/dashboard/comprehensive
// @access  Private (Admin only)
router.get('/dashboard/comprehensive', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { User } = await import('../models/User');
    const { Campaign } = await import('../models/Campaign');
    const { Donation } = await import('../models/Donation');

    // Get comprehensive stats
    const [
      userStats,
      campaignStats,
      donationStats,
      recentActivity
    ] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            donorCount: { $sum: { $cond: [{ $eq: ['$role', 'donor'] }, 1, 0] } },
            charityCount: { $sum: { $cond: [{ $eq: ['$role', 'charity'] }, 1, 0] } },
            adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            verifiedUsers: { $sum: { $cond: [{ $eq: ['$kycStatus', 'verified'] }, 1, 0] } },
            pendingVerifications: { $sum: { $cond: [{ $eq: ['$kycStatus', 'in_review'] }, 1, 0] } }
          }
        }
      ]),

      // Campaign statistics  
      Campaign.aggregate([
        {
          $group: {
            _id: null,
            totalCampaigns: { $sum: 1 },
            activeCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            draftCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            completedCampaigns: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            verifiedCampaigns: { $sum: { $cond: ['$isVerified', 1, 0] } },
            totalTargetAmount: { $sum: '$targetAmount' },
            totalRaisedAmount: { $sum: '$raisedAmount' },
            totalBeneficiaries: { $sum: '$beneficiaryCount' }
          }
        }
      ]),

      // Donation statistics
      Donation.aggregate([
        {
          $group: {
            _id: null,
            totalDonations: { $sum: 1 },
            confirmedDonations: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
            pendingDonations: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            totalDonationAmount: { $sum: '$amount' },
            averageDonation: { $avg: '$amount' },
            uniqueDonors: { $addToSet: '$donor' }
          }
        },
        {
          $addFields: {
            uniqueDonorCount: { $size: '$uniqueDonors' }
          }
        }
      ]),

      // Recent activity (last 10 items)
      Promise.all([
        User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
        Campaign.find().sort({ createdAt: -1 }).limit(5).populate('creator', 'name').select('title status creator createdAt'),
        Donation.find().sort({ createdAt: -1 }).limit(5).populate('donor', 'name').populate('campaign', 'title').select('amount donor campaign createdAt')
      ])
    ]);

    // Format recent activity
    const [recentUsers, recentCampaigns, recentDonations] = recentActivity;
    const formattedActivity = [
      ...recentUsers.map(user => ({
        type: 'user_registration',
        description: `New ${user.role} registered: ${user.name}`,
        timestamp: user.createdAt,
        data: { userId: user._id, name: user.name, role: user.role }
      })),
      ...recentCampaigns.map(campaign => ({
        type: 'campaign_created',
        description: `New campaign: ${campaign.title}`,
        timestamp: campaign.createdAt,
        data: { campaignId: campaign._id, title: campaign.title, creator: (campaign.creator as any)?.name || 'Unknown' }
      })),
      ...recentDonations.map(donation => ({
        type: 'donation_made',
        description: `Donation of ${donation.amount} MATIC to ${(donation.campaign as any)?.title || 'Unknown Campaign'}`,
        timestamp: donation.createdAt,
        data: { donationId: donation._id, amount: donation.amount, donor: (donation.donor as any)?.name || 'Anonymous' }
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);

    res.status(200).json({
      success: true,
      data: {
        users: userStats[0] || {
          totalUsers: 0, donorCount: 0, charityCount: 0, adminCount: 0,
          verifiedUsers: 0, pendingVerifications: 0
        },
        campaigns: campaignStats[0] || {
          totalCampaigns: 0, activeCampaigns: 0, draftCampaigns: 0, completedCampaigns: 0,
          verifiedCampaigns: 0, totalTargetAmount: 0, totalRaisedAmount: 0, totalBeneficiaries: 0
        },
        donations: donationStats[0] || {
          totalDonations: 0, confirmedDonations: 0, pendingDonations: 0,
          totalDonationAmount: 0, averageDonation: 0, uniqueDonorCount: 0
        },
        recentActivity: formattedActivity,
        systemHealth: {
          database: 'connected',
          blockchain: 'ready',
          api: 'operational'
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    next(error);
  }
});

export default router;
