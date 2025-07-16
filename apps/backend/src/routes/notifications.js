// Notification API Routes
const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { protect: auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for notification endpoints
const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 notification requests per minute
  message: 'Too many notification requests, please try again later.'
});

// Subscribe to push notifications
router.post('/subscribe', auth, notificationLimiter, async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data'
      });
    }

    const result = await notificationService.subscribe(userId, subscription);

    res.json({
      success: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to subscribe to notifications'
    });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.unsubscribe(userId);

    res.json({
      success: result.success,
      message: result.message
    });

  } catch (error) {
    console.error('Unsubscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to unsubscribe from notifications'
    });
  }
});

// Send test notification (for development)
router.post('/test', auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test notifications are not available in production'
      });
    }

    const userId = req.user.id;
    const { title, body } = req.body;

    const success = await notificationService.sendPushNotification(userId, {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from DilSeDaan',
      data: { type: 'test' }
    });

    res.json({
      success,
      message: success ? 'Test notification sent' : 'Failed to send test notification'
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send test notification'
    });
  }
});

// Update notification preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    // Validate preferences structure
    const validPreferences = {
      newDonations: preferences.newDonations !== false,
      milestones: preferences.milestones !== false,
      campaignUpdates: preferences.campaignUpdates !== false,
      emergencyCampaigns: preferences.emergencyCampaigns !== false,
      marketingEmails: preferences.marketingEmails === true,
      weeklyDigest: preferences.weeklyDigest !== false,
      pushNotifications: preferences.pushNotifications !== false,
      emailNotifications: preferences.emailNotifications !== false
    };

    const result = await notificationService.updateNotificationPreferences(userId, validPreferences);

    res.json({
      success: result.success,
      message: result.success ? 'Preferences updated successfully' : 'Failed to update preferences'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to update notification preferences'
    });
  }
});

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, fetch from database
    const preferences = {
      newDonations: true,
      milestones: true,
      campaignUpdates: true,
      emergencyCampaigns: true,
      marketingEmails: false,
      weeklyDigest: true,
      pushNotifications: true,
      emailNotifications: true
    };

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch notification preferences'
    });
  }
});

// Send bulk notification (admin only)
router.post('/bulk', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userIds, notification } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!notification || !notification.title || !notification.body) {
      return res.status(400).json({
        success: false,
        message: 'Notification title and body are required'
      });
    }

    const results = await notificationService.sendBulkPushNotification(userIds, notification);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Sent ${successCount} notifications successfully, ${failureCount} failed`,
      data: {
        successCount,
        failureCount,
        details: results
      }
    });

  } catch (error) {
    console.error('Bulk notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send bulk notifications'
    });
  }
});

// Send system-wide notification (admin only)
router.post('/system', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { message, severity } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Notification message is required'
      });
    }

    await notificationService.sendSystemNotification(message, severity);

    res.json({
      success: true,
      message: 'System notification sent successfully'
    });

  } catch (error) {
    console.error('System notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send system notification'
    });
  }
});

// Get notification statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const stats = await notificationService.getNotificationStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch notification statistics'
    });
  }
});

// Trigger campaign-specific notifications (internal use)
router.post('/campaign/donation', auth, async (req, res) => {
  try {
    const { campaignId, donationData } = req.body;

    if (!campaignId || !donationData) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and donation data are required'
      });
    }

    await notificationService.notifyNewDonation(campaignId, donationData);

    res.json({
      success: true,
      message: 'Donation notification sent successfully'
    });

  } catch (error) {
    console.error('Donation notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send donation notification'
    });
  }
});

// Trigger milestone notifications
router.post('/campaign/milestone', auth, async (req, res) => {
  try {
    const { campaignId, milestoneData } = req.body;

    if (!campaignId || !milestoneData) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and milestone data are required'
      });
    }

    await notificationService.notifyMilestoneReached(campaignId, milestoneData);

    res.json({
      success: true,
      message: 'Milestone notification sent successfully'
    });

  } catch (error) {
    console.error('Milestone notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send milestone notification'
    });
  }
});

// Trigger campaign completion notifications
router.post('/campaign/completed', auth, async (req, res) => {
  try {
    const { campaignId, campaignData } = req.body;

    if (!campaignId || !campaignData) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and campaign data are required'
      });
    }

    await notificationService.notifyCampaignCompleted(campaignId, campaignData);

    res.json({
      success: true,
      message: 'Campaign completion notification sent successfully'
    });

  } catch (error) {
    console.error('Campaign completion notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send campaign completion notification'
    });
  }
});

// Trigger emergency campaign notifications
router.post('/emergency', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { campaignData } = req.body;

    if (!campaignData) {
      return res.status(400).json({
        success: false,
        message: 'Campaign data is required'
      });
    }

    await notificationService.notifyEmergencyCampaign(campaignData);

    res.json({
      success: true,
      message: 'Emergency campaign notification sent successfully'
    });

  } catch (error) {
    console.error('Emergency notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send emergency notification'
    });
  }
});

// Trigger payment status notifications
router.post('/payment', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentData } = req.body;

    if (!paymentData || !paymentData.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment data with status is required'
      });
    }

    await notificationService.notifyPaymentStatus(userId, paymentData);

    res.json({
      success: true,
      message: 'Payment notification sent successfully'
    });

  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to send payment notification'
    });
  }
});

// Health check for notification service
router.get('/health', async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats();
    
    res.json({
      success: true,
      status: 'healthy',
      data: {
        activeSubscriptions: stats?.totalSubscriptions || 0,
        serviceStatus: 'running',
        lastCheck: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Notification health check error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      message: 'Notification service is experiencing issues'
    });
  }
});

module.exports = router;
