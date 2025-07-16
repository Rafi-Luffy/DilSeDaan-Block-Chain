# Email Service Setup Guide for DilSeDaan Platform

## 📧 Email Configuration Status

### ✅ Infrastructure Complete
- [x] Email service implementation with nodemailer
- [x] Gmail SMTP configuration
- [x] Test email routes registered (`/api/test/email/*`)
- [x] Welcome, donation confirmation, and password reset emails
- [x] HTML email templates with DilSeDaan branding

### ⚠️ Configuration Needed
- [ ] Gmail App Password setup (15 minutes)
- [ ] Email address verification
- [ ] Live email testing

---

## 🔧 Gmail App Password Setup (Required)

### Step 1: Create Gmail Account for Platform
1. Create a Gmail account: `dilsedaan.charity@gmail.com` (or your preferred email)
2. Enable 2-Factor Authentication on the account
3. Go to Google Account settings → Security → 2-Step Verification

### Step 2: Generate App Password
1. Go to Google Account settings → Security
2. Select "2-Step Verification" → "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "DilSeDaan Platform" as the app name
5. Copy the generated 16-character app password

### Step 3: Update Backend Environment
Update `/apps/backend/.env` with the app password:

```bash
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=dilsedaan.charity@gmail.com
EMAIL_PASS=your-16-character-app-password-here
EMAIL_FROM=DilSeDaan <dilsedaan.charity@gmail.com>
FROM_EMAIL=dilsedaan.charity@gmail.com
FROM_NAME=DilSeDaan Charity Platform
```

---

## 🧪 Testing Email Functionality

### Test 1: Configuration Check
```bash
curl http://localhost:5001/api/test/email/config
```

**Expected Response:**
```json
{
  "success": true,
  "config": {
    "service": "gmail",
    "host": "smtp.gmail.com",
    "port": "587",
    "user": "dilsedaan.charity@gmail.com",
    "from": "dilsedaan.charity@gmail.com",
    "secure": "false"
  },
  "message": "Email configuration loaded"
}
```

### Test 2: Welcome Email
```bash
curl -X POST http://localhost:5001/api/test/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test-email@gmail.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome email sent successfully"
}
```

### Test 3: Donation Confirmation Email
```bash
curl -X POST http://localhost:5001/api/test/email/donation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "email": "your-test-email@gmail.com",
    "amount": 1000,
    "campaign": "Test Campaign",
    "transactionId": "TXN123456"
  }'
```

---

## 📧 Email Templates Available

### 1. Welcome Email (`sendWelcomeEmail`)
- **Trigger**: New user registration
- **Content**: Welcome message, platform overview, login link
- **Template**: HTML with DilSeDaan branding

### 2. Donation Confirmation (`sendDonationConfirmationEmail`)
- **Trigger**: Successful donation
- **Content**: Donation amount, campaign details, tax receipt info
- **Template**: HTML with transaction details

### 3. Password Reset (`sendPasswordResetEmail`)
- **Trigger**: Password reset request
- **Content**: Reset link, security instructions
- **Template**: HTML with secure reset link

### 4. Campaign Verification (`sendCampaignStatusEmail`)
- **Trigger**: Campaign approval/rejection
- **Content**: Status update, next steps
- **Template**: HTML with status notification

---

## 🔧 Email Service Features

### Security
- **App Password Authentication**: Secure Gmail integration
- **TLS Encryption**: Secure email transmission
- **Input Validation**: Sanitized email content
- **Rate Limiting**: Protected against email spam

### Templates
- **HTML Templates**: Rich, branded email design
- **Dynamic Content**: Personalized email content
- **Mobile Responsive**: Email templates work on all devices
- **Government Branding**: Professional appearance

### Error Handling
- **Connection Retry**: Automatic retry on failures
- **Error Logging**: Comprehensive error tracking
- **Fallback Options**: Alternative email providers ready

---

## 🚀 Production Email Setup

### For Government Submission
1. **Organization Email**: Set up official `admin@dilsedaan.org`
2. **SSL Configuration**: Ensure HTTPS for all email links
3. **Domain Authentication**: Configure SPF, DKIM records
4. **Compliance**: GDPR-compliant email handling

### Alternative Providers (Ready)
```bash
# SendGrid Configuration
EMAIL_SERVICE=SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Mailgun Configuration
EMAIL_SERVICE=Mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

---

## 📋 Quick Setup Checklist

### Immediate Setup (15 minutes)
- [ ] Create Gmail account: `dilsedaan.charity@gmail.com`
- [ ] Enable 2-Factor Authentication
- [ ] Generate Gmail App Password
- [ ] Update `EMAIL_PASS` in `/apps/backend/.env`
- [ ] Restart backend server
- [ ] Test welcome email endpoint

### Verification Steps
- [ ] Check email configuration: `GET /api/test/email/config`
- [ ] Send test welcome email: `POST /api/test/email/welcome`
- [ ] Verify email received in inbox
- [ ] Check email formatting and branding
- [ ] Test all email templates

### Production Readiness
- [ ] Organization email domain setup
- [ ] SSL certificate configuration
- [ ] Email deliverability testing
- [ ] Government compliance review

---

## 📞 Support & Troubleshooting

### Common Issues

**"Missing credentials for PLAIN"**
- Solution: Add Gmail App Password to `EMAIL_PASS`

**"Connection timeout"**
- Solution: Check firewall settings, verify SMTP settings

**"Authentication failed"**
- Solution: Verify Gmail App Password, check 2FA settings

### Contact
- **Technical Support**: Check server logs for detailed error messages
- **Email Testing**: Use the provided curl commands for testing

---

## ✨ Email Service Status: READY ✅

The DilSeDaan email service is fully implemented and ready for use. Only Gmail App Password configuration is needed to activate email notifications for the platform.

**Estimated Setup Time**: 15 minutes
**Government Submission Ready**: ✅ Yes (after configuration)
