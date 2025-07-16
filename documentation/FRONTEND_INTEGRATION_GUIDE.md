# 🎨 Frontend Integration Guide - Post-Submission Features

## 📋 Overview

This guide outlines the integration of post-submission backend features into the React frontend application.

## 🏗️ Architecture Overview

```
Frontend (React + TypeScript + Vite)
├── 🔐 Two-Factor Authentication Components
├── 📊 Advanced Analytics Dashboard
├── 📧 Enhanced Email Templates Preview
└── 🛡️ Security Settings Panel
```

## 🔐 Two-Factor Authentication Integration

### 1. Create 2FA Components

#### `components/auth/TwoFactorSetup.tsx`
```typescript
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api';

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete }) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');

  const setupTwoFactor = async () => {
    try {
      const response = await api.post('/api/auth/2fa/setup');
      setQrCode(response.data.qrCodeUrl);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      setStep('verify');
    } catch (error) {
      console.error('2FA setup failed:', error);
    }
  };

  const enableTwoFactor = async () => {
    try {
      await api.post('/api/auth/2fa/enable', {
        token: verificationCode
      });
      setStep('complete');
      onComplete();
    } catch (error) {
      console.error('2FA enable failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'setup' && (
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Set Up Two-Factor Authentication</h3>
          <p className="text-gray-600 mb-6">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          <button
            onClick={setupTwoFactor}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={qrCode} size={200} />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Scan this QR code with your authenticator app
            </p>
            <p className="text-xs text-gray-500">
              Manual entry: {secret}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter 6-digit code from your authenticator app
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <button
              onClick={enableTwoFactor}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Enable 2FA
            </button>
          </div>

          {backupCodes.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Backup Codes</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code key={index} className="bg-white p-2 rounded text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication Enabled</h3>
          <p className="text-gray-600">Your account is now protected with 2FA.</p>
        </div>
      )}
    </div>
  );
};
```

#### `components/auth/TwoFactorVerification.tsx`
```typescript
import React, { useState } from 'react';
import { api } from '@/lib/api';

interface TwoFactorVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onSuccess,
  onCancel
}) => {
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const verifyCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      await api.post('/api/auth/2fa/verify', { token: code });
      onSuccess();
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Two-Factor Authentication</h3>
        <p className="text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <div>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-center text-lg font-mono"
          placeholder="123456"
          maxLength={6}
        />
        {error && (
          <p className="text-red-600 text-sm mt-1">{error}</p>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={verifyCode}
          disabled={isLoading || code.length !== 6}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </div>
  );
};
```

### 2. Security Settings Component

#### `components/settings/SecuritySettings.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';

export const SecuritySettings: React.FC = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [showSetup, setShowSetup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const response = await api.get('/api/auth/2fa/status');
      setTwoFactorEnabled(response.data.enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      const code = prompt('Enter your 2FA code to disable:');
      if (code) {
        await api.post('/api/auth/2fa/disable', { token: code });
        setTwoFactorEnabled(false);
      }
    } catch (error) {
      console.error('Failed to disable 2FA:', error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {twoFactorEnabled ? (
                <button
                  onClick={disableTwoFactor}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Disable
                </button>
              ) : (
                <button
                  onClick={() => setShowSetup(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSetup && (
        <div className="bg-white rounded-lg shadow p-6">
          <TwoFactorSetup
            onComplete={() => {
              setShowSetup(false);
              setTwoFactorEnabled(true);
            }}
          />
        </div>
      )}
    </div>
  );
};
```

## 📊 Advanced Analytics Dashboard

### 1. Analytics Components

#### `components/analytics/AnalyticsDashboard.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MetricsCard } from './MetricsCard';
import { ChartsSection } from './ChartsSection';
import { DataExport } from './DataExport';

interface AnalyticsData {
  overview: {
    totalDonations: number;
    totalCampaigns: number;
    totalUsers: number;
    totalRaised: number;
  };
  trends: any[];
  campaigns: any[];
  donations: any[];
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [overview, campaigns, donations] = await Promise.all([
        api.get(`/api/analytics/overview?timeframe=${timeframe}`),
        api.get(`/api/analytics/campaigns?timeframe=${timeframe}`),
        api.get(`/api/analytics/donations?timeframe=${timeframe}`)
      ]);

      setData({
        overview: overview.data,
        campaigns: campaigns.data,
        donations: donations.data,
        trends: donations.data.trends || []
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timeframeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  if (isLoading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <DataExport timeframe={timeframe} />
        </div>
      </div>

      {data && (
        <>
          <MetricsCard metrics={data.overview} />
          <ChartsSection 
            campaigns={data.campaigns}
            donations={data.donations}
            trends={data.trends}
          />
        </>
      )}
    </div>
  );
};
```

#### `components/analytics/MetricsCard.tsx`
```typescript
import React from 'react';

interface MetricsCardProps {
  metrics: {
    totalDonations: number;
    totalCampaigns: number;
    totalUsers: number;
    totalRaised: number;
  };
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Raised',
      value: `₹${metrics.totalRaised.toLocaleString()}`,
      icon: '💰',
      color: 'bg-green-500'
    },
    {
      title: 'Total Donations',
      value: metrics.totalDonations.toLocaleString(),
      icon: '🎁',
      color: 'bg-blue-500'
    },
    {
      title: 'Active Campaigns',
      value: metrics.totalCampaigns.toLocaleString(),
      icon: '🎯',
      color: 'bg-purple-500'
    },
    {
      title: 'Registered Users',
      value: metrics.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 2. Chart Components

#### `components/analytics/ChartsSection.tsx`
```typescript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ChartsSectionProps {
  campaigns: any[];
  donations: any[];
  trends: any[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ campaigns, donations, trends }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Donation Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Campaign Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaigns.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="raisedAmount" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

## 🔌 API Integration

### 1. Enhanced API Client

#### `lib/api.ts`
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:5001',
  timeout: 10000,
});

// Request interceptor for auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 2FA
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.response?.data?.requires2FA) {
      // Trigger 2FA verification modal
      window.dispatchEvent(new CustomEvent('require2FA', {
        detail: { originalRequest: error.config }
      }));
    }
    return Promise.reject(error);
  }
);

export { api };
```

### 2. Custom Hooks

#### `hooks/useAnalytics.ts`
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export const useAnalytics = (timeframe: string = '30d') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/analytics/overview?timeframe=${timeframe}`);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAnalytics };
};
```

#### `hooks/useTwoFactor.ts`
```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export const useTwoFactor = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/api/auth/2fa/status');
      setEnabled(response.data.enabled);
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const setup = async () => {
    const response = await api.post('/api/auth/2fa/setup');
    return response.data;
  };

  const enable = async (token: string) => {
    await api.post('/api/auth/2fa/enable', { token });
    setEnabled(true);
  };

  const disable = async (token: string) => {
    await api.post('/api/auth/2fa/disable', { token });
    setEnabled(false);
  };

  const verify = async (token: string) => {
    await api.post('/api/auth/2fa/verify', { token });
  };

  return {
    enabled,
    loading,
    setup,
    enable,
    disable,
    verify,
    checkStatus
  };
};
```

## 🎯 Integration Steps

### 1. Install Dependencies
```bash
cd apps/frontend
npm install qrcode.react recharts
npm install @types/qrcode.react --save-dev
```

### 2. Add Routes
```typescript
// In your router configuration
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { SecuritySettings } from '@/components/settings/SecuritySettings';

// Add routes
{
  path: '/admin/analytics',
  element: <AnalyticsDashboard />,
  meta: { requiresAuth: true, role: 'admin' }
},
{
  path: '/settings/security',
  element: <SecuritySettings />,
  meta: { requiresAuth: true }
}
```

### 3. Update Navigation
```typescript
// Add to admin navigation
{
  name: 'Analytics',
  href: '/admin/analytics',
  icon: '📊',
  requiresRole: 'admin'
},
{
  name: 'Security',
  href: '/settings/security',
  icon: '🔐'
}
```

### 4. Environment Variables
```bash
# .env.local
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=DilSeDaan
```

## 🚀 Next Steps

1. **Testing**: Test all components with the backend APIs
2. **Styling**: Apply consistent styling and responsive design
3. **Error Handling**: Implement proper error boundaries and user feedback
4. **Performance**: Add loading states and optimize re-renders
5. **Documentation**: Update user documentation for new features

## 📚 Additional Resources

- [React Query](https://tanstack.com/query/latest) for better data fetching
- [React Hook Form](https://react-hook-form.com/) for form management
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling

This integration guide provides a comprehensive foundation for implementing all post-submission features in the frontend application.
