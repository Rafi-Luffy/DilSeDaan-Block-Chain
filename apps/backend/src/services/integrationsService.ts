import axios from 'axios';
import crypto from 'crypto';

export class PaymentGatewayService {
  // Paytm Integration
  static async createPaytmOrder(orderData: {
    amount: number;
    orderId: string;
    customerId: string;
    callbackUrl: string;
  }): Promise<any> {
    try {
      const paytmParams = {
        body: {
          requestType: 'Payment',
          mid: process.env.PAYTM_MID,
          websiteName: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
          orderId: orderData.orderId,
          txnAmount: {
            value: orderData.amount.toString(),
            currency: 'INR'
          },
          userInfo: {
            custId: orderData.customerId,
          },
          callbackUrl: orderData.callbackUrl
        }
      };

      const checksum = this.generatePaytmChecksum(paytmParams.body);
      
      const response = await axios.post(
        `${process.env.PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${process.env.PAYTM_MID}&orderId=${orderData.orderId}`,
        paytmParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-MID': process.env.PAYTM_MID,
            'X-CHECKSUM': checksum
          }
        }
      );

      return {
        success: true,
        data: response.data,
        paymentUrl: `${process.env.PAYTM_HOST}/theia/api/v1/showPaymentPage?mid=${process.env.PAYTM_MID}&orderId=${orderData.orderId}`
      };
    } catch (error) {
      console.error('Paytm order creation error:', error);
      return { success: false, error: 'Failed to create Paytm order' };
    }
  }

  // PhonePe Integration
  static async createPhonePeOrder(orderData: {
    amount: number;
    merchantTransactionId: string;
    userId: string;
    redirectUrl: string;
  }): Promise<any> {
    try {
      const payload = {
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        merchantTransactionId: orderData.merchantTransactionId,
        merchantUserId: orderData.userId,
        amount: orderData.amount * 100, // PhonePe expects amount in paise
        redirectUrl: orderData.redirectUrl,
        redirectMode: 'POST',
        callbackUrl: `${process.env.API_BASE_URL}/api/payments/phonepe/callback`,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const checksum = crypto
        .createHash('sha256')
        .update(base64Payload + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY)
        .digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;

      const response = await axios.post(
        `${process.env.PHONEPE_HOST}/pg/v1/pay`,
        {
          request: base64Payload
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          }
        }
      );

      return {
        success: true,
        data: response.data,
        paymentUrl: response.data.data?.instrumentResponse?.redirectInfo?.url
      };
    } catch (error) {
      console.error('PhonePe order creation error:', error);
      return { success: false, error: 'Failed to create PhonePe order' };
    }
  }

  // GPay Integration (via Google Pay API)
  static async createGPayOrder(orderData: {
    amount: number;
    orderId: string;
    description: string;
  }): Promise<any> {
    try {
      // GPay integration typically happens on the frontend
      // This is a backend validation/preparation
      const gpayPayload = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: process.env.GPAY_MERCHANT_ID
            }
          }
        }],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: orderData.amount.toString(),
          currencyCode: 'INR',
          transactionId: orderData.orderId
        },
        merchantInfo: {
          merchantName: 'DilSeDaan',
          merchantId: process.env.GPAY_MERCHANT_ID
        }
      };

      return {
        success: true,
        data: gpayPayload,
        message: 'GPay payload prepared for frontend'
      };
    } catch (error) {
      console.error('GPay order preparation error:', error);
      return { success: false, error: 'Failed to prepare GPay order' };
    }
  }

  // UPI Payment QR Generation
  static generateUPIQR(paymentData: {
    upiId: string;
    name: string;
    amount: number;
    note: string;
    transactionId: string;
  }): string {
    const upiString = `upi://pay?pa=${paymentData.upiId}&pn=${encodeURIComponent(paymentData.name)}&am=${paymentData.amount}&cu=INR&tn=${encodeURIComponent(paymentData.note)}&tr=${paymentData.transactionId}`;
    return upiString;
  }

  // Utility: Generate Paytm Checksum
  private static generatePaytmChecksum(params: any): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto
      .createHash('sha256')
      .update(paramString + process.env.PAYTM_MERCHANT_KEY)
      .digest('hex');
  }

  // Payment verification
  static async verifyPayment(gateway: string, paymentData: any): Promise<{
    success: boolean;
    verified: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      switch (gateway) {
        case 'paytm':
          return this.verifyPaytmPayment(paymentData);
        case 'phonepe':
          return this.verifyPhonePePayment(paymentData);
        case 'upi':
          return this.verifyUPIPayment(paymentData);
        default:
          return { success: false, verified: false, error: 'Unsupported gateway' };
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, verified: false, error: 'Verification failed' };
    }
  }

  private static async verifyPaytmPayment(paymentData: any): Promise<any> {
    try {
      const verifyParams = {
        body: {
          mid: process.env.PAYTM_MID,
          orderId: paymentData.orderId
        }
      };

      const checksum = this.generatePaytmChecksum(verifyParams.body);

      const response = await axios.post(
        `${process.env.PAYTM_HOST}/v3/order/status`,
        verifyParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-MID': process.env.PAYTM_MID,
            'X-CHECKSUM': checksum
          }
        }
      );

      return {
        success: true,
        verified: response.data.body.resultInfo.resultStatus === 'TXN_SUCCESS',
        data: response.data
      };
    } catch (error) {
      return { success: false, verified: false, error: 'Paytm verification failed' };
    }
  }

  private static async verifyPhonePePayment(paymentData: any): Promise<any> {
    try {
      const checksum = crypto
        .createHash('sha256')
        .update(`/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${paymentData.transactionId}` + process.env.PHONEPE_SALT_KEY)
        .digest('hex') + '###' + process.env.PHONEPE_SALT_INDEX;

      const response = await axios.get(
        `${process.env.PHONEPE_HOST}/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${paymentData.transactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID
          }
        }
      );

      return {
        success: true,
        verified: response.data.success && response.data.code === 'PAYMENT_SUCCESS',
        data: response.data
      };
    } catch (error) {
      return { success: false, verified: false, error: 'PhonePe verification failed' };
    }
  }

  private static async verifyUPIPayment(paymentData: any): Promise<any> {
    // UPI verification typically requires UTR validation
    // This is a simplified implementation
    if (paymentData.utr && paymentData.utr.length >= 12) {
      return {
        success: true,
        verified: true,
        data: {
          utr: paymentData.utr,
          amount: paymentData.amount,
          status: 'SUCCESS'
        }
      };
    }

    return { success: false, verified: false, error: 'Invalid UPI transaction' };
  }
}

// Social Media Integration Service
export class SocialMediaService {
  // Facebook Share
  static generateFacebookShareUrl(campaignData: {
    url: string;
    title: string;
    description: string;
    image: string;
  }): string {
    const params = new URLSearchParams({
      u: campaignData.url,
      quote: `${campaignData.title} - ${campaignData.description}`
    });
    return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  }

  // Twitter Share
  static generateTwitterShareUrl(campaignData: {
    url: string;
    title: string;
    hashtags: string[];
  }): string {
    const params = new URLSearchParams({
      url: campaignData.url,
      text: campaignData.title,
      hashtags: campaignData.hashtags.join(',')
    });
    return `https://twitter.com/intent/tweet?${params.toString()}`;
  }

  // WhatsApp Share
  static generateWhatsAppShareUrl(campaignData: {
    url: string;
    title: string;
  }): string {
    const text = `${campaignData.title}\n\nDonate now: ${campaignData.url}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  // LinkedIn Share
  static generateLinkedInShareUrl(campaignData: {
    url: string;
    title: string;
    summary: string;
  }): string {
    const params = new URLSearchParams({
      mini: 'true',
      url: campaignData.url,
      title: campaignData.title,
      summary: campaignData.summary
    });
    return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
  }

  // Generate all social share URLs
  static generateAllShareUrls(campaignData: {
    url: string;
    title: string;
    description: string;
    image: string;
    hashtags: string[];
  }) {
    return {
      facebook: this.generateFacebookShareUrl(campaignData),
      twitter: this.generateTwitterShareUrl(campaignData),
      whatsapp: this.generateWhatsAppShareUrl(campaignData),
      linkedin: this.generateLinkedInShareUrl({
        url: campaignData.url,
        title: campaignData.title,
        summary: campaignData.description
      })
    };
  }
}

// Email Marketing Integration (Mailchimp example)
export class EmailMarketingService {
  static async addToMailingList(userData: {
    email: string;
    firstName: string;
    lastName: string;
    tags?: string[];
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
        return { success: false, error: 'Mailchimp not configured' };
      }

      const response = await axios.post(
        `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
        {
          email_address: userData.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: userData.firstName,
            LNAME: userData.lastName
          },
          tags: userData.tags || []
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Mailchimp subscription error:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to subscribe' };
    }
  }

  static async sendCampaignEmail(campaignData: {
    listId: string;
    subject: string;
    fromName: string;
    replyTo: string;
    templateId: string;
    content: any;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Create campaign
      const campaignResponse = await axios.post(
        `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/campaigns`,
        {
          type: 'regular',
          recipients: {
            list_id: campaignData.listId
          },
          settings: {
            subject_line: campaignData.subject,
            from_name: campaignData.fromName,
            reply_to: campaignData.replyTo,
            template_id: campaignData.templateId
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const campaignId = campaignResponse.data.id;

      // Set content
      await axios.put(
        `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`,
        campaignData.content,
        {
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Send campaign
      const sendResponse = await axios.post(
        `https://${process.env.MAILCHIMP_SERVER}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: sendResponse.data };
    } catch (error: any) {
      console.error('Mailchimp campaign error:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to send campaign' };
    }
  }
}
