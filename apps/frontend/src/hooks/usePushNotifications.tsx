import { useEffect, useState } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
}

export const usePushNotifications = () => {
  const [notificationState, setNotificationState] = useState<PushNotificationState>({
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    isSubscribed: false,
    permission: 'default'
  });

  useEffect(() => {
    if (!notificationState.isSupported) return;

    const checkPermission = () => {
      setNotificationState(prev => ({
        ...prev,
        permission: Notification.permission
      }));
    };

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setNotificationState(prev => ({
          ...prev,
          isSubscribed: !!subscription
        }));
      } catch (error) {
        console.error('Error checking push subscription:', error);
      }
    };

    checkPermission();
    checkSubscription();
  }, [notificationState.isSupported]);

  const requestPermission = async (): Promise<boolean> => {
    if (!notificationState.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setNotificationState(prev => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async (): Promise<boolean> => {
    if (!notificationState.isSupported || notificationState.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      // Send subscription to backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription,
          preferences: {
            donations: true,
            campaigns: true,
            updates: true
          }
        })
      });

      if (response.ok) {
        setNotificationState(prev => ({ ...prev, isSubscribed: true }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!notificationState.isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify backend
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        setNotificationState(prev => ({ ...prev, isSubscribed: false }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };

  return {
    ...notificationState,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  };
};

// Push Notification Setup Component
export const PushNotificationSetup = () => {
  const {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800">Push Notifications Not Supported</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Your browser doesn't support push notifications.
        </p>
      </div>
    );
  }

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      let hasPermission = permission === 'granted';
      
      if (permission === 'default') {
        hasPermission = await requestPermission();
      }
      
      if (hasPermission) {
        const subscribed = await subscribeToPush();
        if (subscribed) {
          alert('Push notifications enabled! You\'ll receive updates about your donations and campaigns.');
        } else {
          alert('Failed to enable push notifications. Please try again.');
        }
      } else {
        alert('Push notifications permission denied. You can enable it in your browser settings.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    
    try {
      const unsubscribed = await unsubscribeFromPush();
      if (unsubscribed) {
        alert('Push notifications disabled.');
      } else {
        alert('Failed to disable push notifications.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    const sent = await sendTestNotification();
    if (sent) {
      alert('Test notification sent! Check your notifications.');
    } else {
      alert('Failed to send test notification.');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">Push Notifications</h3>
          <p className="text-sm text-gray-600">
            Get notified about donation updates, campaign milestones, and more.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {permission === 'granted' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Permission Granted
            </span>
          )}
          
          {isSubscribed && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Subscribed
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-2 px-4 rounded-md hover:from-orange-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Enable Push Notifications'}
          </button>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleTest}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Send Test Notification
            </button>
            
            <button
              onClick={handleUnsubscribe}
              disabled={isLoading}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Disabling...' : 'Disable Notifications'}
            </button>
          </div>
        )}
      </div>

      {permission === 'denied' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            Push notifications are blocked. To enable them:
            <br />
            1. Click the lock icon in your address bar
            <br />
            2. Set Notifications to "Allow"
            <br />
            3. Refresh this page
          </p>
        </div>
      )}
    </div>
  );
};
