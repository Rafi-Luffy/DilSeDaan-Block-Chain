import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Users, Database, Bell, FileText, Globe, Mail, Phone } from 'lucide-react'

export function PrivacyPolicyPage() {
  const sections = [
    {
      title: "Information We Collect",
      icon: <Database className="w-6 h-6 text-blue-600" />,
      content: [
        {
          subtitle: "Personal Information",
          details: "We collect information you provide directly, including name, email address, phone number, and payment information when you register or make donations."
        },
        {
          subtitle: "Donation Data",
          details: "Transaction details, donation amounts, preferred causes, and campaign interactions to provide personalized experiences and impact tracking."
        },
        {
          subtitle: "Technical Information",
          details: "Device information, IP address, browser type, and usage analytics to improve our platform security and user experience."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: <Users className="w-6 h-6 text-green-600" />,
      content: [
        {
          subtitle: "Service Delivery",
          details: "Processing donations, sending tax receipts, providing customer support, and delivering impact updates about your contributions."
        },
        {
          subtitle: "Communication",
          details: "Sending transactional emails, campaign updates, impact reports, and important platform notifications with your consent."
        },
        {
          subtitle: "Platform Improvement",
          details: "Analyzing usage patterns to enhance user experience, develop new features, and ensure platform security and reliability."
        }
      ]
    },
    {
      title: "Information Sharing & Disclosure",
      icon: <Eye className="w-6 h-6 text-orange-600" />,
      content: [
        {
          subtitle: "Service Providers",
          details: "We share data with trusted third-party services for payment processing, email delivery, and platform analytics under strict confidentiality agreements."
        },
        {
          subtitle: "Legal Compliance",
          details: "We may disclose information when required by law, to protect our rights, prevent fraud, or ensure user safety and platform integrity."
        },
        {
          subtitle: "Campaign Organizations",
          details: "With your consent, we share relevant donation information with verified campaign organizations for impact reporting and donor recognition."
        }
      ]
    },
    {
      title: "Data Security",
      icon: <Lock className="w-6 h-6 text-purple-600" />,
      content: [
        {
          subtitle: "Encryption",
          details: "All sensitive data is encrypted using industry-standard AES-256 encryption both in transit and at rest, with regular security audits."
        },
        {
          subtitle: "Access Controls",
          details: "Strict access controls ensure only authorized personnel can access personal data, with comprehensive audit logs and monitoring."
        },
        {
          subtitle: "Blockchain Security",
          details: "Donation transactions are recorded on blockchain for immutability and transparency while maintaining donor privacy through anonymization."
        }
      ]
    },
    {
      title: "Your Rights & Choices",
      icon: <Shield className="w-6 h-6 text-red-600" />,
      content: [
        {
          subtitle: "Access & Correction",
          details: "You can access, update, or correct your personal information through your account dashboard or by contacting our support team."
        },
        {
          subtitle: "Data Portability",
          details: "Request a copy of your data in a machine-readable format or have it transferred to another service provider where technically feasible."
        },
        {
          subtitle: "Deletion Rights",
          details: "Request deletion of your personal data, though some information may be retained for legal compliance and fraud prevention."
        }
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: <Globe className="w-6 h-6 text-cyan-600" />,
      content: [
        {
          subtitle: "Essential Cookies",
          details: "Required for platform functionality, security, and user authentication. These cannot be disabled without affecting service operation."
        },
        {
          subtitle: "Analytics Cookies",
          details: "Help us understand user behavior and improve our platform. You can opt-out through your browser settings or our cookie preferences."
        },
        {
          subtitle: "Third-Party Cookies",
          details: "Limited third-party cookies for payment processing and social media integration, governed by respective privacy policies."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-500/10 rounded-full">
                <Shield className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-warm-charcoal mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-warm-charcoal/70 mb-8">
              Your privacy is our priority. Learn how we collect, use, and protect your information.
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
              <h2 className="text-2xl font-bold text-warm-charcoal mb-4">Introduction</h2>
              <p className="text-warm-charcoal/80 leading-relaxed mb-4">
                At DilSeDaan, we are committed to protecting your privacy and maintaining the confidentiality of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our blockchain-powered 
                charity platform.
              </p>
              <p className="text-warm-charcoal/80 leading-relaxed">
                By using DilSeDaan, you agree to the collection and use of information in accordance with this policy. 
                We encourage you to read this policy carefully and contact us if you have any questions.
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

            {/* Data Retention */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-warm-cream"
            >
              <div className="flex items-center gap-4 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-warm-charcoal">Data Retention</h2>
              </div>
              <p className="text-warm-charcoal/80 leading-relaxed mb-4">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, 
                comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-warm-cream/30 rounded-lg p-4">
                  <h4 className="font-semibold text-warm-charcoal mb-2">Account Data</h4>
                  <p className="text-sm text-warm-charcoal/70">
                    Retained for the duration of your account plus 3 years for legal compliance
                  </p>
                </div>
                <div className="bg-warm-cream/30 rounded-lg p-4">
                  <h4 className="font-semibold text-warm-charcoal mb-2">Transaction Records</h4>
                  <p className="text-sm text-warm-charcoal/70">
                    Maintained for 7 years as required by financial regulations
                  </p>
                </div>
              </div>
            </motion.div>

            {/* International Transfers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-warm-cream"
            >
              <div className="flex items-center gap-4 mb-6">
                <Globe className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-warm-charcoal">International Data Transfers</h2>
              </div>
              <p className="text-warm-charcoal/80 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. 
                We ensure appropriate safeguards are in place to protect your privacy rights.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> All international transfers comply with applicable data protection laws and include 
                  appropriate contractual protections.
                </p>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-r from-warm-orange to-warm-golden rounded-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-6">Contact Us About Privacy</h2>
              <p className="mb-6 opacity-90">
                If you have questions about this Privacy Policy or our data practices, please contact our Privacy Team:
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
                  <strong>Response Time:</strong> We respond to privacy-related inquiries within 72 hours and 
                  resolve requests within 30 days as required by law.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PrivacyPolicyPage
