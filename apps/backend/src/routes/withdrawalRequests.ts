import express from 'express';
import { WithdrawalRequest } from '../models/WithdrawalRequest';
import { Campaign } from '../models/Campaign';
import { protect } from '../middleware/auth';
import { AppError } from '../types/index';
import { AuthenticatedRequest } from '../types/index';
import { validateWithdrawalRequest } from '../middleware/validation';
import withdrawalRequestService from '../services/withdrawalRequestService';

const router = express.Router();

// @desc    Create withdrawal request
// @route   POST /api/withdrawal-requests
// @access  Private (Campaign creators only)
router.post('/', protect, validateWithdrawalRequest, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, ...requestData } = req.body;
    
    const withdrawalRequest = await withdrawalRequestService.createWithdrawalRequest(
      campaignId,
      req.user!.id,
      requestData
    );

    res.status(201).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: withdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get withdrawal requests
// @route   GET /api/withdrawal-requests
// @access  Private
router.get('/', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      campaignId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build filters based on user role
    const filters: any = {};
    
    if (req.user?.role === 'admin') {
      // Admins can see all withdrawal requests
      if (status) filters.status = status;
      if (priority) filters['metadata.priority'] = priority;
      if (category) filters['metadata.category'] = category;
      if (campaignId) filters.campaign = campaignId;
    } else if (req.user?.role === 'charity') {
      // Charities can only see their own campaign withdrawal requests
      const userCampaigns = await Campaign.find({ creator: req.user.id }).select('_id');
      filters.campaign = { $in: userCampaigns.map(c => c._id) };
      
      if (status) filters.status = status;
      if (campaignId) {
        // Verify the campaign belongs to the user
        const campaignExists = userCampaigns.some(c => c._id.toString() === campaignId);
        if (!campaignExists) {
          return next(new AppError('Not authorized to view withdrawal requests for this campaign', 403));
        }
        filters.campaign = campaignId;
      }
    } else {
      // Donors cannot view withdrawal requests
      return next(new AppError('Not authorized to view withdrawal requests', 403));
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder
    };

    const result = await withdrawalRequestService.getWithdrawalRequests(filters, options);

    res.status(200).json({
      success: true,
      data: result.requests,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single withdrawal request
// @route   GET /api/withdrawal-requests/:id
// @access  Private
router.get('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const withdrawalRequest = await WithdrawalRequest.findById(req.params.id)
      .populate('campaign', 'title description creator imageUrl')
      .populate('requestedBy', 'name email profile')
      .populate('approvedBy', 'name email');

    if (!withdrawalRequest) {
      return next(new AppError('Withdrawal request not found', 404));
    }

    // Check authorization
    if (req.user?.role !== 'admin' &&
        req.user?.id !== withdrawalRequest.requestedBy._id.toString() &&
        req.user?.id !== (withdrawalRequest.campaign as any).creator?.toString()) {
      return next(new AppError('Not authorized to view this withdrawal request', 403));
    }

    res.status(200).json({
      success: true,
      data: withdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve withdrawal request
// @route   PUT /api/withdrawal-requests/:id/approve
// @access  Admin
router.put('/:id/approve', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can approve withdrawal requests', 403));
    }

    const { notes } = req.body;
    
    const withdrawalRequest = await withdrawalRequestService.approveWithdrawalRequest(
      req.params.id,
      req.user.id,
      notes
    );

    res.status(200).json({
      success: true,
      message: 'Withdrawal request approved successfully',
      data: withdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reject withdrawal request
// @route   PUT /api/withdrawal-requests/:id/reject
// @access  Admin
router.put('/:id/reject', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can reject withdrawal requests', 403));
    }

    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return next(new AppError('Rejection reason is required', 400));
    }

    const withdrawalRequest = await withdrawalRequestService.rejectWithdrawalRequest(
      req.params.id,
      req.user.id,
      rejectionReason
    );

    res.status(200).json({
      success: true,
      message: 'Withdrawal request rejected successfully',
      data: withdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Process withdrawal request (mark as processed)
// @route   PUT /api/withdrawal-requests/:id/process
// @access  Admin
router.put('/:id/process', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can process withdrawal requests', 403));
    }

    const { transactionId } = req.body;
    
    if (!transactionId) {
      return next(new AppError('Transaction ID is required', 400));
    }

    const withdrawalRequest = await withdrawalRequestService.processWithdrawalRequest(
      req.params.id,
      transactionId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Withdrawal request processed successfully',
      data: withdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark withdrawal request as failed
// @route   PUT /api/withdrawal-requests/:id/fail
// @access  Admin
router.put('/:id/fail', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can mark withdrawal requests as failed', 403));
    }

    const { failureReason } = req.body;
    
    if (!failureReason) {
      return next(new AppError('Failure reason is required', 400));
    }

    const withdrawalRequest = await withdrawalRequestService.markWithdrawalRequestFailed(
      req.params.id,
      failureReason
    );

    res.status(200).json({
      success: true,
      message: 'Withdrawal request marked as failed',
      data: withdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get withdrawal requests for a specific campaign
// @route   GET /api/withdrawal-requests/campaign/:campaignId
// @access  Private
router.get('/campaign/:campaignId', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId } = req.params;
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Verify authorization
    if (req.user?.role !== 'admin') {
      const campaign = await Campaign.findOne({ _id: campaignId, creator: req.user?.id });
      if (!campaign) {
        return next(new AppError('Not authorized to view withdrawal requests for this campaign', 403));
      }
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder
    };

    const result = await withdrawalRequestService.getCampaignWithdrawalRequests(campaignId, options);

    res.status(200).json({
      success: true,
      data: result.requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        pages: Math.ceil(result.total / Number(limit))
      },
      summary: {
        availableBalance: result.availableBalance,
        totalWithdrawn: result.totalWithdrawn
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's withdrawal requests
// @route   GET /api/withdrawal-requests/user/my
// @access  Private
router.get('/user/my', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder
    };

    const result = await withdrawalRequestService.getUserWithdrawalRequests(req.user!.id, options);

    res.status(200).json({
      success: true,
      data: result.requests,
      total: result.total
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get withdrawal statistics
// @route   GET /api/withdrawal-requests/stats
// @access  Admin
router.get('/stats/overview', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can view withdrawal statistics', 403));
    }

    const { campaignId } = req.query;
    
    const stats = await withdrawalRequestService.getWithdrawalStats(campaignId as string);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get urgent withdrawal requests
// @route   GET /api/withdrawal-requests/urgent
// @access  Admin
router.get('/urgent/list', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can view urgent withdrawal requests', 403));
    }
    
    const urgentRequests = await withdrawalRequestService.getUrgentWithdrawalRequests();

    res.status(200).json({
      success: true,
      data: urgentRequests,
      count: urgentRequests.length
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk approve withdrawal requests
// @route   POST /api/withdrawal-requests/bulk/approve
// @access  Admin
router.post('/bulk/approve', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can bulk approve withdrawal requests', 403));
    }

    const { withdrawalRequestIds, notes } = req.body;
    
    if (!withdrawalRequestIds || !Array.isArray(withdrawalRequestIds) || withdrawalRequestIds.length === 0) {
      return next(new AppError('Withdrawal request IDs are required', 400));
    }

    const results = await withdrawalRequestService.bulkApproveWithdrawalRequests(
      withdrawalRequestIds,
      req.user.id,
      notes
    );

    res.status(200).json({
      success: true,
      message: `${results.length} withdrawal requests approved successfully`,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Calculate available balance for campaign
// @route   GET /api/withdrawal-requests/campaign/:campaignId/balance
// @access  Private
router.get('/campaign/:campaignId/balance', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId } = req.params;

    // Verify authorization
    if (req.user?.role !== 'admin') {
      const campaign = await Campaign.findOne({ _id: campaignId, creator: req.user?.id });
      if (!campaign) {
        return next(new AppError('Not authorized to view balance for this campaign', 403));
      }
    }

    const availableBalance = await withdrawalRequestService.calculateAvailableBalance(campaignId);

    res.status(200).json({
      success: true,
      data: {
        campaignId,
        availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update withdrawal request
// @route   PUT /api/withdrawal-requests/:id
// @access  Private
router.put('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const withdrawalRequest = await WithdrawalRequest.findById(req.params.id);
    
    if (!withdrawalRequest) {
      return next(new AppError('Withdrawal request not found', 404));
    }

    // Check authorization
    if (req.user?.role !== 'admin' &&
        req.user?.id !== withdrawalRequest.requestedBy.toString()) {
      return next(new AppError('Not authorized to update this withdrawal request', 403));
    }

    // Only allow updates if status is pending
    if (withdrawalRequest.status !== 'pending') {
      return next(new AppError('Only pending withdrawal requests can be updated', 400));
    }

    // Only allow updates to certain fields
    const allowedUpdates = ['purpose', 'documents', 'metadata.notes', 'metadata.priority', 'metadata.category'];
    const updates = Object.keys(req.body).reduce((acc, key) => {
      if (allowedUpdates.includes(key)) {
        if (key.startsWith('metadata.')) {
          if (!acc.metadata) acc.metadata = {};
          acc.metadata[key.split('.')[1]] = req.body[key];
        } else {
          acc[key] = req.body[key];
        }
      }
      return acc;
    }, {} as any);

    const updatedWithdrawalRequest = await WithdrawalRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('campaign', 'title imageUrl');

    res.status(200).json({
      success: true,
      message: 'Withdrawal request updated successfully',
      data: updatedWithdrawalRequest
    });
  } catch (error) {
    next(error);
  }
});

export default router;
