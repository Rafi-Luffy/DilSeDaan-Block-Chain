import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Heart, 
  Shield, 
  Users,
  Target,
  MapPin,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDonationStore } from '@/store/donationStore'
import { useWeb3Store } from '@/store/web3Store'
import { getProgressPercentage } from '@/lib/utils'
import { PaymentModalReal } from '@/components/payment/PaymentModalReal'

interface Campaign {
  id: string
  title: string
  imageUrl: string
  raisedAmount: number
  targetAmount: number
  description?: string
  location?: string
  beneficiaries?: number
  isUrgent?: boolean
}

export function DonatePageFixed() {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');
  const { campaigns, getCampaignById } = useDonationStore();
  const { 
    account, 
    isConnected, 
    network, 
    connectWallet, 
    isPolygonNetwork
  } = useWeb3Store();
  const { t } = useTranslation();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState(1000);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);

  useEffect(() => {
    if (campaignId) {
      const campaign = getCampaignById(campaignId);
      setSelectedCampaign(campaign ?? null);
    } else if (campaigns.length > 0) {
      setSelectedCampaign(campaigns[0]);
    }
  }, [campaignId, campaigns, getCampaignById]);

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  if (!selectedCampaign) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-warm-orange mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-warm-charcoal mb-2">{t('donation.page.loadingCampaign')}</h2>
          <p className="text-warm-charcoal/70">{t('donation.page.preparingExperience')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warm-orange/5 to-warm-green/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            {/* Campaign Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-warm-charcoal mb-6 leading-tight"
              >
                {t('donation.page.title')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-warm-charcoal/80 max-w-3xl mx-auto"
              >
                {t('donation.page.subtitle')}
              </motion.p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Campaign Details */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-8"
              >
                {/* Campaign Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-warm-cream">
                  <div className="relative h-64">
                    <img
                      src={selectedCampaign.imageUrl}
                      alt={selectedCampaign.title}
                      className="w-full h-full object-cover"
                    />
                    {selectedCampaign.isUrgent && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {t('donation.campaign.urgent')}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-warm-charcoal mb-4">{selectedCampaign.title}</h2>
                    
                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-warm-charcoal">Progress</span>
                        <span className="text-sm text-warm-charcoal/70">
                          {getProgressPercentage(selectedCampaign.raisedAmount, selectedCampaign.targetAmount)}%
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(selectedCampaign.raisedAmount, selectedCampaign.targetAmount)} 
                        className="h-3 mb-3"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-warm-orange">₹{selectedCampaign.raisedAmount.toLocaleString()}</span>
                        <span className="text-warm-charcoal/70">{t('donation.campaign.raised')} ₹{selectedCampaign.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-warm-cream rounded-lg">
                        <Users className="h-5 w-5 text-warm-orange mx-auto mb-1" />
                        <div className="text-lg font-bold text-warm-charcoal">{selectedCampaign.beneficiaries || 'Many'}</div>
                        <div className="text-xs text-warm-charcoal/70">{t('donation.campaign.beneficiaries')}</div>
                      </div>
                      <div className="text-center p-3 bg-warm-cream rounded-lg">
                        <MapPin className="h-5 w-5 text-warm-orange mx-auto mb-1" />
                        <div className="text-sm font-bold text-warm-charcoal">{selectedCampaign.location}</div>
                        <div className="text-xs text-warm-charcoal/70">{t('donation.campaign.location')}</div>
                      </div>
                      <div className="text-center p-3 bg-warm-cream rounded-lg">
                        <Target className="h-5 w-5 text-warm-orange mx-auto mb-1" />
                        <div className="text-lg font-bold text-warm-charcoal">
                          {Math.round((selectedCampaign.raisedAmount / selectedCampaign.targetAmount) * 100)}%
                        </div>
                        <div className="text-xs text-warm-charcoal/70">{t('donation.campaign.funded')}</div>
                      </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="flex items-center gap-4 text-sm text-warm-charcoal/70">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span>{t('donation.campaign.verifiedCampaign')}</span>
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
                {/* Donation Form */}
                <div className="bg-white rounded-2xl shadow-lg border border-warm-cream p-8">
                  <h3 className="text-2xl font-bold text-warm-charcoal mb-6">{t('donation.form.donationAmount')}</h3>
                  
                  {/* Amount Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-warm-charcoal mb-3">
                      {t('donation.form.quickAmounts')}
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
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-warm-charcoal mb-3">
                      {t('donation.form.paymentMethod')}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['upi', 'card', 'netbanking', 'crypto'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setSelectedPayment(method)}
                          className={`p-3 rounded-xl font-medium transition-all capitalize ${
                            selectedPayment === method
                              ? 'bg-warm-green text-white shadow-lg'
                              : 'bg-warm-cream text-warm-charcoal hover:bg-warm-green/10 border border-warm-green/20'
                          }`}
                        >
                          {method === 'upi' ? t('payment.upi') : 
                           method === 'card' ? t('payment.card') : 
                           method === 'netbanking' ? t('payment.netbanking') :
                           t('payment.crypto')}
                        </button>
                      ))}
                    </div>
                    
                    {/* Crypto Payment Info */}
                    {selectedPayment === 'crypto' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                              <Wallet className="h-4 w-4" />
                              <span>Blockchain Payment (MATIC)</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              {isConnected 
                                ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)} | ${network}` 
                                : 'Connect your wallet to continue'
                              }
                            </p>
                          </div>
                          {!isConnected && (
                            <Button
                              onClick={() => connectWallet()}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Connect Wallet
                            </Button>
                          )}
                        </div>
                        {!isPolygonNetwork && isConnected && (
                          <div className="mt-2 text-xs text-amber-600">
                            Please switch to Polygon network for optimal fees
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Donate Button */}
                  <button
                    onClick={() => setShowPaymentGateway(true)}
                    className="w-full bg-gradient-to-r from-warm-orange to-warm-golden text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Heart className="h-5 w-5" fill="currentColor" />
                    {t('donation.form.donateNow', { amount: donationAmount.toLocaleString() })}
                  </button>

                  {/* Security Notice */}
                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Shield className="h-4 w-4" />
                      <span>{t('donation.form.secureTransparent')}</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {t('donation.form.blockchainTracked')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Payment Modal */}
      <PaymentModalReal
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        amount={1000}
        campaignId={selectedCampaign?.id || 'general-fund'}
        campaignTitle={selectedCampaign?.title || 'Campaign'}
        donorName={undefined}
        donorEmail={undefined}
      />
    </div>
  );
}

export default DonatePageFixed;
