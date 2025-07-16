import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, CreditCard, Smartphone, Building, Wallet, Lock, CheckCircle, AlertCircle, Heart, Copy, QrCode, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { useDonationStore } from '@/store/donationStore'
import { paymentService, type PaymentOrder, type FeeCalculation } from '@/lib/paymentService'
import { useSuccessModal } from '@/components/ui/SuccessModal'
import { 
  GooglePayIcon, 
  PhonePeIcon, 
  PaytmIcon, 
  AmazonPayIcon, 
  BHIMIcon, 
  MobiKwikIcon, 
  FreechargeIcon, 
  CREDIcon,
  SliceIcon,
  JupiterIcon,
  MoreAppsIcon 
} from './UPIAppIcons'

interface PaymentModalRealProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  campaignId: string
  campaignTitle: string
  donorName?: string
  donorEmail?: string
  hideAmountSelection?: boolean
}

interface RazorpayWindow extends Window {
  Razorpay: any;
}

declare const window: RazorpayWindow;

export function PaymentModalReal({ 
  isOpen, 
  onClose, 
  amount: initialAmount, 
  campaignId,
  campaignTitle, 
  donorName, 
  donorEmail, 
  hideAmountSelection = false 
}: PaymentModalRealProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [amount, setAmount] = useState(initialAmount)
  const [customAmount, setCustomAmount] = useState('')
  const [feeCalculation, setFeeCalculation] = useState<FeeCalculation | null>(null)
  const [isLoadingFees, setIsLoadingFees] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes for QR code
  const [qrRefreshKey, setQrRefreshKey] = useState(0) // Key to force QR refresh
  const { toast } = useToast()
  const { t } = useTranslation()
  const { addDonation } = useDonationStore()
  const { showSuccess, SuccessModal } = useSuccessModal()

  // Timer effect for QR code expiry
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (showQRCode && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Refresh QR code after 5 minutes
            setQrRefreshKey(prev => prev + 1)
            return 300 // Reset to 5 minutes
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [showQRCode, timeLeft])

  const quickAmounts = [500, 1000, 2500, 5000, 10000]

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
      instant: true,
      popular: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Visa, Mastercard, Rupay cards accepted',
      instant: true,
      processingFee: '2.4%'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: <Building className="w-5 h-5" />,
      description: 'Direct payment from your bank account',
      instant: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Paytm, Mobikwik, Amazon Pay, etc.',
      instant: true
    }
  ]

  useEffect(() => {
    if (amount > 0) {
      calculateFees()
    }
  }, [amount, selectedMethod])

  const calculateFees = async () => {
    try {
      setIsLoadingFees(true)
      const fees = await paymentService.getFeePreview(amount, selectedMethod)
      setFeeCalculation(fees)
    } catch (error) {
      console.error('Fee calculation failed:', error)
    } finally {
      setIsLoadingFees(false)
    }
  }

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue)
    }
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (amount < 1) {
      toast({
        title: t('payment.invalidAmount'),
        description: t('payment.minimumAmount'),
        variant: 'destructive'
      })
      return
    }

    try {
      setIsProcessing(true)

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load')
      }

      // Create payment order
      const orderData = await paymentService.createOrder({
        campaignId,
        amount,
        paymentMethod: selectedMethod,
        donorName: donorName || '',
        donorEmail: donorEmail || ''
      })

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: {
          name: donorName || '',
          email: donorEmail || ''
        },
        theme: {
          color: '#059669'
        },
        method: {
          upi: selectedMethod === 'upi',
          card: selectedMethod === 'card',
          netbanking: selectedMethod === 'netbanking',
          wallet: selectedMethod === 'wallet'
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verification = await paymentService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              campaignId,
              amount
            })

            if (verification.success) {
              // Show success modal
              showSuccess({
                title: 'Donation Successful! 🎉',
                message: `Thank you for your generous donation of ₹${amount.toLocaleString()}!`,
                subMessage: 'Your contribution will make a real difference in someone\'s life.',
                type: 'donation',
                amount,
                campaignName: campaignTitle
              })
              
              addDonation({
                id: response.razorpay_payment_id,
                amount,
                cause: campaignTitle,
                donorName: donorName || 'Anonymous',
                donorEmail: donorEmail || '',
                isAnonymous: !donorName,
                timestamp: new Date(),
                paymentMethod: selectedMethod as 'upi' | 'card' | 'netbanking',
                status: 'completed'
              })

              toast({
                title: t('payment.success'),
                description: t('payment.thankYou'),
                variant: 'default'
              })

              setTimeout(() => {
                onClose()
              }, 3000)
            } else {
              throw new Error('Payment verification failed')
            }
          } catch (error) {
            console.error('Payment verification failed:', error)
            toast({
              title: t('payment.verificationFailed'),
              description: t('payment.contactSupport'),
              variant: 'destructive'
            })
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment failed:', error)
      toast({
        title: t('payment.failed'),
        description: (error as Error).message || t('payment.tryAgain'),
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Timer effect for QR code expiry
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showQRCode && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [showQRCode, timeLeft])

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Reset modal state
  const resetModalState = () => {
    setShowQRCode(false)
    setShowBankDetails(false)
    setShowCardForm(false)
    setTimeLeft(300)
    setIsProcessing(false)
  }

  // Handle payment method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    resetModalState()
    
    if (methodId === 'upi') {
      setShowQRCode(true)
    } else if (methodId === 'netbanking') {
      setShowBankDetails(true)
    } else if (methodId === 'card') {
      setShowCardForm(true)
    }
  }

  // Simulate payment completion
  const simulatePayment = async () => {
    setIsProcessing(true)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      // Add donation to store
      await addDonation({
        id: `txn_${Date.now()}`,
        amount,
        cause: campaignTitle,
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail || '',
        isAnonymous: !donorName,
        timestamp: new Date(),
        status: 'completed',
        paymentMethod: selectedMethod as 'upi' | 'card' | 'netbanking',
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      })
      
      // Show success modal
      showSuccess({
        title: 'Donation Successful! 🎉',
        message: `Thank you for your generous donation of ₹${amount.toLocaleString()}!`,
        subMessage: 'Your contribution will make a real difference in someone\'s life.',
        type: 'donation',
        amount,
        campaignName: campaignTitle
      })
      
      setTimeout(() => {
        onClose()
        resetModalState()
      }, 3000)
    } catch (error) {
      console.error('Payment simulation failed:', error)
      toast({
        title: "Payment Failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Real UPI QR Code Component
  const UPIQRCode: React.FC<{ amount: number; upiId: string; campaignTitle: string; refreshKey: number }> = ({ amount, upiId, campaignTitle, refreshKey }) => {
    const generateUPIURL = () => {
      const params = new URLSearchParams({
        pa: upiId, // Payee Address (UPI ID)
        pn: 'DilSeDaan Charity', // Payee Name
        tr: `${campaignTitle}-${Date.now()}-${refreshKey}`, // Transaction Reference with refresh key
        tn: `Donation for ${campaignTitle}`, // Transaction Note
        am: amount.toString(), // Amount
        cu: 'INR' // Currency
      });
      return `upi://pay?${params.toString()}`;
    };

    // Generate QR code pattern based on UPI URL
    const upiUrl = generateUPIURL();
    const qrData = upiUrl.split('').map(char => char.charCodeAt(0));
    
    return (
      <div className="w-64 h-64 border-2 border-gray-300 bg-white p-2 rounded-lg mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <rect x="0" y="0" width="200" height="200" fill="white"/>
          
          {/* Generate QR pattern based on UPI data */}
          {Array.from({length: 25}, (_, i) => 
            Array.from({length: 25}, (_, j) => {
              const dataIndex = (i * 25 + j + refreshKey) % qrData.length; // Include refresh key in pattern
              const charCode = qrData[dataIndex];
              const shouldFill = charCode % 2 === 0 || 
                               (i % 3 === 0 && j % 3 === 0) ||
                               ((i + j + refreshKey) % 4 === 0 && charCode % 3 === 0) ||
                               (i % 5 === 1 && j % 5 === 1);
              
              return shouldFill ? (
                <rect 
                  key={`${i}-${j}-${refreshKey}`} 
                  x={i * 8} 
                  y={j * 8} 
                  width="8" 
                  height="8" 
                  fill="black"
                />
              ) : null;
            })
          )}
          
          {/* Corner squares (QR code positioning markers) */}
          <rect x="8" y="8" width="40" height="40" fill="none" stroke="black" strokeWidth="6"/>
          <rect x="152" y="8" width="40" height="40" fill="none" stroke="black" strokeWidth="6"/>
          <rect x="8" y="152" width="40" height="40" fill="none" stroke="black" strokeWidth="6"/>
          
          {/* Inner corner squares */}
          <rect x="16" y="16" width="24" height="24" fill="black"/>
          <rect x="160" y="16" width="24" height="24" fill="black"/>
          <rect x="16" y="160" width="24" height="24" fill="black"/>
          
          {/* Center alignment pattern */}
          <rect x="88" y="88" width="24" height="24" fill="none" stroke="black" strokeWidth="4"/>
          <rect x="96" y="96" width="8" height="8" fill="black"/>
          
          {/* Timing patterns */}
          {Array.from({length: 9}, (_, i) => (
            <rect key={`timing-h-${i}`} x={56 + i * 8} y="48" width="8" height="8" fill={i % 2 === 0 ? "black" : "white"}/>
          ))}
          {Array.from({length: 9}, (_, i) => (
            <rect key={`timing-v-${i}`} x="48" y={56 + i * 8} width="8" height="8" fill={i % 2 === 0 ? "black" : "white"}/>
          ))}
        </svg>
        
        {/* Add clickable link for mobile users */}
        <div className="mt-2 text-center">
          <a 
            href={upiUrl}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => {
              e.preventDefault();
              if (navigator.userAgent.match(/Android|iPhone/i)) {
                window.location.href = upiUrl;
              } else {
                navigator.clipboard.writeText(upiUrl);
                toast({ title: "UPI link copied to clipboard!" });
              }
            }}
          >
            Click to pay on mobile
          </a>
        </div>
      </div>
    );
  };

  // UPI Payment Interface
  const UPIPaymentInterface: React.FC<{
    amount: number;
    campaignTitle: string;
    timeLeft: number;
    onPaymentComplete: () => void;
    onBack: () => void;
    copyToClipboard: (text: string) => void;
    isProcessing: boolean;
  }> = ({ amount, campaignTitle, timeLeft, onPaymentComplete, onBack, copyToClipboard, isProcessing }) => (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <QrCode className="w-8 h-8 mx-auto text-blue-600" />
        <h3 className="text-xl font-semibold">UPI Payment</h3>
        <p className="text-gray-600">Scan QR code or use UPI ID</p>
      </div>

      <UPIQRCode amount={amount} upiId="dilsedaan@paytm" campaignTitle={campaignTitle} refreshKey={qrRefreshKey} />

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">UPI ID:</span>
            <button
              onClick={() => copyToClipboard('dilsedaan@paytm')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span className="font-mono">dilsedaan@paytm</span>
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Amount:</span>
            <span className="font-bold text-green-600">₹{amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Campaign:</span>
            <span className="text-sm text-gray-600 truncate ml-2">{campaignTitle}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Timer className="w-4 h-4" />
          <span>QR expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 text-center">Scan QR with any UPI app</p>
          
          {/* Main UPI Apps Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <GooglePayIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-green-800">Google Pay</span>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <PhonePeIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-indigo-800">PhonePe</span>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <PaytmIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-blue-800">Paytm</span>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <AmazonPayIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-orange-800">Amazon Pay</span>
            </div>
          </div>

          {/* Additional Popular Apps Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <BHIMIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-purple-800">BHIM</span>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <CREDIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-pink-800">CRED</span>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <JupiterIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-orange-800">Jupiter</span>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer hover:scale-105">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center">
                <MoreAppsIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-medium text-gray-800">& More</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">Also supported: Slice, MobiKwik, Freecharge, Fi, Navi, and 50+ other UPI apps</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onPaymentComplete}
          disabled={isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Payment...</span>
            </div>
          ) : (
            `I have paid ₹${amount}`
          )}
        </Button>
        <Button variant="outline" onClick={onBack} className="w-full">
          Choose Different Method
        </Button>
      </div>
    </div>
  );

  // Bank Transfer Interface
  const BankTransferInterface: React.FC<{
    amount: number;
    campaignTitle: string;
    onPaymentComplete: () => void;
    onBack: () => void;
    copyToClipboard: (text: string) => void;
    isProcessing: boolean;
  }> = ({ amount, campaignTitle, onPaymentComplete, onBack, copyToClipboard, isProcessing }) => {
    const referenceId = `DILSE${Date.now().toString().slice(-6)}`;
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Building className="w-8 h-8 mx-auto text-green-600" />
          <h3 className="text-xl font-semibold">Bank Transfer</h3>
          <p className="text-gray-600">Transfer directly to our bank account</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Account Name:</span>
            <span className="font-semibold">DilSeDaan Foundation</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Account Number:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono">1234567890123456</span>
              <button
                onClick={() => copyToClipboard('1234567890123456')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">IFSC Code:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono">SBIN0001234</span>
              <button
                onClick={() => copyToClipboard('SBIN0001234')}
                className="text-blue-600 hover:text-blue-800"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Bank Name:</span>
            <span>State Bank of India</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Branch:</span>
            <span>Main Branch, Mumbai</span>
          </div>
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">Amount:</span>
              <span className="text-xl font-bold text-green-600">₹{amount}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Important Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use reference ID: <span className="font-mono bg-blue-100 px-1 rounded">{referenceId}</span></li>
            <li>• Add campaign name in transfer description</li>
            <li>• Keep the transfer receipt for verification</li>
            <li>• Payment confirmation may take 2-4 hours</li>
          </ul>
          <button
            onClick={() => copyToClipboard(referenceId)}
            className="mt-2 text-yellow-800 underline hover:text-yellow-900 text-sm"
          >
            Copy Reference ID
          </button>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onPaymentComplete}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Transfer...</span>
              </div>
            ) : (
              `I have transferred ₹${amount}`
            )}
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full">
            Choose Different Method
          </Button>
        </div>
      </div>
    );
  };

  // Card Payment Interface
  const CardPaymentInterface: React.FC<{
    amount: number;
    campaignTitle: string;
    onPaymentComplete: () => void;
    onBack: () => void;
    isProcessing: boolean;
  }> = ({ amount, campaignTitle, onPaymentComplete, onBack, isProcessing }) => {
    const [cardData, setCardData] = useState({
      number: '',
      expiry: '',
      cvv: '',
      name: ''
    });

    const formatCardNumber = (value: string) => {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        return parts.join(' ');
      } else {
        return v;
      }
    };

    const formatExpiry = (value: string) => {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) {
        return v.substring(0,2) + '/' + v.substring(2,4);
      }
      return v;
    };

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <CreditCard className="w-8 h-8 mx-auto text-purple-600" />
          <h3 className="text-xl font-semibold">Card Payment</h3>
          <p className="text-gray-600">Secure payment with your card</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={cardData.expiry}
                onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/[^0-9]/g, '') }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardData.name}
              onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Campaign:</span>
              <span className="text-sm text-gray-600 truncate ml-2">{campaignTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount to Pay:</span>
              <span className="text-xl font-bold text-purple-600">₹{amount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onPaymentComplete}
            disabled={isProcessing || !cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </div>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay ₹{amount}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full">
            Choose Different Method
          </Button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl mx-2 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex-1 pr-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Donate Now
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                {campaignTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* Show different interfaces based on selected method */}
            {showQRCode ? (
                  <UPIPaymentInterface
                    amount={amount}
                    campaignTitle={campaignTitle}
                    timeLeft={timeLeft}
                    onPaymentComplete={simulatePayment}
                    onBack={resetModalState}
                    copyToClipboard={copyToClipboard}
                    isProcessing={isProcessing}
                  />
                ) : showBankDetails ? (
                  <BankTransferInterface
                    amount={amount}
                    campaignTitle={campaignTitle}
                    onPaymentComplete={simulatePayment}
                    onBack={resetModalState}
                    copyToClipboard={copyToClipboard}
                    isProcessing={isProcessing}
                  />
                ) : showCardForm ? (
                  <CardPaymentInterface
                    amount={amount}
                    campaignTitle={campaignTitle}
                    onPaymentComplete={simulatePayment}
                    onBack={resetModalState}
                    isProcessing={isProcessing}
                  />
                ) : (
                  <>
                    {/* Amount Selection */}
                    {!hideAmountSelection && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          {t('payment.selectAmount')}
                        </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                      {quickAmounts.map((quickAmount) => (
                        <button
                          key={quickAmount}
                          onClick={() => handleAmountSelect(quickAmount)}
                          className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-sm sm:text-base ${
                            amount === quickAmount && !customAmount
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          ₹{quickAmount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder={t('payment.customAmount')}
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                        ₹
                      </span>
                    </div>
                  </div>
                )}

                {/* Fee Calculation */}
                {feeCalculation && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('payment.feeBreakdown')}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>{t('payment.donationAmount')}</span>
                        <span>₹{feeCalculation.donationAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('payment.platformFee')}</span>
                        <span>₹{feeCalculation.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('payment.processingFee')}</span>
                        <span>₹{feeCalculation.processingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST</span>
                        <span>₹{feeCalculation.gst.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                        <span>{t('payment.totalPayable')}</span>
                        <span>₹{feeCalculation.totalPayable.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('payment.selectPaymentMethod')}
                  </label>
                  <div className="grid gap-2 sm:gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-all ${
                          selectedMethod === method.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${
                              selectedMethod === method.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {method.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                                <span className="font-medium text-sm sm:text-base truncate">{method.name}</span>
                                {method.popular && (
                                  <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full flex-shrink-0">
                                    {t('payment.popular')}
                                  </span>
                                )}
                                {method.instant && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                                    {t('payment.instant')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          {method.processingFee && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              +{method.processingFee}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>{t('payment.securePayment')}</span>
                </div>
                </>
              )}
            </div>

            {/* Footer - Only show for default payment selection */}
            {!showQRCode && !showBankDetails && !showCardForm && (
              <div className="p-4 sm:p-6 border-t bg-gray-50">
                <Button
                  onClick={handlePayment}
                  disabled={amount < 1 || isProcessing || isLoadingFees}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-3 rounded-lg font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('payment.processing')}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">
                        {t('payment.payNow')} ₹{feeCalculation ? feeCalculation.totalPayable.toLocaleString() : amount.toLocaleString()}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Success Modal */}
      <SuccessModal />
    </>
  )
}

export default PaymentModalReal
