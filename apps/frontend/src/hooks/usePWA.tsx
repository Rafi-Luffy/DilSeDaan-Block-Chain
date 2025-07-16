import { useEffect, useState } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
}

export const usePWA = () => {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false
  });

  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as any)?.standalone || isStandalone;
      
      setPWAState(prev => ({
        ...prev,
        isInstalled: isInStandaloneMode || (isIOS && isInStandaloneMode)
      }));
    };

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setPWAState(prev => ({ ...prev, isInstallable: true }));
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setPWAState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true 
      }));
    };

    // Handle online/offline status
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }));
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          console.log('Service Worker registered:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPWAState(prev => ({ ...prev, updateAvailable: true }));
                }
              });
            }
          });

          // Handle messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type) {
              switch (event.data.type) {
                case 'SW_UPDATE_AVAILABLE':
                  setPWAState(prev => ({ ...prev, updateAvailable: true }));
                  break;
                case 'SW_UPDATED':
                  window.location.reload();
                  break;
              }
            }
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    checkInstalled();
    registerServiceWorker();

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
        setPWAState(prev => ({ 
          ...prev, 
          isInstallable: false, 
          isInstalled: true 
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('App installation failed:', error);
      return false;
    }
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const shareContent = async (data: {
    title: string;
    text: string;
    url: string;
  }) => {
    try {
      if (navigator.share) {
        await navigator.share(data);
        return true;
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${data.title}\n${data.text}\n${data.url}`);
        return true;
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      return false;
    }
  };

  const addToHomeScreen = () => {
    // For iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS && !pwaState.isInstalled) {
      alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen".');
      return true;
    }
    
    return installApp();
  };

  return {
    ...pwaState,
    installApp,
    updateApp,
    shareContent,
    addToHomeScreen
  };
};

// PWA Install Banner Component
export const PWAInstallBanner = () => {
  const { isInstallable, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isInstallable) {
      const hasSeenBanner = localStorage.getItem('pwa-install-banner-seen');
      if (!hasSeenBanner) {
        setTimeout(() => setShowBanner(true), 3000); // Show after 3 seconds
      }
    }
  }, [isInstallable]);

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setShowBanner(false);
      localStorage.setItem('pwa-install-banner-seen', 'true');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-banner-seen', 'true');
  };

  if (!showBanner || !isInstallable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-orange-500 to-green-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-lg">Install DilSeDaan App</h3>
          <p className="text-sm opacity-90">
            Get faster access, offline support, and push notifications!
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleInstall}
            className="bg-white text-orange-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// PWA Update Banner Component
export const PWAUpdateBanner = () => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold">App Update Available</h3>
          <p className="text-sm opacity-90">
            A new version of DilSeDaan is ready to install.
          </p>
        </div>
        
        <button
          onClick={updateApp}
          className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors ml-4"
        >
          Update
        </button>
      </div>
    </div>
  );
};

// Offline Indicator Component
export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center space-x-2">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      <span className="text-sm font-medium">You're offline</span>
    </div>
  );
};
