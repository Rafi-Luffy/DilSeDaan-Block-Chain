import React, { useState } from 'react'
import RealTimeAnalyticsDashboard from '@/components/analytics/RealTimeAnalyticsDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function AnalyticsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('realtime')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('analytics.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('analytics.subtitle')}
              </p>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              Real-time Analytics
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Users className="h-3 w-3 mr-1" />
              AI-Powered Insights
            </Badge>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="realtime" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Real-time</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Financial</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
          </TabsList>

          {/* Real-time Analytics */}
          <TabsContent value="realtime" className="space-y-6">
            <RealTimeAnalyticsDashboard />
          </TabsContent>

          {/* Campaign Analytics */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Active Campaigns</CardTitle>
                  <BarChart3 className="h-4 w-4 text-warm-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-warm-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.3%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Avg. Goal Achievement</CardTitle>
                  <DollarSign className="h-4 w-4 text-warm-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">134%</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Campaign Performance Trends</CardTitle>
                <CardDescription>
                  Track how campaigns are performing over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Campaign performance charts will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Analytics */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Total Donations</CardTitle>
                  <DollarSign className="h-4 w-4 text-warm-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹45,67,892</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Platform Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-warm-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹1,14,197</div>
                  <p className="text-xs text-muted-foreground">
                    2.5% platform fee
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Avg. Donation</CardTitle>
                  <BarChart3 className="h-4 w-4 text-warm-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Refund Rate</CardTitle>
                  <Activity className="h-4 w-4 text-warm-terracotta" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.8%</div>
                  <p className="text-xs text-muted-foreground">
                    -0.2% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Financial Overview</CardTitle>
                <CardDescription>
                  Monthly donation trends and revenue breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Financial charts and graphs will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Analytics */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-warm-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12,487</div>
                  <p className="text-xs text-muted-foreground">
                    +180 new this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Active Donors</CardTitle>
                  <Activity className="h-4 w-4 text-warm-green" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3,247</div>
                  <p className="text-xs text-muted-foreground">
                    26% of total users
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-warm-orange/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-warm-charcoal">Retention Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-warm-orange" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">73%</div>
                  <p className="text-xs text-muted-foreground">
                    30-day retention
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">User Engagement</CardTitle>
                <CardDescription>
                  User activity patterns and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  User engagement charts will be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
