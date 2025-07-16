import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { 
  Heart, 
  Shield, 
  BookOpen, 
  Utensils, 
  Droplets, 
  Users,
  Target,
  Clock,
  CheckCircle,
  Star,
  Globe,
  Coins,
  MapPin,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDonationStore } from '@/store/donationStore'
import { useCampaignStore, type Campaign } from '@/store/campaignStore'
import { getProgressPercentage } from '@/lib/utils'
import { PaymentModalReal } from '@/components/payment/PaymentModalReal'

// Campaign-specific Impact Calculator Component
const ImpactCalculator = ({ amount, campaign }: { amount: number; campaign: Campaign | null }) => {
  const [isActive, setIsActive] = React.useState(false);
  
  // Campaign-specific impact calculations
  const getCampaignSpecificImpact = (amount: number, campaign: Campaign | null) => {
    if (!campaign) return {};

    // Define impact metrics based on campaign category
    const impactsByCategory = {
      'education': {
        books: { value: Math.floor(amount / 150), label: 'Educational Books', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'for students' },
        schoolDays: { value: Math.floor(amount / 120), label: 'School Days', icon: Star, color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'of quality education' },
        stationery: { value: Math.floor(amount / 80), label: 'Stationery Kits', icon: BookOpen, color: 'text-indigo-600', bgColor: 'bg-indigo-50', description: 'for children' },
        uniforms: { value: Math.floor(amount / 400), label: 'School Uniforms', icon: Users, color: 'text-green-600', bgColor: 'bg-green-50', description: 'for underprivileged students' }
      },
      'healthcare': {
        medicine: { value: Math.floor(amount / 250), label: 'Medical Treatments', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50', description: 'for patients in need' },
        checkups: { value: Math.floor(amount / 180), label: 'Health Checkups', icon: Shield, color: 'text-pink-600', bgColor: 'bg-pink-50', description: 'for community members' },
        vaccines: { value: Math.floor(amount / 100), label: 'Vaccinations', icon: Shield, color: 'text-green-600', bgColor: 'bg-green-50', description: 'for children' },
        firstAid: { value: Math.floor(amount / 60), label: 'First Aid Kits', icon: Heart, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'for emergency care' }
      },
      'food': {
        meals: { value: Math.floor(amount / 40), label: 'Nutritious Meals', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'for hungry families' },
        groceries: { value: Math.floor(amount / 300), label: 'Grocery Packages', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'for families in need' },
        supplements: { value: Math.floor(amount / 150), label: 'Nutrition Supplements', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50', description: 'for malnourished children' },
        waterDays: { value: Math.floor(amount / 90), label: 'Days of Clean Water', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50', description: 'for families' }
      },
      'environment': {
        trees: { value: Math.floor(amount / 50), label: 'Trees Planted', icon: Globe, color: 'text-green-600', bgColor: 'bg-green-50', description: 'for reforestation' },
        cleanups: { value: Math.floor(amount / 200), label: 'Community Cleanups', icon: Globe, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'environmental drives' },
        waterDays: { value: Math.floor(amount / 80), label: 'Days of Clean Water', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50', description: 'for communities' },
        recycling: { value: Math.floor(amount / 120), label: 'Recycling Kits', icon: Globe, color: 'text-teal-600', bgColor: 'bg-teal-50', description: 'for households' }
      },
      'disaster': {
        reliefKits: { value: Math.floor(amount / 350), label: 'Relief Kits', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50', description: 'for disaster victims' },
        shelterDays: { value: Math.floor(amount / 150), label: 'Days of Shelter', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50', description: 'for displaced families' },
        meals: { value: Math.floor(amount / 45), label: 'Emergency Meals', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'for affected people' },
        waterDays: { value: Math.floor(amount / 70), label: 'Days of Clean Water', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50', description: 'for emergency needs' }
      },
      'default': {
        meals: { value: Math.floor(amount / 50), label: 'Nutritious Meals', icon: Utensils, color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'for children and families' },
        books: { value: Math.floor(amount / 200), label: 'Educational Books', icon: BookOpen, color: 'text-blue-600', bgColor: 'bg-blue-50', description: 'for students in need' },
        medicine: { value: Math.floor(amount / 300), label: 'Medical Treatments', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50', description: 'for healthcare support' },
        waterDays: { value: Math.floor(amount / 100), label: 'Days of Clean Water', icon: Droplets, color: 'text-cyan-600', bgColor: 'bg-cyan-50', description: 'for families' }
      }
    };

    // Determine category from campaign tags or title
    let category = 'default';
    if (campaign.tags) {
      if (campaign.tags.includes('education') || campaign.title.toLowerCase().includes('education') || campaign.title.toLowerCase().includes('school')) {
        category = 'education';
      } else if (campaign.tags.includes('healthcare') || campaign.title.toLowerCase().includes('health') || campaign.title.toLowerCase().includes('medical')) {
        category = 'healthcare';
      } else if (campaign.tags.includes('food') || campaign.title.toLowerCase().includes('food') || campaign.title.toLowerCase().includes('meal') || campaign.title.toLowerCase().includes('hunger')) {
        category = 'food';
      } else if (campaign.tags.includes('environment') || campaign.title.toLowerCase().includes('environment') || campaign.title.toLowerCase().includes('tree') || campaign.title.toLowerCase().includes('water')) {
        category = 'environment';
      } else if (campaign.tags.includes('disaster') || campaign.title.toLowerCase().includes('disaster') || campaign.title.toLowerCase().includes('relief') || campaign.title.toLowerCase().includes('emergency')) {
        category = 'disaster';
      }
    }

    return (impactsByCategory as any)[category] || impactsByCategory.default;
  };

  const campaignImpacts = getCampaignSpecificImpact(amount, campaign);
  const impactItems = Object.entries(campaignImpacts)
    .map(([key, item]: [string, any]) => ({ key, ...item }))
    .filter(item => item.value > 0);

  React.useEffect(() => {
    setIsActive(amount > 0);
  }, [amount]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-warm-cream p-6">
      <h3 className="text-xl font-bold text-warm-charcoal mb-4 flex items-center">
        <Star className="h-5 w-5 text-warm-golden mr-2" />
        Your Impact on {campaign?.title || 'This Campaign'}
      </h3>
      
      <AnimatePresence>
        {isActive && impactItems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {impactItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-xl ${item.bgColor} border border-opacity-20`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <div>
                    <p className="font-semibold text-gray-800">{item.value} {item.label}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500"
          >
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select an amount to see your impact</p>
            <p className="text-sm">Every contribution makes a difference for {campaign?.title || 'this cause'}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DonatePage() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');
  const { addDonation } = useDonationStore();
  const { campaigns, selectedCampaign, fetchCampaigns, fetchCampaignById } = useCampaignStore();
  const [donationAmount, setDonationAmount] = useState(1000);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  // Fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  // Fetch specific campaign if ID provided, otherwise use first campaign
  useEffect(() => {
    if (campaignId) {
      fetchCampaignById(campaignId);
    }
  }, [campaignId, fetchCampaignById]);

  // Get the current campaign to display
  const currentCampaign = campaignId ? selectedCampaign : (campaigns.length > 0 ? campaigns[0] : null);

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  if (!currentCampaign) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-warm-orange mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-warm-charcoal mb-2">Loading Campaign...</h2>
          <p className="text-warm-charcoal/70">Preparing your donation experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Campaign Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative h-64">
                  <img 
                    src={currentCampaign.images?.[0]?.url || '/images/image_1.png'} 
                    alt={currentCampaign.title}
                    className="w-full h-full object-cover"
                  />
                  {currentCampaign.isUrgent && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      URGENT
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-warm-charcoal mb-3">
                    {currentCampaign.title}
                  </h1>
                  
                  <div className="flex items-center gap-2 text-sm text-warm-charcoal/70 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {typeof currentCampaign.location === 'string' 
                        ? currentCampaign.location 
                        : `${currentCampaign.location.city}, ${currentCampaign.location.state}`
                      }
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-warm-charcoal/70">Progress</span>
                      <span className="text-sm font-semibold text-warm-green">
                        {getProgressPercentage(currentCampaign.raisedAmount, currentCampaign.targetAmount)}% Complete
                      </span>
                    </div>
                    
                    <Progress 
                      value={getProgressPercentage(currentCampaign.raisedAmount, currentCampaign.targetAmount)} 
                      className="h-3"
                    />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-warm-green">
                          ₹{currentCampaign.raisedAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-warm-charcoal/70">raised</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-warm-charcoal">
                          ₹{currentCampaign.targetAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-warm-charcoal/70">goal</p>
                      </div>
                    </div>
                  </div>

                  {currentCampaign.description && (
                    <p className="mt-4 text-warm-charcoal/80 leading-relaxed">
                      {currentCampaign.description}
                    </p>
                  )}

                  <div className="flex gap-4 mt-6">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Verified Campaign</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Tax Benefits</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Donation Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-8"
            >
              {/* Donation Form - MOVED TO TOP */}
              <div className="bg-white rounded-2xl shadow-lg border border-warm-cream p-8">
                <h3 className="text-2xl font-bold text-warm-charcoal mb-6">Make Your Donation</h3>
                
                {/* Amount Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-warm-charcoal mb-3">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`p-3 rounded-xl font-semibold transition-all ${
                          donationAmount === amount
                            ? 'bg-warm-orange text-white shadow-lg transform scale-105'
                            : 'bg-warm-cream text-warm-charcoal hover:bg-warm-orange/10 border border-warm-orange/20'
                        }`}
                      >
                        ₹{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-charcoal font-semibold">₹</span>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors font-semibold text-lg"
                      placeholder="Enter custom amount"
                      min="1"
                    />
                  </div>
                </div>

                {/* Donor Information */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-warm-charcoal mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        className="w-full p-3 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors"
                        placeholder="Enter your name"
                        disabled={isAnonymous}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-warm-charcoal mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        className="w-full p-3 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 text-warm-orange rounded"
                    />
                    <label htmlFor="anonymous" className="text-sm text-warm-charcoal">
                      Donate anonymously
                    </label>
                  </div>
                </div>

                {/* Donate Button */}
                <button
                  onClick={() => setShowPaymentGateway(true)}
                  className="w-full bg-gradient-to-r from-warm-orange to-warm-golden text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Heart className="h-5 w-5" fill="currentColor" />
                  Donate ₹{donationAmount.toLocaleString()} Now
                </button>

                {/* Security Notice */}
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Secure & Transparent</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    All donations are processed securely and tracked on blockchain for complete transparency.
                  </p>
                </div>
              </div>

              {/* Impact Calculator - MOVED TO BOTTOM */}
              <ImpactCalculator amount={donationAmount} campaign={currentCampaign} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModalReal
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={donationAmount}
        campaignId={currentCampaign?._id || ''}
        campaignTitle={currentCampaign?.title || 'General Donation'}
        donorName={isAnonymous ? undefined : donorName}
        donorEmail={donorEmail}
      />
    </div>
  );
}

export default DonatePage;
