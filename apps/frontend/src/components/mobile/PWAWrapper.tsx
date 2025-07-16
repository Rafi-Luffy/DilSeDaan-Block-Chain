import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Bell, Wifi, WifiOff, RotateCcw } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if app is already installed (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIosInstalled = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIosInstalled);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => {
          setHasNewUpdate(true);
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleNotificationRequest = async () => {
    if ('Notification' in window && notificationPermission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Subscribe to push notifications
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
          });

          // Send subscription to backend
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ subscription })
          });
        } catch (error) {
          console.error('Error subscribing to push notifications:', error);
        }
      }
    }
  };

  const handleUpdateApp = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const newWorker = registration.waiting;
        
        if (newWorker) {
          newWorker.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('Error updating app:', error);
      }
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            You are offline. Some features may not be available.
          </div>
        </div>
      )}

      {/* Update Available Banner */}
      {hasNewUpdate && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            A new version is available!
            <button
              onClick={handleUpdateApp}
              className="ml-2 px-3 py-1 bg-white text-blue-500 rounded-full text-xs font-bold hover:bg-gray-100"
            >
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <div className="bg-green-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5" />
              <div>
                <div className="font-semibold">Install DilSeDaan App</div>
                <div className="text-sm text-green-100">Get quick access and offline support</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1 bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-100"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="text-green-100 hover:text-white text-sm px-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {notificationPermission === 'default' && isInstalled && (
        <div className="bg-blue-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <div className="font-semibold">Enable Notifications</div>
                <div className="text-sm text-blue-100">Get updates on your donations and campaigns</div>
              </div>
            </div>
            <button
              onClick={handleNotificationRequest}
              className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-gray-100"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Online Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* PWA Install Badge (for iOS Safari) */}
      {showInstallPrompt && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-xl p-4 shadow-lg max-w-sm">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">Install DilSeDaan</div>
              <div className="text-sm text-gray-600 mb-3">
                Tap the share button in Safari and select "Add to Home Screen"
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isInstalled ? 'pt-0' : ''}`}>
        {children}
      </div>

      {/* Mobile App Bar (when installed) */}
      {isInstalled && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/icon-72x72.png" alt="DilSeDaan" className="w-8 h-8 rounded-lg" />
              <div className="font-semibold text-gray-900">DilSeDaan</div>
            </div>
            <div className="flex items-center gap-2">
              {notificationPermission === 'granted' && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Features Detection */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Register service worker
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  }, function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }

            // Handle app launch from home screen
            if (window.matchMedia('(display-mode: standalone)').matches) {
              console.log('Launched from home screen');
              // Track PWA usage
              if (typeof gtag !== 'undefined') {
                gtag('event', 'pwa_launch', {
                  'event_category': 'PWA',
                  'event_label': 'Home Screen Launch'
                });
              }
            }
          `
        }}
      />
    </div>
  );
};

export default PWAWrapper;
