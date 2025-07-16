import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'

// --- MAIN PAGE COMPONENT ---
export function ContactPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        return
      }

      // Create mailto link with form data
      const subject = encodeURIComponent(`[DilSeDaan Contact] ${formData.subject}`)
      const body = encodeURIComponent(`Hello DilSeDaan Team,

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}

Subject: ${formData.subject}

Message:
${formData.message}

---
This message was sent through the DilSeDaan contact form.
Please respond to: ${formData.email}
      `)
      
      const mailtoLink = `mailto:dilsedaan.charity@gmail.com?subject=${subject}&body=${body}`
      
      // Open mail client
      window.open(mailtoLink, '_blank')
      
      // Show success message
      toast({
        title: "Message Prepared Successfully! ✉️",
        description: "Your email client should open with the message ready to send to dilsedaan.charity@gmail.com",
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try sending an email directly to dilsedaan.charity@gmail.com",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // --- Data (Can be moved to a separate file later) ---
  const contactInfo = [
    { icon: Mail, title: t('contact.info.email.title'), detail: 'dilsedaan.charity@gmail.com', actionText: t('contact.info.email.action'), href: "mailto:dilsedaan.charity@gmail.com" },
    { icon: Phone, title: t('contact.info.phone.title'), detail: t('contact.info.phone.detail'), actionText: t('contact.info.phone.action'), href: "tel:+918069169691" },
  ];

  const faqs = [
      { q: t('contact.faq.questions.track.q'), a: t('contact.faq.questions.track.a') },
      { q: t('contact.faq.questions.tax.q'), a: t('contact.faq.questions.tax.a') },
      { q: t('contact.faq.questions.volunteer.q'), a: t('contact.faq.questions.volunteer.a') },
  ];

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* SECTION 1: HERO */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 paper-texture"></div>
        {/* Watermark Text */}
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-[20vw] font-bold text-warm-cream opacity-80 select-none">{t('contact.hero.title')}</h1>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-warm-charcoal leading-tight">
                    <span className="inline-block text-warm-orange">{t('contact.hero.assistance')}</span>
                    <br />
                    <span className="inline-block text-warm-charcoal">{t('contact.hero.help')}</span>
                </h1>
                <p className="text-xl md:text-2xl text-warm-charcoal/80 mb-8 leading-relaxed font-medium">
                    {t('contact.hero.description')}
                </p>
            </motion.div>
        </div>
      </section>

      {/* SECTION 2: CONTACT DETAILS & FORM */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left Side: Contact Info & Map */}
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-8">
                    <div className="warm-card p-8">
                        <h2 className="text-3xl font-bold mb-8 text-warm-charcoal">Contact Details</h2>
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <MapPin className="h-8 w-8 text-warm-orange flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="font-bold text-lg text-warm-charcoal mb-2">Our Office</h3>
                                    <p className="text-warm-charcoal/80 leading-relaxed">123 Hope Street, Mumbai, Maharashtra, India</p>
                                </div>
                            </div>
                            {contactInfo.map(info => (
                                <div key={info.title} className="flex items-start space-x-4">
                                    <info.icon className="h-8 w-8 text-warm-orange flex-shrink-0 mt-1"/>
                                    <div>
                                        <h3 className="font-bold text-lg text-warm-charcoal mb-2">{info.title}</h3>
                                        <a href={info.href} className="text-warm-blue hover:text-warm-orange transition-colors font-semibold">{info.detail}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="warm-card p-2 overflow-hidden">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.438992641571!2d80.24075867484433!3d13.071199087251762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526671578332d1%3A0xb45404d57c744cf2!2sThaagam%20Foundation!5e0!3m2!1sen!2sin!4v1716029311822!5m2!1sen!2sin"
                            width="100%" 
                            height="350" 
                            style={{ border: 0 }} 
                            allowFullScreen={true} 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="rounded-xl"
                        ></iframe>
                    </div>
                </motion.div>

                {/* Right Side: Contact Form */}
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="warm-card p-8 sticky top-8">
                     <h2 className="text-3xl font-bold mb-8 text-warm-charcoal">{t('contact.form.title')}</h2>
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-warm-charcoal mb-2">{t('contact.form.name')}</label>
                                <input 
                                  type="text" 
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  placeholder="Enter your full name" 
                                  className="w-full p-4 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors bg-white font-medium"
                                  required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-warm-charcoal mb-2">{t('contact.form.email')}</label>
                                <input 
                                  type="email" 
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  placeholder="Enter your email address" 
                                  className="w-full p-4 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors bg-white font-medium"
                                  required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-warm-charcoal mb-2">Phone Number</label>
                                <input 
                                  type="tel" 
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                  placeholder="Enter your phone number" 
                                  className="w-full p-4 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors bg-white font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-warm-charcoal mb-2">{t('contact.form.subject')}</label>
                                <input 
                                  type="text" 
                                  name="subject"
                                  value={formData.subject}
                                  onChange={handleInputChange}
                                  placeholder="Enter subject" 
                                  className="w-full p-4 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors bg-white font-medium"
                                  required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-warm-charcoal mb-2">{t('contact.form.message')}</label>
                            <textarea 
                              rows={5} 
                              name="message"
                              value={formData.message}
                              onChange={handleInputChange}
                              placeholder="Tell us how we can help you..." 
                              className="w-full p-4 border-2 border-warm-cream rounded-xl focus:border-warm-orange outline-none transition-colors resize-none bg-white font-medium"
                              required
                            ></textarea>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-5 w-5 mr-2"/>
                            {isSubmitting ? 'Preparing...' : t('contact.form.submit')}
                        </Button>
                        <p className="text-sm text-warm-charcoal-light text-center">
                          Or email us directly at: <a href="mailto:dilsedaan.charity@gmail.com" className="text-warm-orange hover:underline font-medium">dilsedaan.charity@gmail.com</a>
                        </p>
                     </form>
                </motion.div>
            </div>
        </div>
      </section>

      {/* SECTION 3: FAQ */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 paper-texture"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-4xl font-handwritten font-bold text-warm-charcoal mb-4 transform -rotate-1">{t('contact.faq.title')}</h2>
              <p className="text-xl text-warm-charcoal-light">Find answers to common questions</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="warm-card p-6 flex items-start space-x-4">
                    <HelpCircle className="h-8 w-8 text-warm-green flex-shrink-0 mt-1"/>
                    <div>
                        <h3 className="font-bold text-lg text-warm-charcoal">{faq.q}</h3>
                        <p className="text-warm-charcoal-light">{faq.a}</p>
                    </div>
                </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gradient-to-r from-warm-orange via-warm-golden to-warm-green rounded-2xl p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-handwritten font-bold mb-6 transform -rotate-1">Ready to Join Us?</h2>
                    <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">Start your journey of making a difference today!</p>
                    <Button asChild variant="secondary" size="handmade" className="bg-white text-warm-orange hover:bg-warm-cream transform hover:scale-110 hover:-rotate-2 shadow-handmade font-handwritten font-bold"><Link to="/donate"><Heart className="mr-3 h-5 w-5 animate-heart-beat" fill="currentColor" />Donate Now</Link></Button>
                </div>
            </motion.div>
        </div>
      </section>
    </div>
  )
}