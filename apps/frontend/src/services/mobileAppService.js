// Enhanced Mobile App Service for Progressive Web App features
const mobileAppService = {
  // Check if device supports PWA installation
  isPWASupported() {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
  },

  // Handle PWA installation prompt
  async handleInstallPrompt() {
    let deferredPrompt = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallButton();
    });

    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`PWA install outcome: ${outcome}`);
          deferredPrompt = null;
          this.hideInstallButton();
        }
      });
    }
  },

  // Show install button for PWA
  showInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'block';
    }
  },

  // Hide install button
  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  },

  // Check if PWA is already installed
  isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  // Push notification support
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Send local notification
  sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-72x72.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  },

  // Register for push notifications
  async registerPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlB64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY)
        });

        // Send subscription to backend
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(subscription)
        });

        return subscription;
      } catch (error) {
        console.error('Error registering push notifications:', error);
        return null;
      }
    }
  },

  // Utility function for VAPID key conversion
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  // Offline capability check
  isOnline() {
    return navigator.onLine;
  },

  // Handle offline/online events
  setupOfflineHandler() {
    window.addEventListener('online', () => {
      console.log('App is online');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.showOfflineMessage();
    });
  },

  // Sync offline data when coming back online
  async syncOfflineData() {
    const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
      } catch (error) {
        console.error('Error syncing offline action:', error);
      }
    }

    localStorage.removeItem('offlineActions');
  },

  // Show offline message
  showOfflineMessage() {
    const offlineMessage = document.createElement('div');
    offlineMessage.id = 'offline-message';
    offlineMessage.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50';
    offlineMessage.textContent = 'You are offline. Some features may not be available.';
    document.body.appendChild(offlineMessage);
  },

  // Hide offline message
  hideOfflineMessage() {
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) {
      offlineMessage.remove();
    }
  },

  // Cache management for PWA
  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  },

  // Update service worker
  async updateServiceWorker() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      return registration.update();
    }
  },

  // Initialize mobile app features
  async initialize() {
    if (this.isPWASupported()) {
      await this.handleInstallPrompt();
      await this.requestNotificationPermission();
      await this.registerPushNotifications();
      this.setupOfflineHandler();
      
      if (this.isOnline()) {
        this.hideOfflineMessage();
      } else {
        this.showOfflineMessage();
      }
    }
  }
};

export default mobileAppService;
