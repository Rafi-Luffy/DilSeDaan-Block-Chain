class PWAService {
    constructor() {
        this.isInstallable = false;
        this.deferredPrompt = null;
        this.installButton = null;
        this.updateAvailable = false;
        this.serviceWorker = null;
    }

    async init() {
        // Check if PWA is already installed
        this.checkInstallationStatus();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Setup install prompt
        this.setupInstallPrompt();
        
        // Setup update notifications
        this.setupUpdateNotifications();
        
        // Setup offline functionality
        this.setupOfflineHandling();
        
        console.log('🚀 PWA Service initialized');
    }

    checkInstallationStatus() {
        // Check if app is in standalone mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = window.navigator.standalone === true;
        
        if (isStandalone || isIOSStandalone) {
            console.log('✅ App is running in standalone mode');
            document.body.classList.add('pwa-installed');
        }
        
        return isStandalone || isIOSStandalone;
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.serviceWorker = registration;
                
                console.log('✅ Service Worker registered:', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.updateAvailable = true;
                                this.showUpdateNotification();
                            }
                        });
                    }
                });
                
                return registration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    setupInstallPrompt() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.isInstallable = true;
            this.showInstallButton();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA was installed');
            this.hideInstallButton();
            this.trackInstallation();
        });
    }

    showInstallButton() {
        // Create install button if it doesn't exist
        if (!this.installButton) {
            this.createInstallButton();
        }
        
        if (this.installButton) {
            this.installButton.style.display = 'block';
            this.installButton.addEventListener('click', () => this.promptInstall());
        }
    }

    createInstallButton() {
        this.installButton = document.createElement('button');
        this.installButton.innerHTML = `
            <span class="icon">📱</span>
            <span class="text">Install App</span>
        `;
        this.installButton.className = 'pwa-install-button';
        this.installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            z-index: 1000;
            display: none;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(this.installButton);
    }

    hideInstallButton() {
        if (this.installButton) {
            this.installButton.style.display = 'none';
        }
    }

    async promptInstall() {
        if (!this.deferredPrompt) return;
        
        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted the install prompt');
            } else {
                console.log('❌ User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallButton();
        } catch (error) {
            console.error('❌ Install prompt error:', error);
        }
    }

    setupUpdateNotifications() {
        // Check for updates periodically
        setInterval(() => {
            if (this.serviceWorker) {
                this.serviceWorker.update();
            }
        }, 60000); // Check every minute
    }

    showUpdateNotification() {
        // Create update notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div class="pwa-update-notification">
                <div class="content">
                    <span class="icon">🔄</span>
                    <span class="message">New version available!</span>
                    <button onclick="window.pwaService.applyUpdate()" class="update-btn">Update</button>
                    <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">Later</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #2196F3;
            color: white;
            padding: 12px;
            text-align: center;
            z-index: 1001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
    }

    async applyUpdate() {
        if (this.serviceWorker && this.serviceWorker.waiting) {
            this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    setupOfflineHandling() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.showConnectionStatus('online');
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.showConnectionStatus('offline');
        });
        
        // Initial status
        if (!navigator.onLine) {
            this.showConnectionStatus('offline');
        }
    }

    showConnectionStatus(status) {
        const existingBanner = document.querySelector('.connection-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        
        const banner = document.createElement('div');
        banner.className = 'connection-banner';
        
        if (status === 'offline') {
            banner.innerHTML = `
                <div style="background: #f44336; color: white; padding: 8px; text-align: center;">
                    📡 You're offline. Some features may be limited.
                </div>
            `;
        } else {
            banner.innerHTML = `
                <div style="background: #4CAF50; color: white; padding: 8px; text-align: center;">
                    ✅ You're back online!
                </div>
            `;
            
            // Remove online banner after 3 seconds
            setTimeout(() => banner.remove(), 3000);
        }
        
        document.body.insertBefore(banner, document.body.firstChild);
    }

    async syncOfflineData() {
        // Sync any offline data when coming back online
        try {
            const offlineData = await this.getOfflineData();
            if (offlineData.length > 0) {
                console.log('🔄 Syncing offline data...');
                await this.uploadOfflineData(offlineData);
                await this.clearOfflineData();
                console.log('✅ Offline data synced');
            }
        } catch (error) {
            console.error('❌ Offline sync error:', error);
        }
    }

    async getOfflineData() {
        // Get data stored offline (implement based on your needs)
        if ('indexedDB' in window) {
            // Return offline donations, campaign data, etc.
            return [];
        }
        return [];
    }

    async uploadOfflineData(data) {
        // Upload offline data to server
        for (const item of data) {
            try {
                await fetch('/api/sync-offline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (error) {
                console.error('Failed to sync item:', error);
            }
        }
    }

    async clearOfflineData() {
        // Clear synced offline data
        if ('indexedDB' in window) {
            // Clear offline storage
        }
    }

    trackInstallation() {
        // Track PWA installation for analytics
        if (window.gtag) {
            window.gtag('event', 'pwa_install', {
                event_category: 'engagement',
                event_label: 'PWA Installation'
            });
        }
    }

    // Utility methods for PWA features
    async shareContent(shareData) {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return true;
            } catch (error) {
                console.error('Share failed:', error);
            }
        }
        
        // Fallback to clipboard
        if (navigator.clipboard && shareData.url) {
            try {
                await navigator.clipboard.writeText(shareData.url);
                this.showToast('Link copied to clipboard!');
                return true;
            } catch (error) {
                console.error('Clipboard failed:', error);
            }
        }
        
        return false;
    }

    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 1002;
            font-size: 14px;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    // Badge API for notifications
    setBadge(count) {
        if ('setAppBadge' in navigator) {
            navigator.setAppBadge(count);
        }
    }

    clearBadge() {
        if ('clearAppBadge' in navigator) {
            navigator.clearAppBadge();
        }
    }

    // Check PWA capabilities
    getCapabilities() {
        return {
            installable: this.isInstallable,
            serviceWorker: 'serviceWorker' in navigator,
            pushNotifications: 'PushManager' in window,
            webShare: 'share' in navigator,
            badging: 'setAppBadge' in navigator,
            fileSystemAccess: 'showOpenFilePicker' in window,
            webPayments: 'PaymentRequest' in window,
            geolocation: 'geolocation' in navigator,
            camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
        };
    }
}

// Initialize PWA service
window.pwaService = new PWAService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.pwaService.init());
} else {
    window.pwaService.init();
}

export default PWAService;
