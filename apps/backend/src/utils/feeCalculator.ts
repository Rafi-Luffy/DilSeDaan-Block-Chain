// Fee calculation utility for market-standard pricing
// Based on Indian charity platform analysis and RBI guidelines

export interface FeeCalculation {
  platformFee: number;
  platformFeePercentage: number;
  processingFee: number;
  processingFeePercentage: number;
  gst: number;
  totalFees: number;
  netAmount: number;
  totalPayable: number;
  feeBreakdown: {
    platform: string;
    processing: string;
    gst: string;
    total: string;
  };
}

export interface CampaignContext {
  type: 'individual' | 'ngo' | 'emergency' | 'medical' | 'education';
  isVerifiedNGO: boolean;
  isEmergency: boolean;
  category: string;
}

export class FeeCalculator {
  private static readonly PLATFORM_FEE_INDIVIDUAL = 2.5; // 2.5%
  private static readonly PLATFORM_FEE_NGO = 1.5; // 1.5%
  private static readonly PLATFORM_FEE_EMERGENCY = 1.0; // 1.0%
  private static readonly PLATFORM_FEE_MAX = 5.0; // 5.0%
  
  private static readonly PROCESSING_FEE_CARD = 2.9; // 2.9%
  private static readonly PROCESSING_FEE_UPI = 0; // 0%
  private static readonly PROCESSING_FEE_NETBANKING = 1.9; // 1.9%
  
  private static readonly GST_RATE = 18; // 18%
  private static readonly MIN_FEE_AMOUNT = 10; // ₹10 minimum
  
  /**
   * Calculate comprehensive fees for a donation
   */
  static calculateFees(
    amount: number,
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'crypto',
    campaign: CampaignContext
  ): FeeCalculation {
    
    // Determine platform fee percentage
    let platformFeePercentage = this.PLATFORM_FEE_INDIVIDUAL;
    
    if (campaign.isEmergency) {
      platformFeePercentage = this.PLATFORM_FEE_EMERGENCY;
    } else if (campaign.isVerifiedNGO) {
      platformFeePercentage = this.PLATFORM_FEE_NGO;
    }
    
    // Calculate platform fee
    let platformFee = (amount * platformFeePercentage) / 100;
    platformFee = Math.max(platformFee, this.MIN_FEE_AMOUNT); // Minimum fee
    
    // Determine processing fee percentage
    let processingFeePercentage = 0;
    switch (paymentMethod) {
      case 'card':
        processingFeePercentage = this.PROCESSING_FEE_CARD;
        break;
      case 'netbanking':
        processingFeePercentage = this.PROCESSING_FEE_NETBANKING;
        break;
      case 'upi':
      case 'wallet':
        processingFeePercentage = this.PROCESSING_FEE_UPI;
        break;
      case 'crypto':
        processingFeePercentage = 0; // Only gas fees
        break;
    }
    
    // Calculate processing fee
    const processingFee = (amount * processingFeePercentage) / 100;
    
    // Calculate GST on platform fee (as per Indian tax law)
    const gst = (platformFee * this.GST_RATE) / 100;
    
    // Total fees
    const totalFees = platformFee + processingFee + gst;
    const netAmount = amount; // Amount that goes to campaign
    const totalPayable = amount + totalFees; // Amount donor pays
    
    return {
      platformFee: Math.round(platformFee * 100) / 100,
      platformFeePercentage,
      processingFee: Math.round(processingFee * 100) / 100,
      processingFeePercentage,
      gst: Math.round(gst * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      netAmount: amount,
      totalPayable: Math.round(totalPayable * 100) / 100,
      feeBreakdown: {
        platform: `₹${Math.round(platformFee * 100) / 100} (${platformFeePercentage}%)`,
        processing: processingFee > 0 ? `₹${Math.round(processingFee * 100) / 100} (${processingFeePercentage}%)` : 'Free',
        gst: `₹${Math.round(gst * 100) / 100} (18% on platform fee)`,
        total: `₹${Math.round(totalFees * 100) / 100}`
      }
    };
  }
  
  /**
   * Get fee information for display purposes
   */
  static getFeeInfo(
    paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'crypto',
    campaign: CampaignContext
  ): {
    description: string;
    isRecommended: boolean;
    feeStructure: string;
  } {
    
    let platformFeePercentage = this.PLATFORM_FEE_INDIVIDUAL;
    if (campaign.isEmergency) {
      platformFeePercentage = this.PLATFORM_FEE_EMERGENCY;
    } else if (campaign.isVerifiedNGO) {
      platformFeePercentage = this.PLATFORM_FEE_NGO;
    }
    
    switch (paymentMethod) {
      case 'upi':
        return {
          description: 'Free payment processing via UPI',
          isRecommended: true,
          feeStructure: `Platform fee: ${platformFeePercentage}% + GST (18%)`
        };
      case 'card':
        return {
          description: 'Secure card payments with 2.9% processing fee',
          isRecommended: false,
          feeStructure: `Platform fee: ${platformFeePercentage}% + Processing: 2.9% + GST (18%)`
        };
      case 'netbanking':
        return {
          description: 'Direct bank transfer with 1.9% processing fee',
          isRecommended: false,
          feeStructure: `Platform fee: ${platformFeePercentage}% + Processing: 1.9% + GST (18%)`
        };
      case 'wallet':
        return {
          description: 'Digital wallet payments (Paytm, PhonePe, etc.)',
          isRecommended: true,
          feeStructure: `Platform fee: ${platformFeePercentage}% + GST (18%)`
        };
      case 'crypto':
        return {
          description: 'Cryptocurrency donations (only network gas fees)',
          isRecommended: false,
          feeStructure: 'Only blockchain network fees apply'
        };
      default:
        return {
          description: 'Unknown payment method',
          isRecommended: false,
          feeStructure: 'Fee structure not available'
        };
    }
  }
}
