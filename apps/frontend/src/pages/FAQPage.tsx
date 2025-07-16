import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Heart, Shield, CreditCard, Users, Globe, MessageCircle, HelpCircle, Star } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'general' | 'donations' | 'security' | 'platform' | 'impact'
  icon: React.ReactNode
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 'what-is-dilsedaan',
    question: 'What is DilSeDaan and how does it work?',
    answer: 'DilSeDaan is a revolutionary blockchain-powered charity platform that ensures complete transparency in charitable donations. Every donation is recorded on the blockchain, making it immutable and traceable. Donors can track exactly how their money is used, view real-time impact reports, and receive regular updates on campaign progress.',
    category: 'general',
    icon: <Heart className="w-5 h-5 text-red-500" />
  },
  {
    id: 'how-is-different',
    question: 'How is DilSeDaan different from other charity platforms?',
    answer: 'Unlike traditional charity platforms, DilSeDaan uses blockchain technology for complete transparency. Every transaction is recorded immutably, donors receive real-time updates, and we provide detailed impact reports. Our platform also offers tax-exemption certificates, government compliance, and direct beneficiary feedback.',
    category: 'general',
    icon: <Star className="w-5 h-5 text-amber-500" />
  },
  {
    id: 'getting-started',
    question: 'How do I get started with donating?',
    answer: 'Simply create a free account, browse our verified campaigns, choose a cause you care about, and make a donation. You can donate any amount starting from ₹100. After donation, you\'ll receive instant confirmation and can track the impact of your contribution in real-time.',
    category: 'general',
    icon: <Users className="w-5 h-5 text-blue-500" />
  },

  // Donations
  {
    id: 'minimum-donation',
    question: 'What is the minimum amount I can donate?',
    answer: 'The minimum donation amount is ₹100. There is no maximum limit - you can donate as much as you wish. We believe every contribution, no matter the size, can make a meaningful difference.',
    category: 'donations',
    icon: <CreditCard className="w-5 h-5 text-green-500" />
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Digital Wallets. All payments are processed securely through encrypted channels.',
    category: 'donations',
    icon: <CreditCard className="w-5 h-5 text-green-500" />
  },
  {
    id: 'tax-benefits',
    question: 'Can I get tax benefits for my donations?',
    answer: 'Yes! DilSeDaan is registered under Section 80G of the Income Tax Act. You can claim up to 50% tax deduction on your donations. Tax exemption certificates are automatically generated and sent to your email within 24 hours of donation.',
    category: 'donations',
    icon: <Shield className="w-5 h-5 text-purple-500" />
  },
  {
    id: 'donation-tracking',
    question: 'How can I track my donations?',
    answer: 'Every donation receives a unique blockchain transaction ID. You can track your donation\'s journey through your donor dashboard, receive regular SMS/email updates, and view detailed impact reports showing exactly how your money was utilized.',
    category: 'donations',
    icon: <Globe className="w-5 h-5 text-cyan-500" />
  },

  // Security
  {
    id: 'security-measures',
    question: 'How secure are my donations and personal information?',
    answer: 'We use bank-level security with 256-bit SSL encryption for all transactions. Personal data is protected under strict privacy policies, and our blockchain technology ensures donation tracking without compromising donor privacy. We are PCI DSS compliant and regularly audited.',
    category: 'security',
    icon: <Shield className="w-5 h-5 text-purple-500" />
  },
  {
    id: 'blockchain-security',
    question: 'How does blockchain make donations more secure?',
    answer: 'Blockchain creates an immutable record of every transaction. Once recorded, donation data cannot be altered or deleted, ensuring complete transparency. This eliminates fraud, provides real-time tracking, and builds trust between donors and beneficiaries.',
    category: 'security',
    icon: <Globe className="w-5 h-5 text-indigo-500" />
  },

  // Platform
  {
    id: 'campaign-verification',
    question: 'How do you verify campaigns and beneficiaries?',
    answer: 'Every campaign undergoes rigorous verification including document verification, field visits, beneficiary interviews, and financial background checks. We work with local NGOs and government agencies to ensure authenticity. Only verified campaigns are published on our platform.',
    category: 'platform',
    icon: <Shield className="w-5 h-5 text-green-600" />
  },
  {
    id: 'fund-utilization',
    question: 'How do I know my funds are being used properly?',
    answer: 'Our blockchain technology tracks every rupee from your donation to the final beneficiary. You receive regular updates with photos, videos, and reports. We also conduct independent audits and provide milestone-based fund releases to ensure proper utilization.',
    category: 'platform',
    icon: <Globe className="w-5 h-5 text-blue-600" />
  },
  {
    id: 'platform-fees',
    question: 'Does DilSeDaan charge any platform fees?',
    answer: 'We charge a minimal platform fee of 3-5% to cover operational costs, payment gateway charges, and platform maintenance. This fee is clearly displayed before you complete your donation. 95-97% of your donation goes directly to the cause.',
    category: 'platform',
    icon: <CreditCard className="w-5 h-5 text-orange-500" />
  },

  // Impact
  {
    id: 'impact-measurement',
    question: 'How do you measure and report impact?',
    answer: 'We use data-driven impact measurement with regular field visits, beneficiary feedback, photo/video documentation, and third-party audits. Impact reports include quantitative metrics (meals provided, children educated, etc.) and qualitative stories from beneficiaries.',
    category: 'impact',
    icon: <Star className="w-5 h-5 text-amber-600" />
  },
  {
    id: 'campaign-updates',
    question: 'How often will I receive updates about campaigns I support?',
    answer: 'You\'ll receive immediate confirmation after donation, weekly progress updates during active campaigns, milestone achievement notifications, and a comprehensive impact report upon campaign completion. You can customize notification preferences in your dashboard.',
    category: 'impact',
    icon: <MessageCircle className="w-5 h-5 text-blue-500" />
  }
]

const categories = [
  { id: 'all', name: 'All Questions', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'general', name: 'General', icon: <Heart className="w-4 h-4" /> },
  { id: 'donations', name: 'Donations', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'security', name: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'platform', name: 'Platform', icon: <Globe className="w-4 h-4" /> },
  { id: 'impact', name: 'Impact', icon: <Star className="w-4 h-4" /> }
]

export function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = selectedCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-warm-orange/10 to-warm-golden/10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-warm-orange/10 rounded-full">
                <HelpCircle className="w-12 h-12 text-warm-orange" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-charcoal mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-warm-charcoal/70 mb-8">
              Everything you need to know about DilSeDaan, donations, and making an impact
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-warm-orange text-white shadow-lg transform scale-105'
                    : 'bg-white text-warm-charcoal hover:bg-warm-orange/10 border border-warm-cream'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </motion.div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="mb-4"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-warm-cream overflow-hidden">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-warm-cream/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {faq.icon}
                      <h3 className="text-base font-semibold text-warm-charcoal">
                        {faq.question}
                      </h3>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-warm-orange" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-warm-orange" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {openItems.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2">
                          <div className="border-t border-warm-cream/50 pt-4">
                            <p className="text-warm-charcoal/80 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-warm-orange to-warm-golden rounded-2xl p-8 max-w-2xl mx-auto text-white">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
              <p className="mb-6 opacity-90">
                Our support team is here to help you make the most impact with your donations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:dilsedaan.charity@gmail.com"
                  className="bg-white text-warm-orange px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="tel:+917671966605"
                  className="bg-white/20 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30"
                >
                  Call +91 7671966605
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default FAQPage
