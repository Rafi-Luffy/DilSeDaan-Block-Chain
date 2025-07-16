import express from 'express';
import { Campaign } from '../models/Campaign';
import { User } from '../models/User';
import { protect, authorize, optionalAuth } from '../middleware/auth';
import { AppError } from '../types/index';
import { AuthenticatedRequest } from '../types/index';

const router = express.Router();

console.log('CAMPAIGNS-REAL ROUTE FILE LOADED SUCCESSFULLY');

// Get campaigns
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log('CAMPAIGNS ROUTE HIT! Fetching data...');
    
    const { status, category, verified, search } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    // Filter by status if provided
    if (status) {
      filter.status = status;
    } else {
      // Default to showing only active campaigns for public
      if (!req.user || req.user.role !== 'admin') {
        filter.status = 'active';
      }
    }
    
    // Filter by category
    if (category) {
      filter.category = category;
    }
    
    // Filter by verified status
    if (verified !== undefined) {
      filter.isVerified = verified === 'true';
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Filter applied:', filter);

    const campaigns = await Campaign.find(filter)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${campaigns.length} campaigns`);

    res.status(200).json({
      success: true,
      data: campaigns,
      count: campaigns.length
    });
  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    next(error);
  }
});

// Single campaign
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('creator', 'name email profile')
      .lean();

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('❌ Error fetching campaign:', error);
    next(error);
  }
});

// Create campaign
router.post('/', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log('Creating new campaign...');
    
    const campaignData = {
      ...req.body,
      creator: req.user!._id,
      // Set status based on user role
      status: req.user!.role === 'admin' ? 'active' : 'pending_review'
    };

    const campaign = await Campaign.create(campaignData);
    
    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate('creator', 'name email')
      .lean();

    console.log(`Campaign created: ${campaign.title}`);

    res.status(201).json({
      success: true,
      data: populatedCampaign
    });
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    next(error);
  }
});

// Admin approval
router.put('/:id/status', protect, authorize('admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    console.log(`🔄 Updating campaign ${req.params.id} status to ${req.body.status}`);
    
    const { status, rejectionReason } = req.body;
    
    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user!._id
    };
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    console.log(`Campaign status updated: ${campaign.title} -> ${status}`);

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('❌ Error updating campaign status:', error);
    next(error);
  }
});

// Update campaign
router.put('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Check if user is creator or admin
    if (campaign.creator.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return next(new AppError('Not authorized to update this campaign', 403));
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    res.status(200).json({
      success: true,
      data: updatedCampaign
    });
  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    next(error);
  }
});

// Delete campaign
router.delete('/:id', protect, async (req: AuthenticatedRequest, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return next(new AppError('Campaign not found', 404));
    }

    // Check if user is creator or admin
    if (campaign.creator.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') {
      return next(new AppError('Not authorized to delete this campaign', 403));
    }

    await Campaign.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    next(error);
  }
});

export default router;
