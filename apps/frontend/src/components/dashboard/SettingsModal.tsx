import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  Mail,
  Globe,
  Lock,
  CreditCard,
  FileText,
  Settings as SettingsIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: any
  onUpdateProfile: (updates: any) => void
  onUpdatePreferences: (preferences: any) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onUpdatePreferences
}) => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    bio: userProfile?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState(userProfile?.preferences || {
    emailNotifications: true,
    smsNotifications: true,
    donationReminders: true,
    impactReports: true,
    newsletter: true,
    publicProfile: false,
    twoFactorAuth: false,
    dataSharing: false,
    marketingEmails: false
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Name is required')
      }
      if (!formData.email.trim()) {
        throw new Error('Email is required')
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      onUpdateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio
      })

      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been saved successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      
      onUpdatePreferences(preferences)

      toast({
        title: 'Preferences Saved',
        description: 'Your notification preferences have been updated.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save preferences',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive'
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.'
      })
      
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (confirmed) {
      toast({
        title: 'Account Deletion Requested',
        description: 'We have received your request. You will receive a confirmation email shortly.',
        variant: 'destructive'
      })
    }
  }

  const downloadData = (type: 'all' | 'donations' | 'profile') => {
    toast({
      title: 'Download Started',
      description: `Your ${type} data is being prepared for download.`
    })
    // Simulate download
    setTimeout(() => {
      toast({
        title: 'Download Ready',
        description: `Your ${type} data has been downloaded.`
      })
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warm-orange/10 rounded-lg flex items-center justify-center">
                <SettingsIcon className="h-5 w-5 text-warm-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-warm-charcoal">Account Settings</h2>
                <p className="text-sm text-warm-charcoal/70">Manage your account preferences and security</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 p-1 m-4 bg-gray-100">
                <TabsTrigger value="profile" className="data-[state=active]:bg-white">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="data-[state=active]:bg-white">
                  <Lock className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="data" className="data-[state=active]:bg-white">
                  <Download className="h-4 w-4 mr-2" />
                  Data
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and profile information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-warm-charcoal font-medium">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-warm-charcoal font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                          className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-warm-charcoal font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-warm-charcoal font-medium">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Enter your location"
                          className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-warm-charcoal font-medium">Bio</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-warm-orange/30 bg-white text-warm-charcoal placeholder:text-gray-500"
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-warm-orange hover:bg-warm-orange/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-warm-charcoal font-medium">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                          className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-warm-charcoal font-medium">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-warm-charcoal font-medium">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="bg-white border-gray-300 text-warm-charcoal placeholder:text-gray-500 focus:border-warm-orange focus:ring-warm-orange"
                      />
                    </div>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="bg-warm-orange hover:bg-warm-orange/90"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Enable 2FA</h4>
                        <p className="text-sm text-gray-600">Use your phone to verify login attempts</p>
                      </div>
                      <Switch
                        checked={preferences.twoFactorAuth}
                        onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, twoFactorAuth: checked })}
                      />
                    </div>
                    {preferences.twoFactorAuth && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          Two-factor authentication is enabled. You'll receive a code via SMS when logging in.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified about account activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-warm-orange" />
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, emailNotifications: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-warm-orange" />
                          <div>
                            <h4 className="font-medium">SMS Notifications</h4>
                            <p className="text-sm text-gray-600">Receive updates via text message</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.smsNotifications}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, smsNotifications: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="h-5 w-5 text-warm-orange" />
                          <div>
                            <h4 className="font-medium">Donation Reminders</h4>
                            <p className="text-sm text-gray-600">Remind me to make regular donations</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.donationReminders}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, donationReminders: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-warm-orange" />
                          <div>
                            <h4 className="font-medium">Impact Reports</h4>
                            <p className="text-sm text-gray-600">Monthly reports on your donation impact</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.impactReports}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, impactReports: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-warm-orange" />
                          <div>
                            <h4 className="font-medium">Newsletter</h4>
                            <p className="text-sm text-gray-600">Stay updated with our latest news and campaigns</p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences.newsletter}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, newsletter: checked })}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                      className="bg-warm-orange hover:bg-warm-orange/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Control how your information is shared and used</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Public Profile</h4>
                          <p className="text-sm text-gray-600">Allow others to see your donation activity</p>
                        </div>
                        <Switch
                          checked={preferences.publicProfile}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, publicProfile: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Data Sharing</h4>
                          <p className="text-sm text-gray-600">Share anonymized data for impact research</p>
                        </div>
                        <Switch
                          checked={preferences.dataSharing}
                          onCheckedChange={(checked: boolean) => setPreferences({ ...preferences, dataSharing: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Marketing Emails</h4>
                          <p className="text-sm text-gray-600">Receive promotional content and offers</p>
                        </div>
                        <Switch
                          checked={preferences.marketingEmails}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, marketingEmails: checked })}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Your Privacy Rights</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Right to access your personal data</li>
                        <li>• Right to correct inaccurate data</li>
                        <li>• Right to delete your account and data</li>
                        <li>• Right to data portability</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleSavePreferences}
                      disabled={isLoading}
                      className="bg-warm-orange hover:bg-warm-orange/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Privacy Settings'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data" className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                    <CardDescription>Download your data in various formats</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => downloadData('profile')}
                        className="p-4 h-auto flex-col items-start border-warm-orange/30"
                      >
                        <User className="h-6 w-6 text-warm-orange mb-2" />
                        <h4 className="font-medium">Profile Data</h4>
                        <p className="text-xs text-gray-600">Personal information and settings</p>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => downloadData('donations')}
                        className="p-4 h-auto flex-col items-start border-warm-orange/30"
                      >
                        <CreditCard className="h-6 w-6 text-warm-orange mb-2" />
                        <h4 className="font-medium">Donation History</h4>
                        <p className="text-xs text-gray-600">All your donation records</p>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => downloadData('all')}
                        className="p-4 h-auto flex-col items-start border-warm-orange/30"
                      >
                        <Download className="h-6 w-6 text-warm-orange mb-2" />
                        <h4 className="font-medium">Complete Data</h4>
                        <p className="text-xs text-gray-600">Everything associated with your account</p>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions that will affect your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <h4 className="font-medium text-red-900">Delete Account</h4>
                          <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
