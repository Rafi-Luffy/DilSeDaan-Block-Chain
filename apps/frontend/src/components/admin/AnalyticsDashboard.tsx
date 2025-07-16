import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Activity, Download, Eye, Target } from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalDonations: number;
    totalCampaigns: number;
    totalUsers: number;
    totalRaised: number;
    activeUsers: number;
    conversionRate: number;
    averageDonation: number;
    topCampaigns: Array<{
      id: string;
      title: string;
      raised: number;
      target: number;
      progress: number;
    }>;
  };
  trends: Array<{
    date: string;
    donations: number;
    amount: number;
    users: number;
  }>;
  campaigns: Array<{
    id: string;
    title: string;
    category: string;
    raisedAmount: number;
    targetAmount: number;
    donorCount: number;
    progress: number;
  }>;
  donations: Array<{
    date: string;
    amount: number;
    campaign: string;
    donor: string;
  }>;
  realTimeMetrics: {
    todayDonations: number;
    todayAmount: number;
    onlineUsers: number;
    recentActivity: Array<{
      type: string;
      message: string;
      timestamp: string;
    }>;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchRealTimeMetrics();
    
    // Set up real-time updates
    const interval = setInterval(fetchRealTimeMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [overview, campaigns, donations] = await Promise.all([
        api.analytics.getOverview(timeframe),
        api.analytics.getCampaigns(timeframe),
        api.analytics.getDonations(timeframe)
      ]);

      setData({
        overview: overview.data,
        campaigns: campaigns.data,
        donations: donations.data,
        trends: donations.data.trends || [],
        realTimeMetrics: {
          todayDonations: 0,
          todayAmount: 0,
          onlineUsers: 0,
          recentActivity: []
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRealTimeMetrics = async () => {
    try {
      const response = await api.analytics.getRealTimeMetrics();
      setRealTimeData(response.data);
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
    }
  };

  const exportData = async (type: string, format: string) => {
    try {
      const blob = await api.analytics.exportData(type, format, timeframe);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dilsedaan-${type}-${format}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const timeframeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' }
  ];

  const colors = ['#f97316', '#16a34a', '#3b82f6', '#8b5cf6', '#ef4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your platform's performance and impact</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => exportData('overview', 'csv')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Real-time Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{realTimeData.todayDonations}</div>
                <div className="text-sm text-gray-600">Today's Donations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">₹{realTimeData.todayAmount?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Today's Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{realTimeData.onlineUsers}</div>
                <div className="text-sm text-gray-600">Online Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Raised</p>
                      <p className="text-2xl font-bold text-green-600">₹{data.overview.totalRaised.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Donations</p>
                      <p className="text-2xl font-bold text-blue-600">{data.overview.totalDonations.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                      <p className="text-2xl font-bold text-purple-600">{data.overview.totalCampaigns.toLocaleString()}</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-orange-600">{data.overview.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Donation Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="donations" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.overview.topCampaigns?.slice(0, 5).map((campaign, index) => (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{campaign.title}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${campaign.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{campaign.progress.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₹{campaign.raised.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">of ₹{campaign.target.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.campaigns.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="raisedAmount" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.campaigns.reduce((acc, campaign) => {
                        const existing = acc.find(item => item.name === campaign.category);
                        if (existing) {
                          existing.value += campaign.raisedAmount;
                        } else {
                          acc.push({ name: campaign.category, value: campaign.raisedAmount });
                        }
                        return acc;
                      }, [] as Array<{ name: string; value: number }>)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.campaigns.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.donations.slice(0, 10).map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{donation.campaign}</div>
                        <div className="text-sm text-gray-600">{donation.donor}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{donation.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{new Date(donation.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Users</span>
                      <Badge variant="secondary">{data.overview.activeUsers || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <Badge variant="secondary">{(data.overview.conversionRate || 0).toFixed(2)}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Donation</span>
                      <Badge variant="secondary">₹{(data.overview.averageDonation || 0).toLocaleString()}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
