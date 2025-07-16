import React from 'react'
import { motion } from 'framer-motion'
import { Scale, Shield, CreditCard, Users, AlertTriangle, CheckCircle, FileText, Globe, Mail, Phone } from 'lucide-react'

export function TermsOfServicePage() {
  const sections = [
    {
      title: "Platform Usage",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      content: [
        {
          subtitle: "Eligibility",
          details: "You must be at least 18 years old and legally capable of entering into binding agreements to use DilSeDaan. Accounts created by minors require parental consent."
        },
        {
          subtitle: "Account Responsibility",
          details: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        },
        {
          subtitle: "Prohibited Activities",
          details: "Users may not engage in fraudulent activities, create false campaigns, misrepresent donation purposes, or violate any applicable laws while using our platform."
        }
      ]
    },
    {
      title: "Donations & Payments",
      icon: <CreditCard className="w-6 h-6 text-green-600" />,
      content: [
        {
          subtitle: "Donation Process",
          details: "All donations are final and non-refundable unless required by law. Donations are processed through secure payment gateways and recorded on blockchain for transparency."
        },
        {
          subtitle: "Payment Processing",
          details: "We partner with licensed payment processors for secure transactions. Payment processing fees may apply and will be clearly disclosed before completion."
        },
        {
          subtitle: "Tax Benefits",
          details: "Tax exemption certificates are provided for eligible donations under Section 80G. Donors are responsible for claiming deductions according to their tax jurisdiction."
        }
      ]
    },
    {
      title: "Campaign Guidelines",
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      content: [
        {
          subtitle: "Campaign Creation",
          details: "Campaign creators must provide accurate information, submit required documentation, and undergo verification processes before campaigns go live."
        },
        {
          subtitle: "Fund Utilization",
          details: "Campaign funds must be used solely for stated purposes. Regular reporting and documentation of fund utilization is mandatory for all campaigns."
        },
        {
          subtitle: "Content Standards",
          details: "All campaign content must be truthful, appropriate, and comply with our community guidelines. Misleading or offensive content will result in campaign removal."
        }
      ]
    },
    {
      title: "Platform Rights & Responsibilities",
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      content: [
        {
          subtitle: "Service Availability",
          details: "We strive for 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be announced in advance when possible."
        },
        {
          subtitle: "Content Moderation",
          details: "We reserve the right to review, modify, or remove content that violates our terms, is inappropriate, or poses security risks to our platform or users."
        },
        {
          subtitle: "Account Suspension",
          details: "We may suspend or terminate accounts that violate these terms, engage in fraudulent activities, or pose risks to platform integrity."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: <Scale className="w-6 h-6 text-red-600" />,
      content: [
        {
          subtitle: "Platform Ownership",
          details: "DilSeDaan owns all rights to the platform, including software, design, trademarks, and proprietary technology. Users receive limited license for personal use only."
        },
        {
          subtitle: "User Content",
          details: "You retain ownership of content you submit but grant us license to use, display, and distribute it for platform operations and promotional purposes."
        },
        {
          subtitle: "Trademark Usage",
          details: "The DilSeDaan name, logo, and branding elements are protected trademarks. Unauthorized use is strictly prohibited and may result in legal action."
        }
      ]
    },
    {
      title: "Limitation of Liability",
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      content: [
        {
          subtitle: "Service Limitations",
          details: "DilSeDaan provides a platform for charitable giving but is not responsible for campaign outcomes, fund misuse by verified organizations, or third-party actions."
        },
        {
          subtitle: "Maximum Liability",
          details: "Our total liability to you for any claims arising from platform use is limited to the amount of fees paid by you in the 12 months preceding the claim."
        },
        {
          subtitle: "Force Majeure",
          details: "We are not liable for service interruptions caused by events beyond our reasonable control, including natural disasters, government actions, or technical failures."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/10 rounded-full">
                <Scale className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-charcoal mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-warm-charcoal/70 mb-8">
              Please read these terms carefully before using our platform
            </p>
            <div className="bg-white rounded-lg p-6 shadow-lg inline-block">
              <p className="text-sm text-warm-charcoal/60">
                <strong>Last Updated:</strong> January 2025 | <strong>Effective Date:</strong> January 1, 2025
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-warm-cream"
            >
              <h2 className="text-2xl font-bold text-warm-charcoal mb-4">Welcome to DilSeDaan</h2>
              <p className="text-warm-charcoal/80 leading-relaxed mb-4">
                These Terms of Service ("Terms") govern your access to and use of DilSeDaan, a blockchain-powered 
                charitable giving platform. By accessing or using our services, you agree to be bound by these Terms 
                and our Privacy Policy.
              </p>
              <p className="text-warm-charcoal/80 leading-relaxed">
                If you disagree with any part of these terms, please do not access or use our platform. 
                We reserve the right to update these Terms at any time, and continued use constitutes acceptance of any changes.
              </p>
            </motion.div>

            {/* Main Sections */}
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-warm-cream"
              >
                <div className="flex items-center gap-4 mb-6">
                  {section.icon}
                  <h2 className="text-2xl font-bold text-warm-charcoal">{section.title}</h2>
                </div>
                
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-warm-orange/30 pl-6">
                      <h3 className="text-lg font-semibold text-warm-charcoal mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-warm-charcoal/80 leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Dispute Resolution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-warm-cream"
            >
              <div className="flex items-center gap-4 mb-6">
                <Scale className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-warm-charcoal">Dispute Resolution</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Governing Law</h4>
                  <p className="text-blue-700 text-sm">
                    These Terms are governed by the laws of India. Any disputes will be subject to the exclusive 
                    jurisdiction of courts in Mumbai, Maharashtra.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Mediation First</h4>
                  <p className="text-green-700 text-sm">
                    Before pursuing legal action, both parties agree to attempt resolution through good faith 
                    mediation using a mutually agreed mediator.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Privacy & Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-warm-cream"
            >
              <div className="flex items-center gap-4 mb-6">
                <Shield className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-warm-charcoal">Privacy & Data Protection</h2>
              </div>
              <p className="text-warm-charcoal/80 leading-relaxed mb-4">
                Our Privacy Policy, which forms part of these Terms, explains how we collect, use, and protect 
                your information. We are committed to maintaining the highest standards of data security and privacy.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-warm-cream/30 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                  <h4 className="font-semibold text-warm-charcoal mb-1">GDPR Compliant</h4>
                  <p className="text-sm text-warm-charcoal/70">
                    Full compliance with international data protection standards
                  </p>
                </div>
                <div className="bg-warm-cream/30 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                  <h4 className="font-semibold text-warm-charcoal mb-1">Data Rights</h4>
                  <p className="text-sm text-warm-charcoal/70">
                    Full user control over personal data and privacy settings
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Updates & Changes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-warm-cream"
            >
              <div className="flex items-center gap-4 mb-6">
                <Globe className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-warm-charcoal">Terms Updates</h2>
              </div>
              <p className="text-warm-charcoal/80 leading-relaxed mb-4">
                We may update these Terms from time to time to reflect changes in our services, legal requirements, 
                or industry standards. Material changes will be communicated through:
              </p>
              <ul className="space-y-2 text-warm-charcoal/70">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Email notification to registered users
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Prominent notice on our platform
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  30-day advance notice for significant changes
                </li>
              </ul>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-r from-warm-orange to-warm-golden rounded-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-6">Legal & Support Contact</h2>
              <p className="mb-6 opacity-90">
                For questions about these Terms or legal matters, please contact our Legal Team:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="opacity-90">dilsedaan.charity@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="opacity-90">+91 7671966605</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm opacity-75">
                  <strong>Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST<br/>
                  <strong>Legal Address:</strong> Mumbai, Maharashtra, India
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TermsOfServicePage
