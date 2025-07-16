import { motion } from 'framer-motion'
import { Heart, Shield, Users, Globe, Link as LinkIcon, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// --- TEAM AND MILESTONE DATA ---
const teamMemberKeys = [
  { 
    nameKey: 'about.team.members.arjun.name', 
    roleKey: 'about.team.members.arjun.role', 
    image: '/images/Memeber_Arjun.png', 
    bioKey: 'about.team.members.arjun.bio', 
    quoteKey: 'about.team.members.arjun.quote' 
  },
  { 
    nameKey: 'about.team.members.priya.name', 
    roleKey: 'about.team.members.priya.role', 
    image: '/images/Member_Priya.png', 
    bioKey: 'about.team.members.priya.bio', 
    quoteKey: 'about.team.members.priya.quote' 
  },
  { 
    nameKey: 'about.team.members.rahul.name', 
    roleKey: 'about.team.members.rahul.role', 
    image: '/images/Member_Rahul.png', 
    bioKey: 'about.team.members.rahul.bio', 
    quoteKey: 'about.team.members.rahul.quote' 
  },
  { 
    nameKey: 'about.team.members.sneha.name', 
    roleKey: 'about.team.members.sneha.role', 
    image: '/images/Member_Sneha.png', 
    bioKey: 'about.team.members.sneha.bio', 
    quoteKey: 'about.team.members.sneha.quote' 
  },
];

const milestoneKeys = [
  { year: '2024', titleKey: 'about.milestones.2024.title', descriptionKey: 'about.milestones.2024.description', icon: Leaf },
  { year: '2024', titleKey: 'about.milestones.2024_mid.title', descriptionKey: 'about.milestones.2024_mid.description', icon: LinkIcon },
  { year: '2025', titleKey: 'about.milestones.2025.title', descriptionKey: 'about.milestones.2025.description', icon: Heart },
  { year: '2025', titleKey: 'about.milestones.2025_current.title', descriptionKey: 'about.milestones.2025_current.description', icon: Users },
];

const values = [
  { icon: Shield, title: 'about.values.transparency.title', description: 'about.values.transparency.description' },
  { icon: Heart, title: 'about.values.impact.title', description: 'about.values.impact.description' },
  { icon: Users, title: 'about.values.community.title', description: 'about.values.community.description' },
  { icon: Globe, title: 'about.values.accessible.title', description: 'about.values.accessible.description' },
];

// --- MAIN PAGE COMPONENT ---
export function AboutPage() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-warm-cream">
      {/* SECTION 1: HERO */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10 relative overflow-hidden">
        <div className="absolute inset-0 mandala-bg"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-warm-charcoal">
              <span className="inline-block transform -rotate-2 text-warm-orange">A Promise</span>
              <br />
              <span className="inline-block transform rotate-1">{t('about.hero.title')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-warm-charcoal-light mb-8 leading-relaxed font-main">
              {t('about.hero.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: THE FOUNDER'S NOTE (Interactive Mission) */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 paper-texture"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="md:col-span-2 warm-card p-8 md:p-12 transform -rotate-1">
              <h2 className="text-4xl font-handwritten font-bold text-warm-charcoal mb-6">{t('about.mission.title')}</h2>
              <p className="text-lg text-warm-charcoal-light leading-relaxed mb-4">
                {t('about.mission.description')}
              </p>
              <p className="text-lg text-warm-charcoal-light leading-relaxed">
                {t('about.mission.promise')}
              </p>
              <div className="mt-8 text-right">
                <p className="font-handwritten text-2xl text-warm-charcoal">{t('about.team.members.arjun.name')}</p>
                <p className="text-warm-charcoal-light">{t('about.team.founder')}</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}>
                <img src="/images/Founder.png" alt="Founder" className="rounded-2xl shadow-handmade transform rotate-2 w-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE VALUES */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-handwritten font-bold text-warm-charcoal mb-4 transform rotate-1">{t('about.values.title')}</h2>
            <p className="text-xl text-warm-charcoal-light">{t('about.values.subtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.1 }} className="warm-card text-center group hover:shadow-handmade transition-all duration-300 transform hover:-translate-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-blue/10 rounded-full mb-6 group-hover:animate-bounce-gentle"><value.icon className="h-8 w-8 text-warm-blue" /></div>
                <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-4 transform -rotate-1">{t(value.title)}</h3>
                <p className="text-warm-charcoal-light leading-relaxed">{t(value.description)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: TIMELINE */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 lotus-pattern"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-handwritten font-bold text-warm-charcoal mb-4 transform -rotate-1">{t('about.journey.title')}</h2>
            <p className="text-xl text-warm-charcoal-light">{t('about.journey.subtitle')}</p>
          </motion.div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-warm-orange/20"></div>
            {milestoneKeys.map((milestone, index) => (
              <motion.div key={`${milestone.year}-${index}`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.2 }} className="mb-16 flex items-center">
                <div className={`flex-1 ${index % 2 === 0 ? 'text-right pr-8' : 'order-2 pl-8'}`}>
                  <div className={`warm-card p-6 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                    <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-2 whitespace-pre-line">{t(milestone.titleKey)}</h3>
                    <p className="text-warm-charcoal-light">{t(milestone.descriptionKey)}</p>
                  </div>
                </div>
                <div className="relative flex-shrink-0 order-1">
                  <div className="absolute -translate-x-1/2 left-1/2 w-12 h-12 bg-warm-orange rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xl">
                    <milestone.icon />
                  </div>
                  <div className="absolute -translate-x-1/2 left-1/2 top-14 bg-warm-green text-white font-handwritten text-sm px-2 py-1 rounded-full">{milestone.year}</div>
                </div>
                <div className="flex-1 order-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TEAM */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-handwritten font-bold text-warm-charcoal mb-4 transform rotate-1">{t('about.team.title')}</h2>
            <p className="text-xl text-warm-charcoal-light">{t('about.team.subtitle')}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMemberKeys.map((member, index) => (
              <motion.div key={member.nameKey} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.1 }} className="warm-card overflow-hidden group hover:shadow-handmade transition-all duration-500 transform hover:-translate-y-3">
                <div className="relative h-56">
                    <img src={member.image} alt={t(member.nameKey)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-handwritten font-bold text-warm-charcoal mb-1 transform -rotate-1 whitespace-pre-line">{t(member.nameKey)}</h3>
                  <div className="text-warm-blue font-handwritten font-medium mb-3">{t(member.roleKey)}</div>
                  <p className="text-warm-charcoal-light text-sm mb-4 leading-relaxed">{t(member.bioKey)}</p>
                  <div className="bg-warm-golden/10 rounded-lg p-3 border-l-4 border-warm-golden"><p className="text-xs font-handwritten text-warm-charcoal italic">"{t(member.quoteKey)}"</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* SECTION 6: FINAL CTA */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gradient-to-r from-warm-orange via-warm-golden to-warm-green rounded-2xl p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                        <h2 className="text-4xl md:text-6xl font-handwritten font-bold mb-6 transform -rotate-1">{t('about.cta.title')}</h2>
                        <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">{t('about.cta.subtitle')}</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Button asChild variant="secondary" size="handmade" className="bg-white text-warm-orange hover:bg-warm-cream transform hover:scale-110 hover:-rotate-2 shadow-handmade font-handwritten font-bold"><Link to="/donate"><Heart className="mr-3 h-5 w-5 animate-heart-beat" fill="currentColor" />{t('about.cta.joinMission')}</Link></Button>
                            
                            <Button asChild className="btn-handmade bg-white text-warm-orange hover:bg-warm-cream border-2 border-white">
                                <Link to="/contact">{t('about.cta.contactUs')}</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
      </section>
    </div>
  )
}