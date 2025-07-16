import express from 'express';
import { RecurringDonation } from '../models/RecurringDonation';
import { protect } from '../middleware/auth';
import { AppError } from '../types/index';
import { AuthenticatedRequest } from '../types/index';
import { validateRecurringDonation } from '../middleware/validation';
import recurringDonationService from '../services/recurringDonationService';

const router = express.Router();

// @desc    Create recurring donation
// @route   POST /api/recurring-donations
// @access  Private
router.post('/', protect, validateRecurringDonation, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, ...donationData } = req.body;
    
    const recurringDonation = await recurringDonationService.createRecurringDonation(
      req.user!.id,
      campaignId,
      donationData
    );

    res.status(201).json({
      success: true,
      message: 'Recurring donation created successfully',
      data: recurringDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's recurring donations
// @route   GET /api/recurring-donations
// @access  Private
router.get('/', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const {
      status,
      frequency,
      campaignId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query as any;

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (frequency) filters.frequency = frequency;
    if (campaignId) filters.campaign = campaignId;

    const recurringDonations = await recurringDonationService.getUserRecurringDonations(
      req.user!.id,
      filters
    );

    // Apply pagination manually for consistency
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedResults = recurringDonations.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: recurringDonations.length,
        pages: Math.ceil(recurringDonations.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single recurring donation
// @route   GET /api/recurring-donations/:id
// @access  Private
router.get('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const recurringDonation = await RecurringDonation.findById(req.params.id)
      .populate('donor', 'name email profile')
      .populate('campaign', 'title description creator imageUrl');

    if (!recurringDonation) {
      return next(new AppError('Recurring donation not found', 404));
    }

    // Check if user can view this recurring donation
    if (req.user?.role !== 'admin' &&
        req.user?.id !== recurringDonation.donor._id.toString()) {
      return next(new AppError('Not authorized to view this recurring donation', 403));
    }

    res.status(200).json({
      success: true,
      data: recurringDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Pause recurring donation
// @route   PUT /api/recurring-donations/:id/pause
// @access  Private
router.put('/:id/pause', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { reason } = req.body;
    
    const recurringDonation = await RecurringDonation.findById(req.params.id);
    
    if (!recurringDonation) {
      return next(new AppError('Recurring donation not found', 404));
    }

    // Check if user can pause this recurring donation
    if (req.user?.role !== 'admin' &&
        req.user?.id !== recurringDonation.donor.toString()) {
      return next(new AppError('Not authorized to pause this recurring donation', 403));
    }

    if (recurringDonation.status !== 'active') {
      return next(new AppError('Only active recurring donations can be paused', 400));
    }

    const updatedRecurringDonation = await recurringDonationService.pauseRecurringDonation(
      req.params.id,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Recurring donation paused successfully',
      data: updatedRecurringDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Resume recurring donation
// @route   PUT /api/recurring-donations/:id/resume
// @access  Private
router.put('/:id/resume', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const recurringDonation = await RecurringDonation.findById(req.params.id);
    
    if (!recurringDonation) {
      return next(new AppError('Recurring donation not found', 404));
    }

    // Check if user can resume this recurring donation
    if (req.user?.role !== 'admin' &&
        req.user?.id !== recurringDonation.donor.toString()) {
      return next(new AppError('Not authorized to resume this recurring donation', 403));
    }

    if (recurringDonation.status !== 'paused') {
      return next(new AppError('Only paused recurring donations can be resumed', 400));
    }

    const updatedRecurringDonation = await recurringDonationService.resumeRecurringDonation(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Recurring donation resumed successfully',
      data: updatedRecurringDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel recurring donation
// @route   PUT /api/recurring-donations/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { reason } = req.body;
    
    const recurringDonation = await RecurringDonation.findById(req.params.id);
    
    if (!recurringDonation) {
      return next(new AppError('Recurring donation not found', 404));
    }

    // Check if user can cancel this recurring donation
    if (req.user?.role !== 'admin' &&
        req.user?.id !== recurringDonation.donor.toString()) {
      return next(new AppError('Not authorized to cancel this recurring donation', 403));
    }

    if (recurringDonation.status === 'cancelled' || recurringDonation.status === 'completed') {
      return next(new AppError('This recurring donation is already inactive', 400));
    }

    const updatedRecurringDonation = await recurringDonationService.cancelRecurringDonation(
      req.params.id,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Recurring donation cancelled successfully',
      data: updatedRecurringDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get recurring donation statistics
// @route   GET /api/recurring-donations/stats
// @access  Private
router.get('/stats/overview', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId } = req.query;
    
    // For non-admin users, only allow their own statistics
    let actualCampaignId;
    if (req.user?.role === 'admin') {
      actualCampaignId = campaignId as string;
    } else if (req.user?.role === 'charity' && campaignId) {
      // Verify campaign belongs to the charity
      const Campaign = require('../models/Campaign').Campaign;
      const campaign = await Campaign.findOne({ _id: campaignId, creator: req.user.id });
      if (!campaign) {
        return next(new AppError('Not authorized to view statistics for this campaign', 403));
      }
      actualCampaignId = campaignId as string;
    }

    const stats = await recurringDonationService.getRecurringDonationStats(actualCampaignId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Process recurring donations manually (Admin only)
// @route   POST /api/recurring-donations/process
// @access  Admin
router.post('/process', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can manually process recurring donations', 403));
    }

    await recurringDonationService.processRecurringDonations();

    res.status(200).json({
      success: true,
      message: 'Recurring donations processing initiated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update recurring donation details
// @route   PUT /api/recurring-donations/:id
// @access  Private
router.put('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const recurringDonation = await RecurringDonation.findById(req.params.id);
    
    if (!recurringDonation) {
      return next(new AppError('Recurring donation not found', 404));
    }

    // Check if user can update this recurring donation
    if (req.user?.role !== 'admin' &&
        req.user?.id !== recurringDonation.donor.toString()) {
      return next(new AppError('Not authorized to update this recurring donation', 403));
    }

    // Only allow updates to certain fields
    const allowedUpdates = ['amount', 'frequency', 'endDate', 'maxOccurrences', 'paymentMethod'];
    const updates = Object.keys(req.body).reduce((acc, key) => {
      if (allowedUpdates.includes(key)) {
        acc[key] = req.body[key];
      }
      return acc;
    }, {} as any);

    // If frequency is being updated, recalculate next payment date
    if (updates.frequency) {
      const currentDate = new Date();
      updates.nextPaymentDate = recurringDonationService['calculateNextPaymentDate'](currentDate, updates.frequency);
    }

    const updatedRecurringDonation = await RecurringDonation.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('campaign', 'title imageUrl');

    res.status(200).json({
      success: true,
      message: 'Recurring donation updated successfully',
      data: updatedRecurringDonation
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get campaign recurring donations (For campaign creators)
// @route   GET /api/recurring-donations/campaign/:campaignId
// @access  Private
router.get('/campaign/:campaignId', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId } = req.params;
    const {
      status,
      frequency,
      page = 1,
      limit = 10
    } = req.query as any;

    // Verify authorization
    if (req.user?.role !== 'admin') {
      const Campaign = require('../models/Campaign').Campaign;
      const campaign = await Campaign.findOne({ _id: campaignId, creator: req.user?.id });
      if (!campaign) {
        return next(new AppError('Not authorized to view recurring donations for this campaign', 403));
      }
    }

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (frequency) filters.frequency = frequency;

    const recurringDonations = await recurringDonationService.getCampaignRecurringDonations(
      campaignId,
      filters
    );

    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedResults = recurringDonations.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: recurringDonations.length,
        pages: Math.ceil(recurringDonations.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
