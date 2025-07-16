# Gmail App Password Setup Guide for DilSeDaan Platform

## 🔑 Why Do We Need an App Password?

Gmail requires App Passwords for SMTP authentication when 2-Factor Authentication is enabled (which is recommended for security). Your regular Gmail password won't work for SMTP.

## 📋 Step-by-Step Guide to Generate Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already enabled)
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with: **dilsedaan.charity@gmail.com**
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable 2FA

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select "Mail" as the app
5. Select "Other (Custom name)" and enter: **DilSeDaan Platform**
6. Click "Generate"
7. **Copy the 16-character password** (example: abcd efgh ijkl mnop)

### Step 3: Update DilSeDaan Configuration
Replace the password in your backend `.env` file:

```bash
# Replace this line in apps/backend/.env:
EMAIL_PASS=ServingIndia@1000

# With your generated app password:
EMAIL_PASS=abcd efgh ijkl mnop
```

**Important**: Use the app password exactly as generated (with or without spaces - both work).

### Step 4: Test the Configuration
After updating the .env file:

1. Restart the backend server:
   ```bash
   cd apps/backend
   npm start
   ```

2. Test the email service:
   ```bash
   curl -X POST http://localhost:5001/api/test/email/welcome \
     -H "Content-Type: application/json" \
     -d '{"name": "Test User", "email": "test@example.com"}'
   ```

## 🚨 Security Notes

1. **Never share your app password** - treat it like your regular password
2. **Use different app passwords** for different applications
3. **Revoke app passwords** if they're no longer needed
4. **Store securely** in environment variables only

## 🧪 Alternative: Testing with a Test Email Service

If you prefer not to use your real Gmail account for testing, you can use:

1. **Ethereal Email** (fake SMTP for testing): https://ethereal.email/
2. **Mailtrap** (email testing service): https://mailtrap.io/
3. **Gmail alias** or dedicated test account

## ✅ Expected Results After Setup

Once configured correctly, you should see:
- ✅ Email service connected successfully (in server logs)
- ✅ Test emails sending without errors
- ✅ Welcome emails, donation confirmations, etc. working

## 🔧 Troubleshooting

### Still getting authentication errors?
1. Double-check the app password is correct
2. Ensure 2FA is enabled on the Gmail account
3. Try regenerating the app password
4. Check that the email address is correct

### Connection timeouts?
1. Check your internet connection
2. Verify Gmail SMTP settings:
   - Host: smtp.gmail.com
   - Port: 587
   - Secure: false (for STARTTLS)

### Rate limiting issues?
Gmail has sending limits:
- 500 emails per day for free accounts
- 2000 emails per day for Google Workspace accounts

## 📞 Support

If you continue having issues:
1. Check [Gmail SMTP documentation](https://support.google.com/mail/answer/7126229)
2. Verify account security settings
3. Contact Google Support if needed

---

**Next Steps**: Once you generate the app password, update the `.env` file and restart the backend server. The email service will then be fully functional for the DilSeDaan platform! ✨
