import { api } from './api';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  name: string;
  description: string;
  prefill: {
    name?: string;
    email?: string;
  };
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
  campaignId: string;
  amount: number;
}

export interface FeeCalculation {
  donationAmount: number;
  platformFee: number;
  processingFee: number;
  gst: number;
  totalFees: number;
  totalPayable: number;
  feeBreakdown: string[];
}

class PaymentService {
  /**
   * Get fee calculation preview
   */
  async getFeePreview(amount: number, paymentMethod: string = 'upi', campaignType: string = 'individual'): Promise<FeeCalculation> {
    try {
      const response = await api.payment.getFeePreview({
        amount,
        paymentMethod,
        campaignType
      });
      
      return response.data.feeCalculations[paymentMethod];
    } catch (error) {
      console.error('Fee calculation failed:', error);
      throw new Error('Failed to calculate fees');
    }
  }

  /**
   * Create payment order for any payment method
   */
  async createOrder(orderData: {
    campaignId: string;
    amount: number;
    paymentMethod: string;
    donorName: string;
    donorEmail: string;
  }): Promise<PaymentOrder> {
    try {
      // Use card order creation for now (works with all methods)
      const response = await api.payment.createCardOrder({
        campaignId: orderData.campaignId,
        amount: orderData.amount
      });

      return response.data.paymentConfig;
    } catch (error) {
      console.error('Payment order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Create Razorpay order for card payments
   */
  async createPaymentOrder(campaignId: string, amount: number): Promise<PaymentOrder> {
    try {
      const response = await api.payment.createCardOrder({
        campaignId,
        amount
      });

      return response.data.paymentConfig;
    } catch (error) {
      console.error('Payment order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Verify payment after successful payment
   */
  async verifyPayment(verification: PaymentVerification): Promise<any> {
    try {
      const response = await api.payment.verifyCardPayment(verification);
      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Process UPI payment
   */
  async processUPIPayment(campaignId: string, amount: number, upiId: string): Promise<any> {
    try {
      const response = await api.payment.createUPIPayment({
        campaignId,
        amount,
        upiId
      });

      return response.data;
    } catch (error) {
      console.error('UPI payment failed:', error);
      throw new Error('UPI payment processing failed');
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(campaignId: string): Promise<any[]> {
    try {
      const response = await api.payment.getPaymentMethods({ campaignId });
      return response.data.methods;
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      return this.getDefaultPaymentMethods();
    }
  }

  /**
   * Get Razorpay configuration
   */
  async getRazorpayConfig(): Promise<any> {
    try {
      const response = await api.payment.getRazorpayConfig();
      return response.data;
    } catch (error) {
      console.error('Failed to get Razorpay config:', error);
      return {
        keyId: 'rzp_test_placeholder',
        currency: 'INR',
        isTestMode: true
      };
    }
  }

  /**
   * Initialize Razorpay payment
   */
  async initiateRazorpayPayment(
    paymentOrder: PaymentOrder,
    onSuccess: (response: any) => void,
    onFailure: (error: any) => void
  ): Promise<void> {
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await this.loadRazorpayScript();
      }

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: paymentOrder.name,
        description: paymentOrder.description,
        order_id: paymentOrder.orderId,
        prefill: paymentOrder.prefill,
        theme: {
          color: '#059669' // DilSeDaan green
        },
        modal: {
          ondismiss: () => {
            onFailure({ error: 'Payment cancelled by user' });
          }
        },
        handler: (response: any) => {
          onSuccess(response);
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay initialization failed:', error);
      onFailure(error);
    }
  }

  /**
   * Load Razorpay script dynamically
   */
  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Default payment methods fallback
   */
  private getDefaultPaymentMethods() {
    return [
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using any UPI app',
        icon: 'smartphone',
        recommended: true,
        instant: true,
        minAmount: 10,
        maxAmount: 100000
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, RuPay',
        icon: 'credit-card',
        recommended: false,
        instant: true,
        minAmount: 10,
        maxAmount: 500000
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'Direct bank transfer',
        icon: 'building',
        recommended: false,
        instant: true,
        minAmount: 10,
        maxAmount: 500000
      }
    ];
  }
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = new PaymentService();
