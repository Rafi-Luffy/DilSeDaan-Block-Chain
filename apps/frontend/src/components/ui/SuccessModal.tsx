import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, Heart, Sparkles, Gift } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  subMessage?: string
  type?: 'donation' | 'registration' | 'verification' | 'general'
  amount?: number
  campaignName?: string
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  subMessage, 
  type = 'general',
  amount,
  campaignName 
}: SuccessModalProps) {
  const getTypeDetails = () => {
    switch (type) {
      case 'donation':
        return {
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: 'bg-green-600 hover:bg-green-700',
          decorIcon: Heart,
          confetti: true
        }
      case 'registration':
        return {
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          decorIcon: Sparkles,
          confetti: true
        }
      case 'verification':
        return {
          bgGradient: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          buttonBg: 'bg-purple-600 hover:bg-purple-700',
          decorIcon: Gift,
          confetti: false
        }
      default:
        return {
          bgGradient: 'from-warm-cream to-warm-orange/10',
          borderColor: 'border-warm-orange/30',
          iconBg: 'bg-warm-orange/20',
          iconColor: 'text-warm-orange',
          buttonBg: 'bg-warm-orange hover:bg-warm-orange/90',
          decorIcon: CheckCircle,
          confetti: false
        }
    }
  }

  const typeDetails = getTypeDetails()
  const DecorIcon = typeDetails.decorIcon

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6 
          }}
          className={`
            relative bg-gradient-to-br ${typeDetails.bgGradient} 
            border-2 ${typeDetails.borderColor}
            rounded-3xl shadow-2xl max-w-md w-full p-8 text-center
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Animation */}
          {typeDetails.confetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0, 
                    y: -20, 
                    x: Math.random() * 300 - 150,
                    rotate: 0 
                  }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: [0, 300], 
                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)] 
                  }}
                  transition={{ 
                    duration: 3, 
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className={`absolute w-3 h-3 rounded-full ${
                    ['bg-green-400', 'bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-purple-400'][i % 5]
                  }`}
                  style={{
                    left: `${20 + (i % 5) * 15}%`,
                    top: '10%'
                  }}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`
              mx-auto w-20 h-20 ${typeDetails.iconBg} 
              rounded-full flex items-center justify-center mb-6
            `}
          >
            <CheckCircle className={`h-10 w-10 ${typeDetails.iconColor}`} />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-warm-charcoal mb-4 font-handwritten"
          >
            {title}
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-warm-charcoal/80 text-lg mb-4 leading-relaxed"
          >
            {message}
          </motion.p>

          {/* Donation Details */}
          {type === 'donation' && amount && campaignName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/70 rounded-2xl p-4 mb-6 border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Amount Donated</p>
                  <p className="text-2xl font-bold text-green-600">₹{amount.toLocaleString()}</p>
                </div>
                <Heart className="h-8 w-8 text-green-600 animate-pulse" fill="currentColor" />
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-sm text-gray-600">Campaign</p>
                <p className="font-semibold text-warm-charcoal">{campaignName}</p>
              </div>
            </motion.div>
          )}

          {/* Sub Message */}
          {subMessage && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-warm-charcoal/60 text-sm mb-6"
            >
              {subMessage}
            </motion.p>
          )}

          {/* Decorative Elements */}
          <div className="flex justify-center space-x-2 mb-6">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
              >
                <DecorIcon className={`h-5 w-5 ${typeDetails.iconColor}/40`} />
              </motion.div>
            ))}
          </div>

          {/* Action Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={onClose}
            className={`
              w-full py-4 px-6 ${typeDetails.buttonBg} text-white font-semibold 
              rounded-2xl transition-all duration-300 transform hover:scale-105
              shadow-lg hover:shadow-xl
            `}
          >
            Continue
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Easy hook
export function useSuccessModal() {
  const [modal, setModal] = React.useState<{
    isOpen: boolean
    title: string
    message: string
    subMessage?: string
    type?: 'donation' | 'registration' | 'verification' | 'general'
    amount?: number
    campaignName?: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const showSuccess = React.useCallback((config: Omit<typeof modal, 'isOpen'>) => {
    setModal({ ...config, isOpen: true })
  }, [])

  const hideSuccess = React.useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const SuccessModalComponent = React.useCallback(() => (
    <SuccessModal
      isOpen={modal.isOpen}
      onClose={hideSuccess}
      title={modal.title}
      message={modal.message}
      subMessage={modal.subMessage}
      type={modal.type}
      amount={modal.amount}
      campaignName={modal.campaignName}
    />
  ), [modal, hideSuccess])

  return {
    showSuccess,
    hideSuccess,
    SuccessModal: SuccessModalComponent
  }
}
