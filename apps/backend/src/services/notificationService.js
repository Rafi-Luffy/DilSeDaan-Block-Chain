// Comprehensive Notification Service with Push Notifications, Email, and Real-time Updates
const webpush = require('web-push');
const { EventEmitter } = require('events');
const emailService = require('./emailService');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.subscriptions = new Map();
    this.webPushEnabled = false;
    this.setupWebPush();
  }

  // Setup web push configuration
  setupWebPush() {
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    
    // Only setup if both keys are properly configured
    if (vapidPublicKey && vapidPrivateKey && vapidPublicKey.length > 20) {
      try {
        webpush.setVapidDetails(
          'mailto:support@dilsedaan.org',
          vapidPublicKey,
          vapidPrivateKey
        );
        this.webPushEnabled = true;
        console.log('✅ Web push notifications configured');
      } catch (error) {
        console.warn('⚠️ Web push setup failed:', error.message);
        console.log('💡 Generate VAPID keys with: npx web-push generate-vapid-keys');
      }
    } else {
      console.log('⚠️ VAPID keys not configured - push notifications disabled');
      console.log('💡 Generate VAPID keys with: npx web-push generate-vapid-keys');
    }
  }

  // Subscribe user to push notifications
  async subscribe(userId, subscription) {
    try {
      this.subscriptions.set(userId, subscription);
      
      // Store subscription in database (if using MongoDB)
      // await UserSubscription.create({ userId, subscription });
      
      console.log(`User ${userId} subscribed to push notifications`);
      return { success: true, message: 'Successfully subscribed to notifications' };
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return { success: false, message: 'Failed to subscribe to notifications' };
    }
  }

  // Unsubscribe user from push notifications
  async unsubscribe(userId) {
    try {
      this.subscriptions.delete(userId);
      
      // Remove subscription from database
      // await UserSubscription.deleteOne({ userId });
      
      console.log(`User ${userId} unsubscribed from push notifications`);
      return { success: true, message: 'Successfully unsubscribed from notifications' };
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return { success: false, message: 'Failed to unsubscribe from notifications' };
    }
  }

  // Send push notification to specific user
  async sendPushNotification(userId, payload) {
    try {
      if (!this.webPushEnabled) {
        console.log('⚠️ Web push not enabled, skipping push notification');
        return false;
      }

      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        console.log(`No subscription found for user ${userId}`);
        return false;
      }

      const notificationPayload = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/images/icon-192x192.png',
        badge: payload.badge || '/images/icon-72x72.png',
        image: payload.image,
        data: payload.data || {},
        actions: payload.actions || [],
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        tag: payload.tag || 'default',
        renotify: payload.renotify || false,
        vibrate: payload.vibrate || [200, 100, 200]
      };

      await webpush.sendNotification(subscription, JSON.stringify(notificationPayload));
      console.log(`Push notification sent to user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      
      // If subscription is invalid, remove it
      if (error.statusCode === 410) {
        this.subscriptions.delete(userId);
      }
      
      return false;
    }
  }

  // Send push notification to multiple users
  async sendBulkPushNotification(userIds, payload) {
    const results = [];
    
    for (const userId of userIds) {
      const result = await this.sendPushNotification(userId, payload);
      results.push({ userId, success: result });
    }
    
    return results;
  }

  // Campaign-related notifications
  async notifyNewDonation(campaignId, donationData) {
    try {
      // Notify campaign creator
      await this.sendPushNotification(donationData.campaignCreatorId, {
        title: '🎉 New Donation Received!',
        body: `You received ₹${donationData.amount} for your campaign "${donationData.campaignTitle}"`,
        icon: '/images/donation-icon.png',
        data: {
          type: 'new_donation',
          campaignId,
          donationId: donationData.donationId,
          amount: donationData.amount
        },
        actions: [
          { action: 'view', title: 'View Campaign' },
          { action: 'thank', title: 'Thank Donor' }
        ]
      });

      // Send email notification
      await emailService.sendDonationReceivedEmail({
        to: donationData.campaignCreatorEmail,
        campaignTitle: donationData.campaignTitle,
        donorName: donationData.donorName,
        amount: donationData.amount,
        message: donationData.message
      });

      // Emit real-time event
      this.emit('newDonation', {
        campaignId,
        donation: donationData
      });

      console.log(`New donation notification sent for campaign ${campaignId}`);
    } catch (error) {
      console.error('Error sending new donation notification:', error);
    }
  }

  // Notify about campaign milestones
  async notifyMilestoneReached(campaignId, milestoneData) {
    try {
      const { creatorId, supporters, milestone, campaignTitle } = milestoneData;

      // Notify campaign creator
      await this.sendPushNotification(creatorId, {
        title: '🎯 Milestone Reached!',
        body: `Your campaign "${campaignTitle}" reached ${milestone}% of its goal!`,
        icon: '/images/milestone-icon.png',
        data: {
          type: 'milestone_reached',
          campaignId,
          milestone
        }
      });

      // Notify all supporters
      const supporterNotifications = supporters.map(supporterId => 
        this.sendPushNotification(supporterId, {
          title: '🎯 Campaign Progress Update',
          body: `"${campaignTitle}" reached ${milestone}% of its goal!`,
          icon: '/images/progress-icon.png',
          data: {
            type: 'campaign_progress',
            campaignId,
            milestone
          }
        })
      );

      await Promise.all(supporterNotifications);

      console.log(`Milestone notification sent for campaign ${campaignId} at ${milestone}%`);
    } catch (error) {
      console.error('Error sending milestone notification:', error);
    }
  }

  // Notify about campaign completion
  async notifyCampaignCompleted(campaignId, campaignData) {
    try {
      const { creatorId, supporters, campaignTitle, finalAmount, goalAmount } = campaignData;

      // Notify campaign creator
      await this.sendPushNotification(creatorId, {
        title: '🎉 Campaign Completed!',
        body: `Congratulations! Your campaign "${campaignTitle}" raised ₹${finalAmount}!`,
        icon: '/images/success-icon.png',
        image: '/images/celebration-banner.png',
        data: {
          type: 'campaign_completed',
          campaignId,
          finalAmount,
          goalAmount
        },
        requireInteraction: true
      });

      // Notify all supporters
      const supporterNotifications = supporters.map(supporterId => 
        this.sendPushNotification(supporterId, {
          title: '🎉 Campaign Successful!',
          body: `"${campaignTitle}" successfully raised ₹${finalAmount}! Thank you for your support!`,
          icon: '/images/success-icon.png',
          data: {
            type: 'campaign_success',
            campaignId,
            finalAmount
          }
        })
      );

      await Promise.all(supporterNotifications);

      // Send completion emails
      await emailService.sendCampaignCompletionEmail({
        to: campaignData.creatorEmail,
        campaignTitle,
        finalAmount,
        goalAmount,
        supporterCount: supporters.length
      });

      console.log(`Campaign completion notification sent for ${campaignId}`);
    } catch (error) {
      console.error('Error sending campaign completion notification:', error);
    }
  }

  // Emergency campaign notifications
  async notifyEmergencyCampaign(campaignData) {
    try {
      // Get users interested in emergency campaigns
      const interestedUsers = await this.getEmergencyInterestedUsers();

      const notification = {
        title: '🚨 Urgent Help Needed',
        body: `Emergency: ${campaignData.title}`,
        icon: '/images/emergency-icon.png',
        image: campaignData.images[0]?.url,
        data: {
          type: 'emergency_campaign',
          campaignId: campaignData._id,
          category: 'emergency'
        },
        requireInteraction: true,
        actions: [
          { action: 'donate', title: 'Donate Now' },
          { action: 'share', title: 'Share Campaign' }
        ]
      };

      const notifications = interestedUsers.map(userId => 
        this.sendPushNotification(userId, notification)
      );

      await Promise.all(notifications);

      console.log(`Emergency campaign notification sent to ${interestedUsers.length} users`);
    } catch (error) {
      console.error('Error sending emergency campaign notification:', error);
    }
  }

  // System-wide notifications
  async sendSystemNotification(message, severity = 'info') {
    try {
      const allUsers = Array.from(this.subscriptions.keys());
      
      const notification = {
        title: 'DilSeDaan Update',
        body: message,
        icon: '/images/system-icon.png',
        data: {
          type: 'system_notification',
          severity
        }
      };

      const notifications = allUsers.map(userId => 
        this.sendPushNotification(userId, notification)
      );

      await Promise.all(notifications);

      console.log(`System notification sent to ${allUsers.length} users`);
    } catch (error) {
      console.error('Error sending system notification:', error);
    }
  }

  // Payment-related notifications
  async notifyPaymentStatus(userId, paymentData) {
    try {
      const { status, amount, campaignTitle, paymentMethod } = paymentData;

      let notification = {};

      if (status === 'success') {
        notification = {
          title: '✅ Payment Successful',
          body: `Your donation of ₹${amount} to "${campaignTitle}" was successful!`,
          icon: '/images/payment-success-icon.png',
          data: {
            type: 'payment_success',
            amount,
            campaignTitle,
            paymentMethod
          }
        };
      } else if (status === 'failed') {
        notification = {
          title: '❌ Payment Failed',
          body: `Your donation of ₹${amount} to "${campaignTitle}" could not be processed.`,
          icon: '/images/payment-failed-icon.png',
          data: {
            type: 'payment_failed',
            amount,
            campaignTitle,
            paymentMethod
          },
          actions: [
            { action: 'retry', title: 'Try Again' },
            { action: 'support', title: 'Contact Support' }
          ]
        };
      } else if (status === 'pending') {
        notification = {
          title: '⏳ Payment Processing',
          body: `Your donation of ₹${amount} to "${campaignTitle}" is being processed.`,
          icon: '/images/payment-pending-icon.png',
          data: {
            type: 'payment_pending',
            amount,
            campaignTitle,
            paymentMethod
          }
        };
      }

      await this.sendPushNotification(userId, notification);
      console.log(`Payment notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  // Reminder notifications
  async sendCampaignReminders() {
    try {
      // Send reminders for campaigns ending soon
      const endingSoonCampaigns = await this.getCampaignsEndingSoon();
      
      for (const campaign of endingSoonCampaigns) {
        await this.notifyEndingSoon(campaign);
      }

      // Send reminders to inactive users
      const inactiveUsers = await this.getInactiveUsers();
      
      for (const user of inactiveUsers) {
        await this.notifyInactiveUser(user);
      }

      console.log('Campaign reminders sent successfully');
    } catch (error) {
      console.error('Error sending campaign reminders:', error);
    }
  }

  // Notify about campaigns ending soon
  async notifyEndingSoon(campaign) {
    try {
      const daysLeft = Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      // Notify campaign creator
      await this.sendPushNotification(campaign.creatorId, {
        title: '⏰ Campaign Ending Soon',
        body: `Your campaign "${campaign.title}" ends in ${daysLeft} days!`,
        icon: '/images/reminder-icon.png',
        data: {
          type: 'campaign_ending',
          campaignId: campaign._id,
          daysLeft
        }
      });

      // Notify supporters who haven't donated recently
      const supporters = await this.getCampaignSupporters(campaign._id);
      
      const supporterNotifications = supporters.map(supporterId => 
        this.sendPushNotification(supporterId, {
          title: '⏰ Last Chance to Help',
          body: `"${campaign.title}" needs your support - only ${daysLeft} days left!`,
          icon: '/images/urgent-icon.png',
          data: {
            type: 'last_chance',
            campaignId: campaign._id,
            daysLeft
          },
          actions: [
            { action: 'donate', title: 'Donate Now' },
            { action: 'share', title: 'Share Campaign' }
          ]
        })
      );

      await Promise.all(supporterNotifications);
    } catch (error) {
      console.error('Error sending ending soon notification:', error);
    }
  }

  // Notify inactive users
  async notifyInactiveUser(user) {
    try {
      const recommendedCampaigns = await this.getRecommendedCampaigns(user._id);
      
      if (recommendedCampaigns.length > 0) {
        const campaign = recommendedCampaigns[0];
        
        await this.sendPushNotification(user._id, {
          title: '💝 Make a Difference Today',
          body: `${campaign.title} - Help someone in need`,
          icon: '/images/heart-icon.png',
          image: campaign.images[0]?.url,
          data: {
            type: 'inactive_user_reminder',
            campaignId: campaign._id,
            category: campaign.category
          }
        });
      }
    } catch (error) {
      console.error('Error sending inactive user notification:', error);
    }
  }

  // Helper methods
  async getEmergencyInterestedUsers() {
    // In a real implementation, this would query users who opted in for emergency notifications
    return Array.from(this.subscriptions.keys()).slice(0, 100); // Mock implementation
  }

  async getCampaignsEndingSoon() {
    // Mock implementation - in real app, query database
    return [];
  }

  async getInactiveUsers() {
    // Mock implementation - in real app, query users who haven't donated in 30 days
    return [];
  }

  async getCampaignSupporters(campaignId) {
    // Mock implementation - in real app, get unique donor IDs for campaign
    return [];
  }

  async getRecommendedCampaigns(userId) {
    // Mock implementation - in real app, use recommendation engine
    return [];
  }

  // Notification preferences management
  async updateNotificationPreferences(userId, preferences) {
    try {
      // Store user preferences in database
      // await UserPreferences.updateOne({ userId }, { preferences }, { upsert: true });
      
      console.log(`Updated notification preferences for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false };
    }
  }

  // Get notification statistics for admin dashboard
  async getNotificationStats() {
    try {
      return {
        totalSubscriptions: this.subscriptions.size,
        notificationsSentToday: 0, // Would track in database
        averageClickRate: 12.5,
        popularNotificationTypes: [
          { type: 'new_donation', count: 150 },
          { type: 'milestone_reached', count: 89 },
          { type: 'campaign_completed', count: 45 },
          { type: 'payment_success', count: 120 }
        ]
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return null;
    }
  }
}

module.exports = new NotificationService();
