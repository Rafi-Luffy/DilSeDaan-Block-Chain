import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  QrCode, 
  Download,
  Check,
  X,
  AlertTriangle,
  Fingerprint,
  Mail,
  Clock,
  Settings
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function SecurityPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('2fa')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [qrCodeVisible, setQrCodeVisible] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const backupCodes = [
    'a1b2-c3d4-e5f6',
    'g7h8-i9j0-k1l2',
    'm3n4-o5p6-q7r8',
    's9t0-u1v2-w3x4',
    'y5z6-a7b8-c9d0',
    'e1f2-g3h4-i5j6'
  ]

  const securityFeatures = [
    {
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security with TOTP',
      status: twoFactorEnabled ? 'Enabled' : 'Disabled',
      icon: Smartphone,
      enabled: twoFactorEnabled
    },
    {
      title: 'Email Verification',
      description: 'Verify important actions via email',
      status: 'Enabled',
      icon: Mail,
      enabled: true
    },
    {
      title: 'Login Alerts',
      description: 'Get notified of new login attempts',
      status: 'Enabled',
      icon: Shield,
      enabled: true
    },
    {
      title: 'Biometric Login',
      description: 'Use fingerprint or face recognition',
      status: 'Coming Soon',
      icon: Fingerprint,
      enabled: false
    }
  ]

  const recentActivity = [
    {
      action: 'Password changed',
      timestamp: '2 hours ago',
      location: 'Mumbai, India',
      device: 'Chrome on Windows'
    },
    {
      action: 'Login successful',
      timestamp: '1 day ago',
      location: 'Delhi, India',
      device: 'Mobile App'
    },
    {
      action: '2FA enabled',
      timestamp: '3 days ago',
      location: 'Mumbai, India',
      device: 'Firefox on Mac'
    }
  ]

  const handleEnable2FA = () => {
    setQrCodeVisible(true)
  }

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      setTwoFactorEnabled(true)
      setQrCodeVisible(false)
      setShowBackupCodes(true)
    }
  }

  const SecurityFeatureCard = ({ feature }: { feature: any }) => (
    <Card className="bg-white border border-warm-orange/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              <feature.icon className={`h-5 w-5 ${feature.enabled ? 'text-green-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
          <Badge variant={feature.enabled ? 'default' : 'outline'}>
            {feature.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Security Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your account security and authentication preferences
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Secure Account
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Lock className="h-3 w-3 mr-1" />
              Encrypted Data
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Key className="h-3 w-3 mr-1" />
              TOTP Support
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="2fa">
                  <Smartphone className="h-4 w-4 mr-2" />
                  2FA
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Lock className="h-4 w-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Clock className="h-4 w-4 mr-2" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* 2FA Tab */}
              <TabsContent value="2fa">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                      <Smartphone className="h-5 w-5" />
                      <span>Two-Factor Authentication (2FA)</span>
                    </CardTitle>
                    <CardDescription>
                      Secure your account with an authenticator app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!twoFactorEnabled && !qrCodeVisible && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Smartphone className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Enable Two-Factor Authentication</h3>
                        <p className="text-gray-600 mb-6">
                          Add an extra layer of security to your account with TOTP authentication
                        </p>
                        <Button onClick={handleEnable2FA} size="lg">
                          <Shield className="h-5 w-5 mr-2" />
                          Enable 2FA
                        </Button>
                      </div>
                    )}

                    {qrCodeVisible && !twoFactorEnabled && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>
                          <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <QrCode className="h-24 w-24 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                          </p>
                          <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono">
                            Secret Key: JBSWY3DPEHPK3PXP
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Enter verification code from your app:
                            </label>
                            <Input
                              type="text"
                              placeholder="000000"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              maxLength={6}
                              className="text-center text-lg tracking-wider"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <Button 
                              onClick={handleVerify2FA}
                              disabled={verificationCode.length !== 6}
                              className="flex-1"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Verify & Enable
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setQrCodeVisible(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {twoFactorEnabled && (
                      <div className="space-y-6">
                        <div className="text-center py-4">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-green-600 mb-2">2FA Enabled Successfully!</h3>
                          <p className="text-gray-600">Your account is now protected with two-factor authentication</p>
                        </div>

                        {showBackupCodes && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-orange-800 mb-2">Save Your Backup Codes</h4>
                                <p className="text-sm text-orange-700 mb-4">
                                  Store these codes safely. You can use them to access your account if you lose your phone.
                                </p>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-white p-2 rounded border font-mono text-sm">
                                      {code}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Codes
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setShowBackupCodes(false)}>
                                    I've Saved Them
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <Button variant="outline" className="flex-1">
                            <Key className="h-4 w-4 mr-2" />
                            View Backup Codes
                          </Button>
                          <Button variant="destructive" className="flex-1">
                            <X className="h-4 w-4 mr-2" />
                            Disable 2FA
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                      <Lock className="h-5 w-5" />
                      <span>Password Security</span>
                    </CardTitle>
                    <CardDescription>
                      Manage your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <Input type="password" placeholder="Enter current password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <Input type="password" placeholder="Enter new password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <Input type="password" placeholder="Confirm new password" />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Password Requirements</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Contains uppercase and lowercase letters</li>
                        <li>• Contains at least one number</li>
                        <li>• Contains at least one special character</li>
                      </ul>
                    </div>

                    <Button>
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                      <Clock className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                    <CardDescription>
                      Monitor your account activity and security events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-gray-600">
                                {activity.location} • {activity.device}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{activity.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                      <Settings className="h-5 w-5" />
                      <span>Advanced Security</span>
                    </CardTitle>
                    <CardDescription>
                      Advanced security settings and configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">                        <div className="flex items-center justify-between p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                          <div>
                            <h4 className="font-medium">Session Timeout</h4>
                            <p className="text-sm text-gray-600">Automatically log out after inactivity</p>
                          </div>
                        <select className="border rounded px-3 py-1">
                          <option>30 minutes</option>
                          <option>1 hour</option>
                          <option>4 hours</option>
                          <option>Never</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                        <div>
                          <h4 className="font-medium">Login Notifications</h4>
                          <p className="text-sm text-gray-600">Email notifications for new logins</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                        <div>
                          <h4 className="font-medium">API Access</h4>
                          <p className="text-sm text-gray-600">Allow third-party API access</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button variant="destructive">
                        <X className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Status */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <SecurityFeatureCard key={index} feature={feature} />
                ))}
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Security Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Use a unique, strong password</p>
                <p>• Enable two-factor authentication</p>
                <p>• Keep your authenticator app secure</p>
                <p>• Don't share backup codes</p>
                <p>• Review activity regularly</p>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>Having trouble with security settings?</p>
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
