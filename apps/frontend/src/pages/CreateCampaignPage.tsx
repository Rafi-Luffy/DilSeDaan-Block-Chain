import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Upload, MapPin, Calendar, DollarSign, Users, Star, CheckCircle, ArrowRight, Shield, FileText, Target, Clock, Building, Mail, Phone, User, Globe, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useCampaignStore } from '@/store/campaignStore'

interface CampaignData {
  // Organization Information
  organizationName: string
  organizationType: 'ngo' | 'charity' | 'foundation' | 'trust' | 'cooperative' | 'individual'
  organizationEmail: string
  organizationPhone: string
  organizationAddress: string
  organizationWebsite: string
  registrationNumber: string
  taxExemptionNumber: string
  establishedYear: string
  
  // Campaign Details
  campaignTitle: string
  category: string
  subCategory: string
  description: string
  location: string
  locationState: string
  targetAmount: number
  duration: number
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  
  // Beneficiary Information
  beneficiaryCount: number
  beneficiaryAge: string
  beneficiaryGender: string
  beneficiaryDetails: string
  impactStatement: string
  
  // Milestones & Implementation
  milestones: { title: string; amount: number; description: string; timeline: string; deliverables: string }[]
  implementation: string
  timeline: string
  
  // Verification Documents
  documents: {
    organizationCertificate: File | null
    taxExemptionCertificate: File | null
    projectProposal: File | null
    budgetBreakdown: File | null
    beneficiaryProof: File | null
    previousWork: File | null
  }
  
  // Contact Person
  contactName: string
  contactDesignation: string
  contactEmail: string
  contactPhone: string
  contactWhatsapp: string
  
  // Additional Information
  previousCampaigns: string
  socialMediaLinks: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
  }
  
  // Compliance
  termsAccepted: boolean
  dataProcessingConsent: boolean
  marketingConsent: boolean
}

const categoryOptions = [
  { value: 'education', label: 'Education & Skill Development' },
  { value: 'healthcare', label: 'Healthcare & Medical Emergency' },
  { value: 'childWelfare', label: 'Child Welfare & Protection' },
  { value: 'women', label: 'Women Empowerment' },
  { value: 'elderly', label: 'Elderly Care' },
  { value: 'emergency', label: 'Emergency Relief' },
  { value: 'water', label: 'Water & Sanitation' },
  { value: 'food', label: 'Food Security & Nutrition' },
  { value: 'environment', label: 'Environment & Conservation' },
  { value: 'disaster', label: 'Disaster Relief & Recovery' },
  { value: 'animal', label: 'Animal Welfare' },
  { value: 'community', label: 'Community Development' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'technology', label: 'Technology & Innovation' }
]

const organizationTypes = [
  { value: 'ngo', label: 'Non-Governmental Organization (NGO)' },
  { value: 'charity', label: 'Registered Charity' },
  { value: 'foundation', label: 'Foundation' },
  { value: 'trust', label: 'Public/Private Trust' },
  { value: 'cooperative', label: 'Cooperative Society' },
  { value: 'individual', label: 'Individual/Personal Cause' }
]

const urgencyLevels = [
  { value: 'low', label: 'Low - Standard campaign', color: 'text-green-600' },
  { value: 'medium', label: 'Medium - Time-sensitive', color: 'text-yellow-600' },
  { value: 'high', label: 'High - Urgent need', color: 'text-orange-600' },
  { value: 'emergency', label: 'Emergency - Life-threatening', color: 'text-red-600' }
]

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 
  'Ladakh', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 
  'Lakshadweep', 'Andaman and Nicobar Islands'
]

const campaignCategories = [
  'Education & Literacy',
  'Healthcare & Medical',
  'Clean Water & Sanitation',
  'Food & Nutrition',
  'Disaster Relief',
  'Women Empowerment',
  'Child Welfare',
  'Senior Citizen Care',
  'Environmental Conservation',
  'Skill Development',
  'Animal Welfare',
  'Community Infrastructure',
  'Digital Literacy',
  'Mental Health Support'
]

export function CreateCampaignPage() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuthStore()
  const { createCampaign } = useCampaignStore()
  
  // Determine if user is admin
  const isAdmin = user?.role === 'admin'
  
  const [formData, setFormData] = useState<CampaignData>({
    // Organization Information
    organizationName: '',
    organizationType: 'ngo',
    organizationEmail: '',
    organizationPhone: '',
    organizationAddress: '',
    organizationWebsite: '',
    registrationNumber: '',
    taxExemptionNumber: '',
    establishedYear: '',
    
    // Campaign Details
    campaignTitle: '',
    category: '',
    subCategory: '',
    description: '',
    location: '',
    locationState: '',
    targetAmount: 0,
    duration: 30,
    urgency: 'medium',
    
    // Beneficiary Information
    beneficiaryCount: 0,
    beneficiaryAge: '',
    beneficiaryGender: '',
    beneficiaryDetails: '',
    impactStatement: '',
    
    // Milestones & Implementation
    milestones: [
      { title: '', amount: 0, description: '', timeline: '', deliverables: '' }
    ],
    implementation: '',
    timeline: '',
    
    // Verification Documents
    documents: {
      organizationCertificate: null,
      taxExemptionCertificate: null,
      projectProposal: null,
      budgetBreakdown: null,
      beneficiaryProof: null,
      previousWork: null
    },
    
    // Contact Person
    contactName: '',
    contactDesignation: '',
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
    
    // Additional Information
    previousCampaigns: '',
    socialMediaLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    },
    
    // Compliance
    termsAccepted: false,
    dataProcessingConsent: false,
    marketingConsent: false
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [announceMessage, setAnnounceMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const stepHeaderRef = useRef<HTMLHeadingElement>(null)

  const handleInputChange = (field: keyof CampaignData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.organizationName.trim()) errors.organizationName = 'Organization name is required'
        if (!formData.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required'
        if (!formData.organizationAddress.trim()) errors.organizationAddress = 'Organization address is required'
        if (!formData.organizationEmail.trim()) errors.organizationEmail = 'Organization email is required'
        if (!formData.organizationPhone.trim()) errors.organizationPhone = 'Organization phone is required'
        if (!formData.contactName.trim()) errors.contactName = 'Contact person name is required'
        if (!formData.contactDesignation.trim()) errors.contactDesignation = 'Contact designation is required'
        break
      case 2:
        if (!formData.campaignTitle.trim()) errors.campaignTitle = 'Campaign title is required'
        if (!formData.category) errors.category = 'Category is required'
        if (!formData.location.trim()) errors.location = 'Location is required'
        if (!formData.description.trim()) errors.description = 'Campaign description is required'
        if (!formData.targetAmount || formData.targetAmount < 10000) errors.targetAmount = 'Target amount must be at least ₹10,000'
        if (!formData.beneficiaryCount || formData.beneficiaryCount < 1) errors.beneficiaryCount = 'Number of beneficiaries is required'
        if (!formData.beneficiaryDetails.trim()) errors.beneficiaryDetails = 'Beneficiary details are required'
        break
      case 3:
        if (!formData.impactStatement.trim()) errors.impactStatement = 'Impact statement is required'
        if (!formData.implementation.trim()) errors.implementation = 'Implementation plan is required'
        break
      case 4:
        if (!formData.contactEmail.trim()) errors.contactEmail = 'Contact email is required'
        if (!formData.contactPhone.trim()) errors.contactPhone = 'Contact phone is required'
        break
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Focus management for step changes
  useEffect(() => {
    if (stepHeaderRef.current) {
      stepHeaderRef.current.focus()
      setAnnounceMessage(`Step ${currentStep}: ${steps[currentStep - 1].title}`)
    }
  }, [currentStep])

  // Announce form errors
  useEffect(() => {
    const errorCount = Object.keys(formErrors).length
    if (errorCount > 0) {
      setAnnounceMessage(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`)
    }
  }, [formErrors])

  const handleFileUpload = (field: keyof CampaignData['documents'], file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: file }
    }))
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', amount: 0, description: '', timeline: '', deliverables: '' }]
    }))
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep(currentStep)) {
      const firstErrorField = Object.keys(formErrors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`) as HTMLElement
      if (errorElement) {
        errorElement.focus()
      }
      return
    }
    
    setIsSubmitting(true)
    setAnnounceMessage('Submitting campaign for review...')
    
    try {
      // Create campaign via API
      await createCampaign({
        title: formData.campaignTitle,
        description: formData.description,
        targetAmount: formData.targetAmount,
        category: formData.category,
        location: {
          state: formData.locationState,
          city: formData.location,
          pincode: '000000'
        },
        beneficiaries: formData.beneficiaryCount,
        endDate: new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toISOString(),
        images: [{
          url: '/images/campaigns/default.png'
        }],
        tags: formData.category ? [formData.category] : []
      })
      
      setIsSubmitting(false)
      setIsSubmitted(true)
      
      toast({
        title: 'Campaign Submitted! 🎉',
        description: isAdmin ? 'Campaign created and approved!' : 'Submitted for admin review.',
        variant: 'success',
      })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (isAdmin) {
          window.location.href = '/admin'
        } else {
          window.location.href = '/campaigns'
        }
      }, 2000)
      
    } catch (error) {
      setIsSubmitting(false)
      toast({
        title: 'Error',
        description: 'Failed to submit campaign. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-warm-cream py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="warm-card p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-24 h-24 bg-warm-green rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              
              <h1 className="text-3xl section-heading mb-4 transform -rotate-1">
                Campaign Under Review! 🔍
              </h1>
              
              <p className="text-lg text-warm-charcoal-light mb-8">
                Thank you for submitting your campaign! Our verification team will thoroughly review your submission, 
                verify all documents, and conduct due diligence checks. You'll hear from us within 48-72 hours.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2 text-warm-green">
                  <CheckCircle className="h-5 w-5" />
                  <span>Campaign details submitted</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-orange">
                  <Shield className="h-5 w-5" />
                  <span>Document verification in progress</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-blue">
                  <Clock className="h-5 w-5" />
                  <span>Due diligence check: 48-72 hours</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-warm-green">
                  <Star className="h-5 w-5" />
                  <span>Campaign will go live upon approval</span>
                </div>
              </div>
              
              <div className="bg-warm-orange/10 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-warm-charcoal mb-2">What happens next?</h3>
                <ul className="text-sm text-warm-charcoal-light space-y-1 text-left">
                  <li>• Document verification by our legal team</li>
                  <li>• Background check on organization</li>
                  <li>• Review of proposed milestones and budget</li>
                  <li>• Final approval and campaign activation</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="btn-handmade">
                  <Link to="/campaigns">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Browse Existing Campaigns
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white">
                  <Link to="/">
                    <Heart className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, title: 'Organization Details', icon: Shield },
    { id: 2, title: 'Campaign Information', icon: Heart },
    { id: 3, title: 'Milestones & Budget', icon: Target },
    { id: 4, title: 'Documents & Verification', icon: FileText }
  ]

  const handleStepNavigation = (nextStep: number) => {
    if (nextStep > currentStep && !validateStep(currentStep)) {
      const firstErrorField = Object.keys(formErrors)[0]
      const errorElement = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`) as HTMLElement
      if (errorElement) {
        errorElement.focus()
      }
      return
    }
    setCurrentStep(nextStep)
  }

  return (
    <div className="min-h-screen bg-warm-cream py-4 sm:py-6 lg:py-8">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-warm-orange text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-warm-orange focus:ring-offset-2"
      >
        Skip to main content
      </a>
      
      {/* ARIA Live Region for Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announceMessage}
      </div>
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl lg:max-w-5xl mx-auto"
        >
          {/* Header */}
          <header className="text-center mb-8 sm:mb-10 lg:mb-12">
            {isAdmin && (
              <div className="mb-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-purple-700">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Admin Campaign Creation</span>
                </div>
                <p className="text-sm text-purple-600 mt-1">
                  As an admin, your campaigns will be auto-approved and have additional verification features.
                </p>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl section-heading mb-3 sm:mb-4 transform -rotate-1">
              Start a Campaign<br />
              <span className="block">Make a Difference! 🌟</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-warm-charcoal-light max-w-3xl mx-auto px-2">
              Create a transparent, blockchain-verified campaign to raise funds for your charitable cause. 
              Our platform ensures 100% transparency and helps you connect with generous donors worldwide.
              {!isAdmin && (
                <span className="block mt-2 text-sm text-orange-600">
                  📋 Note: Your campaign will require admin approval before going live.
                </span>
              )}
            </p>
          </header>

          {/* Progress Steps */}
          <nav aria-label="Campaign creation progress" className="mb-6 sm:mb-8">
            <div className="flex justify-between items-center overflow-x-auto pb-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'bg-warm-orange border-warm-orange text-white' 
                        : 'border-warm-orange/30 text-warm-orange/50'
                    }`}
                    aria-label={`Step ${step.id}: ${step.title}${currentStep >= step.id ? ' (completed)' : ''}`}
                  >
                    <step.icon className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true" />
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-8 sm:w-full h-1 mx-2 sm:mx-4 transition-all duration-300 ${
                        currentStep > step.id ? 'bg-warm-orange' : 'bg-warm-orange/20'
                      }`} 
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <h2 
                ref={stepHeaderRef}
                className="text-lg sm:text-xl section-heading"
                tabIndex={-1}
                id="step-title"
              >
                {steps[currentStep - 1].title}
              </h2>
            </div>
          </nav>

          {/* Main Form Content */}
          <main id="main-content">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="warm-card p-4 sm:p-6 lg:p-8"
            >
              <form ref={formRef} onSubmit={handleSubmit} noValidate>
                {/* Step 1: Organization Details */}
                {currentStep === 1 && (
                  <fieldset className="space-y-4 sm:space-y-6">
                    <legend className="sr-only">Organization Details</legend>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="organizationName" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Name *
                      </label>
                      <input
                        id="organizationName"
                        name="organizationName"
                        type="text"
                        required
                        aria-invalid={formErrors.organizationName ? 'true' : 'false'}
                        aria-describedby={formErrors.organizationName ? 'organizationName-error' : 'organizationName-help'}
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.organizationName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="Your registered organization name"
                      />
                      <div id="organizationName-help" className="text-xs text-warm-charcoal-light mt-1">
                        Enter the full legal name of your organization
                      </div>
                      {formErrors.organizationName && (
                        <div id="organizationName-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.organizationName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="registrationNumber" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Registration Number *
                      </label>
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        required
                        aria-invalid={formErrors.registrationNumber ? 'true' : 'false'}
                        aria-describedby={formErrors.registrationNumber ? 'registrationNumber-error' : 'registrationNumber-help'}
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.registrationNumber 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="Government registration number"
                      />
                      <div id="registrationNumber-help" className="text-xs text-warm-charcoal-light mt-1">
                        Official government registration or license number
                      </div>
                      {formErrors.registrationNumber && (
                        <div id="registrationNumber-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.registrationNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="organizationAddress" className="block text-sm font-medium text-warm-charcoal mb-2">
                      Organization Address *
                    </label>
                    <textarea
                      id="organizationAddress"
                      name="organizationAddress"
                      required
                      aria-invalid={formErrors.organizationAddress ? 'true' : 'false'}
                      aria-describedby={formErrors.organizationAddress ? 'organizationAddress-error' : 'organizationAddress-help'}
                      value={formData.organizationAddress}
                      onChange={(e) => handleInputChange('organizationAddress', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white resize-none transition-colors ${
                        formErrors.organizationAddress 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                      }`}
                      placeholder="Complete registered address"
                    />
                    <div id="organizationAddress-help" className="text-xs text-warm-charcoal-light mt-1">
                      Include street address, city, state, and postal code
                    </div>
                    {formErrors.organizationAddress && (
                      <div id="organizationAddress-error" className="text-red-600 text-sm mt-1" role="alert">
                        {formErrors.organizationAddress}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="organizationEmail" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Email *
                      </label>
                      <input
                        id="organizationEmail"
                        name="organizationEmail"
                        type="email"
                        required
                        aria-invalid={formErrors.organizationEmail ? 'true' : 'false'}
                        aria-describedby={formErrors.organizationEmail ? 'organizationEmail-error' : 'organizationEmail-help'}
                        value={formData.organizationEmail}
                        onChange={(e) => handleInputChange('organizationEmail', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.organizationEmail 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="official@organization.org"
                      />
                      <div id="organizationEmail-help" className="text-xs text-warm-charcoal-light mt-1">
                        Official email address for organization correspondence
                      </div>
                      {formErrors.organizationEmail && (
                        <div id="organizationEmail-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.organizationEmail}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="organizationPhone" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Phone *
                      </label>
                      <input
                        id="organizationPhone"
                        name="organizationPhone"
                        type="tel"
                        required
                        aria-invalid={formErrors.organizationPhone ? 'true' : 'false'}
                        aria-describedby={formErrors.organizationPhone ? 'organizationPhone-error' : 'organizationPhone-help'}
                        value={formData.organizationPhone}
                        onChange={(e) => handleInputChange('organizationPhone', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.organizationPhone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      <div id="organizationPhone-help" className="text-xs text-warm-charcoal-light mt-1">
                        Include country code and area code
                      </div>
                      {formErrors.organizationPhone && (
                        <div id="organizationPhone-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.organizationPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person Name *
                      </label>
                      <input
                        id="contactName"
                        name="contactName"
                        type="text"
                        required
                        aria-invalid={formErrors.contactName ? 'true' : 'false'}
                        aria-describedby={formErrors.contactName ? 'contactName-error' : 'contactName-help'}
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.contactName 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="Primary contact person"
                      />
                      <div id="contactName-help" className="text-xs text-warm-charcoal-light mt-1">
                        Full name of the main contact person
                      </div>
                      {formErrors.contactName && (
                        <div id="contactName-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.contactName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="contactDesignation" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Designation *
                      </label>
                      <input
                        id="contactDesignation"
                        name="contactDesignation"
                        type="text"
                        required
                        aria-invalid={formErrors.contactDesignation ? 'true' : 'false'}
                        aria-describedby={formErrors.contactDesignation ? 'contactDesignation-error' : 'contactDesignation-help'}
                        value={formData.contactDesignation}
                        onChange={(e) => handleInputChange('contactDesignation', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.contactDesignation 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="CEO, Director, Project Manager, etc."
                      />
                      <div id="contactDesignation-help" className="text-xs text-warm-charcoal-light mt-1">
                        Job title or role within the organization
                      </div>
                      {formErrors.contactDesignation && (
                        <div id="contactDesignation-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.contactDesignation}
                        </div>
                      )}
                    </div>
                  </div>
                </fieldset>
              )}

                {/* Step 2: Campaign Information */}
                {currentStep === 2 && (
                  <fieldset className="space-y-6">
                    <legend className="sr-only">Campaign Information</legend>
                  <div>
                    <label htmlFor="campaignTitle" className="block text-sm font-medium text-warm-charcoal mb-2">
                      Campaign Title *
                    </label>
                    <input
                      id="campaignTitle"
                      name="campaignTitle"
                      type="text"
                      required
                      aria-invalid={formErrors.campaignTitle ? 'true' : 'false'}
                      aria-describedby={formErrors.campaignTitle ? 'campaignTitle-error' : 'campaignTitle-help'}
                      value={formData.campaignTitle}
                      onChange={(e) => handleInputChange('campaignTitle', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                        formErrors.campaignTitle 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                      }`}
                      placeholder="e.g., Clean Water for 500 Families in Rural Maharashtra"
                    />
                    <div id="campaignTitle-help" className="text-xs text-warm-charcoal-light mt-1">
                      Choose a clear, descriptive title that explains your campaign's purpose
                    </div>
                    {formErrors.campaignTitle && (
                      <div id="campaignTitle-error" className="text-red-600 text-sm mt-1" role="alert">
                        {formErrors.campaignTitle}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        aria-invalid={formErrors.category ? 'true' : 'false'}
                        aria-describedby={formErrors.category ? 'category-error' : 'category-help'}
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.category 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {categoryOptions.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                      <div id="category-help" className="text-xs text-warm-charcoal-light mt-1">
                        Choose the category that best describes your campaign
                      </div>
                      {formErrors.category && (
                        <div id="category-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.category}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Location *
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        required
                        aria-invalid={formErrors.location ? 'true' : 'false'}
                        aria-describedby={formErrors.location ? 'location-error' : 'location-help'}
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.location 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="City, State, Country"
                      />
                      <div id="location-help" className="text-xs text-warm-charcoal-light mt-1">
                        Where will this campaign have its impact?
                      </div>
                      {formErrors.location && (
                        <div id="location-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-warm-charcoal mb-2">
                      Campaign Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      aria-invalid={formErrors.description ? 'true' : 'false'}
                      aria-describedby={formErrors.description ? 'description-error' : 'description-help'}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={5}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white resize-none transition-colors ${
                        formErrors.description 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                      }`}
                      placeholder="Describe the problem, your solution, and the impact it will create..."
                    />
                    <div id="description-help" className="text-xs text-warm-charcoal-light mt-1">
                      Explain the problem you're solving, your approach, and expected outcomes
                    </div>
                    {formErrors.description && (
                      <div id="description-error" className="text-red-600 text-sm mt-1" role="alert">
                        {formErrors.description}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="targetAmount" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Target Amount (₹) *
                      </label>
                      <input
                        id="targetAmount"
                        name="targetAmount"
                        type="number"
                        required
                        min="10000"
                        aria-invalid={formErrors.targetAmount ? 'true' : 'false'}
                        aria-describedby={formErrors.targetAmount ? 'targetAmount-error' : 'targetAmount-help'}
                        value={formData.targetAmount}
                        onChange={(e) => handleInputChange('targetAmount', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.targetAmount 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="100000"
                      />
                      <div id="targetAmount-help" className="text-xs text-warm-charcoal-light mt-1">
                        Minimum amount: ₹10,000
                      </div>
                      {formErrors.targetAmount && (
                        <div id="targetAmount-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.targetAmount}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Campaign Duration (days) *
                      </label>
                      <input
                        id="duration"
                        name="duration"
                        type="number"
                        required
                        min="7"
                        max="365"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white focus:ring-2 focus:ring-warm-orange/20"
                        aria-describedby="duration-help"
                      />
                      <div id="duration-help" className="text-xs text-warm-charcoal-light mt-1">
                        Between 7 and 365 days
                      </div>
                    </div>
                    <div>
                      <label htmlFor="urgency" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Urgency Level *
                      </label>
                      <select
                        id="urgency"
                        name="urgency"
                        required
                        value={formData.urgency}
                        onChange={(e) => handleInputChange('urgency', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white focus:ring-2 focus:ring-warm-orange/20"
                        aria-describedby="urgency-help"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="emergency">Emergency</option>
                      </select>
                      <div id="urgency-help" className="text-xs text-warm-charcoal-light mt-1">
                        How urgent is your campaign?
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="beneficiaryCount" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Number of Beneficiaries *
                      </label>
                      <input
                        id="beneficiaryCount"
                        name="beneficiaryCount"
                        type="number"
                        required
                        min="1"
                        aria-invalid={formErrors.beneficiaryCount ? 'true' : 'false'}
                        aria-describedby={formErrors.beneficiaryCount ? 'beneficiaryCount-error' : 'beneficiaryCount-help'}
                        value={formData.beneficiaryCount}
                        onChange={(e) => handleInputChange('beneficiaryCount', parseInt(e.target.value))}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.beneficiaryCount 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="500"
                      />
                      <div id="beneficiaryCount-help" className="text-xs text-warm-charcoal-light mt-1">
                        How many people will benefit from this campaign?
                      </div>
                      {formErrors.beneficiaryCount && (
                        <div id="beneficiaryCount-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.beneficiaryCount}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="beneficiaryDetails" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Beneficiary Details *
                      </label>
                      <textarea
                        id="beneficiaryDetails"
                        name="beneficiaryDetails"
                        required
                        aria-invalid={formErrors.beneficiaryDetails ? 'true' : 'false'}
                        aria-describedby={formErrors.beneficiaryDetails ? 'beneficiaryDetails-error' : 'beneficiaryDetails-help'}
                        value={formData.beneficiaryDetails}
                        onChange={(e) => handleInputChange('beneficiaryDetails', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white resize-none transition-colors ${
                          formErrors.beneficiaryDetails 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="Who will benefit from this campaign?"
                      />
                      <div id="beneficiaryDetails-help" className="text-xs text-warm-charcoal-light mt-1">
                        Describe who will benefit and how
                      </div>
                      {formErrors.beneficiaryDetails && (
                        <div id="beneficiaryDetails-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.beneficiaryDetails}
                        </div>
                      )}
                    </div>
                  </div>
                </fieldset>
              )}

                {/* Step 3: Milestones & Budget */}
                {currentStep === 3 && (
                  <fieldset className="space-y-6">
                    <legend className="sr-only">Milestones and Budget Planning</legend>
                  <div>
                    <label htmlFor="impactStatement" className="block text-sm font-medium text-warm-charcoal mb-2">
                      Expected Impact Statement *
                    </label>
                    <textarea
                      id="impactStatement"
                      name="impactStatement"
                      required
                      aria-invalid={formErrors.impactStatement ? 'true' : 'false'}
                      aria-describedby={formErrors.impactStatement ? 'impactStatement-error' : 'impactStatement-help'}
                      value={formData.impactStatement}
                      onChange={(e) => handleInputChange('impactStatement', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white resize-none transition-colors ${
                        formErrors.impactStatement 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                      }`}
                      placeholder="What measurable impact will this campaign create?"
                    />
                    <div id="impactStatement-help" className="text-xs text-warm-charcoal-light mt-1">
                      Describe the specific, measurable outcomes and long-term impact
                    </div>
                    {formErrors.impactStatement && (
                      <div id="impactStatement-error" className="text-red-600 text-sm mt-1" role="alert">
                        {formErrors.impactStatement}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg section-heading">Project Milestones</h3>
                      <Button 
                        type="button" 
                        onClick={addMilestone} 
                        variant="outline" 
                        size="sm"
                        className="focus:outline-none focus:ring-2 focus:ring-warm-orange focus:ring-offset-2"
                        aria-describedby="milestone-help"
                      >
                        + Add Milestone
                      </Button>
                    </div>
                    <div id="milestone-help" className="text-xs text-warm-charcoal-light mb-4">
                      Break down your project into achievable milestones with specific deliverables
                    </div>
                    
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="bg-warm-cream/50 p-4 rounded-xl mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-warm-charcoal mb-1 sm:mb-2">
                              Milestone {index + 1} Title *
                            </label>
                            <input
                              type="text"
                              required
                              value={milestone.title}
                              onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white"
                              placeholder="e.g., Water pump installation"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-warm-charcoal mb-1 sm:mb-2">
                              Amount (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              value={milestone.amount}
                              onChange={(e) => updateMilestone(index, 'amount', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-warm-charcoal mb-1 sm:mb-2">
                              Description *
                            </label>
                            <textarea
                              required
                              value={milestone.description}
                              onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-warm-charcoal mb-1 sm:mb-2">
                              Timeline *
                            </label>
                            <input
                              type="text"
                              required
                              value={milestone.timeline}
                              onChange={(e) => updateMilestone(index, 'timeline', e.target.value)}
                              className="w-full px-3 py-2 border border-warm-orange/30 rounded-lg focus:border-warm-orange focus:outline-none bg-white"
                              placeholder="e.g., Week 1-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label htmlFor="implementation" className="block text-sm font-medium text-warm-charcoal mb-2">
                      Implementation Plan *
                    </label>
                    <textarea
                      id="implementation"
                      name="implementation"
                      required
                      aria-invalid={formErrors.implementation ? 'true' : 'false'}
                      aria-describedby={formErrors.implementation ? 'implementation-error' : 'implementation-help'}
                      value={formData.implementation}
                      onChange={(e) => handleInputChange('implementation', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white resize-none transition-colors ${
                        formErrors.implementation 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                      }`}
                      placeholder="Detailed plan of how you will execute this project..."
                    />
                    <div id="implementation-help" className="text-xs text-warm-charcoal-light mt-1">
                      Provide a detailed step-by-step plan for executing your project
                    </div>
                    {formErrors.implementation && (
                      <div id="implementation-error" className="text-red-600 text-sm mt-1" role="alert">
                        {formErrors.implementation}
                      </div>
                    )}
                  </div>
                </fieldset>
              )}

                {/* Step 4: Documents */}
                {currentStep === 4 && (
                  <fieldset className="space-y-6">
                    <legend className="sr-only">Document Upload and Verification</legend>
                  {isAdmin ? (
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl mb-6" role="region" aria-labelledby="admin-document-requirements">
                      <h3 id="admin-document-requirements" className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Admin Campaign Creation
                      </h3>
                      <p className="text-sm text-purple-600">
                        As an admin, document verification is optional. Your campaigns will be auto-approved.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-warm-orange/10 p-4 rounded-xl mb-6" role="region" aria-labelledby="document-requirements">
                      <h3 id="document-requirements" className="font-bold text-warm-charcoal mb-2">Required Documents</h3>
                      <p className="text-sm text-warm-charcoal-light">
                        Upload clear, high-quality scans of all required documents. All documents will be verified by our team.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="organizationCertificate" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Organization Registration Certificate {!isAdmin && '*'}
                      </label>
                      <input
                        id="organizationCertificate"
                        name="organizationCertificate"
                        type="file"
                        required={!isAdmin}
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('organizationCertificate', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white focus:ring-2 focus:ring-warm-orange/20"
                        aria-describedby="organizationCertificate-help"
                      />
                      <div id="organizationCertificate-help" className="text-xs text-warm-charcoal-light mt-1">
                        Accepted formats: PDF, JPG, PNG (max 10MB)
                      </div>
                    </div>
                    <div>
                      <label htmlFor="projectProposal" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Detailed Project Proposal {!isAdmin && '*'}
                      </label>
                      <input
                        id="projectProposal"
                        name="projectProposal"
                        type="file"
                        required={!isAdmin}
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload('projectProposal', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white focus:ring-2 focus:ring-warm-orange/20"
                        aria-describedby="projectProposal-help"
                      />
                      <div id="projectProposal-help" className="text-xs text-warm-charcoal-light mt-1">
                        Accepted formats: PDF, DOC, DOCX (max 10MB)
                      </div>
                    </div>
                    <div>
                      <label htmlFor="budgetBreakdown" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Budget Breakdown *
                      </label>
                      <input
                        id="budgetBreakdown"
                        name="budgetBreakdown"
                        type="file"
                        required
                        accept=".pdf,.xlsx,.xls"
                        onChange={(e) => handleFileUpload('budgetBreakdown', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white focus:ring-2 focus:ring-warm-orange/20"
                        aria-describedby="budgetBreakdown-help"
                      />
                      <div id="budgetBreakdown-help" className="text-xs text-warm-charcoal-light mt-1">
                        Accepted formats: PDF, XLSX, XLS (max 10MB)
                      </div>
                    </div>
                    <div>
                      <label htmlFor="beneficiaryProof" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Beneficiary Identification Proof *
                      </label>
                      <input
                        id="beneficiaryProof"
                        name="beneficiaryProof"
                        type="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload('beneficiaryProof', e.target.files?.[0] || null)}
                        className="w-full px-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none bg-white focus:ring-2 focus:ring-warm-orange/20"
                        aria-describedby="beneficiaryProof-help"
                      />
                      <div id="beneficiaryProof-help" className="text-xs text-warm-charcoal-light mt-1">
                        Accepted formats: PDF, JPG, PNG (max 10MB)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="contactEmail" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person Email *
                      </label>
                      <input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        required
                        aria-invalid={formErrors.contactEmail ? 'true' : 'false'}
                        aria-describedby={formErrors.contactEmail ? 'contactEmail-error' : 'contactEmail-help'}
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.contactEmail 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="contact@organization.org"
                      />
                      <div id="contactEmail-help" className="text-xs text-warm-charcoal-light mt-1">
                        Primary email for campaign-related communication
                      </div>
                      {formErrors.contactEmail && (
                        <div id="contactEmail-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.contactEmail}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="contactPhone" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Contact Person Phone *
                      </label>
                      <input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        required
                        aria-invalid={formErrors.contactPhone ? 'true' : 'false'}
                        aria-describedby={formErrors.contactPhone ? 'contactPhone-error' : 'contactPhone-help'}
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none bg-white transition-colors ${
                          formErrors.contactPhone 
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                            : 'border-warm-orange/30 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20'
                        }`}
                        placeholder="+91 98765 43210"
                      />
                      <div id="contactPhone-help" className="text-xs text-warm-charcoal-light mt-1">
                        Include country code for international support
                      </div>
                      {formErrors.contactPhone && (
                        <div id="contactPhone-error" className="text-red-600 text-sm mt-1" role="alert">
                          {formErrors.contactPhone}
                        </div>
                      )}
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between pt-6 sm:pt-8">
                {/* Help text for screen readers */}
                <div className="sr-only">
                  <div id="next-step-help">Proceed to the next step of campaign creation</div>
                  <div id="submit-help">Submit your campaign for review and verification</div>
                  <div id="submitting-help">Please wait while your campaign is being submitted</div>
                  <div id="previous-help">Go back to the previous step</div>
                </div>
                
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleStepNavigation(currentStep - 1)}
                    className="w-full sm:w-auto border-warm-orange text-warm-orange hover:bg-warm-orange hover:text-white focus:outline-none focus:ring-2 focus:ring-warm-orange focus:ring-offset-2"
                    aria-describedby="previous-help"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => handleStepNavigation(currentStep + 1)}
                    className="w-full sm:w-auto btn-handmade sm:ml-auto order-first sm:order-last focus:outline-none focus:ring-2 focus:ring-warm-orange focus:ring-offset-2"
                    aria-describedby="next-step-help"
                  >
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto btn-handmade sm:ml-auto order-first sm:order-last focus:outline-none focus:ring-2 focus:ring-warm-orange focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-describedby={isSubmitting ? "submitting-help" : "submit-help"}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-3"
                          aria-hidden="true"
                        >
                          ⏳
                        </motion.div>
                        <span className="hidden sm:inline">Submitting Campaign...</span>
                        <span className="sm:hidden">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" aria-hidden="true" />
                        <span className="hidden sm:inline">Submit Campaign for Review</span>
                        <span className="sm:hidden">Submit Campaign</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </main>
      </motion.div>
    </div>
  </div>
  )
}
