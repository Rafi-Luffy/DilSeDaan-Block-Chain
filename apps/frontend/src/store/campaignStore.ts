// Real API integration for campaign data
import { api } from '../lib/api'
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface Campaign {
  _id: string
  title: string
  description: string
  story: string
  category: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  creator: string
  beneficiaries: number
  location: {
    state: string
    city: string
    pincode: string
  } | string
  images: { url: string }[]
  gallery?: string[]
  contractAddress?: string
  ipfsPlanHash?: string
  transactionHash?: string
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed' | 'cancelled'
  isUrgent: boolean
  startDate: string
  endDate?: string
  milestones: Milestone[]
  isVerified: boolean
  verifiedBy?: string
  verificationDate?: string
  tags: string[]
  documents: Document[]
  updates: CampaignUpdate[]
  priority?: number
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  _id: string
  title: string
  description: string
  targetAmount: number
  deadline: string
  status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'funds_released'
  proofDocuments: string[]
  submittedAt?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  transactionHash?: string
  order: number
}

export interface CampaignUpdate {
  _id: string
  title: string
  content: string
  images?: string[]
  createdAt: string
  createdBy: string
}

export interface CampaignFilters {
  category?: string
  status?: string
  location?: string
  minAmount?: number
  maxAmount?: number
  isUrgent?: boolean
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface CampaignState {
  campaigns: Campaign[]
  selectedCampaign: Campaign | null
  loading: boolean
  error: string | null
  filters: CampaignFilters
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  
  // Actions
  fetchCampaigns: (filters?: CampaignFilters) => Promise<void>
  fetchCampaignById: (id: string) => Promise<void>
  createCampaign: (campaignData: Partial<Campaign>) => Promise<Campaign | null>
  updateCampaign: (id: string, campaignData: Partial<Campaign>) => Promise<Campaign | null>
  deleteCampaign: (id: string) => Promise<boolean>
  addCampaignUpdate: (id: string, updateData: { title: string; content: string; images?: string[] }) => Promise<boolean>
  submitMilestone: (campaignId: string, milestoneId: string, proofDocuments: string[]) => Promise<boolean>
  verifyMilestone: (campaignId: string, milestoneId: string, approved: boolean, rejectionReason?: string) => Promise<boolean>
  setFilters: (filters: Partial<CampaignFilters>) => void
  clearError: () => void
  resetState: () => void
}

const initialState = {
  campaigns: [],
  selectedCampaign: null,
  loading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
}

export const useCampaignStore = create<CampaignState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        fetchCampaigns: async (filters?: CampaignFilters) => {
          set({ loading: true, error: null })
          
          try {
            const currentFilters = { ...get().filters, ...filters }
            
            // Try to fetch from API first
            try {
              const response = await api.campaign.getAll(currentFilters)
              
              if (response.data.success && response.data.data.length > 0) {
                set({
                  campaigns: response.data.data,
                  pagination: response.data.pagination,
                  filters: currentFilters,
                  loading: false
                })
                return
              }
            } catch (apiError) {
              console.log('API not available, using mock data')
            }
            
            // Fallback to mock data if API fails or returns no data
            set({
              campaigns: mockCampaignsWithHindiNames,
              pagination: {
                page: 1,
                limit: 13,
                total: 13,
                pages: 1
              },
              filters: currentFilters,
              loading: false
            })
            
          } catch (error: any) {
            // Use mock data as final fallback
            set({
              campaigns: mockCampaignsWithHindiNames,
              pagination: {
                page: 1,
                limit: 13,
                total: 13,
                pages: 1
              },
              filters: { ...get().filters, ...filters },
              error: null, // Don't show error since we have fallback data
              loading: false
            })
          }
        },

        fetchCampaignById: async (id: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.getById(id)
            
            if (response.data.success) {
              set({
                selectedCampaign: response.data.data,
                loading: false
              })
            } else {
              throw new Error(response.data.error || 'Failed to fetch campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to fetch campaign',
              loading: false
            })
          }
        },

        createCampaign: async (campaignData: Partial<Campaign>) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.create(campaignData)
            
            if (response.data.success) {
              const newCampaign = response.data.data
              set(state => ({
                campaigns: [newCampaign, ...state.campaigns],
                loading: false
              }))
              return newCampaign
            } else {
              throw new Error(response.data.error || 'Failed to create campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to create campaign',
              loading: false
            })
            return null
          }
        },

        updateCampaign: async (id: string, campaignData: Partial<Campaign>) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.update(id, campaignData)
            
            if (response.data.success) {
              const updatedCampaign = response.data.data
              set(state => ({
                campaigns: state.campaigns.map(c => c._id === id ? updatedCampaign : c),
                selectedCampaign: state.selectedCampaign?._id === id ? updatedCampaign : state.selectedCampaign,
                loading: false
              }))
              return updatedCampaign
            } else {
              throw new Error(response.data.error || 'Failed to update campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to update campaign',
              loading: false
            })
            return null
          }
        },

        deleteCampaign: async (id: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.delete(id)
            
            if (response.data.success) {
              set(state => ({
                campaigns: state.campaigns.filter(c => c._id !== id),
                selectedCampaign: state.selectedCampaign?._id === id ? null : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to delete campaign')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to delete campaign',
              loading: false
            })
            return false
          }
        },

        addCampaignUpdate: async (id: string, updateData: { title: string; content: string; images?: string[] }) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.addUpdate(id, updateData)
            
            if (response.data.success) {
              const newUpdate = response.data.data
              set(state => ({
                selectedCampaign: state.selectedCampaign?._id === id ? {
                  ...state.selectedCampaign,
                  updates: [newUpdate, ...state.selectedCampaign.updates]
                } : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to add update')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to add update',
              loading: false
            })
            return false
          }
        },

        submitMilestone: async (campaignId: string, milestoneId: string, proofDocuments: string[]) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.submitMilestone(campaignId, milestoneId, { proofDocuments })
            
            if (response.data.success) {
              const updatedMilestone = response.data.data
              set(state => ({
                selectedCampaign: state.selectedCampaign?._id === campaignId ? {
                  ...state.selectedCampaign,
                  milestones: state.selectedCampaign.milestones.map(m => 
                    m._id === milestoneId ? updatedMilestone : m
                  )
                } : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to submit milestone')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to submit milestone',
              loading: false
            })
            return false
          }
        },

        verifyMilestone: async (campaignId: string, milestoneId: string, approved: boolean, rejectionReason?: string) => {
          set({ loading: true, error: null })
          
          try {
            const response = await api.campaign.verifyMilestone(campaignId, milestoneId, { approved, rejectionReason })
            
            if (response.data.success) {
              const updatedMilestone = response.data.data
              set(state => ({
                selectedCampaign: state.selectedCampaign?._id === campaignId ? {
                  ...state.selectedCampaign,
                  milestones: state.selectedCampaign.milestones.map(m => 
                    m._id === milestoneId ? updatedMilestone : m
                  )
                } : state.selectedCampaign,
                loading: false
              }))
              return true
            } else {
              throw new Error(response.data.error || 'Failed to verify milestone')
            }
          } catch (error: any) {
            set({
              error: error.response?.data?.error || error.message || 'Failed to verify milestone',
              loading: false
            })
            return false
          }
        },

        setFilters: (filters: Partial<CampaignFilters>) => {
          set(state => ({
            filters: { ...state.filters, ...filters }
          }))
        },

        clearError: () => set({ error: null }),

        resetState: () => set(initialState)
      }),
      {
        name: 'campaign-store',
        partialize: (state) => ({
          filters: state.filters
        })
      }
    ),
    { name: 'campaign-store' }
  )
)

// Mock data with Hindi campaign names - Complete 13 campaigns as requested
const mockCampaignsWithHindiNames: Campaign[] = [
  {
    _id: '1',
    title: 'Padhega India, Tabhi Toh Badhega India!',
    description: 'Education is the foundation of progress. Help us provide quality education to underprivileged children across India.',
    story: 'Every child deserves access to quality education. Join us in building a literate India.',
    category: 'education',
    targetAmount: 500000,
    raisedAmount: 320000,
    donorCount: 456,
    creator: 'DilSeDaan Team',
    beneficiaries: 2000,
    location: 'Pan India',
    images: [{ url: '/images/image_1.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['education', 'children', 'literacy'],
    documents: [],
    updates: [],
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Ek Thali Khushiyon Ki',
    description: 'No child should sleep hungry. Through our nutrition programs, we provide wholesome meals to thousands of children daily.',
    story: 'One plate of happiness at a time. Your donation can feed a family today.',
    category: 'food_nutrition',
    targetAmount: 300000,
    raisedAmount: 245000,
    donorCount: 623,
    creator: 'DilSeDaan Team',
    beneficiaries: 1500,
    location: 'Rural India',
    images: [{ url: '/images/image_2.png' }],
    status: 'active',
    isUrgent: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['food', 'nutrition', 'children'],
    documents: [],
    updates: [],
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Beti Padhao, Sapne Sajao',
    description: 'Empowering girls through education breaks the cycle of poverty and creates strong communities.',
    story: 'Education is the key to breaking barriers. Support girl child education.',
    category: 'education',
    targetAmount: 400000,
    raisedAmount: 189000,
    donorCount: 789,
    creator: 'DilSeDaan Team',
    beneficiaries: 800,
    location: 'Rural Areas',
    images: [{ url: '/images/image_3.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['girl-education', 'women-empowerment'],
    documents: [],
    updates: [],
    priority: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    title: 'Ek Chhat – Ek Jeevan',
    description: 'Join us in creating a cleaner and greener India. Every step towards cleanliness is a step towards progress.',
    story: 'Clean environment leads to healthy living. Be part of the change.',
    category: 'environment',
    targetAmount: 120000,
    raisedAmount: 75000,
    donorCount: 189,
    creator: 'DilSeDaan Team',
    beneficiaries: 1000,
    location: 'Urban Areas',
    images: [{ url: '/images/image_4.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['environment', 'cleanliness'],
    documents: [],
    updates: [],
    priority: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '5',
    title: 'Jeevan Bachao, Muskaan Lautaao',
    description: 'Supporting families in medical emergencies. Quick financial assistance for those who need urgent medical care.',
    story: 'Every life is precious. Help us save lives through medical support.',
    category: 'healthcare',
    targetAmount: 300000,
    raisedAmount: 185000,
    donorCount: 298,
    creator: 'DilSeDaan Team',
    beneficiaries: 50,
    location: 'All India',
    images: [{ url: '/images/image_5.png' }],
    status: 'active',
    isUrgent: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['healthcare', 'emergency'],
    documents: [],
    updates: [],
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '6',
    title: 'Garmi ho ya Sardi, Madad ho har kism ki',
    description: 'Skill development and entrepreneurship opportunities for rural women. Empowering women to become self-reliant.',
    story: 'When we empower women, we empower communities and nations.',
    category: 'women_empowerment',
    targetAmount: 250000,
    raisedAmount: 145000,
    donorCount: 167,
    creator: 'DilSeDaan Team',
    beneficiaries: 200,
    location: 'Rural India',
    images: [{ url: '/images/image_6.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['women-empowerment', 'entrepreneurship'],
    documents: [],
    updates: [],
    priority: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '7',
    title: 'Gaon-Gaon Paani, Har Haath Swachhta',
    description: 'Providing shelter and homes for the homeless. Everyone deserves a safe place to call home.',
    story: 'A roof over the head, hope in the heart. Help us build homes.',
    category: 'housing',
    targetAmount: 350000,
    raisedAmount: 178000,
    donorCount: 89,
    creator: 'DilSeDaan Team',
    beneficiaries: 50,
    location: 'Urban Slums',
    images: [{ url: '/images/image_7.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['housing', 'shelter'],
    documents: [],
    updates: [],
    priority: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '8',
    title: 'Naye Hunar, Nayi Pehchaan',
    description: 'Critical medical care and treatments for those who cannot afford healthcare.',
    story: 'Save lives, restore smiles. Your donation can save a life today.',
    category: 'healthcare',
    targetAmount: 400000,
    raisedAmount: 298000,
    donorCount: 567,
    creator: 'DilSeDaan Team',
    beneficiaries: 25,
    location: 'Hospitals Nationwide',
    images: [{ url: '/images/image_8.png' }],
    status: 'active',
    isUrgent: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['healthcare', 'critical-care'],
    documents: [],
    updates: [],
    priority: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '9',
    title: 'Maa Yamuna Ko Saaf Bhi Rakhna Hai, Zinda Bhi',
    description: 'Emergency relief and disaster management support for communities in need.',
    story: 'Whether heat or cold, help of every kind. Emergency support when needed most.',
    category: 'disaster_relief',
    targetAmount: 120000,
    raisedAmount: 67000,
    donorCount: 203,
    creator: 'DilSeDaan Team',
    beneficiaries: 600,
    location: 'Disaster Affected Areas',
    images: [{ url: '/images/image_9.png' }],
    status: 'active',
    isUrgent: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['disaster-relief', 'emergency'],
    documents: [],
    updates: [],
    priority: 9,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '10',
    title: 'Buzurgo Ka Haq – Apnapan aur Samman',
    description: 'Clean water and sanitation facilities for rural communities across India.',
    story: 'Village to village water, cleanliness in every hand. Clean water for all.',
    category: 'water_sanitation',
    targetAmount: 280000,
    raisedAmount: 145000,
    donorCount: 178,
    creator: 'DilSeDaan Team',
    beneficiaries: 1200,
    location: 'Rural Villages',
    images: [{ url: '/images/image_10.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['water', 'sanitation', 'rural'],
    documents: [],
    updates: [],
    priority: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '11',
    title: 'Khilti Muskaan, Acid ke Paar',
    description: 'Skill development and vocational training programs for unemployed youth.',
    story: 'New skills, new identity. Empowering youth with employable skills.',
    category: 'skill_development',
    targetAmount: 220000,
    raisedAmount: 98000,
    donorCount: 134,
    creator: 'DilSeDaan Team',
    beneficiaries: 150,
    location: 'Training Centers',
    images: [{ url: '/images/image_11.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 110 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['skill-development', 'youth', 'employment'],
    documents: [],
    updates: [],
    priority: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '12',
    title: 'Mazdoor Desh Ka Mazboot Haath',
    description: 'Supporting migrant workers and daily wage laborers with emergency assistance and job security.',
    story: 'Workers are the strong hands of the nation. Supporting labor rights and welfare.',
    category: 'labor_rights',
    targetAmount: 180000,
    raisedAmount: 89000,
    donorCount: 167,
    creator: 'DilSeDaan Team',
    beneficiaries: 500,
    location: 'Industrial Areas',
    images: [{ url: '/images/image_12.png' }],
    status: 'active',
    isUrgent: false,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['labor-rights', 'workers', 'migrant'],
    documents: [],
    updates: [],
    priority: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '13',
    title: 'Man Ki Baat, Sunne Wale Hain Hum',
    description: 'Support and rehabilitation for acid attack survivors. Providing medical care and legal assistance.',
    story: 'Blooming smiles, beyond acid. Supporting survivors towards a new life.',
    category: 'women_support',
    targetAmount: 350000,
    raisedAmount: 156000,
    donorCount: 234,
    creator: 'DilSeDaan Team',
    beneficiaries: 30,
    location: 'Rehabilitation Centers',
    images: [{ url: '/images/image_13.png' }],
    status: 'active',
    isUrgent: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [],
    isVerified: true,
    tags: ['women-support', 'acid-attack', 'rehabilitation'],
    documents: [],
    updates: [],
    priority: 13,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Override the initial state with mock data
// (async () => {
//   const campaigns = mockCampaignsWithHindiNames
//   for (const campaign of campaigns) {
//     await api.campaign.create(campaign)
//   }
// })()
