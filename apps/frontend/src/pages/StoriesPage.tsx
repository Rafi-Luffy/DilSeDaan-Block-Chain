import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Heart, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCampaignStore, type Campaign } from '@/store/campaignStore'
import { useAuthStore } from '@/store/authStore'
import { getProgressPercentage } from '@/lib/utils'
import { getImagePath } from '@/lib/images'
import { PaymentModalReal } from '@/components/payment/PaymentModalReal'
import { LoginModal } from '@/components/auth/LoginModal'

// Helper function to safely render campaign properties
const safeCampaignProperty = (value: any, fallback: string = 'N/A'): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'object') {
    // For location objects specifically
    if (value.city || value.state) {
      return [value.city, value.state].filter(Boolean).join(', ') || fallback;
    }
    return fallback;
  }
  return String(value) || fallback;
};

// Helper function to get the correct image for each campaign
const getImageForCampaign = (index: number): string => {
  // Hardcoded image mapping for campaigns 1-13
  const imageMap = [
    '/images/image_1.png',  // Campaign 1: Education
    '/images/image_2.png',  // Campaign 2: Food & Nutrition
    '/images/image_3.png',  // Campaign 3: Women Education
    '/images/image_4.png',  // Campaign 4: Environment
    '/images/image_5.png',  // Campaign 5: Healthcare
    '/images/image_6.png',  // Campaign 6: Women Empowerment
    '/images/image_7.png',  // Campaign 7: Housing
    '/images/image_8.png',  // Campaign 8: Critical Healthcare
    '/images/image_9.png',  // Campaign 9: Disaster Relief
    '/images/image_10.png', // Campaign 10: Water & Sanitation
    '/images/image_11.png', // Campaign 11: Skill Development
    '/images/image_12.png', // Campaign 12: Labor Rights
    '/images/image_13.png'  // Campaign 13: Women Support
  ];
  
  // Return the corresponding image or cycle through if more campaigns
  return imageMap[index % imageMap.length];
};

export function StoriesPage() {
  const { campaigns, fetchCampaigns } = useCampaignStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  
  // State declarations
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [donationAmount] = useState(1000)

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'education', label: 'Education' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'food_nutrition', label: 'Food & Nutrition' },
    { id: 'environment', label: 'Environment' },
    { id: 'women_empowerment', label: 'Women Empowerment' },
    { id: 'housing', label: 'Housing' },
    { id: 'disaster_relief', label: 'Disaster Relief' },
    { id: 'water_sanitation', label: 'Water & Sanitation' },
    { id: 'skill_development', label: 'Skill Development' },
    { id: 'labor_rights', label: 'Labor Rights' },
    { id: 'women_support', label: 'Women Support' }
  ]

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartCampaign = () => {
    if (isAuthenticated) {
      navigate('/create-campaign')
    } else {
      setShowLoginModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-warm-charcoal mb-6">
              Stories That Touch Hearts ❤️
            </h1>
            <p className="text-xl text-warm-charcoal/80 max-w-3xl mx-auto mb-8">
              Every campaign here represents real people with real needs. Browse through stories that need your support, or start your own campaign to make a difference.
            </p>
            <Button
              onClick={handleStartCampaign}
              className="bg-gradient-to-r from-warm-orange to-warm-green text-white font-bold py-4 px-8 rounded-xl text-lg hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Start a Campaign
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-warm-cream">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-warm-orange text-white shadow-lg transform scale-105'
                    : 'bg-warm-cream text-warm-charcoal hover:bg-warm-orange/10 hover:text-warm-orange'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="text-center mt-4 text-warm-charcoal/70">
            Showing {filteredCampaigns.length} campaigns
          </div>
          
          {/* Search Input */}
          <div className="max-w-md mx-auto mt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-full border border-warm-cream focus:outline-none focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-charcoal/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-cream hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48">
                  <img
                    src={(() => {
                      const campaignImages: Record<string, string> = {
                        'Padhega India, Tabhi Toh Badhega India!': getImagePath('images/image_1.png'),
                        'Ek Thali Khushiyon Ki': getImagePath('images/image_2.png'),
                        'Beti Padhao, Sapne Sajao': getImagePath('images/image_3.png'),
                        'Ek Chhat – Ek Jeevan': getImagePath('images/image_4.png'),
                        'Jeevan Bachao, Muskaan Lautaao': getImagePath('images/image_5.png'),
                        'Garmi ho ya Sardi, Madad ho har kism ki': getImagePath('images/image_6.png'),
                        'Gaon-Gaon Paani, Har Haath Swachhta': getImagePath('images/image_7.png'),
                        'Naye Hunar, Nayi Pehchaan': getImagePath('images/image_8.png'),
                        'Maa Yamuna Ko Saaf Bhi Rakhna Hai, Zinda Bhi': getImagePath('images/image_9.png'),
                        'Buzurgo Ka Haq – Apnapan aur Samman': getImagePath('images/image_10.png'),
                        'Khilti Muskaan, Acid ke Paar': getImagePath('images/image_11.png'),
                        'Mazdoor Desh Ka Mazboot Haath': getImagePath('images/image_12.png'),
                        'Man Ki Baat, Sunne Wale Hain Hum': getImagePath('images/image_13.png')
                      };
                      return campaignImages[campaign.title] || `/images/image_${(index % 13) + 1}.png`;
                    })()}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', e.currentTarget.src);
                      e.currentTarget.src = 'https://via.placeholder.com/400x200/FFB800/FFFFFF?text=Campaign+Image';
                    }}
                  />
                  {campaign.isUrgent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      URGENT 🚨
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {safeCampaignProperty(campaign.location, 'India')}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm bg-warm-orange/10 text-warm-orange px-3 py-1 rounded-full font-medium">
                      {safeCampaignProperty(campaign.category, 'General')}
                    </span>
                    <span className="text-sm text-warm-charcoal/70 flex items-center">
                      <Heart className="h-3 w-3 mr-1 text-red-500" fill="currentColor" />
                      {campaign.donorCount}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-warm-charcoal mb-3 leading-tight">
                    {safeCampaignProperty(campaign.title, 'Untitled Campaign')}
                  </h3>

                  <p className="text-warm-charcoal/70 text-sm mb-4 line-clamp-3">
                    {safeCampaignProperty(campaign.description, 'No description available')}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-warm-charcoal">
                        ₹{campaign.raisedAmount.toLocaleString()} raised
                      </span>
                      <span className="text-warm-charcoal/70">
                        {getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%
                      </span>
                    </div>
                    <div className="w-full bg-warm-cream rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-warm-orange to-warm-green h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-warm-charcoal/70 mt-1">
                      Goal: ₹{campaign.targetAmount.toLocaleString()}
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setSelectedCampaign(campaign)
                      setShowPaymentModal(true)
                    }}
                    className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white"
                  >
                    <Heart className="h-4 w-4 mr-2" fill="currentColor" />
                    Donate Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModalReal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={donationAmount}
        campaignId={selectedCampaign?._id || 'general-fund'}
        campaignTitle={selectedCampaign?.title || 'General Fund'}
        donorName={undefined}
        donorEmail={undefined}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
