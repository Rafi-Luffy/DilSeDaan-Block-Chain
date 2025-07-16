import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, Upload, MapPin, Calendar, DollarSign, Users, Star, CheckCircle, 
  ArrowRight, Shield, FileText, Target, Clock, Building, Mail, Phone, 
  User, Globe, Award, Plus, Minus, AlertCircle, Camera, Link as LinkIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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
  { value: 'education', label: 'Education & Skill Development', icon: '📚' },
  { value: 'healthcare', label: 'Healthcare & Medical Emergency', icon: '🏥' },
  { value: 'childWelfare', label: 'Child Welfare & Protection', icon: '👶' },
  { value: 'women', label: 'Women Empowerment', icon: '👩' },
  { value: 'elderly', label: 'Elderly Care', icon: '👴' },
  { value: 'emergency', label: 'Emergency Relief', icon: '🚨' },
  { value: 'water', label: 'Water & Sanitation', icon: '💧' },
  { value: 'food', label: 'Food Security & Nutrition', icon: '🍲' },
  { value: 'environment', label: 'Environment & Conservation', icon: '🌱' },
  { value: 'disaster', label: 'Disaster Relief & Recovery', icon: '🌪️' },
  { value: 'animal', label: 'Animal Welfare', icon: '🐾' },
  { value: 'community', label: 'Community Development', icon: '🏘️' },
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
  { value: 'low', label: 'Standard Campaign', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'medium', label: 'Time-Sensitive', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'high', label: 'Urgent Need', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'emergency', label: 'Life-Threatening Emergency', color: 'text-red-600', bg: 'bg-red-50' }
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

export function CreateCampaignPageNew() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    description: '',
    location: '',
    locationState: '',
    targetAmount: 0,
    duration: 30,
    urgency: 'medium',
    
    // Beneficiary Information
    beneficiaryCount: 1,
    beneficiaryAge: '',
    beneficiaryGender: '',
    beneficiaryDetails: '',
    impactStatement: '',
    
    // Milestones & Implementation
    milestones: [{ title: '', amount: 0, description: '', timeline: '', deliverables: '' }],
    implementation: '',
    timeline: '',
    
    // Verification Documents
    documents: {
      organizationCertificate: null,
      taxExemptionCertificate: null,
      projectProposal: null,
      budgetBreakdown: null,
      beneficiaryProof: null,
      previousWork: null,
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

  const steps = [
    { id: 1, title: 'Organization Info', icon: Building, description: 'Tell us about your organization' },
    { id: 2, title: 'Campaign Details', icon: Target, description: 'Describe your campaign' },
    { id: 3, title: 'Beneficiary Info', icon: Users, description: 'Who will benefit?' },
    { id: 4, title: 'Implementation Plan', icon: Calendar, description: 'How will you execute?' },
    { id: 5, title: 'Documents & Verification', icon: FileText, description: 'Upload required documents' },
    { id: 6, title: 'Review & Submit', icon: CheckCircle, description: 'Final review before submission' }
  ]

  const updateFormData = (field: keyof CampaignData | string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof CampaignData] as any),
            [child]: value
          }
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', amount: 0, description: '', timeline: '', deliverables: '' }]
    }))
  }

  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      setFormData(prev => ({
        ...prev,
        milestones: prev.milestones.filter((_, i) => i !== index)
      }))
    }
  }

  const updateMilestone = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.map((milestone, i) => 
        i === index ? { ...milestone, [field]: value } : milestone
      )
    }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    updateFormData(`documents.${field}`, file)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Organization Info
        return !!(formData.organizationName && formData.organizationEmail && formData.organizationPhone && formData.registrationNumber)
      case 2: // Campaign Details
        return !!(formData.campaignTitle && formData.category && formData.description && formData.targetAmount > 0)
      case 3: // Beneficiary Info
        return !!(formData.beneficiaryCount > 0 && formData.beneficiaryDetails && formData.impactStatement)
      case 4: // Implementation
        return !!(formData.implementation && formData.milestones.every(m => m.title && m.amount > 0))
      case 5: // Documents
        return !!(formData.documents.organizationCertificate && formData.documents.projectProposal)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6))
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive",
      })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!formData.termsAccepted || !formData.dataProcessingConsent) {
      toast({
        title: "Consent Required",
        description: "Please accept the terms and conditions and data processing consent.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: t('createCampaign.success.title'),
        description: t('createCampaign.success.description'),
      })
      
      // Reset form
      setCurrentStep(1)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Organization Information
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => updateFormData('organizationName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your organization name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Type *
                </label>
                <select
                  value={formData.organizationType}
                  onChange={(e) => updateFormData('organizationType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {organizationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.organizationEmail}
                  onChange={(e) => updateFormData('organizationEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="organization@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.organizationPhone}
                  onChange={(e) => updateFormData('organizationPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Registration/License number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Exemption Number (80G/12A)
                </label>
                <input
                  type="text"
                  value={formData.taxExemptionNumber}
                  onChange={(e) => updateFormData('taxExemptionNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="80G or 12A certificate number"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Address *
              </label>
              <textarea
                value={formData.organizationAddress}
                onChange={(e) => updateFormData('organizationAddress', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Complete address with pin code"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (if any)
                </label>
                <input
                  type="url"
                  value={formData.organizationWebsite}
                  onChange={(e) => updateFormData('organizationWebsite', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="https://www.yourorganization.org"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established Year
                </label>
                <input
                  type="number"
                  value={formData.establishedYear}
                  onChange={(e) => updateFormData('establishedYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>
        )

      case 2: // Campaign Details
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.campaignTitle}
                onChange={(e) => updateFormData('campaignTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Give your campaign a compelling title"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map(category => (
                    <button
                      key={category.value}
                      onClick={() => updateFormData('category', category.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        formData.category === category.value
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{category.icon}</div>
                      <div className="text-sm font-medium">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <div className="space-y-2">
                  {urgencyLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => updateFormData('urgency', level.value)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        formData.urgency === level.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${level.bg}`}
                    >
                      <div className={`font-medium ${level.color}`}>{level.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe your campaign in detail. What is the problem you're solving? How will the funds be used?"
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (₹) *
                </label>
                <input
                  type="number"
                  value={formData.targetAmount || ''}
                  onChange={(e) => updateFormData('targetAmount', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="100000"
                  min="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="7"
                  max="365"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location State *
                </label>
                <select
                  value={formData.locationState}
                  onChange={(e) => updateFormData('locationState', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Location/Area *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="City, District, Village or specific area"
              />
            </div>
          </div>
        )

      case 3: // Beneficiary Information
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Beneficiaries *
                </label>
                <input
                  type="number"
                  value={formData.beneficiaryCount}
                  onChange={(e) => updateFormData('beneficiaryCount', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Group
                </label>
                <select
                  value={formData.beneficiaryAge}
                  onChange={(e) => updateFormData('beneficiaryAge', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Age Group</option>
                  <option value="children">Children (0-18)</option>
                  <option value="youth">Youth (18-35)</option>
                  <option value="adults">Adults (35-60)</option>
                  <option value="elderly">Elderly (60+)</option>
                  <option value="mixed">Mixed Age Groups</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender Focus
                </label>
                <select
                  value={formData.beneficiaryGender}
                  onChange={(e) => updateFormData('beneficiaryGender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select Gender</option>
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="girls">Girls</option>
                  <option value="boys">Boys</option>
                  <option value="mixed">All Genders</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficiary Details *
              </label>
              <textarea
                value={formData.beneficiaryDetails}
                onChange={(e) => updateFormData('beneficiaryDetails', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe who will benefit from this campaign. Include their current situation, challenges they face, and why they need help."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Impact Statement *
              </label>
              <textarea
                value={formData.impactStatement}
                onChange={(e) => updateFormData('impactStatement', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="What positive change will this campaign create? How will you measure success? What will be different after the campaign?"
              />
            </div>
          </div>
        )

      case 4: // Implementation Plan
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Plan *
              </label>
              <textarea
                value={formData.implementation}
                onChange={(e) => updateFormData('implementation', e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe how you will implement this campaign. What are the key activities? How will you ensure transparency?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => updateFormData('timeline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="e.g., Phase 1: 1-3 months, Phase 2: 4-6 months"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Milestones *</h3>
                <Button onClick={addMilestone} className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" /> Add Milestone
                </Button>
              </div>
              
              {formData.milestones.map((milestone, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Milestone {index + 1}</h4>
                    {formData.milestones.length > 1 && (
                      <Button
                        onClick={() => removeMilestone(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Milestone Title *
                      </label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., Purchase educational materials"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        value={milestone.amount || ''}
                        onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="25000"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Describe what will be accomplished in this milestone"
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={milestone.timeline}
                        onChange={(e) => updateMilestone(index, 'timeline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., Week 1-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deliverables
                      </label>
                      <input
                        type="text"
                        value={milestone.deliverables}
                        onChange={(e) => updateMilestone(index, 'deliverables', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., 500 textbooks distributed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 5: // Documents & Verification
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Document Requirements</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Please upload clear, readable documents in PDF or JPG format. Maximum file size: 5MB per document.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FileUploadField
                label="Organization Certificate *"
                description="Registration certificate, trust deed, or incorporation documents"
                file={formData.documents.organizationCertificate}
                onChange={(file) => handleFileUpload('organizationCertificate', file)}
              />
              
              <FileUploadField
                label="Tax Exemption Certificate"
                description="80G or 12A certificate (if applicable)"
                file={formData.documents.taxExemptionCertificate}
                onChange={(file) => handleFileUpload('taxExemptionCertificate', file)}
              />
              
              <FileUploadField
                label="Project Proposal *"
                description="Detailed project proposal with budget breakdown"
                file={formData.documents.projectProposal}
                onChange={(file) => handleFileUpload('projectProposal', file)}
              />
              
              <FileUploadField
                label="Budget Breakdown"
                description="Detailed budget showing how funds will be used"
                file={formData.documents.budgetBreakdown}
                onChange={(file) => handleFileUpload('budgetBreakdown', file)}
              />
              
              <FileUploadField
                label="Beneficiary Proof"
                description="Photos, documents, or evidence of beneficiaries"
                file={formData.documents.beneficiaryProof}
                onChange={(file) => handleFileUpload('beneficiaryProof', file)}
              />
              
              <FileUploadField
                label="Previous Work"
                description="Photos or reports of your previous work (if any)"
                file={formData.documents.previousWork}
                onChange={(file) => handleFileUpload('previousWork', file)}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => updateFormData('contactName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Full name of primary contact"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.contactDesignation}
                    onChange={(e) => updateFormData('contactDesignation', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Director, Coordinator, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="contact@organization.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactWhatsapp}
                    onChange={(e) => updateFormData('contactWhatsapp', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 6: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex">
                <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-green-800">Ready to Submit!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Please review your campaign details below and accept the terms to submit your campaign.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Campaign Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>Organization:</strong> {formData.organizationName}</div>
                <div><strong>Campaign Title:</strong> {formData.campaignTitle}</div>
                <div><strong>Category:</strong> {categoryOptions.find(c => c.value === formData.category)?.label}</div>
                <div><strong>Target Amount:</strong> ₹{formData.targetAmount?.toLocaleString()}</div>
                <div><strong>Beneficiaries:</strong> {formData.beneficiaryCount}</div>
                <div><strong>Location:</strong> {formData.location}, {formData.locationState}</div>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => updateFormData('termsAccepted', e.target.checked)}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I accept the <Link to="/terms" className="text-orange-600 hover:underline">Terms and Conditions</Link> and 
                  confirm that all information provided is accurate and truthful. *
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={formData.dataProcessingConsent}
                  onChange={(e) => updateFormData('dataProcessingConsent', e.target.checked)}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  I consent to the processing of my personal data as described in the 
                  <Link to="/privacy" className="text-orange-600 hover:underline"> Privacy Policy</Link>. *
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={formData.marketingConsent}
                  onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                  className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="marketing" className="text-sm text-gray-700">
                  I agree to receive campaign updates and marketing communications (optional).
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('createCampaign.title')}</h1>
          <p className="text-lg text-gray-600">{t('createCampaign.subtitle')}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center max-w-[120px]">
                <div className="text-sm font-medium text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {steps[currentStep - 1]?.title}
          </h2>
          {renderStepContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6 py-3"
          >
            Previous
          </Button>
          
          {currentStep < 6 ? (
            <Button
              onClick={handleNext}
              className="bg-orange-500 hover:bg-orange-600 px-6 py-3"
            >
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.termsAccepted || !formData.dataProcessingConsent}
              className="bg-green-600 hover:bg-green-700 px-8 py-3"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Campaign'} <Heart className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// File Upload Component
function FileUploadField({ 
  label, 
  description, 
  file, 
  onChange 
}: { 
  label: string
  description: string
  file: File | null
  onChange: (file: File | null) => void 
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
          id={label.replace(/\s+/g, '-').toLowerCase()}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <label
          htmlFor={label.replace(/\s+/g, '-').toLowerCase()}
          className="cursor-pointer"
        >
          {file ? (
            <div className="text-green-600">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">{file.name}</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="font-medium">Click to upload</p>
            </div>
          )}
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  )
}
