import express from 'express';
import { emailService } from '../utils/emailService';
import { protect } from '../middleware/auth';

const router = express.Router();

// @desc    Test email configuration
// @route   GET /api/test/email/config
// @access  Public (for testing)
router.get('/config', async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        from: process.env.FROM_EMAIL || process.env.EMAIL_FROM,
        secure: process.env.EMAIL_SECURE
      },
      message: 'Email configuration loaded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Test welcome email
// @route   POST /api/test/email/welcome
// @access  Public (for testing)
router.post('/welcome', async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const result = await emailService.sendWelcomeEmail({
      name,
      email,
      loginUrl: `${process.env.FRONTEND_URL}/dashboard`
    });

    res.json({
      success: result,
      message: result ? 'Welcome email sent successfully' : 'Failed to send welcome email'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Test donation confirmation email
// @route   POST /api/test/email/donation
// @access  Private (Admin only)
router.post('/donation', protect, async (req, res, next) => {
  try {
    const { email, amount, campaign, transactionId } = req.body;

    if (!email || !amount || !campaign) {
      return res.status(400).json({
        success: false,
        message: 'Email, amount, and campaign are required'
      });
    }

    const result = await emailService.sendDonationConfirmationEmail(email, {
      amount,
      campaign,
      transactionId: transactionId || `TXN${Date.now()}`
    });

    res.json({
      success: result,
      message: result ? 'Donation confirmation email sent successfully' : 'Failed to send donation confirmation email'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Test password reset email
// @route   POST /api/test/email/reset
// @access  Private (Admin only)
router.post('/reset', protect, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const resetToken = `reset-${Date.now()}`;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const result = await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);

    res.json({
      success: result,
      message: result ? 'Password reset email sent successfully' : 'Failed to send password reset email'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Debug environment variables
// @route   GET /api/test/email/debug
// @access  Public (for testing)
router.get('/debug', async (req, res) => {
  try {
    res.json({
      success: true,
      debug: {
        EMAIL_SERVICE: process.env.EMAIL_SERVICE,
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS ? 'SET (' + process.env.EMAIL_PASS.length + ' chars)' : 'NOT SET',
        EMAIL_FROM: process.env.EMAIL_FROM,
        FROM_EMAIL: process.env.FROM_EMAIL,
        EMAIL_SECURE: process.env.EMAIL_SECURE
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Send tax receipt email
// @route   POST /api/email/tax-receipt
// @access  Public (for testing)
router.post('/tax-receipt', async (req, res) => {
  try {
    const { userDetails, donations, totalAmount, financialYear, receiptNumber, issuedDate } = req.body;

    if (!userDetails?.email || !donations?.length) {
      return res.status(400).json({
        success: false,
        message: 'User email and donations are required'
      });
    }

    // Generate tax receipt email content
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Tax Receipt - DilSeDaan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .receipt-container { max-width: 800px; margin: 0 auto; border: 2px solid #FF6B35; padding: 30px; }
          .header { text-align: center; border-bottom: 2px solid #FF6B35; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #FF6B35; margin-bottom: 10px; }
          .receipt-title { font-size: 24px; font-weight: bold; color: #2D3748; margin-bottom: 5px; }
          .receipt-subtitle { color: #718096; font-size: 16px; }
          .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section { flex: 1; }
          .info-label { font-weight: bold; color: #2D3748; }
          .info-value { color: #4A5568; margin-bottom: 10px; }
          .donation-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .donation-table th, .donation-table td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; }
          .donation-table th { background-color: #FF6B35; color: white; font-weight: bold; }
          .total-section { background-color: #FFF5F0; padding: 20px; border-radius: 8px; text-align: center; }
          .total-amount { font-size: 24px; font-weight: bold; color: #FF6B35; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #718096; }
          .legal-note { background-color: #EDF2F7; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">🫶 DilSeDaan</div>
            <div class="receipt-title">OFFICIAL TAX RECEIPT</div>
            <div class="receipt-subtitle">Section 80G - Income Tax Deduction Certificate</div>
          </div>

          <div class="receipt-info">
            <div class="info-section">
              <div class="info-label">Donor Details:</div>
              <div class="info-value"><strong>${userDetails.name}</strong></div>
              <div class="info-value">${userDetails.email}</div>
              <div class="info-value">${userDetails.phone || 'N/A'}</div>
              <div class="info-value">${userDetails.address || 'N/A'}</div>
            </div>
            <div class="info-section" style="text-align: right;">
              <div class="info-label">Receipt Details:</div>
              <div class="info-value"><strong>Receipt No:</strong> ${receiptNumber}</div>
              <div class="info-value"><strong>Issue Date:</strong> ${issuedDate}</div>
              <div class="info-value"><strong>Financial Year:</strong> ${financialYear}</div>
            </div>
          </div>

          <table class="donation-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cause</th>
                <th>Transaction ID</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${donations.map(d => `
                <tr>
                  <td>${new Date(d.date).toLocaleDateString('en-IN')}</td>
                  <td>${d.cause}</td>
                  <td style="font-family: monospace; font-size: 12px;">${d.transactionId}</td>
                  <td style="text-align: right; font-weight: bold;">₹${d.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div style="font-size: 18px; margin-bottom: 10px;">Total Donation Amount</div>
            <div class="total-amount">₹${totalAmount.toLocaleString('en-IN')}</div>
            <div style="margin-top: 10px; color: #4A5568;">Eligible for 80G Tax Deduction</div>
          </div>

          <div class="legal-note">
            <strong>Important Notes:</strong><br>
            • This receipt is valid for claiming Income Tax deduction under Section 80G<br>
            • All donations are made through blockchain-verified transactions for complete transparency<br>
            • Please retain this receipt for your tax filing records<br>
            • For any queries, contact: support@dilsedaan.com
          </div>

          <div class="footer">
            <div style="margin-bottom: 10px;">
              <strong>DilSeDaan Foundation</strong><br>
              Registered Non-Profit Organization<br>
              80G Registration: [Your 80G Number]
            </div>
            <div style="font-size: 12px; color: #A0AEC0;">
              This is a computer-generated receipt. दिल से सेवा, दिल से दान ❤️
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using the existing email service
    const result = await emailService.sendEmail({
      to: userDetails.email,
      subject: `📄 Tax Receipt (80G) - ₹${totalAmount.toLocaleString('en-IN')} - DilSeDaan`,
      html: receiptHtml
    });

    console.log('📧 Tax receipt sent successfully to:', userDetails.email);

    res.json({
      success: true,
      message: 'Tax receipt sent successfully',
      receiptNumber,
      totalAmount
    });

  } catch (error) {
    console.error('Tax receipt error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
