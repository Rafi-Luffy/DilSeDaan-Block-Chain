import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Heart, X, Shield, Globe, Sparkles, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

export function LoginModal({ isOpen, onClose, defaultTab = 'login' }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { login, register, isLoading } = useAuthStore()
  const { toast } = useToast()
  const { t } = useTranslation()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      setActiveTab(defaultTab)
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [isOpen, defaultTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (activeTab === 'register') {
      if (!formData.name.trim()) {
        toast({
          title: t('common.error'),
          description: t('auth.validation.nameRequired'),
          variant: "destructive"
        })
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: t('common.error'),
          description: t('auth.validation.passwordMismatch'),
          variant: "destructive"
        })
        return
      }
      
      if (formData.password.length < 6) {
        toast({
          title: t('common.error'),
          description: t('auth.validation.passwordLength'),
          variant: "destructive"
        })
        return
      }
    }
    
    let success = false
    
    if (activeTab === 'login') {
      success = await login(formData.email, formData.password)
      if (success) {
        toast({
          title: "🎉 " + t('common.success'),
          description: t('auth.login.success'),
        })
        onClose()
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      } else {
        toast({
          title: t('common.error'),
          description: t('auth.login.failed'),
          variant: "destructive"
        })
      }
    } else {
      success = await register(formData.name, formData.email, formData.password)
      if (success) {
        toast({
          title: "🌟 " + t('common.success'),
          description: t('auth.register.success'),
        })
        onClose()
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      } else {
        toast({
          title: t('common.error'),
          description: t('auth.register.failed'),
          variant: "destructive"
        })
      }
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: t('auth.password.weak') }
    if (password.length < 8) return { strength: 1, text: t('auth.password.fair') }
    if (password.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return { strength: 3, text: t('auth.password.strong') }
    return { strength: 2, text: t('auth.password.good') }
  }

  if (!isOpen) return null

  const passwordStrength = activeTab === 'register' ? getPasswordStrength(formData.password) : null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 lg:p-6">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.4, damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-sm sm:max-w-md mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full text-warm-charcoal/50 hover:text-warm-charcoal hover:bg-warm-cream/50 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-warm-orange via-warm-pink to-warm-purple rounded-full mb-3 sm:mb-4 shadow-lg">
                    <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-handwritten font-bold text-warm-charcoal mb-2">
                    {activeTab === 'login' ? t('auth.login.title') : t('auth.register.title')}
                  </h2>
                  <p className="text-warm-charcoal-light text-xs sm:text-sm leading-relaxed px-2">
                    {activeTab === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
                  </p>
                </div>

                {/* Enhanced Tabs */}
                <div className="flex mb-6 bg-warm-cream/50 rounded-2xl p-1.5">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden",
                      activeTab === 'login'
                        ? 'bg-white text-warm-orange shadow-lg transform scale-[1.02]'
                        : 'text-warm-charcoal-light hover:text-warm-orange hover:bg-white/50'
                    )}
                  >
                    <span className="flex items-center justify-center relative z-10">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('auth.login.tab')}
                    </span>
                    {activeTab === 'login' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-warm-orange/10 to-warm-pink/10 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-300 relative overflow-hidden",
                      activeTab === 'register'
                        ? 'bg-white text-warm-orange shadow-lg transform scale-[1.02]'
                        : 'text-warm-charcoal-light hover:text-warm-orange hover:bg-white/50'
                    )}
                  >
                    <span className="flex items-center justify-center relative z-10">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('auth.register.tab')}
                    </span>
                    {activeTab === 'register' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-warm-orange/10 to-warm-pink/10 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                </div>

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-3 sm:space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <AnimatePresence mode="wait">
                {activeTab === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      {t('auth.fields.name')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-charcoal/50" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-main transition-colors bg-white/80 backdrop-blur-sm text-sm"
                        placeholder={t('auth.placeholders.name')}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-2">
                  {t('auth.fields.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-orange" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-main transition-colors bg-white/80 backdrop-blur-sm text-sm"
                    placeholder={activeTab === 'login' ? t('auth.placeholders.email') : t('auth.placeholders.email')}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-warm-charcoal mb-2">
                  {t('auth.fields.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-orange" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-2 sm:py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-main transition-colors bg-white/80 backdrop-blur-sm text-sm"
                    placeholder={activeTab === 'login' ? t('auth.placeholders.password') : t('auth.placeholders.password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-charcoal/50 hover:text-warm-orange transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password strength indicator for registration */}
                <AnimatePresence>
                  {activeTab === 'register' && formData.password && passwordStrength && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-warm-cream rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength.strength === 0 ? 'w-1/4 bg-red-400' :
                              passwordStrength.strength === 1 ? 'w-2/4 bg-yellow-400' :
                              passwordStrength.strength === 2 ? 'w-3/4 bg-orange-400' :
                              'w-full bg-green-400'
                            }`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength.strength === 0 ? 'text-red-500' :
                          passwordStrength.strength === 1 ? 'text-yellow-500' :
                          passwordStrength.strength === 2 ? 'text-orange-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-warm-charcoal mb-2">
                      {t('auth.fields.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-charcoal/50" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        className={`w-full pl-10 pr-12 py-2 sm:py-3 border-2 rounded-xl focus:outline-none font-main transition-colors bg-white/80 backdrop-blur-sm text-sm ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? 'border-red-300 focus:border-red-500'
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-warm-orange/30 focus:border-warm-orange'
                        }`}
                        placeholder={t('auth.placeholders.confirmPassword')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-charcoal/50 hover:text-warm-orange transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-warm-orange to-warm-pink hover:from-warm-orange/90 hover:to-warm-pink/90 text-white font-semibold py-2 sm:py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {activeTab === 'login' ? t('auth.login.loading') : t('auth.register.loading')}
                    </div>
                  ) : (
                    <>
                      <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                      {activeTab === 'login' ? t('auth.login.button') : t('auth.register.button')}
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Forgot Password Link */}
              {activeTab === 'login' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <a
                    href="/forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      window.location.href = '/forgot-password';
                    }}
                    className="text-sm text-warm-orange hover:text-warm-pink transition-colors font-medium"
                  >
                    {t('auth.login.forgotPassword')}
                  </a>
                </motion.div>
              )}
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
    )}
    </AnimatePresence>
  )
}
