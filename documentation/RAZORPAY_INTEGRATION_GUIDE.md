# Razorpay Payment Gateway Integration Guide

## 🏦 Current Status
- ✅ Razorpay SDK installed and configured
- ✅ Production-ready payment service created
- ✅ Order creation and verification implemented
- ✅ Webhook handling for payment events
- ✅ Fee calculation with government-compliant GST
- ✅ Test mode integration working

## 🔑 Setting Up Production Razorpay

### Step 1: Create Razorpay Account
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Complete business verification
3. Upload required documents (PAN, GST, Bank details)
4. Get account approval (typically 24-48 hours)

### Step 2: Get Live API Keys
1. Navigate to **Settings → API Keys** in Razorpay dashboard
2. Generate **Live Mode** keys:
   - `Key ID` (starts with `rzp_live_`)
   - `Key Secret` (confidential)

### Step 3: Configure Webhook
1. Go to **Settings → Webhooks** in dashboard
2. Create new webhook with URL: `https://yourdomain.com/api/payments/webhook/razorpay`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
4. Copy the **Webhook Secret**

### Step 4: Update Environment Variables
```bash
# Update apps/backend/.env
RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_secret_key
RAZORPAY_WEBHOOK_SECRET=your_actual_webhook_secret
```

## 💳 Payment Features Implemented

### Supported Payment Methods
- **UPI** (Recommended) - Lowest fees
- **Credit/Debit Cards** - All major banks
- **Net Banking** - 100+ banks supported
- **Digital Wallets** - Paytm, PhonePe, etc.

### Fee Structure (Government Compliant)
- **Platform Fee**: 2.5% (competitive vs 6.9% industry standard)
- **Verified NGOs**: 1.5% (reduced fees)
- **Processing Fees**: Razorpay standard rates
- **GST**: 18% on platform fees (automatic)

### Security Features
- ✅ Payment signature verification
- ✅ Webhook signature validation
- ✅ PCI DSS compliant (through Razorpay)
- ✅ Automatic fraud detection
- ✅ Secure refund processing

## 🧪 Testing

### Test Cards (Development)
```
Visa: 4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
CVV: Any 3 digits
Expiry: Any future date
```

### Test UPI IDs
```
success@razorpay
failure@razorpay
```

### API Endpoints
```
POST /api/payments/card/create-order - Create payment order
POST /api/payments/card/verify - Verify payment
POST /api/payments/webhook/razorpay - Webhook handler
GET /api/payments/config/razorpay - Get frontend config
GET /api/payments/fees/preview - Fee calculator
```

## 🔄 Workflow

### Payment Process
1. **Frontend** calls create-order API with amount and campaign
2. **Backend** calculates fees and creates Razorpay order
3. **Frontend** opens Razorpay checkout with order details
4. **User** completes payment on Razorpay
5. **Frontend** receives payment response
6. **Backend** verifies payment signature
7. **Database** updates donation and campaign records
8. **Webhook** confirms payment capture (async)

### Error Handling
- Invalid signature → Payment rejected
- Failed payment → Donation marked as failed
- Network issues → Retry mechanism
- Webhook failures → Manual reconciliation

## 📊 Monitoring & Analytics

### Razorpay Dashboard Features
- Real-time payment tracking
- Settlement reports
- Failed payment analysis
- Refund management
- Tax reports for GST filing

### Platform Integration
- Payment success/failure rates
- Fee revenue tracking
- Campaign-wise payment analysis
- Donor payment preferences

## 🛡️ Security Best Practices

### Environment Security
- Never commit live keys to version control
- Use environment variables for all secrets
- Rotate webhook secrets periodically
- Monitor for suspicious payment patterns

### Validation
- Always verify payment signatures
- Validate webhook signatures
- Check payment amounts match
- Verify payment status before confirming donations

## 🚀 Go-Live Checklist

- [ ] Razorpay account approved and verified
- [ ] Live API keys obtained and configured
- [ ] Webhook URL accessible and tested
- [ ] SSL certificate installed (required for payments)
- [ ] Payment flow tested end-to-end
- [ ] Fee calculations verified
- [ ] GST compliance checked
- [ ] Refund process tested
- [ ] Monitoring and alerts set up

## 💰 Revenue Model

### Fee Transparency
- **DilSeDaan**: 2.5% platform fee + processing + GST
- **Competitors**: 6.9% average (Ketto, Milaap)
- **Cost Savings**: ~60% lower fees than competition
- **NGO Discount**: 1.5% for verified organizations

### Expected Monthly Processing
- Target: ₹10-50 lakhs in donations
- Platform Revenue: ₹25,000-₹1,25,000 per month
- Processing Volume: 500-2,500 transactions

---

**📞 Support**: For Razorpay integration issues, contact Razorpay support or check their [documentation](https://razorpay.com/docs/)
