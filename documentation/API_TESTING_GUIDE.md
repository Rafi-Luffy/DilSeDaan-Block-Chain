# 🧪 DilSeDaan API Testing Guide

## 📋 Post-Submission Features Testing

This document provides comprehensive testing instructions for all the newly implemented post-submission features.

## 🔧 Prerequisites

### 1. Environment Setup
```bash
# Backend server should be running
cd apps/backend
npm run dev

# Server should be running on: http://localhost:5001
```

### 2. Required Tools
- **Postman** or **curl** for API testing
- **Google Authenticator** app for 2FA testing
- **Email client** to verify email templates

## 🔐 Two-Factor Authentication (2FA) Testing

### Base URL: `http://localhost:5001/api/auth/2fa`

### 1. Setup 2FA
```bash
# Generate QR code and secret
POST /api/auth/2fa/setup
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}

# Response includes:
# - qrCodeUrl: QR code for authenticator app
# - secret: Manual entry secret
# - backupCodes: 8 backup codes
```

### 2. Enable 2FA
```bash
# Enable 2FA with verification
POST /api/auth/2fa/enable
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "token": "123456"  # 6-digit code from authenticator app
}
```

### 3. Verify 2FA Token
```bash
# Verify TOTP token
POST /api/auth/2fa/verify
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "token": "123456"  # 6-digit code from authenticator app
}
```

### 4. Check 2FA Status
```bash
# Get 2FA status
GET /api/auth/2fa/status
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 5. Disable 2FA
```bash
# Disable 2FA
POST /api/auth/2fa/disable
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "token": "123456"  # 6-digit code from authenticator app
}
```

### 6. Regenerate Backup Codes
```bash
# Generate new backup codes
POST /api/auth/2fa/regenerate-backup-codes
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "token": "123456"  # 6-digit code from authenticator app
}
```

## 📊 Advanced Analytics Testing

### Base URL: `http://localhost:5001/api/analytics`

### 1. Platform Overview
```bash
# Get platform-wide metrics
GET /api/analytics/overview?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}

# Query Parameters:
# - timeframe: 7d, 30d, 90d, 1y, all
```

### 2. Campaign Analytics
```bash
# Get campaign performance data
GET /api/analytics/campaigns?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}

# Get specific campaign analytics
GET /api/analytics/campaigns/CAMPAIGN_ID?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 3. Donation Analytics
```bash
# Get donation analytics
GET /api/analytics/donations?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}

# Get donation trends
GET /api/analytics/donations/trends?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 4. User Analytics
```bash
# Get user analytics
GET /api/analytics/users?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}

# Get donor analytics for specific user
GET /api/analytics/users/USER_ID/donations?timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 5. Real-Time Metrics
```bash
# Get real-time metrics
GET /api/analytics/real-time
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### 6. Data Export
```bash
# Export analytics data
GET /api/analytics/export?type=campaigns&format=json&timeframe=30d
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}

# Export Parameters:
# - type: campaigns, donations, users
# - format: json, csv
# - timeframe: 7d, 30d, 90d, 1y, all
```

## 📧 Enhanced Email System Testing

### Base URL: `http://localhost:5001/test-email`

### 1. Test Email Service
```bash
# Test email configuration
GET /test-email
```

### 2. Email Templates Available
- **Welcome Email** - User registration
- **Email Verification** - Account verification
- **Password Reset** - Secure password reset
- **Campaign Approval** - Campaign approval notification
- **Donation Confirmation** - Enhanced donation receipt
- **Campaign Progress** - Milestone updates

### 3. Test Email Verification
```bash
# Trigger email verification (via user registration)
POST /api/auth/register
Body: {
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

## 🔍 Testing Checklist

### 2FA Testing
- [ ] Setup 2FA generates QR code and secret
- [ ] QR code can be scanned by authenticator app
- [ ] Manual secret entry works
- [ ] 2FA can be enabled with valid token
- [ ] 2FA verification works with valid tokens
- [ ] 2FA status endpoint returns correct status
- [ ] 2FA can be disabled with valid token
- [ ] Backup codes are generated and stored
- [ ] Backup codes can be regenerated

### Analytics Testing
- [ ] Platform overview returns correct metrics
- [ ] Campaign analytics show performance data
- [ ] Donation analytics display trends
- [ ] User analytics show user behavior
- [ ] Real-time metrics are current
- [ ] Data export works for all formats
- [ ] Timeframe filtering works correctly
- [ ] Admin-only endpoints require proper permissions

### Email Testing
- [ ] Email service configuration is correct
- [ ] Email templates render properly
- [ ] Email verification works
- [ ] Password reset emails are sent
- [ ] Campaign approval emails are sent
- [ ] Donation confirmation emails are sent
- [ ] Campaign progress emails are sent
- [ ] All email templates are mobile-responsive

## 🚨 Common Issues & Solutions

### 2FA Issues
- **QR Code not showing**: Check if base64 encoding is correct
- **Token verification fails**: Ensure system time is synchronized
- **Backup codes not working**: Check if codes are properly stored

### Analytics Issues
- **No data returned**: Check if there are donations/campaigns in the timeframe
- **Export fails**: Verify the export format and data structure
- **Performance issues**: Consider implementing caching for large datasets

### Email Issues
- **Emails not sending**: Check SMTP configuration and credentials
- **Templates not rendering**: Verify HTML template syntax
- **Images not loading**: Check image URLs and hosting

## 📈 Performance Testing

### Load Testing
```bash
# Test with multiple concurrent requests
# Use tools like Apache Bench or Artillery

# Example with curl for basic testing
for i in {1..10}; do
  curl -X GET "http://localhost:5001/api/analytics/overview" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" &
done
```

### Response Time Testing
- Analytics endpoints should respond within 2-3 seconds
- 2FA operations should complete within 1 second
- Email sending should be asynchronous and not block requests

## 🛡️ Security Testing

### 2FA Security
- [ ] Secret keys are properly encrypted
- [ ] Backup codes are hashed before storage
- [ ] Time-based tokens have proper window validation
- [ ] Rate limiting is implemented for 2FA attempts

### Analytics Security
- [ ] Only authorized users can access analytics
- [ ] User-specific data is properly filtered
- [ ] Admin endpoints require admin privileges
- [ ] Sensitive data is not exposed in responses

### Email Security
- [ ] Email templates don't contain XSS vulnerabilities
- [ ] Email verification tokens expire properly
- [ ] Password reset tokens are secure and time-limited
- [ ] No sensitive data is logged in email operations

## 🎯 Next Steps

After testing all features:
1. **Frontend Integration** - Integrate new APIs into the frontend
2. **UI/UX Enhancement** - Create admin dashboard for analytics
3. **Production Deployment** - Deploy to production environment
4. **Monitoring Setup** - Implement logging and monitoring
5. **Documentation** - Create user documentation for new features

## 📞 Support

For issues or questions about the post-submission features:
- Check the error logs in the backend console
- Verify environment variables are set correctly
- Ensure database connections are working
- Test with different user roles and permissions
