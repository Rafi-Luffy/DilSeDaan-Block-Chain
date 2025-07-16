import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Wallet, Smartphone, Building, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeb3Store } from '@/store/web3Store'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface PaymentMethodsProps {
  amount: string
  campaignId: string
  onSuccess: (transactionHash: string, method: string) => void
  onClose: () => void
}

type PaymentMethod = 'crypto' | 'card' | 'upi' | 'netbanking'

interface PaymentOption {
  id: PaymentMethod
  name: string
  icon: React.ReactNode
  description: string
  fee: string
  available: boolean
  processing: boolean
}

export function PaymentMethods({ amount, campaignId, onSuccess, onClose }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('crypto')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'process' | 'confirm'>('select')
  
  const { isConnected, connectWallet, donateToContract, network, balance } = useWeb3Store()
  const { toast } = useToast()
  const { t } = useTranslation()

  const paymentOptions: PaymentOption[] = [
    {
      id: 'crypto',
      name: t('payment.methods.wallet'),
      icon: <Wallet className="h-5 w-5" />,
      description: 'Pay with MATIC on Polygon - Instant & Transparent',
      fee: '0% fee',
      available: isConnected && network === 'polygon',
      processing: false
    },
    {
      id: 'card',
      name: t('payment.methods.card'),
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Credit/Debit card via Razorpay',
      fee: '2.5% fee',
      available: true,
      processing: false
    },
    {
      id: 'upi',
      name: t('payment.methods.upi'),
      icon: <Smartphone className="h-5 w-5" />,
      description: 'UPI/QR Code payment',
      fee: '0% fee',
      available: true,
      processing: false
    },
    {
      id: 'netbanking',
      name: t('payment.methods.netbanking'),
      icon: <Building className="h-5 w-5" />,
      description: 'Net Banking (All major banks)',
      fee: '1% fee',
      available: true,
      processing: false
    }
  ]

  const handleCryptoPayment = async () => {
    try {
      setIsProcessing(true)
      setPaymentStep('process')

      if (!isConnected) {
        await connectWallet()
        return
      }

      if (network !== 'polygon') {
        toast({
          title: 'Wrong Network',
          description: 'Please switch to Polygon network to continue',
          variant: 'destructive'
        })
        return
      }

      const transactionHash = await donateToContract(campaignId, amount, 'Donation via crypto wallet')
      
      if (transactionHash) {
        setPaymentStep('confirm')
        toast({
          title: '🎉 ' + t('payment.success'),
          description: 'Your donation has been recorded on the blockchain!',
          variant: 'default'
        })
        
        setTimeout(() => {
          onSuccess(transactionHash, 'crypto')
        }, 2000)
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Crypto payment failed:', error)
      toast({
        title: t('payment.failed'),
        description: 'Please try again or use a different payment method',
        variant: 'destructive'
      })
      setPaymentStep('select')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTraditionalPayment = async (method: PaymentMethod) => {
    try {
      setIsProcessing(true)
      setPaymentStep('process')

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockTransactionId = `${method}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      setPaymentStep('confirm')
      toast({
        title: '🎉 ' + t('payment.success'),
        description: `Payment completed via ${method}!`,
        variant: 'default'
      })

      setTimeout(() => {
        onSuccess(mockTransactionId, method)
      }, 2000)
    } catch (error) {
      console.error(`${method} payment failed:`, error)
      toast({
        title: t('payment.failed'),
        description: 'Please try again',
        variant: 'destructive'
      })
      setPaymentStep('select')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (selectedMethod === 'crypto') {
      await handleCryptoPayment()
    } else {
      await handleTraditionalPayment(selectedMethod)
    }
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR' 
    }).format(num)
  }

  if (paymentStep === 'process') {
    return (
      <div className="p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4 w-16 h-16 border-4 border-warm-orange border-t-transparent rounded-full"
        />
        <h3 className="text-lg font-semibold text-warm-brown mb-2">
          {t('payment.processing')}
        </h3>
        <p className="text-warm-brown/70">
          {selectedMethod === 'crypto' 
            ? 'Please confirm the transaction in your wallet...'
            : 'Processing your payment...'
          }
        </p>
      </div>
    )
  }

  if (paymentStep === 'confirm') {
    return (
      <div className="p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mx-auto mb-4 w-16 h-16 bg-warm-green rounded-full flex items-center justify-center"
        >
          <CheckCircle className="h-8 w-8 text-white" />
        </motion.div>
        <h3 className="text-lg font-semibold text-warm-brown mb-2">
          Payment Successful! 🎉
        </h3>
        <p className="text-warm-brown/70 mb-4">
          Your donation of {formatAmount(amount)} has been processed successfully.
        </p>
        {selectedMethod === 'crypto' && (
          <div className="bg-warm-green/10 p-3 rounded-lg">
            <p className="text-sm text-warm-green font-medium">
              ✓ Recorded on Polygon blockchain for full transparency
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-warm-brown mb-2">
          Choose Payment Method
        </h3>
        <p className="text-warm-brown/70">
          You're donating {formatAmount(amount)} to support this cause
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {paymentOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
              selectedMethod === option.id
                ? "border-warm-orange bg-warm-orange/5"
                : "border-gray-200 hover:border-warm-orange/50",
              !option.available && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => option.available && setSelectedMethod(option.id)}
          >
            <div className="flex items-start space-x-3">
              <div className={cn(
                "p-2 rounded-lg",
                selectedMethod === option.id ? "bg-warm-orange text-white" : "bg-gray-100 text-gray-600"
              )}>
                {option.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-warm-brown">
                    {option.name}
                  </h4>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    option.fee === '0% fee' 
                      ? "bg-warm-green/10 text-warm-green"
                      : "bg-yellow-100 text-yellow-800"
                  )}>
                    {option.fee}
                  </span>
                </div>
                
                <p className="text-sm text-warm-brown/70 mb-2">
                  {option.description}
                </p>

                {/* Special messages */}
                {option.id === 'crypto' && !isConnected && (
                  <div className="flex items-center space-x-1 text-xs text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Connect wallet to use this option</span>
                  </div>
                )}

                {option.id === 'crypto' && isConnected && network !== 'polygon' && (
                  <div className="flex items-center space-x-1 text-xs text-yellow-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Switch to Polygon network</span>
                  </div>
                )}

                {option.id === 'crypto' && isConnected && network === 'polygon' && (
                  <div className="flex items-center space-x-1 text-xs text-warm-green">
                    <CheckCircle className="h-3 w-3" />
                    <span>Wallet connected • Balance: {balance} MATIC</span>
                  </div>
                )}
              </div>

              {selectedMethod === option.id && (
                <div className="w-5 h-5 bg-warm-orange rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security notice */}
      <div className="bg-blue-50 p-3 rounded-lg mb-6">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Secure Payment</p>
            <p className="text-xs text-blue-700">
              All payments are secured with industry-standard encryption
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1 bg-warm-orange text-white hover:bg-warm-orange/90"
          disabled={!paymentOptions.find(o => o.id === selectedMethod)?.available || isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay ${formatAmount(amount)}`}
        </Button>
      </div>
    </div>
  )
}

export default PaymentMethods
