import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Donation {
  id: string
  amount: number
  cause: string
  donorName: string
  donorEmail: string
  message?: string
  isAnonymous: boolean
  timestamp: Date
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: 'upi' | 'card' | 'netbanking'
  transactionId?: string
  taxBenefit?: number
}

export interface Campaign {
  id: string
  title: string
  description: string
  category: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  imageUrl: string
  isUrgent: boolean
  endDate?: Date
  location: string
  beneficiaries?: number
  story?: string
  // Blockchain & verification fields
  contractAddress?: string
  ipfsPlanHash?: string
  milestones?: {
    total: number
    verified: number
  }
}

interface DonationState {
  donations: Donation[]
  campaigns: Campaign[]
  totalDonated: number
  totalImpact: number
  addDonation: (donation: Donation) => void
  updateDonationStatus: (id: string, status: Donation['status']) => void
  getCampaignById: (id: string) => Campaign | undefined
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
}

export const useDonationStore = create<DonationState>()(
  persist(
    (set, get) => ({
      donations: [
        {
          id: 'don1',
          amount: 5000,
          cause: 'Padhega India, Tabhi Toh Badhega India!',
          donorName: 'Rajesh Kumar',
          donorEmail: 'rajesh.kumar@example.com',
          message: 'Happy to support education for children',
          isAnonymous: false,
          timestamp: new Date('2024-01-15'),
          status: 'completed',
          paymentMethod: 'upi',
          transactionId: 'TXN123456789',
          taxBenefit: 2500
        },
        {
          id: 'don2',
          amount: 2500,
          cause: 'Ek Thali Khushiyon Ki',
          donorName: 'Rajesh Kumar',
          donorEmail: 'rajesh.kumar@example.com',
          message: 'Every child deserves good food',
          isAnonymous: false,
          timestamp: new Date('2024-01-10'),
          status: 'completed',
          paymentMethod: 'card',
          transactionId: 'TXN987654321',
          taxBenefit: 1250
        },
        {
          id: 'don3',
          amount: 10000,
          cause: 'Beti Padhao, Sapne Sajao',
          donorName: 'Rajesh Kumar',
          donorEmail: 'rajesh.kumar@example.com',
          message: 'Supporting girl child education',
          isAnonymous: false,
          timestamp: new Date('2024-01-05'),
          status: 'completed',
          paymentMethod: 'netbanking',
          transactionId: 'TXN456789123',
          taxBenefit: 5000
        },
        {
          id: 'don4',
          amount: 7500,
          cause: 'Swasth Bharat, Swasth Parivar',
          donorName: 'Rajesh Kumar',
          donorEmail: 'rajesh.kumar@example.com',
          message: 'Health is wealth',
          isAnonymous: false,
          timestamp: new Date('2023-12-20'),
          status: 'completed',
          paymentMethod: 'upi',
          transactionId: 'TXN789123456',
          taxBenefit: 3750
        },
        {
          id: 'don5',
          amount: 3000,
          cause: 'Jeevan Bachao, Muskaan Lautaao',
          donorName: 'Rajesh Kumar',
          donorEmail: 'rajesh.kumar@example.com',
          message: 'Saving lives is our priority',
          isAnonymous: false,
          timestamp: new Date('2023-12-15'),
          status: 'completed',
          paymentMethod: 'upi',
          transactionId: 'TXN321654987',
          taxBenefit: 1500
        }
      ],
      campaigns: [
        {
          id: '1',
          title: 'Padhega India, Tabhi Toh Badhega India!',
          description: 'Education is the foundation of progress. Help us provide quality education to underprivileged children across India.',
          category: 'Education',
          targetAmount: 150000,
          raisedAmount: 89500,
          donorCount: 234,
          imageUrl: '/images/image_1.png',
          isUrgent: false,
          location: 'Pan India',
          beneficiaries: 500,
          story: 'Every child deserves access to quality education. Join us in building a literate India.'
        },
        {
          id: '2',
          title: 'Ek Thali Khushiyon Ki',
          description: 'Nutritious meals for hungry children and families. Because no one should sleep on an empty stomach.',
          category: 'Food & Nutrition',
          targetAmount: 200000,
          raisedAmount: 165000,
          donorCount: 412,
          imageUrl: '/images/image_2.png',
          isUrgent: true,
          location: 'Rural India',
          beneficiaries: 800,
          story: 'One plate of happiness at a time. Your donation can feed a family today.'
        },
        {
          id: '3',
          title: 'Beti Padhao, Sapne Sajao',
          description: 'Empowering girls through education. Every girl child deserves to dream and achieve her goals.',
          category: 'Girl Child Education',
          targetAmount: 180000,
          raisedAmount: 92000,
          donorCount: 156,
          imageUrl: '/images/image_3.png',
          isUrgent: false,
          location: 'Rural Areas',
          beneficiaries: 300,
          story: 'Education is the key to breaking barriers. Support girl child education.'
        },
        {
          id: '4',
          title: 'Swachhta Mein Hi Swasthya',
          description: 'Join us in creating a cleaner and greener India. Every step towards cleanliness is a step towards progress.',
          category: 'Environment',
          targetAmount: 120000,
          raisedAmount: 75000,
          donorCount: 189,
          imageUrl: '/images/image_4.png',
          isUrgent: false,
          location: 'Urban Areas',
          beneficiaries: 1000,
          story: 'Clean environment leads to healthy living. Be part of the change.'
        },
        {
          id: '5',
          title: 'Sehat Ka Khayal, Sapno Ka Sawaal',
          description: 'Supporting families in medical emergencies. Quick financial assistance for those who need urgent medical care.',
          category: 'Healthcare',
          targetAmount: 300000,
          raisedAmount: 185000,
          donorCount: 298,
          imageUrl: '/images/image_5.png',
          isUrgent: true,
          location: 'All India',
          beneficiaries: 50,
          story: 'Every life is precious. Help us save lives through medical support.'
        },
        {
          id: '6',
          title: 'Mahila Shakti Badhti Pragati',
          description: 'Skill development and entrepreneurship opportunities for rural women. Empowering women to become self-reliant.',
          category: 'Women Empowerment',
          targetAmount: 250000,
          raisedAmount: 145000,
          donorCount: 167,
          imageUrl: '/images/image_6.png',
          isUrgent: false,
          location: 'Rural India',
          beneficiaries: 200,
          story: 'When we empower women, we empower communities and nations.'
        },
        {
          id: '7',
          title: 'Ghar ki Chahat, Umeedo Ka Ghar',
          description: 'Providing shelter and homes for the homeless. Everyone deserves a safe place to call home.',
          category: 'Housing',
          targetAmount: 350000,
          raisedAmount: 178000,
          donorCount: 89,
          imageUrl: '/images/image_7.png',
          isUrgent: false,
          location: 'Urban Slums',
          beneficiaries: 50,
          story: 'A roof over the head, hope in the heart. Help us build homes.'
        },
        {
          id: '8',
          title: 'Swasth Raho, Khush Raho',
          description: 'Critical medical care and treatments for those who cannot afford healthcare.',
          category: 'Healthcare',
          targetAmount: 400000,
          raisedAmount: 298000,
          donorCount: 567,
          imageUrl: '/images/image_8.png',
          isUrgent: true,
          location: 'Hospitals Nationwide',
          beneficiaries: 25,
          story: 'Save lives, restore smiles. Your donation can save a life today.'
        },
        {
          id: '9',
          title: 'Mushkil Mein Madad, Dil Se Sahayata',
          description: 'Emergency relief and disaster management support for communities in need.',
          category: 'Disaster Relief',
          targetAmount: 120000,
          raisedAmount: 67000,
          donorCount: 203,
          imageUrl: '/images/image_9.png',
          isUrgent: true,
          location: 'Disaster Affected Areas',
          beneficiaries: 600,
          story: 'Whether heat or cold, help of every kind. Emergency support when needed most.'
        },
        {
          id: '10',
          title: 'Jal Hi Jeevan, Safai Hi Swasthya',
          description: 'Clean water and sanitation facilities for rural communities across India.',
          category: 'Water & Sanitation',
          targetAmount: 280000,
          raisedAmount: 145000,
          donorCount: 178,
          imageUrl: '/images/image_10.png',
          isUrgent: false,
          location: 'Rural Villages',
          beneficiaries: 1200,
          story: 'Village to village water, cleanliness in every hand. Clean water for all.'
        },
        {
          id: '11',
          title: 'Hunar Se Rojgar, Sapno Ka Udhar',
          description: 'Skill development and vocational training programs for unemployed youth.',
          category: 'Skill Development',
          targetAmount: 220000,
          raisedAmount: 98000,
          donorCount: 134,
          imageUrl: '/images/image_11.png',
          isUrgent: false,
          location: 'Training Centers',
          beneficiaries: 150,
          story: 'New skills, new identity. Empowering youth with employable skills.'
        },
        {
          id: '12',
          title: 'Prithvi Maa Ka Samman, Hara Bhara Jahan',
          description: 'River cleaning and environmental conservation efforts to save our sacred rivers.',
          category: 'Environment',
          targetAmount: 160000,
          raisedAmount: 78000,
          donorCount: 289,
          imageUrl: '/images/image_12.png',
          isUrgent: false,
          location: 'River Yamuna',
          beneficiaries: 50000,
          story: 'Keep Mother Yamuna clean and alive. Environmental conservation for future generations.'
        },
        {
          id: '13',
          title: 'Buzurgo Ka Adab, Maa-Baap Ka Hisaab',
          description: 'Care and support for elderly citizens. Ensuring dignity and respect for our elders.',
          category: 'Elderly Care',
          targetAmount: 190000,
          raisedAmount: 112000,
          donorCount: 167,
          imageUrl: '/images/image_13.png',
          isUrgent: false,
          location: 'Old Age Homes',
          beneficiaries: 200,
          story: 'Rights of the elderly - belonging and respect. Honor our elders.'
        },
        {
          id: '14',
          title: 'Khilti Muskaan, Acid ke Paar',
          description: 'Support and rehabilitation for acid attack survivors. Restoring hope and confidence.',
          category: 'Women Support',
          targetAmount: 300000,
          raisedAmount: 145000,
          donorCount: 234,
          imageUrl: '/images/image_1.png',
          isUrgent: true,
          location: 'Rehabilitation Centers',
          beneficiaries: 30,
          story: 'Blooming smiles, beyond acid. Supporting survivors towards a new life.'
        },
        {
          id: '15',
          title: 'Mazdoor Desh Ka Mazboot Haath',
          description: 'Support for daily wage workers and labor rights. Strengthening the backbone of our nation.',
          category: 'Labor Rights',
          targetAmount: 80000,
          raisedAmount: 34000,
          donorCount: 156,
          imageUrl: '/images/image_2.png',
          isUrgent: false,
          location: 'Industrial Areas',
          beneficiaries: 2000,
          story: 'Workers are the strong hands of the nation. Supporting labor rights and welfare.'
        },
        {
          id: '16',
          title: 'Man Ki Baat, Sunne Wale Hain Hum',
          description: 'Mental health support and counseling services. Because mental wellness matters too.',
          category: 'Mental Health',
          targetAmount: 250000,
          raisedAmount: 123000,
          donorCount: 198,
          imageUrl: '/images/image_3.png',
          isUrgent: false,
          location: 'Counseling Centers',
          beneficiaries: 400,
          story: 'Words from the heart, we are here to listen. Mental health support for all.'
        }
      ],
      totalDonated: 28000, // Sum of sample donations
      totalImpact: 28000,
      addDonation: (donation) =>
        set((state) => {
          // Log to blockchain for transparency and immutability
          const blockchainData = {
            donationId: donation.id,
            campaignId: (donation as any).campaignId || 'general',
            amount: donation.amount,
            paymentMethod: donation.paymentMethod || 'unknown',
            timestamp: new Date().toISOString(),
            donorHash: btoa(donation.donorName || 'anonymous'), // Basic anonymization
            transactionType: 'DONATION',
            status: 'CONFIRMED'
          }
          
          // Store blockchain record (this would typically call a smart contract)
          console.log('🔗 Blockchain Transaction Recorded:', blockchainData)
          
          // In a real implementation, this would:
          // 1. Call smart contract to record transaction
          // 2. Generate transaction hash
          // 3. Store on IPFS for permanence
          // 4. Create audit trail
          
          return {
            donations: [...state.donations, {
              ...donation,
              blockchainHash: `0x${Math.random().toString(16).substring(2, 34)}`, // Mock hash
              blockchainTimestamp: new Date().toISOString(),
              verified: true
            }],
            totalDonated: state.totalDonated + donation.amount,
          }
        }),
      updateDonationStatus: (id, status) =>
        set((state) => ({
          donations: state.donations.map((donation) =>
            donation.id === id ? { ...donation, status } : donation
          ),
        })),
      getCampaignById: (id) => get().campaigns.find((campaign) => campaign.id === id),
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [...state.campaigns, campaign],
        })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, ...updates } : campaign
          ),
        })),
    }),
    {
      name: 'donation-storage',
    }
  )
)