import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Target, Activity, Bell, Download, Filter } from 'lucide-react';

interface AnalyticsData {
  totalDonations: number;
  totalCampaigns: number;
  totalUsers: number;
  conversionRate: number;
  realtimeUsers: number;
  recentActivity: Array<{
    id: string;
    type: 'donation' | 'campaign' | 'user';
    message: string;
    timestamp: string;
    amount?: number;
  }>;
  dailyStats: Array<{
    date: string;
    donations: number;
    campaigns: number;
    users: number;
    revenue: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  topCampaigns: Array<{
    id: string;
    title: string;
    raised: number;
    goal: number;
    donors: number;
    completion: number;
  }>;
}

const RealTimeAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
    
    let interval: NodeJS.Timeout;
    if (realTimeEnabled) {
      interval = setInterval(loadAnalyticsData, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTimeframe, realTimeEnabled]);

  const loadAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${selectedTimeframe}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'campaign':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <Users className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into platform performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          {/* Real-time Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="realtime"
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
              className="rounded text-blue-600"
            />
            <label htmlFor="realtime" className="text-sm text-gray-700 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Real-time updates
            </label>
          </div>

          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => exportData('csv')}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportData('pdf')}
              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalDonations)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5% from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalCampaigns)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.2% from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalUsers)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+15.7% from last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate}%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Real-time users: {analyticsData.realtimeUsers}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analyticsData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  {activity.amount && (
                    <p className="text-sm font-medium text-green-600">{formatCurrency(activity.amount)}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Categories</h3>
          
          <div className="space-y-4">
            {analyticsData.categoryBreakdown.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{category.count} campaigns</span>
                  <span>{formatCurrency(category.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Campaigns</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Campaign</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Raised</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Goal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Donors</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{campaign.title}</div>
                  </td>
                  <td className="py-3 px-4 text-green-600 font-medium">
                    {formatCurrency(campaign.raised)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatCurrency(campaign.goal)}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatNumber(campaign.donors)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(campaign.completion, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{Math.round(campaign.completion)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAnalyticsDashboard;
