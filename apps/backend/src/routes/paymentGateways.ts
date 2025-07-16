import { Router, Request, Response } from 'express';
import { PaymentGatewayService, SocialMediaService } from '../services/integrationsService';
import { protect } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/index';
import { Donation } from '../models/Donation';
import { Campaign } from '../models/Campaign';
import { validatePaymentOrder, validatePaymentVerification, validateSocialShare } from '../middleware/validation';

const router = Router();

// Create Paytm payment order
router.post('/paytm/create-order', [
  protect,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('campaignId').notEmpty().withMessage('Campaign ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, campaignId } = req.body;
    const orderId = `PAYTM_${Date.now()}_${req.user?.id}`;

    const paymentOrder = await PaymentGatewayService.createPaytmOrder({
      amount,
      orderId,
      customerId: req.user?.id || '',
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback/paytm`
    });

    if (paymentOrder.success) {
      // Store pending donation
      const donation = new Donation({
        donorId: req.user?.id,
        campaignId,
        amount,
        paymentMethod: 'paytm',
        paymentStatus: 'pending',
        paymentOrderId: orderId,
        paymentGateway: 'paytm'
      });

      await donation.save();

      res.json({
        success: true,
        orderId,
        paymentUrl: paymentOrder.paymentUrl,
        data: paymentOrder.data
      });
    } else {
      res.status(400).json({ error: paymentOrder.error });
    }
  } catch (error) {
    console.error('Paytm order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create PhonePe payment order
router.post('/phonepe/create-order', [
  protect,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('campaignId').notEmpty().withMessage('Campaign ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, campaignId } = req.body;
    const transactionId = `PHONEPE_${Date.now()}_${req.user?.id}`;

    const paymentOrder = await PaymentGatewayService.createPhonePeOrder({
      amount,
      merchantTransactionId: transactionId,
      userId: req.user?.id || '',
      redirectUrl: `${process.env.FRONTEND_URL}/payment/callback/phonepe`
    });

    if (paymentOrder.success) {
      const donation = new Donation({
        donorId: req.user?.id,
        campaignId,
        amount,
        paymentMethod: 'phonepe',
        paymentStatus: 'pending',
        paymentOrderId: transactionId,
        paymentGateway: 'phonepe'
      });

      await donation.save();

      res.json({
        success: true,
        transactionId,
        paymentUrl: paymentOrder.paymentUrl,
        data: paymentOrder.data
      });
    } else {
      res.status(400).json({ error: paymentOrder.error });
    }
  } catch (error) {
    console.error('PhonePe order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create GPay payment order
router.post('/gpay/create-order', [
  protect,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('campaignId').notEmpty().withMessage('Campaign ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, campaignId, description } = req.body;
    const orderId = `GPAY_${Date.now()}_${req.user?.id}`;

    const paymentOrder = await PaymentGatewayService.createGPayOrder({
      amount,
      orderId,
      description: description || 'Donation via DilSeDaan'
    });

    if (paymentOrder.success) {
      const donation = new Donation({
        donorId: req.user?.id,
        campaignId,
        amount,
        paymentMethod: 'gpay',
        paymentStatus: 'pending',
        paymentOrderId: orderId,
        paymentGateway: 'gpay'
      });

      await donation.save();

      res.json({
        success: true,
        orderId,
        gpayPayload: paymentOrder.data
      });
    } else {
      res.status(400).json({ error: paymentOrder.error });
    }
  } catch (error) {
    console.error('GPay order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate UPI QR code
router.post('/upi/generate-qr', [
  protect,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('campaignId').notEmpty().withMessage('Campaign ID is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, campaignId, note } = req.body;
    const transactionId = `UPI_${Date.now()}_${req.user?.id}`;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const upiString = PaymentGatewayService.generateUPIQR({
      upiId: process.env.UPI_ID || 'dilsedaan@paytm',
      name: 'DilSeDaan',
      amount,
      note: note || `Donation for ${campaign.title}`,
      transactionId
    });

    // Store pending donation
    const donation = new Donation({
      donorId: req.user?.id,
      campaignId,
      amount,
      paymentMethod: 'upi',
      paymentStatus: 'pending',
      paymentOrderId: transactionId,
      paymentGateway: 'upi'
    });

    await donation.save();

    res.json({
      success: true,
      transactionId,
      upiString,
      instructions: 'Scan QR code or use UPI ID to complete payment. Provide UTR for verification.'
    });
  } catch (error) {
    console.error('UPI QR generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify payment
router.post('/verify/:gateway', [
  protect,
  body('paymentData').notEmpty().withMessage('Payment data is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gateway } = req.params;
    const { paymentData } = req.body;

    const verification = await PaymentGatewayService.verifyPayment(gateway, paymentData);

    if (verification.success && verification.verified) {
      // Update donation status
      const donation = await Donation.findOne({
        paymentOrderId: paymentData.orderId || paymentData.transactionId || paymentData.merchantTransactionId,
        donorId: req.user?.id
      });

      if (donation) {
        donation.paymentStatus = 'completed';
        donation.transactionId = verification.data?.transactionId || paymentData.transactionId;
        donation.paymentCompletedAt = new Date();
        await donation.save();

        // Update campaign raised amount
        await Campaign.findByIdAndUpdate(donation.campaignId, {
          $inc: { 
            raisedAmount: donation.amount,
            donorCount: 1
          }
        });

        res.json({
          success: true,
          verified: true,
          donation: {
            id: donation._id,
            amount: donation.amount,
            status: donation.paymentStatus
          }
        });
      } else {
        res.status(404).json({ error: 'Donation not found' });
      }
    } else {
      res.status(400).json({ 
        error: 'Payment verification failed',
        details: verification.error 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Social sharing URLs
router.get('/social/share-urls/:campaignId', async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaignUrl = `${process.env.FRONTEND_URL}/campaigns/${campaignId}`;
    const shareUrls = SocialMediaService.generateAllShareUrls({
      url: campaignUrl,
      title: campaign.title,
      description: campaign.description.substring(0, 200) + '...',
      image: campaign.images?.[0]?.url || '/images/default-campaign.jpg',
      hashtags: ['DilSeDaan', 'Charity', 'Donation', 'Help', ...campaign.tags]
    });

    res.json({
      success: true,
      shareUrls,
      campaignTitle: campaign.title
    });
  } catch (error) {
    console.error('Social share URLs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track social shares
router.post('/social/track-share', [
  body('campaignId').notEmpty().withMessage('Campaign ID is required'),
  body('platform').isIn(['facebook', 'twitter', 'whatsapp', 'linkedin']).withMessage('Invalid platform')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { campaignId, platform } = req.body;

    // Increment share count for campaign
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 
        [`socialShares.${platform}`]: 1,
        'socialShares.total': 1
      }
    });

    res.json({ success: true, message: 'Share tracked successfully' });
  } catch (error) {
    console.error('Share tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payment callback endpoints
router.post('/callback/paytm', async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    
    const verification = await PaymentGatewayService.verifyPayment('paytm', paymentData);
    
    if (verification.success && verification.verified) {
      const donation = await Donation.findOne({
        paymentOrderId: paymentData.ORDERID
      });

      if (donation) {
        donation.paymentStatus = 'completed';
        donation.transactionId = paymentData.TXNID;
        donation.paymentCompletedAt = new Date();
        await donation.save();

        await Campaign.findByIdAndUpdate(donation.campaignId, {
          $inc: { 
            raisedAmount: donation.amount,
            donorCount: 1
          }
        });
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${paymentData.ORDERID}`);
  } catch (error) {
    console.error('Paytm callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
});

router.post('/callback/phonepe', async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    
    const verification = await PaymentGatewayService.verifyPayment('phonepe', paymentData);
    
    if (verification.success && verification.verified) {
      const donation = await Donation.findOne({
        paymentOrderId: paymentData.merchantTransactionId
      });

      if (donation) {
        donation.paymentStatus = 'completed';
        donation.transactionId = paymentData.transactionId;
        donation.paymentCompletedAt = new Date();
        await donation.save();

        await Campaign.findByIdAndUpdate(donation.campaignId, {
          $inc: { 
            raisedAmount: donation.amount,
            donorCount: 1
          }
        });
      }
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnId=${paymentData.merchantTransactionId}`);
  } catch (error) {
    console.error('PhonePe callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
});

export default router;
