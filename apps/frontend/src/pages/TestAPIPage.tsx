import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function TestAPIPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Test auth store
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const testCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.campaign.getAll();
      console.log('API Response:', response);
      
      if (response.data?.success) {
        setCampaigns(response.data.data.campaigns || []);
      } else {
        setError('Failed to fetch campaigns');
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await login('testfrontend@example.com', 'testpass123');
      if (!success) {
        setError('Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const testAdminLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await login('platformadmin@dilsedaan.org', 'admin123456');
      if (!success) {
        setError('Admin login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Admin login error');
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health`);
      const data = await response.json();
      console.log('Health check:', data);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const testAdminDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.admin.getDashboard();
      console.log('Admin Dashboard Response:', response);
      
      if (response.data?.success) {
        console.log('Admin Dashboard Data:', response.data.data);
      } else {
        setError('Failed to fetch admin dashboard');
      }
    } catch (err: any) {
      console.error('Admin Dashboard Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
        
        {/* Auth Test Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
          
          {isAuthenticated ? (
            <div>
              <p className="mb-4">✅ Logged in as: <strong>{user?.name}</strong> ({user?.email})</p>
              <Button onClick={logout} variant="outline">Logout</Button>
            </div>
          ) : (
            <div>
              <p className="mb-4">❌ Not logged in</p>
              <Button onClick={testLogin} disabled={loading}>
                {loading ? 'Logging in...' : 'Test Login'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Campaign API Test Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Campaign API Test</h2>
          <Button onClick={testCampaigns} disabled={loading}>
            {loading ? 'Loading...' : 'Test Campaign API'}
          </Button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          {campaigns.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Campaigns ({campaigns.length}):</h3>
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <div key={campaign._id} className="p-3 bg-gray-50 rounded border">
                    <h4 className="font-medium">{campaign.title}</h4>
                    <p className="text-sm text-gray-600">{campaign.description}</p>
                    <p className="text-xs text-gray-500">
                      Target: ₹{campaign.targetAmount?.toLocaleString()} | 
                      Raised: ₹{campaign.raisedAmount?.toLocaleString()} | 
                      Status: {campaign.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Admin Test Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin Test</h2>
          
          <div className="space-y-3">
            <Button onClick={testAdminLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Test Admin Login'}
            </Button>
            
            <Button onClick={testAdminDashboard} disabled={loading}>
              {loading ? 'Loading...' : 'Test Admin Dashboard'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestAPIPage;
