import express from 'express';
import { Campaign } from '../models/Campaign';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { campaignCacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache';
import { AppError } from '../types/index';
import { AuthenticatedRequest, CampaignFilters } from '../types/index';

const router = express.Router();

console.log('🔧 CAMPAIGNS ROUTE FILE LOADED SUCCESSFULLY!');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
router.get('/', /*campaignCacheMiddleware(),*/ optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log('�🔥🔥 CAMPAIGNS ROUTE HIT! Fetching real data from Atlas...');
    console.log('🔥🔥🔥 THIS SHOULD APPEAR IF ROUTE IS HIT');
    
    // Get real campaigns from MongoDB Atlas
    const campaigns = await Campaign.find({ isVerified: true })
      .populate('creator', 'name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log(`✅ Found ${campaigns.length} real campaigns from Atlas`);
    
    if (campaigns.length > 0) {
      console.log(`📝 First campaign from Atlas: ${campaigns[0].title}`);
    }

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        page: 1,
        limit: 20,
        total: campaigns.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    next(error);
  }
});

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Public
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name email profile walletAddress')
      .populate('milestones.verifiedBy', 'name')
      .populate('documents.uploadedBy', 'name');

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Check if user can view this campaign
    if (!campaign.isVerified && 
        (!req.user || 
         (req.user.role !== 'admin' && 
          req.user.role !== 'auditor' && 
          req.user._id.toString() !== campaign.creator.toString()))) {
      return next(new AppError('Campaign not found', 404));
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private (Charity/Admin)
router.post('/', protect, authorize('charity', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    req.body.creator = req.user?.id;
    
    const campaign = await Campaign.create(req.body);

    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Owner/Admin)
router.put('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    let campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner or admin
    if (campaign.creator.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to update this campaign', 401));
    }

    // Don't allow updates to certain fields if campaign is active
    if (campaign.status === 'active') {
      const restrictedFields = ['targetAmount', 'endDate', 'category'];
      restrictedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          delete req.body[field];
        }
      });
    }

    campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Owner/Admin)
router.delete('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner or admin
    if (campaign.creator.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to delete this campaign', 401));
    }

    // Don't allow deletion if campaign has received donations
    if (campaign.raisedAmount > 0) {
      return next(new AppError('Cannot delete campaign that has received donations', 400));
    }

    await campaign.deleteOne();

    res.status(200).json({
      success: true,
      data: 'Campaign deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add campaign update
// @route   POST /api/campaigns/:id/updates
// @access  Private (Owner/Admin)
router.post('/:id/updates', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner or admin
    if (campaign.creator.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return next(new AppError('Not authorized to add updates to this campaign', 401));
    }

    const update = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    campaign.updates.push(update);
    await campaign.save();

    res.status(201).json({
      success: true,
      data: campaign.updates[campaign.updates.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit milestone for verification
// @route   POST /api/campaigns/:id/milestones/:milestoneId/submit
// @access  Private (Owner)
router.post('/:id/milestones/:milestoneId/submit', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Make sure user is campaign owner
    if (campaign.creator.toString() !== req.user?.id) {
      return next(new AppError('Not authorized to submit milestones for this campaign', 401));
    }

    const milestone = (campaign.milestones as any).id(req.params.milestoneId);
    
    if (!milestone) {
      return next(new AppError('Milestone not found', 404));
    }

    if (milestone.status !== 'pending') {
      return next(new AppError('Milestone cannot be submitted', 400));
    }

    milestone.status = 'submitted';
    milestone.submittedAt = new Date();
    milestone.proofDocuments = req.body.proofDocuments || [];

    await campaign.save();

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify milestone
// @route   POST /api/campaigns/:id/milestones/:milestoneId/verify
// @access  Private (Admin/Auditor)
router.post('/:id/milestones/:milestoneId/verify', protect, authorize('admin', 'auditor'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { approved, rejectionReason } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    const milestone = (campaign.milestones as any).id(req.params.milestoneId);
    
    if (!milestone) {
      return next(new AppError('Milestone not found', 404));
    }

    if (milestone.status !== 'submitted') {
      return next(new AppError('Milestone is not submitted for verification', 400));
    }

    milestone.status = approved ? 'verified' : 'rejected';
    milestone.verifiedAt = new Date();
    milestone.verifiedBy = req.user?.id;
    
    if (!approved && rejectionReason) {
      milestone.rejectionReason = rejectionReason;
    }

    await campaign.save();

    res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error) {
    next(error);
  }
});

export default router;
