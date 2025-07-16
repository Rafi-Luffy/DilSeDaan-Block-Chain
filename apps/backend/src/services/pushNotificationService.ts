import webpush from 'web-push';
import { User } from '../models/User';

// Initialize web-push with VAPID keys only if they are provided
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@dilsedaan.org',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys not configured. Push notifications will be disabled.');
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: any;
}

export class PushNotificationService {
  // Check if push notifications are configured
  private static isConfigured(): boolean {
    return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
  }

  // Send notification to specific user
  static async sendToUser(userId: string, payload: NotificationPayload): Promise<boolean> {
    if (!this.isConfigured()) {
      console.warn('Push notifications not configured, skipping notification to user:', userId);
      return false;
    }

    try {
      const user = await User.findById(userId).select('pushSubscriptions');
      if (!user?.pushSubscriptions || user.pushSubscriptions.length === 0) {
        return false;
      }

      const notification = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        url: payload.url || '/',
        data: payload.data || {}
      };

      const promises = user.pushSubscriptions.map(subscription => 
        webpush.sendNotification(subscription, JSON.stringify(notification))
          .catch(error => {
            console.error('Push notification failed:', error);
            // Remove invalid subscription
            this.removeInvalidSubscription(userId, subscription);
          })
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  // Send notification to multiple users
  static async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<number> {
    const promises = userIds.map(userId => this.sendToUser(userId, payload));
    const results = await Promise.all(promises);
    return results.filter(result => result).length;
  }

  // Send notification to all users
  static async sendToAll(payload: NotificationPayload): Promise<number> {
    if (!this.isConfigured()) {
      console.warn('Push notifications not configured, skipping broadcast notification');
      return 0;
    }

    try {
      const users = await User.find({ 
        pushSubscriptions: { $exists: true, $ne: [] } 
      }).select('_id');

      const userIds = users.map(user => user._id.toString());
      return await this.sendToUsers(userIds, payload);
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      return 0;
    }
  }

  // Donation-related notifications
  static async notifyDonationReceived(donorId: string, campaignTitle: string, amount: number): Promise<boolean> {
    return this.sendToUser(donorId, {
      title: 'Donation Confirmed! 🙏',
      body: `Your ₹${amount} donation to "${campaignTitle}" has been confirmed. Thank you for your generosity!`,
      url: '/donations/history',
      data: { type: 'donation_confirmed', amount, campaignTitle }
    });
  }

  static async notifyCampaignCreator(creatorId: string, donorName: string, amount: number, campaignTitle: string): Promise<boolean> {
    return this.sendToUser(creatorId, {
      title: 'New Donation Received! 💝',
      body: `${donorName} just donated ₹${amount} to your campaign "${campaignTitle}"`,
      url: '/campaigns/manage',
      data: { type: 'donation_received', donorName, amount, campaignTitle }
    });
  }

  // Campaign-related notifications
  static async notifyCampaignApproved(creatorId: string, campaignTitle: string): Promise<boolean> {
    return this.sendToUser(creatorId, {
      title: 'Campaign Approved! ✅',
      body: `Your campaign "${campaignTitle}" has been approved and is now live`,
      url: '/campaigns/manage',
      data: { type: 'campaign_approved', campaignTitle }
    });
  }

  static async notifyCampaignGoalReached(creatorId: string, campaignTitle: string): Promise<boolean> {
    return this.sendToUser(creatorId, {
      title: 'Goal Reached! 🎉',
      body: `Congratulations! Your campaign "${campaignTitle}" has reached its funding goal`,
      url: '/campaigns/manage',
      data: { type: 'goal_reached', campaignTitle }
    });
  }

  // Milestone notifications
  static async notifyMilestoneReached(campaignId: string, milestoneTitle: string, percentage: number): Promise<boolean> {
    try {
      // Notify all campaign supporters
      const donations = await User.aggregate([
        {
          $lookup: {
            from: 'donations',
            localField: '_id',
            foreignField: 'donorId',
            as: 'donations'
          }
        },
        {
          $match: {
            'donations.campaignId': campaignId
          }
        },
        {
          $project: { _id: 1 }
        }
      ]);

      const donorIds = donations.map(d => d._id.toString());
      
      return await this.sendToUsers(donorIds, {
        title: 'Milestone Reached! 🏆',
        body: `"${milestoneTitle}" milestone reached! Campaign is ${percentage}% funded`,
        url: `/campaigns/${campaignId}`,
        data: { type: 'milestone_reached', campaignId, milestoneTitle, percentage }
      }) > 0;
    } catch (error) {
      console.error('Error sending milestone notification:', error);
      return false;
    }
  }

  // Weekly digest notifications
  static async sendWeeklyDigest(): Promise<number> {
    try {
      // Get users who want weekly digest
      const users = await User.find({
        'profile.preferences.notifications.weekly': true,
        pushSubscriptions: { $exists: true, $ne: [] }
      }).select('_id');

      const userIds = users.map(user => user._id.toString());
      
      return await this.sendToUsers(userIds, {
        title: 'Your Weekly Impact Digest 📊',
        body: 'See how your donations are making a difference this week',
        url: '/impact/weekly',
        data: { type: 'weekly_digest' }
      });
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      return 0;
    }
  }

  // Emergency campaign alerts
  static async sendEmergencyAlert(campaignTitle: string, urgencyLevel: 'high' | 'critical'): Promise<number> {
    try {
      const users = await User.find({
        'profile.preferences.notifications.emergency': true,
        pushSubscriptions: { $exists: true, $ne: [] }
      }).select('_id');

      const userIds = users.map(user => user._id.toString());
      
      const title = urgencyLevel === 'critical' ? 
        '🚨 Critical Emergency Campaign' : 
        '⚠️ Emergency Campaign Alert';
      
      return await this.sendToUsers(userIds, {
        title,
        body: `"${campaignTitle}" needs immediate support. Every donation counts!`,
        url: '/campaigns?filter=emergency',
        data: { type: 'emergency_alert', campaignTitle, urgencyLevel }
      });
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      return 0;
    }
  }

  // Fundraising reminders
  static async sendFundraisingReminder(userId: string, campaignTitle: string, daysLeft: number): Promise<boolean> {
    const urgency = daysLeft <= 3 ? 'urgent' : 'gentle';
    const message = urgency === 'urgent' ? 
      `Only ${daysLeft} days left! Help us reach the goal` :
      `${daysLeft} days remaining to support this cause`;

    return this.sendToUser(userId, {
      title: `${urgency === 'urgent' ? '⏰' : '💭'} Campaign Reminder`,
      body: `"${campaignTitle}" - ${message}`,
      url: '/campaigns',
      data: { type: 'fundraising_reminder', campaignTitle, daysLeft, urgency }
    });
  }

  // Remove invalid subscription
  private static async removeInvalidSubscription(userId: string, subscription: any): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: subscription }
      });
    } catch (error) {
      console.error('Error removing invalid subscription:', error);
    }
  }

  // Test notification
  static async sendTestNotification(userId: string): Promise<boolean> {
    return this.sendToUser(userId, {
      title: 'Test Notification 🧪',
      body: 'This is a test notification from DilSeDaan. Your notifications are working perfectly!',
      url: '/',
      data: { type: 'test' }
    });
  }
}
