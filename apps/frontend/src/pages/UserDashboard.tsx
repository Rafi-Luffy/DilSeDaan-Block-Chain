import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Download, 
  Share2, 
  Settings, 
  Bell, 
  CreditCard, 
  Award, 
  BarChart3, 
  FileText, 
  Shield, 
  Globe, 
  Users, 
  Target, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Eye, 
  Trash2, 
  Filter, 
  Search, 
  RefreshCw, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Star, 
  Gift, 
  Bookmark, 
  MessageSquare, 
  Link, 
  ExternalLink,
  PieChart,
  LineChart,
  BarChart,
  Activity,
  Zap,
  Crown,
  Medal,
  Trophy,
  Coins,
  Calculator,
  Upload,
  Save,
  Copy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { useDonationStore } from '@/store/donationStore'
import { useAuthStore } from '@/store/authStore'
import { useTranslation } from 'react-i18next'
import { SettingsModal } from '@/components/dashboard/SettingsModal'
import { NotificationsModal } from '@/components/dashboard/NotificationsModal'

// Types for dashboard data
interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  memberSince: Date
  avatar: string
  bio: string
  donationGoal: number
  achievements: Achievement[]
  preferences: UserPreferences
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  level: 'bronze' | 'silver' | 'gold' | 'platinum'
}

interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  donationReminders: boolean
  impactReports: boolean
  newsletter: boolean
  publicProfile: boolean
}

interface DonationAnalytics {
  totalDonated: number
  donationCount: number
  averageDonation: number
  monthlyGrowth: number
  favoriteCategory: string
  impactScore: number
  monthlyData: { month: string; amount: number }[]
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
  yearlyComparison: { year: number; amount: number }[]
}

const UserDashboard: React.FC = () => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { donations } = useDonationStore()
  const { user } = useAuthStore()
  
  // State management
  const [activeTab, setActiveTab] = useState('overview')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [analytics, setAnalytics] = useState<DonationAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [isEditing, setIsEditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get actual user name from auth store or fallback to sample
  const actualUserName = user?.name || (user as any)?.username || 'Valued Donor'

  // Sample user data (in real app, this would come from API)
  const sampleUser: UserProfile = {
    id: 'user123',
    name: actualUserName,
    email: user?.email || 'user@example.com',
    phone: '+91 9876543210',
    location: 'Mumbai, Maharashtra',
    memberSince: new Date('2023-01-15'),
    avatar: '', // Default to empty so first letter shows
    bio: 'Passionate about education and healthcare initiatives. Believes in making a positive impact in the community.',
    donationGoal: 50000,
    achievements: [
      {
        id: 'first-donation',
        title: 'First Donation',
        description: 'Made your first donation',
        icon: '🎉',
        unlockedAt: new Date('2023-01-20'),
        level: 'bronze'
      },
      {
        id: 'education-supporter',
        title: 'Education Champion',
        description: 'Donated ₹10,000+ to education causes',
        icon: '📚',
        unlockedAt: new Date('2023-03-15'),
        level: 'silver'
      },
      {
        id: 'consistent-giver',
        title: 'Consistent Giver',
        description: 'Donated for 6 consecutive months',
        icon: '⭐',
        unlockedAt: new Date('2023-07-01'),
        level: 'gold'
      },
      {
        id: 'major-donor',
        title: 'Major Donor',
        description: 'Total donations exceed ₹25,000',
        icon: '👑',
        unlockedAt: new Date('2023-09-10'),
        level: 'platinum'
      }
    ],
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      donationReminders: true,
      impactReports: true,
      newsletter: true,
      publicProfile: false
    }
  }

  // Initialize data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setUserProfile(sampleUser)
        
        // Calculate analytics from donations
        const calculatedAnalytics = calculateAnalytics(donations)
        setAnalytics(calculatedAnalytics)
        
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeDashboard()
  }, [donations, toast])

  // Calculate analytics from donations
  const calculateAnalytics = (userDonations: any[]): DonationAnalytics => {
    const totalDonated = userDonations.reduce((sum, d) => sum + d.amount, 0)
    const donationCount = userDonations.length
    const averageDonation = donationCount > 0 ? totalDonated / donationCount : 0
    
    // If no donations, provide mock data for visualization
    if (donationCount === 0) {
      return {
        totalDonated: 0,
        donationCount: 0,
        averageDonation: 0,
        monthlyGrowth: 0,
        favoriteCategory: 'Education',
        impactScore: 0,
        monthlyData: [
          { month: 'Aug', amount: 500 },
          { month: 'Sep', amount: 750 },
          { month: 'Oct', amount: 1200 },
          { month: 'Nov', amount: 800 },
          { month: 'Dec', amount: 1500 },
          { month: 'Jan', amount: 0 }
        ],
        categoryBreakdown: [
          { category: 'Education', amount: 2500, percentage: 35 },
          { category: 'Healthcare', amount: 2000, percentage: 28 },
          { category: 'Food Security', amount: 1500, percentage: 21 },
          { category: 'Environment', amount: 800, percentage: 11 },
          { category: 'Others', amount: 350, percentage: 5 }
        ],
        yearlyComparison: [
          { year: 2023, amount: 4500 },
          { year: 2024, amount: 0 }
        ]
      }
    }
    
    // Group by category
    const categoryGroups = userDonations.reduce((acc, d) => {
      const category = d.cause.includes('Education') ? 'Education' :
                     d.cause.includes('Health') ? 'Healthcare' :
                     d.cause.includes('Food') ? 'Food Security' :
                     d.cause.includes('Environment') ? 'Environment' :
                     'Others'
      acc[category] = (acc[category] || 0) + d.amount
      return acc
    }, {})

    const categoryBreakdown = Object.entries(categoryGroups).map(([category, amount]) => ({
      category,
      amount: amount as number,
      percentage: ((amount as number) / totalDonated) * 100
    }))

    const favoriteCategory = categoryBreakdown.reduce((max, current) => 
      current.amount > max.amount ? current : max, 
      categoryBreakdown[0] || { category: 'None', amount: 0 }
    ).category

    // Monthly data (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const monthDonations = userDonations.filter(d => {
        const donationDate = new Date(d.timestamp)
        return donationDate.getMonth() === date.getMonth() && 
               donationDate.getFullYear() === date.getFullYear()
      })
      
      return {
        month: monthName,
        amount: monthDonations.reduce((sum, d) => sum + d.amount, 0)
      }
    })

    return {
      totalDonated,
      donationCount,
      averageDonation,
      monthlyGrowth: 15.5, // Sample growth percentage
      favoriteCategory,
      impactScore: Math.min(100, (totalDonated / 1000) * 5), // Impact score calculation
      monthlyData,
      categoryBreakdown,
      yearlyComparison: [
        { year: 2023, amount: totalDonated * 0.7 },
        { year: 2024, amount: totalDonated }
      ]
    }
  }

  // Export functions
  const exportDonationHistory = (format: 'csv' | 'pdf' | 'excel') => {
    if (format === 'csv') {
      generateCSV(donations)
    } else if (format === 'pdf') {
      generatePDF(donations, userProfile)
    } else if (format === 'excel') {
      generateCSV(donations) // For now, Excel will download as CSV
    }

    toast({
      title: 'Export Successful',
      description: `Donation history exported as ${format.toUpperCase()}`
    })
  }

  const exportTaxReceipt = () => {
    sendTaxReceipt()
  }

  const exportImpactReport = () => {
    generatePDF(donations, userProfile)
    toast({
      title: 'Impact Report Generated',
      description: 'Your personalized impact report has been downloaded'
    })
  }

  const shareProfile = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    shareImpact(platform)
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates })
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully'
      })
    }
  }

  const updatePreferences = (preferences: UserPreferences) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, preferences })
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been saved'
      })
    }
  }

  const generatePDF = (donations: any[], userProfile: UserProfile | null) => {
    const doc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>DilSeDaan Donation Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { color: #ff6b35; font-size: 24px; font-weight: bold; }
          .subtitle { color: #666; margin-top: 5px; }
          .donation-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .amount { color: #28a745; font-weight: bold; font-size: 18px; }
          .date { color: #666; font-size: 12px; }
          .total { background: #f8f9fa; padding: 20px; margin-top: 20px; text-align: center; }
          .welcome { text-align: center; padding: 50px; background: #f8f9fa; border-radius: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">DilSeDaan</div>
          <div class="subtitle">दिल से ❤️ - Charity & Donation Platform</div>
        </div>
        
        ${donations.length === 0 ? `
          <div class="welcome">
            <h3>Welcome to DilSeDaan! You are yet to make any donations. Start your journey of giving today!</h3>
            <p>Visit our platform to explore various causes and make your first donation.</p>
          </div>
        ` : `
          <h2>Donation Report for ${userProfile?.name}</h2>
          <p>Report generated on: ${new Date().toLocaleDateString('en-IN')}</p>
          
          ${donations.map(donation => `
            <div class="donation-item">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <h4>${donation.cause}</h4>
                  <p class="date">${new Date(donation.timestamp).toLocaleDateString('en-IN')}</p>
                  <p>Payment Method: ${donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'UPI'}</p>
                  <p>Transaction ID: ${donation.transactionId || 'N/A'}</p>
                </div>
                <div class="amount">₹${donation.amount.toLocaleString()}</div>
              </div>
            </div>
          `).join('')}
          
          <div class="total">
            <h3>Total Donated: ₹${donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</h3>
            <p>Total Donations: ${donations.length}</p>
            <p>Tax Benefit: ₹${donations.reduce((sum, d) => sum + (d.taxBenefit || 0), 0).toLocaleString()}</p>
          </div>
        `}
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
          <p>This report is generated by DilSeDaan platform. For any queries, contact us at dilsedaan.charity@gmail.com</p>
        </div>
      </body>
      </html>
    `
    
    const blob = new Blob([doc], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DilSeDaan_Donation_Report_${new Date().toISOString().split('T')[0]}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateCSV = (donations: any[]) => {
    if (donations.length === 0) {
      const csv = `Welcome to DilSeDaan!\nYou are yet to make any donations.\nStart your journey of giving today!`
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DilSeDaan_Welcome_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    const headers = ['Date', 'Cause', 'Amount', 'Payment Method', 'Transaction ID', 'Status']
    const csvContent = [
      headers.join(','),
      ...donations.map(donation => [
        new Date(donation.timestamp).toLocaleDateString('en-IN'),
        `"${donation.cause}"`,
        donation.amount,
        donation.paymentMethod || 'UPI',
        donation.transactionId || 'N/A',
        donation.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DilSeDaan_Donations_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sendTaxReceipt = async () => {
    try {
      // First generate receipt data
      const receiptData = {
        userDetails: {
          name: userProfile?.name || 'Donor',
          email: userProfile?.email || '',
          phone: userProfile?.phone || '',
          address: userProfile?.location || ''
        },
        donations: donations.map(d => ({
          amount: d.amount,
          cause: d.cause,
          date: d.timestamp,
          transactionId: d.id,
          blockchainHash: (d as any).blockchainHash || 'Processing...'
        })),
        totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        financialYear: '2024-25',
        receiptNumber: `DSR${Date.now()}`,
        issuedDate: new Date().toLocaleDateString('en-IN')
      }

      // Call backend to generate and send receipt
      const response = await fetch('http://localhost:5001/api/test/email/tax-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(receiptData)
      })

      if (!response.ok) {
        throw new Error('Failed to send tax receipt')
      }

      toast({
        title: 'Tax Receipt Sent! 📄',
        description: `Professional tax receipt (80G) has been sent to ${userProfile?.email}. Valid for IT returns. Check your inbox!`,
        duration: 6000
      })
    } catch (error) {
      console.error('Tax receipt error:', error)
      toast({
        title: 'Error',
        description: 'Failed to send tax receipt. Please try again or contact support.',
        variant: 'destructive'
      })
    }
  }

  const shareImpact = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0)
    const message = `I've donated ₹${totalDonated.toLocaleString()} through @DilSeDaan platform! Join me in making a difference. दिल से ❤️ #DilSeDaan #Charity #Donation`
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dilsedaan.com')}&quote=${encodeURIComponent(message)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://dilsedaan.com')}&summary=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' https://dilsedaan.com')}`
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive'
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a valid image file.',
          variant: 'destructive'
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        if (userProfile && e.target?.result) {
          const newProfile = {
            ...userProfile,
            avatar: e.target.result as string
          }
          setUserProfile(newProfile)
          
          // In a real app, you would upload to server here
          // localStorage.setItem('userProfile', JSON.stringify(newProfile))
          
          toast({
            title: 'Profile Photo Updated!',
            description: 'Your profile photo has been successfully updated.',
          })
        }
      }
      reader.onerror = () => {
        toast({
          title: 'Upload Failed',
          description: 'Failed to read the image file. Please try again.',
          variant: 'destructive'
        })
      }
      reader.readAsDataURL(file)
    }
    // Reset the input value to allow re-uploading the same file
    event.target.value = ''
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const updateDonationGoal = () => {
    if (userProfile && newGoal) {
      setUserProfile({
        ...userProfile,
        donationGoal: parseInt(newGoal)
      })
      setIsEditingGoal(false)
      setNewGoal('')
      toast({
        title: 'Goal Updated!',
        description: `Your annual donation goal has been set to ₹${parseInt(newGoal).toLocaleString()}`,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-orange mx-auto mb-4"></div>
          <p className="text-warm-charcoal">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile?.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-warm-orange/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-warm-orange/20 border-4 border-warm-orange/30 flex items-center justify-center">
                    <span className="text-xl font-bold text-warm-orange">
                      {userProfile?.name ? getInitials(userProfile.name) : 'U'}
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white border-warm-orange/30"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-warm-charcoal">
                  Welcome back, {userProfile?.name}! 👋
                </h1>
                <p className="text-warm-charcoal/70">
                  Member since {userProfile?.memberSince.toLocaleDateString('en-IN', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(true)}
                className="border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                <Badge variant="secondary" className="ml-2 bg-warm-orange text-white">3</Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white text-black border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Donated</p>
                  <p className="text-2xl font-bold text-black">₹{analytics?.totalDonated.toLocaleString()}</p>
                  <p className="text-gray-600 text-xs">+{analytics?.monthlyGrowth}% this month</p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Donations Made</p>
                  <p className="text-2xl font-bold text-black">{analytics?.donationCount}</p>
                  <p className="text-gray-600 text-xs">Across {analytics?.categoryBreakdown.length} categories</p>
                </div>
                <Heart className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Impact Score</p>
                  <p className="text-2xl font-bold text-black">{Math.round(analytics?.impactScore || 0)}</p>
                  <p className="text-gray-600 text-xs">Lives touched</p>
                </div>
                <Award className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border-2 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Achievements</p>
                  <p className="text-2xl font-bold text-black">{userProfile?.achievements.length}</p>
                  <p className="text-gray-600 text-xs">Badges earned</p>
                </div>
                <Trophy className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white border border-warm-orange/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="donations" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <Heart className="h-4 w-4 mr-2" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Donation Goal Progress */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-warm-charcoal">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-warm-orange" />
                      Annual Donation Goal
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditingGoal(true)
                        setNewGoal(userProfile?.donationGoal.toString() || '')
                      }}
                      className="border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Goal
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {isEditingGoal ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="Enter new goal"
                          className="max-w-[150px] border-warm-orange/30"
                        />
                        <Button
                          size="sm"
                          onClick={updateDonationGoal}
                          className="bg-warm-orange hover:bg-warm-orange/90"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingGoal(false)}
                          className="border-warm-orange/30"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>Track your progress towards your ₹{userProfile?.donationGoal.toLocaleString()} goal</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        ₹{analytics?.totalDonated.toLocaleString()} / ₹{userProfile?.donationGoal.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={(analytics?.totalDonated || 0) / (userProfile?.donationGoal || 1) * 100} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-warm-charcoal/70">
                      <span>{Math.round((analytics?.totalDonated || 0) / (userProfile?.donationGoal || 1) * 100)}% completed</span>
                      <span>₹{((userProfile?.donationGoal || 0) - (analytics?.totalDonated || 0)).toLocaleString()} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-warm-charcoal">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-warm-orange hover:bg-warm-orange/90"
                    onClick={() => window.location.href = '/stories'}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Make a Donation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    onClick={() => exportDonationHistory('pdf')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    onClick={exportTaxReceipt}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Tax Receipt
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    onClick={() => shareProfile('twitter')}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Impact
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                  <Activity className="h-5 w-5 text-warm-orange" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.slice(0, 5).map((donation, index) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warm-orange/10 rounded-full flex items-center justify-center">
                          <Heart className="h-5 w-5 text-warm-orange" />
                        </div>
                        <div>
                          <p className="font-medium text-warm-charcoal">{donation.cause}</p>
                          <p className="text-sm text-warm-charcoal/70">
                            {new Date(donation.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-warm-green">₹{donation.amount.toLocaleString()}</p>
                        <Badge 
                          variant={donation.status === 'completed' ? 'default' : 'secondary'}
                          className={donation.status === 'completed' ? 'bg-warm-green' : ''}
                        >
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search donations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-warm-orange/30"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-[180px] border-warm-orange/30">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="food">Food Security</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full sm:w-[180px] border-warm-orange/30">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportDonationHistory('csv')}
                      className="border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportDonationHistory('excel')}
                      className="border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donations List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-warm-charcoal">
                  <span>Donation History</span>
                  <Badge variant="outline" className="border-warm-orange/30">
                    {donations.length} donations
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="border border-warm-orange/20 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-warm-orange/10 rounded-lg flex items-center justify-center">
                            <Heart className="h-6 w-6 text-warm-orange" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-warm-charcoal">{donation.cause}</h3>
                            <p className="text-sm text-warm-charcoal/70">
                              {new Date(donation.timestamp).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-warm-charcoal/50">
                              Payment Method: {donation.paymentMethod ? donation.paymentMethod.toUpperCase() : 'UPI'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-warm-green">₹{donation.amount.toLocaleString()}</p>
                          <Badge 
                            variant={donation.status === 'completed' ? 'default' : 'secondary'}
                            className={donation.status === 'completed' ? 'bg-warm-green' : ''}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {donation.status}
                          </Badge>
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                    <LineChart className="h-5 w-5 text-warm-orange" />
                    Monthly Donation Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics?.monthlyData.map((data, index) => (
                      <div key={data.month} className="flex flex-col items-center gap-2">
                        <div 
                          className="bg-warm-orange/80 rounded-t-md w-8 transition-all hover:bg-warm-orange"
                          style={{ 
                            height: `${Math.max(10, (data.amount / Math.max(...analytics.monthlyData.map(d => d.amount))) * 200)}px` 
                          }}
                        />
                        <span className="text-xs text-warm-charcoal/70">{data.month}</span>
                        <span className="text-xs font-medium text-warm-charcoal">₹{data.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                    <PieChart className="h-5 w-5 text-warm-orange" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics?.categoryBreakdown.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-charcoal">{category.category}</span>
                          <span className="font-medium text-warm-charcoal">
                            ₹{category.amount.toLocaleString()} ({category.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-warm-charcoal">Average Donation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warm-orange">₹{analytics?.averageDonation.toLocaleString()}</p>
                    <p className="text-sm text-warm-charcoal/70">Per donation</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-warm-charcoal">Favorite Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-warm-green">{analytics?.favoriteCategory}</p>
                    <p className="text-sm text-warm-charcoal/70">Most supported cause</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-warm-charcoal">Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-warm-blue">+{analytics?.monthlyGrowth}%</p>
                    <p className="text-sm text-warm-charcoal/70">This month</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                  <Trophy className="h-5 w-5 text-warm-orange" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Celebrate your impact milestones and unlock new achievements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile?.achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className="border border-warm-orange/20 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl
                          ${achievement.level === 'bronze' ? 'bg-orange-100' : 
                            achievement.level === 'silver' ? 'bg-gray-100' :
                            achievement.level === 'gold' ? 'bg-orange-200' :
                            'bg-purple-100'}`}
                        >
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-warm-charcoal">{achievement.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={`
                              ${achievement.level === 'bronze' ? 'border-orange-300 text-orange-700' : 
                                achievement.level === 'silver' ? 'border-gray-300 text-gray-700' :
                                achievement.level === 'gold' ? 'border-orange-400 text-orange-800' :
                                'border-purple-300 text-purple-700'}
                            `}
                          >
                            {achievement.level}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-warm-charcoal/70 mb-2">{achievement.description}</p>
                      <p className="text-xs text-warm-charcoal/50">
                        Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Towards Next Achievement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Next Milestone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-warm-orange/10 rounded-full flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-warm-charcoal">Ultimate Benefactor</h3>
                      <p className="text-sm text-warm-charcoal/70">Donate ₹50,000 in total</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>₹{analytics?.totalDonated.toLocaleString()} / ₹50,000</span>
                        </div>
                        <Progress value={(analytics?.totalDonated || 0) / 50000 * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-warm-charcoal">
                    <span className="flex items-center gap-2">
                      <User className="h-5 w-5 text-warm-orange" />
                      Profile Information
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="border-warm-orange/30 text-warm-charcoal hover:bg-warm-orange/10"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-1">Name</label>
                        <Input 
                          value={userProfile?.name} 
                          onChange={(e) => updateProfile({ name: e.target.value })}
                          className="border-warm-orange/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-1">Email</label>
                        <Input 
                          type="email"
                          value={userProfile?.email} 
                          onChange={(e) => updateProfile({ email: e.target.value })}
                          className="border-warm-orange/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-1">Phone</label>
                        <Input 
                          value={userProfile?.phone} 
                          onChange={(e) => updateProfile({ phone: e.target.value })}
                          className="border-warm-orange/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-1">Location</label>
                        <Input 
                          value={userProfile?.location} 
                          onChange={(e) => updateProfile({ location: e.target.value })}
                          className="border-warm-orange/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-warm-charcoal mb-1">Bio</label>
                        <textarea 
                          value={userProfile?.bio} 
                          onChange={(e) => updateProfile({ bio: e.target.value })}
                          className="w-full min-h-[100px] px-3 py-2 border border-warm-orange/30 rounded-md focus:outline-none focus:ring-2 focus:ring-warm-orange/30"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      <Button 
                        onClick={() => setIsEditing(false)}
                        className="bg-warm-orange hover:bg-warm-orange/90"
                      >
                        Save Changes
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-warm-orange" />
                        <span className="text-warm-charcoal">{userProfile?.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-warm-orange" />
                        <span className="text-warm-charcoal">{userProfile?.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-warm-orange" />
                        <span className="text-warm-charcoal">{userProfile?.location}</span>
                      </div>
                      <div className="pt-4">
                        <h4 className="font-medium text-warm-charcoal mb-2">About</h4>
                        <p className="text-warm-charcoal/70">{userProfile?.bio}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                    <Settings className="h-5 w-5 text-warm-orange" />
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-charcoal">Email Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.preferences.emailNotifications}
                        onChange={(e) => updatePreferences({
                          ...userProfile!.preferences,
                          emailNotifications: e.target.checked
                        })}
                        className="rounded border-warm-orange/30"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-charcoal">SMS Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.preferences.smsNotifications}
                        onChange={(e) => updatePreferences({
                          ...userProfile!.preferences,
                          smsNotifications: e.target.checked
                        })}
                        className="rounded border-warm-orange/30"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-charcoal">Donation Reminders</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.preferences.donationReminders}
                        onChange={(e) => updatePreferences({
                          ...userProfile!.preferences,
                          donationReminders: e.target.checked
                        })}
                        className="rounded border-warm-orange/30"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-charcoal">Impact Reports</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.preferences.impactReports}
                        onChange={(e) => updatePreferences({
                          ...userProfile!.preferences,
                          impactReports: e.target.checked
                        })}
                        className="rounded border-warm-orange/30"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-charcoal">Newsletter</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.preferences.newsletter}
                        onChange={(e) => updatePreferences({
                          ...userProfile!.preferences,
                          newsletter: e.target.checked
                        })}
                        className="rounded border-warm-orange/30"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-charcoal">Public Profile</span>
                      <input 
                        type="checkbox" 
                        checked={userProfile?.preferences.publicProfile}
                        onChange={(e) => updatePreferences({
                          ...userProfile!.preferences,
                          publicProfile: e.target.checked
                        })}
                        className="rounded border-warm-orange/30"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                  <Share2 className="h-5 w-5 text-warm-orange" />
                  Share Your Impact
                </CardTitle>
                <CardDescription>
                  Inspire others by sharing your donation journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => shareProfile('twitter')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <span className="mr-2">🐦</span>
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareProfile('facebook')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <span className="mr-2">📘</span>
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareProfile('linkedin')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <span className="mr-2">💼</span>
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareProfile('whatsapp')}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <span className="mr-2">💬</span>
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-warm-charcoal">
                    <Download className="h-5 w-5 text-warm-orange" />
                    Export Reports
                  </CardTitle>
                  <CardDescription>
                    Download your donation data and reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => exportDonationHistory('csv')}
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Donation History (CSV)
                  </Button>
                  <Button
                    onClick={() => exportDonationHistory('excel')}
                    className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Donation History (Excel)
                  </Button>
                  <Button
                    onClick={() => exportDonationHistory('pdf')}
                    className="w-full justify-start bg-red-600 hover:bg-red-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Donation History (PDF)
                  </Button>
                  <Button
                    onClick={exportTaxReceipt}
                    className="w-full justify-start bg-purple-600 hover:bg-purple-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Tax Receipt (80G)
                  </Button>
                  <Button
                    onClick={exportImpactReport}
                    className="w-full justify-start bg-warm-orange hover:bg-warm-orange/90"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Impact Report
                  </Button>
                </CardContent>
              </Card>

              {/* Report Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-warm-charcoal">Report Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-warm-charcoal mb-2">Annual Tax Benefits</h4>
                    <p className="text-2xl font-bold text-warm-green">₹{Math.round((analytics?.totalDonated || 0) * 0.5).toLocaleString()}</p>
                    <p className="text-sm text-warm-charcoal/70">
                      50% of ₹{analytics?.totalDonated.toLocaleString()} (Section 80G)
                    </p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-warm-charcoal mb-2">Impact Generated</h4>
                    <p className="text-2xl font-bold text-warm-blue">{Math.round(analytics?.impactScore || 0)}</p>
                    <p className="text-sm text-warm-charcoal/70">Lives positively impacted</p>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-warm-charcoal mb-2">Donation Frequency</h4>
                    <p className="text-2xl font-bold text-black">
                      {analytics?.donationCount ? Math.round(365 / analytics.donationCount) : 0} days
                    </p>
                    <p className="text-sm text-warm-charcoal/70">Average interval between donations</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Recent Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Donation History 2024', type: 'PDF', date: '2024-01-15', size: '2.3 MB' },
                    { name: 'Tax Receipt 2023-24', type: 'PDF', date: '2024-01-10', size: '1.1 MB' },
                    { name: 'Impact Report Q4', type: 'PDF', date: '2024-01-05', size: '4.7 MB' },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-warm-orange/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-warm-orange/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-warm-orange" />
                        </div>
                        <div>
                          <p className="font-medium text-warm-charcoal">{report.name}</p>
                          <p className="text-sm text-warm-charcoal/70">{report.type} • {report.size}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-warm-charcoal/70">{report.date}</p>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userProfile={userProfile}
          onUpdateProfile={updateProfile}
          onUpdatePreferences={updatePreferences}
        />

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      </div>
    </div>
  )
}

export default UserDashboard
