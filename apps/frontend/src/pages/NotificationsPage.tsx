import React, { useState } from 'react'
import AdvancedNotificationCenter from '@/components/notifications/AdvancedNotificationCenter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Settings, Filter, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function NotificationsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('all')
  const [unreadCount, setUnreadCount] = useState(12)

  const notifications = [
    {
      id: 1,
      type: 'donation',
      title: 'New donation received',
      message: 'You received a donation of ₹5,000 for "Help Build School"',
      time: '2 minutes ago',
      isRead: false,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'campaign',
      title: 'Campaign milestone reached',
      message: 'Your campaign "Medical Emergency" reached 75% of its goal',
      time: '1 hour ago',
      isRead: false,
      icon: AlertCircle,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'system',
      title: 'Payment processed',
      message: 'Your donation of ₹2,000 to "Flood Relief" was successful',
      time: '3 hours ago',
      isRead: true,
      icon: Info,
      color: 'text-gray-600'
    },
    {
      id: 4,
      type: 'update',
      title: 'Campaign update posted',
      message: 'New update available for "Animal Rescue Center"',
      time: '5 hours ago',
      isRead: false,
      icon: Info,
      color: 'text-purple-600'
    },
    {
      id: 5,
      type: 'reminder',
      title: 'Follow-up reminder',
      message: 'Follow up on your donation to "Children Education Fund"',
      time: '1 day ago',
      isRead: true,
      icon: AlertCircle,
      color: 'text-orange-600'
    }
  ]

  const getNotificationsByType = (type: string) => {
    if (type === 'all') return notifications
    if (type === 'unread') return notifications.filter(n => !n.isRead)
    return notifications.filter(n => n.type === type)
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  const NotificationItem = ({ notification }: { notification: any }) => (
    <div className={`p-4 border-l-4 ${notification.isRead ? 'border-gray-200' : 'border-blue-500'} ${notification.isRead ? 'bg-white' : 'bg-blue-50'} rounded-lg mb-3`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${notification.isRead ? 'bg-gray-100' : 'bg-white'}`}>
          <notification.icon className={`h-4 w-4 ${notification.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-2">
              {!notification.isRead && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  New
                </Badge>
              )}
              <span className="text-xs text-gray-500">{notification.time}</span>
            </div>
          </div>
          <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
            {notification.message}
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Button size="sm" variant="outline">
              <Check className="h-3 w-3 mr-1" />
              Mark as read
            </Button>
            <Button size="sm" variant="ghost">
              <X className="h-3 w-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('notifications.title')}
                </h1>
                <p className="text-gray-600 mt-1">
                  Stay updated with your campaigns and donations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                {unreadCount} unread
              </Badge>
              <Button variant="outline" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Notification Center */}
          <div className="lg:col-span-3">
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-warm-charcoal">Notification Center</CardTitle>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="donation">Donations</TabsTrigger>
                    <TabsTrigger value="campaign">Campaigns</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="update">Updates</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-6">
                    <div className="space-y-4">
                      {getNotificationsByType(activeTab).map((notification) => (
                        <NotificationItem key={notification.id} notification={notification} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Advanced Notification Component */}
            <Card className="mt-6 bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Real-time Notifications</CardTitle>
                <CardDescription>
                  Live notification feed with advanced features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedNotificationCenter />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Notification Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unread</span>
                  <span className="font-semibold text-blue-600">{unreadCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This week</span>
                  <span className="font-semibold">23</span>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push notifications</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS alerts</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Campaign updates</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <Button size="sm" className="w-full mt-4">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Subscribe to updates
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage subscriptions
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Check className="h-4 w-4 mr-2" />
                  Archive old notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
