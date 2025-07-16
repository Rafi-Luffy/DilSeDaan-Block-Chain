import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { 
  BarChart3, 
  Heart, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Clock
} from 'lucide-react'

// Admin types
interface AdminStats {
  totalDonations: number
  totalDonors: number
  activeCampaigns: number
  pendingCampaigns: number
  verifiedCampaigns: number
}

interface Campaign {
  _id: string
  title: string
  description: string
  category: string
  targetAmount: number
  status: string
  creator: { name: string; _id: string }
  createdAt: string
}

const AdminPageEnhanced: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast } = useToast()
  
  // State vars
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  
  // Data
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalDonations: 2500000,
    totalDonors: 12500,
    activeCampaigns: 45,
    pendingCampaigns: 0,
    verifiedCampaigns: 37
  })
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Admin check
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/')
      return
    }
  }, [user, navigate])

  // Load data
  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setIsLoading(true)
      
      // Load pending campaigns
      const response = await fetch('/api/campaigns?status=pending_review', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const pendingCampaigns = data.data || [];
        setCampaigns(pendingCampaigns);
        
        setAdminStats(prev => ({
          ...prev,
          pendingCampaigns: pendingCampaigns.length
        }));
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handlers
  const handleApproveCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (response.ok) {
        setCampaigns(prev => prev.filter(campaign => campaign._id !== campaignId));
        setAdminStats(prev => ({
          ...prev,
          pendingCampaigns: prev.pendingCampaigns - 1,
          activeCampaigns: prev.activeCampaigns + 1
        }));
        
        toast({
          title: 'Success',
          description: 'Campaign approved successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve campaign',
        variant: 'destructive'
      });
    }
  }

  const handleRejectCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ 
          status: 'rejected',
          rejectionReason: 'Does not meet guidelines'
        })
      });

      if (response.ok) {
        setCampaigns(prev => prev.filter(campaign => campaign._id !== campaignId));
        setAdminStats(prev => ({
          ...prev,
          pendingCampaigns: prev.pendingCampaigns - 1
        }));
        
        toast({
          title: 'Success',
          description: 'Campaign rejected successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject campaign',
        variant: 'destructive'
      });
    }
  }

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-orange mx-auto mb-4"></div>
          <p className="text-warm-charcoal">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-warm-charcoal mb-2">Admin Dashboard</h1>
          <p className="text-warm-charcoal/80">Manage campaigns and platform operations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-warm-orange/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <Heart className="h-4 w-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-warm-orange data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{adminStats.totalDonations.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.totalDonors.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.activeCampaigns}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.pendingCampaigns}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {campaigns.length > 0 && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-xl text-yellow-800 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pending Campaign Approvals
                  </CardTitle>
                  <CardDescription className="text-yellow-700">
                    Review and approve/reject campaigns submitted by users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign._id} className="bg-white rounded-lg p-4 border border-yellow-200">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-warm-charcoal">{campaign.title}</h4>
                            <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{campaign.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Category: {campaign.category}</span>
                            <span>Target: ₹{campaign.targetAmount?.toLocaleString()}</span>
                            <span>Created by: {campaign.creator?.name}</span>
                            <span>Submitted: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveCampaign(campaign._id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectCampaign(campaign._id)}
                            variant="destructive"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleViewCampaign(campaign._id)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Track platform performance and growth metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPageEnhanced
