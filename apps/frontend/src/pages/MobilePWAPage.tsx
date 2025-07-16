import React, { useState, useEffect } from 'react'
import PWAWrapper from '@/components/mobile/PWAWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Bell, 
  Share, 
  Camera, 
  Fingerprint,
  Shield,
  Zap,
  Globe,
  Monitor
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function MobilePWAPage() {
  const { t } = useTranslation()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [activeTab, setActiveTab] = useState('features')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(isStandalone)

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
      }
    }
  }

  const features = [
    {
      icon: Download,
      title: 'Install App',
      description: 'Add DilSeDaan to your home screen for quick access',
      status: isInstalled ? 'Installed' : 'Available',
      color: isInstalled ? 'text-green-600' : 'text-blue-600'
    },
    {
      icon: WifiOff,
      title: 'Offline Support',
      description: 'Browse campaigns and prepare donations even without internet',
      status: 'Active',
      color: 'text-green-600'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get notified about campaign updates and donation receipts',
      status: 'Enabled',
      color: 'text-green-600'
    },
    {
      icon: Share,
      title: 'Native Sharing',
      description: 'Share campaigns directly from the app',
      status: 'Available',
      color: 'text-blue-600'
    },
    {
      icon: Camera,
      title: 'Camera Integration',
      description: 'Scan QR codes for quick donations',
      status: 'Available',
      color: 'text-blue-600'
    },
    {
      icon: Fingerprint,
      title: 'Biometric Auth',
      description: 'Secure login with fingerprint or face recognition',
      status: 'Coming Soon',
      color: 'text-orange-600'
    }
  ]

  const stats = [
    { label: 'App Size', value: '< 5 MB', icon: Download },
    { label: 'Load Time', value: '< 2 sec', icon: Zap },
    { label: 'Offline Pages', value: '15+', icon: WifiOff },
    { label: 'Platform Support', value: '99%', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Mobile & PWA Features
                </h1>
                <p className="text-gray-600 mt-1">
                  Progressive Web App experience for mobile users
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className={isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {!isInstalled && installPrompt && (
                <Button onClick={handleInstallApp}>
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border border-warm-orange/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <stat.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="installation">Install</TabsTrigger>
                <TabsTrigger value="offline">Offline</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Features Tab */}
              <TabsContent value="features">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">PWA Features</CardTitle>
                    <CardDescription>
                      Experience native app-like functionality in your browser
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {features.map((feature, index) => (
                        <div key={index} className="p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <feature.icon className={`h-5 w-5 ${feature.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold">{feature.title}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {feature.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Installation Tab */}
              <TabsContent value="installation">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">App Installation</CardTitle>
                    <CardDescription>
                      Add DilSeDaan to your device for the best experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isInstalled ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-green-600 mb-2">App Installed Successfully!</h3>
                        <p className="text-gray-600">DilSeDaan is now available on your home screen</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Install DilSeDaan App</h3>
                          <p className="text-gray-600 mb-4">Get the full app experience with offline access and push notifications</p>
                          {installPrompt && (
                            <Button size="lg" onClick={handleInstallApp}>
                              <Download className="h-5 w-5 mr-2" />
                              Install Now
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Installation Steps:</h4>
                          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                            <li>Click the "Install Now" button above</li>
                            <li>Confirm the installation in the browser prompt</li>
                            <li>Find the DilSeDaan app icon on your home screen</li>
                            <li>Enjoy the native app experience!</li>
                          </ol>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Offline Tab */}
              <TabsContent value="offline">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">Offline Capabilities</CardTitle>
                    <CardDescription>
                      Continue using DilSeDaan even without internet connection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Available Offline:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Browse cached campaigns</li>
                          <li>• View donation history</li>
                          <li>• Read saved articles and updates</li>
                          <li>• Prepare donation forms (sync when online)</li>
                          <li>• Access help and support pages</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Auto-sync when online:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li>• Submit prepared donations</li>
                          <li>• Update campaign progress</li>
                          <li>• Sync notification preferences</li>
                          <li>• Download latest content</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">Performance Metrics</CardTitle>
                    <CardDescription>
                      Optimized for speed and efficiency on all devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="h-5 w-5 text-warm-orange" />
                            <span className="font-semibold">Load Performance</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">95/100</p>
                          <p className="text-sm text-gray-600">Lighthouse Score</p>
                        </div>

                        <div className="p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <Monitor className="h-5 w-5 text-warm-blue" />
                            <span className="font-semibold">Accessibility</span>
                          </div>
                          <p className="text-2xl font-bold text-green-600">98/100</p>
                          <p className="text-sm text-gray-600">WCAG Compliant</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">First Contentful Paint</span>
                          <span className="font-semibold text-green-600">1.2s</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Time to Interactive</span>
                          <span className="font-semibold text-green-600">2.1s</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cumulative Layout Shift</span>
                          <span className="font-semibold text-green-600">0.08</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* PWA Wrapper Component */}
            <Card className="mt-6 bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Live PWA Features</CardTitle>
                <CardDescription>
                  Interactive demonstration of PWA capabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PWAWrapper>
                  <div className="text-center py-4">
                    <p className="text-gray-600">Interactive PWA features demonstration</p>
                  </div>
                </PWAWrapper>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Device Info */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Device Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{navigator.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">User Agent:</span>
                  <span className="font-medium">{navigator.userAgent.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Online:</span>
                  <Badge variant={isOnline ? 'default' : 'destructive'}>
                    {isOnline ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Installed:</span>
                  <Badge variant={isInstalled ? 'default' : 'outline'}>
                    {isInstalled ? 'Yes' : 'No'}
                  </Badge>
                </div>
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
                  Enable Notifications
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Share App
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>Having trouble with the mobile app?</p>
                <ul className="space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>• Clear browser cache</li>
                  <li>• Contact support</li>
                </ul>
                <Button size="sm" className="w-full mt-3">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
