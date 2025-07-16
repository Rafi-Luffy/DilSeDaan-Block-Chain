import { Router, Request, Response } from 'express';
import { protect } from '../middleware/auth';
import { PushNotificationService } from '../services/pushNotificationService';
import { User } from '../models/User';
import { body, validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../types/index';
import { validatePushSubscription, validatePushNotification, validateNotificationPreferences } from '../middleware/validation';

const router = Router();

// Subscribe to push notifications
router.post('/subscribe', [
  protect,
  body('subscription').notEmpty().withMessage('Subscription data is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subscription, preferences } = req.body;
    const userId = req.user?.id;

    // Add subscription to user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove existing subscription for this endpoint (avoid duplicates)
    user.pushSubscriptions = user.pushSubscriptions?.filter(
      sub => sub.endpoint !== subscription.endpoint
    ) || [];

    // Add new subscription
    user.pushSubscriptions.push(subscription);

    // Update notification preferences if provided
    if (preferences) {
      user.profile.preferences.notifications = {
        ...user.profile.preferences.notifications,
        ...preferences
      };
    }

    await user.save();

    res.json({ 
      success: true, 
      message: 'Push notification subscription added successfully' 
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await User.findByIdAndUpdate(userId, {
      $set: { pushSubscriptions: [] }
    });

    res.json({ 
      success: true, 
      message: 'Unsubscribed from push notifications' 
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send test notification
router.post('/test', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sent = await PushNotificationService.sendTestNotification(userId);
    
    if (sent) {
      res.json({ success: true, message: 'Test notification sent' });
    } else {
      res.status(400).json({ error: 'Failed to send test notification' });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification preferences
router.get('/preferences', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('profile.preferences.notifications pushSubscriptions');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      preferences: user.profile.preferences.notifications,
      isSubscribed: user.pushSubscriptions && user.pushSubscriptions.length > 0,
      subscriptionCount: user.pushSubscriptions?.length || 0
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification preferences
router.put('/preferences', [
  protect,
  body('preferences').isObject().withMessage('Preferences must be an object')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { preferences } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.profile.preferences.notifications = {
      ...user.profile.preferences.notifications,
      ...preferences
    };

    await user.save();

    res.json({ 
      success: true, 
      message: 'Notification preferences updated',
      preferences: user.profile.preferences.notifications
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Send notification to all users
router.post('/broadcast', [
  protect,
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, body, url, data } = req.body;

    const sentCount = await PushNotificationService.sendToAll({
      title,
      body,
      url,
      data
    });

    res.json({ 
      success: true, 
      message: `Notification sent to ${sentCount} users`,
      sentCount
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Send emergency alert
router.post('/emergency-alert', [
  protect,
  body('campaignTitle').notEmpty().withMessage('Campaign title is required'),
  body('urgencyLevel').isIn(['high', 'critical']).withMessage('Invalid urgency level')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { campaignTitle, urgencyLevel } = req.body;

    const sentCount = await PushNotificationService.sendEmergencyAlert(
      campaignTitle, 
      urgencyLevel
    );

    res.json({ 
      success: true, 
      message: `Emergency alert sent to ${sentCount} users`,
      sentCount
    });
  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification history (for admin)
router.get('/history', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user?.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // This would typically come from a notification history collection
    // For now, return mock data
    const mockHistory = [
      {
        id: '1',
        title: 'Welcome to DilSeDaan',
        body: 'Thank you for joining our platform',
        sentAt: new Date(Date.now() - 86400000),
        recipients: 150,
        type: 'welcome'
      },
      {
        id: '2',
        title: 'Emergency Campaign Alert',
        body: 'Critical medical emergency needs immediate support',
        sentAt: new Date(Date.now() - 3600000),
        recipients: 1200,
        type: 'emergency'
      }
    ];

    res.json({
      success: true,
      notifications: mockHistory,
      total: mockHistory.length
    });
  } catch (error) {
    console.error('Notification history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
