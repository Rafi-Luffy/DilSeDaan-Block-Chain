import React, { useEffect } from 'react';
import { PWAInstallBanner, PWAUpdateBanner, OfflineIndicator } from '../hooks/usePWA';
import { PushNotificationSetup } from '../hooks/usePushNotifications';

interface EnhancedAppWrapperProps {
  children: React.ReactNode;
}

export const EnhancedAppWrapper: React.FC<EnhancedAppWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered: ', registration);
        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      });
    }
  }, []);

  return (
    <div className="enhanced-app-wrapper">
      {/* Main app content */}
      {children}
      
      {/* PWA Features */}
      <PWAInstallBanner />
      <PWAUpdateBanner />
      <OfflineIndicator />
      
      {/* Enhanced Features Notification */}
      <EnhancedFeaturesNotification />
    </div>
  );
};

const EnhancedFeaturesNotification: React.FC = () => {
  const [showNotification, setShowNotification] = React.useState(false);
  const [hasSeenEnhancements, setHasSeenEnhancements] = React.useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('enhanced-features-seen');
    if (!seen) {
      setTimeout(() => setShowNotification(true), 5000);
    } else {
      setHasSeenEnhancements(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowNotification(false);
    localStorage.setItem('enhanced-features-seen', 'true');
    setHasSeenEnhancements(true);
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg p-6 z-50 animate-slide-in">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-lg mb-2">🎉 Platform Enhanced!</h3>
          <div className="text-sm space-y-1 mb-4">
            <div className="flex items-center space-x-2">
              <span>📧</span>
              <span>Email verification system</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔐</span>
              <span>Two-factor authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📊</span>
              <span>Advanced analytics dashboard</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔔</span>
              <span>Push notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>💳</span>
              <span>Multiple payment gateways</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📱</span>
              <span>PWA & offline support</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowNotification(false)}
              className="bg-white text-purple-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Explore Now
            </button>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white ml-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Enhanced settings page component
export const EnhancedSettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Enhanced Settings</h1>
        
        {/* Push Notifications Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Push Notifications</h2>
          <PushNotificationSetup />
        </div>
        
        {/* Security Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <TwoFactorAuthSetup />
        </div>
        
        {/* Email Verification Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Email Verification</h2>
          <EmailVerificationStatus />
        </div>
        
        {/* Analytics Preferences */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Analytics & Privacy</h2>
          <AnalyticsPreferences />
        </div>
      </div>
    </div>
  );
};

const TwoFactorAuthSetup: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const check2FAStatus = async () => {
    try {
      const response = await fetch('/api/2fa/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    }
  };

  useEffect(() => {
    check2FAStatus();
  }, []);

  const handle2FASetup = async () => {
    setIsLoading(true);
    try {
      // Redirect to 2FA setup page or open modal
      window.location.href = '/settings/2fa-setup';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600">
            Add an extra layer of security to your account
          </p>
          {is2FAEnabled && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              Enabled
            </span>
          )}
        </div>
        
        <button
          onClick={handle2FASetup}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            is2FAEnabled
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? 'Loading...' : is2FAEnabled ? 'Manage' : 'Setup'}
        </button>
      </div>
    </div>
  );
};

const EmailVerificationStatus: React.FC = () => {
  const [isVerified, setIsVerified] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const checkEmailStatus = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.emailVerified);
      }
    } catch (error) {
      console.error('Failed to check email verification status:', error);
    }
  };

  useEffect(() => {
    checkEmailStatus();
  }, []);

  const sendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Verification email sent! Check your inbox.');
      } else {
        alert('Failed to send verification email.');
      }
    } catch (error) {
      alert('Error sending verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Email Verification</h3>
          <p className="text-sm text-gray-600">
            Verify your email address to secure your account
          </p>
          {isVerified ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
              Pending
            </span>
          )}
        </div>
        
        {!isVerified && (
          <button
            onClick={sendVerificationEmail}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send Verification'}
          </button>
        )}
      </div>
    </div>
  );
};

const AnalyticsPreferences: React.FC = () => {
  const [preferences, setPreferences] = React.useState({
    allowAnalytics: true,
    shareAnonymousData: true,
    trackDonationBehavior: true,
    receiveInsights: true
  });

  const updatePreferences = async (newPreferences: typeof preferences) => {
    try {
      const response = await fetch('/api/analytics/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      });
      
      if (response.ok) {
        setPreferences(newPreferences);
      }
    } catch (error) {
      console.error('Failed to update analytics preferences:', error);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <h3 className="font-medium">Analytics & Data Sharing</h3>
      
      {Object.entries(preferences).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <label className="text-sm text-gray-700 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </label>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => {
              const newPreferences = { ...preferences, [key]: e.target.checked };
              updatePreferences(newPreferences);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ))}
    </div>
  );
};
