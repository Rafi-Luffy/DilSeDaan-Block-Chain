import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export interface RazorpayOrderData {
  amount: number; // in paise (INR * 100)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

export class RazorpayService {
  private razorpay: Razorpay;
  private keySecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!keyId || !this.keySecret) {
      console.warn('⚠️  Razorpay credentials not found. Using test mode.');
      // Initialize with test credentials for development
      this.razorpay = new Razorpay({
        key_id: keyId || 'rzp_test_placeholder',
        key_secret: this.keySecret || 'test_secret_placeholder'
      });
    } else {
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: this.keySecret
      });
    }

    console.log('Razorpay initialized with key:', keyId ? `${keyId.substring(0, 8)}...` : 'test_mode');
  }

  /**
   * Create a new order for payment
   */
  async createOrder(orderData: RazorpayOrderData): Promise<any> {
    try {
      if (!this.keySecret || this.keySecret === 'test_secret_placeholder') {
        // Return mock order for development
        return this.createMockOrder(orderData);
      }

      const order = await this.razorpay.orders.create({
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        notes: orderData.notes
      });

      console.log('✅ Razorpay order created:', order.id);
      return order;
    } catch (error) {
      console.error('❌ Razorpay order creation failed:', error);
      throw new Error(`Payment order creation failed: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(verification: RazorpayPaymentVerification): boolean {
    try {
      if (!this.keySecret || this.keySecret === 'test_secret_placeholder') {
        // Always return true for test mode
        console.log('🧪 Test mode: Payment signature verification skipped');
        return true;
      }

      const { orderId, paymentId, signature } = verification;
      const body = orderId + '|' + paymentId;
      
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body.toString())
        .digest('hex');

      const isValid = expectedSignature === signature;
      
      if (isValid) {
        console.log('✅ Payment signature verified successfully');
      } else {
        console.error('❌ Payment signature verification failed');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Payment signature verification error:', error);
      return false;
    }
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    try {
      if (!this.keySecret || this.keySecret === 'test_secret_placeholder') {
        return this.getMockPayment(paymentId);
      }

      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('❌ Failed to fetch payment:', error);
      throw new Error(`Payment fetch failed: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  async createRefund(paymentId: string, amount?: number): Promise<any> {
    try {
      if (!this.keySecret || this.keySecret === 'test_secret_placeholder') {
        return this.createMockRefund(paymentId, amount);
      }

      const refundData: any = { payment_id: paymentId };
      if (amount) {
        refundData.amount = amount;
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      console.log('✅ Refund created:', refund.id);
      return refund;
    } catch (error) {
      console.error('❌ Refund creation failed:', error);
      throw new Error(`Refund creation failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(webhookBody: string, webhookSignature: string): boolean {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.warn('⚠️  Webhook secret not configured');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');

      return expectedSignature === webhookSignature;
    } catch (error) {
      console.error('❌ Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Get Razorpay configuration for frontend
   */
  getConfig() {
    return {
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      currency: 'INR',
      isTestMode: !this.keySecret || this.keySecret === 'test_secret_placeholder'
    };
  }

  // Mock methods for development/testing
  private createMockOrder(orderData: RazorpayOrderData) {
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: mockOrderId,
      entity: 'order',
      amount: orderData.amount,
      amount_paid: 0,
      amount_due: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: 'created',
      attempts: 0,
      notes: orderData.notes || {},
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  private getMockPayment(paymentId: string) {
    return {
      id: paymentId,
      entity: 'payment',
      amount: 100000, // ₹1000
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      captured: true,
      description: 'Mock payment for development',
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  private createMockRefund(paymentId: string, amount?: number) {
    return {
      id: `rfnd_mock_${Date.now()}`,
      entity: 'refund',
      amount: amount || 100000,
      currency: 'INR',
      payment_id: paymentId,
      status: 'processed',
      speed: 'normal',
      created_at: Math.floor(Date.now() / 1000)
    };
  }
}

// Export singleton instance
export const razorpayService = new RazorpayService();
