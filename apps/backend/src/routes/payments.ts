import express from 'express';
import { protect } from '../middleware/auth';
import { AppError } from '../types/index';
import { AuthenticatedRequest } from '../types/index';
import { Campaign } from '../models/Campaign';
import { Donation } from '../models/Donation';
import { FeeCalculator, CampaignContext } from '../utils/feeCalculator';
import { razorpayService } from '../utils/razorpayService';

const router = express.Router();

// @desc    Get fee calculation preview (public endpoint for transparency)
// @route   GET /api/payments/fees/preview
// @access  Public
router.get('/fees/preview', async (req, res, next) => {
  try {
    const { amount = 1000, paymentMethod = 'upi', campaignType = 'individual' } = req.query;
    
    const donationAmount = parseFloat(amount as string);
    
    // Create campaign context for fee calculation
    const campaignContext: CampaignContext = {
      type: campaignType as any,
      isVerifiedNGO: campaignType === 'ngo',
      isEmergency: campaignType === 'emergency',
      category: campaignType as string
    };
    
    // Calculate fees for different payment methods
    const feeCalculations = {
      upi: FeeCalculator.calculateFees(donationAmount, 'upi', campaignContext),
      card: FeeCalculator.calculateFees(donationAmount, 'card', campaignContext),
      netbanking: FeeCalculator.calculateFees(donationAmount, 'netbanking', campaignContext),
      wallet: FeeCalculator.calculateFees(donationAmount, 'wallet', campaignContext),
      crypto: FeeCalculator.calculateFees(donationAmount, 'crypto', campaignContext)
    };
    
    res.status(200).json({
      success: true,
      data: {
        donationAmount,
        campaignType,
        feeCalculations,
        marketComparison: {
          ketto: `₹${Math.round(donationAmount * 0.069)} (6.9%)`,
          milaap: `₹${Math.round(donationAmount * 0.069)} (6.9%)`,
          goFundMe: `₹${Math.round(donationAmount * 0.029 + 20)} (2.9% + ₹20)`,
          dilSeDaan: `₹${feeCalculations.upi.totalFees} (${feeCalculations.upi.platformFeePercentage}% + GST)`
        },
        note: 'DilSeDaan offers significantly lower fees compared to competitors while maintaining full transparency'
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// Apply protection to payment routes (after public endpoints)
router.use(protect);

// @desc    Create UPI payment intent
// @route   POST /api/payments/upi/create
// @access  Private
router.post('/upi/create', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, amount, upiId } = req.body;

    // Validate input
    if (!campaignId || !amount || !upiId) {
      return next(new AppError('Campaign ID, amount, and UPI ID are required', 400));
    }

    // Validate amount (minimum ₹10, maximum ₹1,00,000)
    if (amount < 10 || amount > 100000) {
      return next(new AppError('Amount must be between ₹10 and ₹1,00,000', 400));
    }

    // Check campaign exists and is active
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'active') {
      return next(new AppError('Campaign not found or not active', 404));
    }

    // Generate UPI payment URL
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('DilSeDaan Charity Platform')}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Donation to ${campaign.title}`)}`;

    // Create payment record with pending status
    const paymentRecord = {
      donor: req.user?.id,
      campaign: campaignId,
      amount,
      currency: 'INR',
      paymentMethod: 'UPI',
      paymentData: {
        upiId,
        upiUrl,
        merchantTransactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      status: 'pending',
      createdAt: new Date()
    };

    res.status(200).json({
      success: true,
      data: {
        paymentUrl: upiUrl,
        paymentRecord,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`,
        instructions: 'Scan QR code or click the UPI link to complete payment'
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Verify UPI payment
// @route   POST /api/payments/upi/verify
// @access  Private
router.post('/upi/verify', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { merchantTransactionId, utrNumber } = req.body;

    if (!merchantTransactionId || !utrNumber) {
      return next(new AppError('Transaction ID and UTR number are required', 400));
    }

    // In a real implementation, you would verify with UPI provider
    // For demo purposes, we'll simulate verification
    
    // Create confirmed donation record
    // This would normally be done after payment gateway confirmation
    const donationData = {
      donor: req.user?.id,
      // campaign: would be retrieved from payment record
      amount: 100, // would be retrieved from payment record
      currency: 'INR',
      paymentMethod: 'UPI',
      transactionId: utrNumber,
      status: 'confirmed',
      message: 'UPI payment donation'
    };

    res.status(200).json({
      success: true,
      message: 'Payment verification successful',
      data: {
        verified: true,
        transactionId: utrNumber,
        // donation: would include created donation record
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Create Razorpay order for card payments
// @route   POST /api/payments/card/create-order
// @access  Private
router.post('/card/create-order', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId, amount } = req.body;

    // Validate input
    if (!campaignId || !amount) {
      return next(new AppError('Campaign ID and amount are required', 400));
    }

    // Validate amount
    if (amount < 10 || amount > 100000) {
      return next(new AppError('Amount must be between ₹10 and ₹1,00,000', 400));
    }

    // Check campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== 'active') {
      return next(new AppError('Campaign not found or not active', 404));
    }

    // Determine campaign context for fee calculation
    const campaignContext: CampaignContext = {
      type: campaign.category === 'healthcare' ? 'medical' : 
            campaign.category === 'education' ? 'education' :
            campaign.category === 'disaster_relief' ? 'emergency' : 'individual',
      isVerifiedNGO: (campaign as any).organizationType === 'ngo' || (campaign as any).organizationType === 'charity' || false,
      isEmergency: campaign.category === 'disaster_relief' || campaign.tags?.includes('emergency'),
      category: campaign.category || 'other'
    };

    // Calculate market-standard fees
    const feeCalculation = FeeCalculator.calculateFees(amount, 'card', campaignContext);

    // Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder({
      amount: feeCalculation.totalPayable * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `donation_${campaignId}_${Date.now()}`,
      notes: {
        campaignId: campaignId,
        donorId: req.user?.id || '',
        donationAmount: amount.toString(),
        platformFee: feeCalculation.platformFee.toString(),
        gst: feeCalculation.gst.toString()
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: feeCalculation.totalPayable,
        donationAmount: amount,
        currency: 'INR',
        fees: {
          platform: feeCalculation.platformFee,
          processing: feeCalculation.processingFee,
          gst: feeCalculation.gst,
          total: feeCalculation.totalFees,
          breakdown: feeCalculation.feeBreakdown
        },
        campaign: {
          id: campaign._id,
          title: campaign.title,
          type: campaignContext.type,
          isVerifiedNGO: campaignContext.isVerifiedNGO
        },
        paymentConfig: {
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          order_id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'DilSeDaan',
          description: `Donation to ${campaign.title}`,
          prefill: {
            name: req.user?.name,
            email: req.user?.email
          }
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Verify card payment
// @route   POST /api/payments/card/verify
// @access  Private
router.post('/card/verify', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderId, paymentId, signature, campaignId, amount } = req.body;

    if (!orderId || !paymentId || !signature) {
      return next(new AppError('Order ID, payment ID, and signature are required', 400));
    }

    // Verify payment signature with Razorpay
    const isSignatureValid = razorpayService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature
    });

    if (!isSignatureValid) {
      return next(new AppError('Invalid payment signature', 400));
    }

    // Get payment details from Razorpay
    const paymentDetails = await razorpayService.getPayment(paymentId);
    
    if (paymentDetails.status !== 'captured') {
      return next(new AppError('Payment not captured successfully', 400));
    }

    // Create donation record
    const donation = await Donation.create({
      donor: req.user?.id,
      campaign: campaignId,
      amount: amount / 83, // Convert INR to approximate MATIC value for storage consistency
      currency: 'MATIC', // Store as MATIC equivalent for consistency
      network: 'polygon',
      paymentMethod: 'CARD',
      transactionHash: paymentId, // Use payment ID as transaction reference
      blockNumber: 0, // Not applicable for card payments
      gasUsed: 0,
      gasFee: 0,
      status: 'confirmed',
      message: `Card payment donation of ₹${amount}`,
      metadata: {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        originalAmount: amount,
        originalCurrency: 'INR'
      }
    });

    // Update campaign raised amount
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: { 
        raisedAmount: donation.amount,
        donorCount: 1
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        donation,
        verified: true
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get payment methods available with market-standard fees
// @route   GET /api/payments/methods
// @access  Private
router.get('/methods', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { campaignId } = req.query;
    
    // Get campaign context for fee calculation
    let campaignContext: CampaignContext = {
      type: 'individual',
      isVerifiedNGO: false,
      isEmergency: false,
      category: 'other'
    };
    
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        campaignContext = {
          type: campaign.category === 'healthcare' ? 'medical' : 
                campaign.category === 'education' ? 'education' :
                campaign.category === 'disaster_relief' ? 'emergency' : 'individual',
          isVerifiedNGO: (campaign as any).organizationType === 'ngo' || (campaign as any).organizationType === 'charity' || false,
          isEmergency: campaign.category === 'disaster_relief',
          category: campaign.category || 'other'
        };
      }
    }

    const paymentMethods = [
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using any UPI app (GPay, PhonePe, Paytm, etc.)',
        icon: 'upi-icon',
        recommended: true,
        ...FeeCalculator.getFeeInfo('upi', campaignContext),
        minAmount: 10,
        maxAmount: 200000,
        currency: 'INR',
        processingTime: 'Instant'
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using Visa, Mastercard, RuPay, American Express',
        icon: 'card-icon',
        recommended: false,
        ...FeeCalculator.getFeeInfo('card', campaignContext),
        minAmount: 10,
        maxAmount: 100000,
        currency: 'INR',
        processingTime: 'Instant'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Direct bank transfer from 100+ banks',
        icon: 'bank-icon',
        recommended: false,
        ...FeeCalculator.getFeeInfo('netbanking', campaignContext),
        minAmount: 10,
        maxAmount: 500000,
        currency: 'INR',
        processingTime: 'Instant'
      },
      {
        id: 'wallet',
        name: 'Digital Wallets',
        description: 'Pay using Paytm, PhonePe, Amazon Pay, etc.',
        icon: 'wallet-icon',
        recommended: true,
        ...FeeCalculator.getFeeInfo('wallet', campaignContext),
        minAmount: 10,
        maxAmount: 100000,
        currency: 'INR',
        processingTime: 'Instant'
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        description: 'Pay using MATIC, ETH, USDC on Polygon',
        icon: 'crypto-icon',
        recommended: false,
        ...FeeCalculator.getFeeInfo('crypto', campaignContext),
        minAmount: 0.001,
        maxAmount: 10000,
        currency: 'MATIC',
        processingTime: '1-2 minutes'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        methods: paymentMethods,
        recommendedMethod: 'upi',
        supportedCurrencies: ['INR', 'MATIC', 'ETH', 'USDC'],
        feeNote: campaignContext.isVerifiedNGO 
          ? 'Reduced fees for verified NGOs/charities'
          : campaignContext.isEmergency 
          ? 'Reduced fees for emergency campaigns'
          : 'Standard platform fees apply',
        transparencyInfo: {
          gstIncluded: true,
          feeBreakdown: 'Platform fee + Processing fee + GST (18%)',
          minimumFee: '₹10'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook/razorpay
// @access  Public (webhook)
router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookBody = req.body.toString();

    // Verify webhook signature
    const isValidWebhook = razorpayService.verifyWebhookSignature(webhookBody, webhookSignature);
    
    if (!isValidWebhook) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const webhookEvent = JSON.parse(webhookBody);
    const { event, payload } = webhookEvent;

    console.log('Razorpay webhook received:', event);

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;
      
      case 'refund.created':
        await handleRefundCreated(payload.refund.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for webhook event handling
async function handlePaymentCaptured(payment: any) {
  try {
    console.log('Payment captured:', payment.id);
    
    // Find donation by payment ID and update status
    const donation = await Donation.findOne({
      'metadata.razorpayPaymentId': payment.id
    });

    if (donation) {
      donation.status = 'confirmed';
      await donation.save();
      
      // Send confirmation email (if email service is configured)
      // await emailService.sendDonationConfirmationEmail(donation.donor.email, donation);
      
      console.log('Donation confirmed:', donation._id);
    }
  } catch (error) {
    console.error('❌ Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log('❌ Payment failed:', payment.id);
    
    // Find donation by payment ID and update status
    const donation = await Donation.findOne({
      'metadata.razorpayPaymentId': payment.id
    });

    if (donation) {
      donation.status = 'failed';
      await donation.save();
      console.log('❌ Donation marked as failed:', donation._id);
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

async function handleRefundCreated(refund: any) {
  try {
    console.log('🔄 Refund created:', refund.id);
    
    // Handle refund logic here
    // Update donation status, campaign amounts, etc.
  } catch (error) {
    console.error('❌ Error handling refund:', error);
  }
}

// @desc    Get Razorpay configuration for frontend
// @route   GET /api/payments/config/razorpay
// @access  Public
router.get('/config/razorpay', (req, res) => {
  const config = razorpayService.getConfig();
  
  res.status(200).json({
    success: true,
    data: config
  });
});

export default router;
