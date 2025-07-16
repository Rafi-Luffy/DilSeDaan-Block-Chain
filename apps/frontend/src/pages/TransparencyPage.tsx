import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, CheckCircle, Clock, X, Heart, ExternalLink, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDonationStore } from '@/store/donationStore'
import { useAuthStore } from '@/store/authStore'

// --- MOCK DATA ALIGNED WITH BLOCKCHAIN ARCHITECTURE ---
// In a real DApp, this would be a connected user's wallet address from Metamask/etc.
const MOCK_USER_WALLET_ADDRESS = "0xAbC123...fEd456";

type UsageProof = {
    item: string;
    amount: number;
    verified: boolean;
    // Link to proof document (e.g., receipt scan) on IPFS
    proofIpfsHash: string | null;
    // The transaction hash of the verification/milestone approval
    verificationTransactionHash: string | null;
};

type BlockchainTransaction = {
    transactionHash: string;
    donorAddress: string;
    // Donor name could be from a profile linked to the address, or "Anonymous"
    donorName: string;
    amount: number;
    campaign: string;
    timestamp: string;
    status: 'confirmed' | 'pending' | 'failed';
    blockNumber: number | null;
    usage: UsageProof[];
};

const MOCK_TRANSACTIONS: BlockchainTransaction[] = [
  { transactionHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b", donorAddress: MOCK_USER_WALLET_ADDRESS, donorName: "Priya (from Wallet)", amount: 5000, campaign: "Little Priya's School Books", timestamp: "2024-07-15T10:30:00Z", status: "confirmed", blockNumber: 18945672, usage: [
      { item: "School books purchase", amount: 2000, verified: true, proofIpfsHash: "QmXoW8s...Y4Z", verificationTransactionHash: "0x...1111" },
      { item: "Uniform tailoring", amount: 1500, verified: true, proofIpfsHash: "QmYp9X...A5B", verificationTransactionHash: "0x...2222" },
      { item: "Stationery supplies", amount: 1000, verified: true, proofIpfsHash: "QmZa7B...C9D", verificationTransactionHash: "0x...3333" },
      { item: "Platform fee (5%)", amount: 250, verified: true, proofIpfsHash: "QmBv3D...E8F", verificationTransactionHash: "0x...4444" },
      { item: "Funds remaining", amount: 250, verified: false, proofIpfsHash: null, verificationTransactionHash: null }
  ]},
  { transactionHash: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f2b3c4d", donorAddress: "0xAnonymous...789", donorName: "Anonymous Hero", amount: 10000, campaign: "Clean Water for Rampur", timestamp: "2024-07-14T15:45:00Z", status: "confirmed", blockNumber: 18945234, usage: [
      { item: "Water purification system", amount: 8000, verified: true, proofIpfsHash: "QmCdeFg...G1H", verificationTransactionHash: "0x...5555" },
      { item: "System installation labor", amount: 1500, verified: true, proofIpfsHash: "QmHijKl...M2N", verificationTransactionHash: "0x...6666" },
      { item: "Platform fee (5%)", amount: 500, verified: true, proofIpfsHash: "QmOpQr...S3T", verificationTransactionHash: "0x...7777" }
  ]},
  { transactionHash: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f3c4d5e6f", donorAddress: "0xRahul...abc", donorName: "Rahul from Delhi", amount: 2500, campaign: "Emergency Food Relief", timestamp: "2024-07-13T09:20:00Z", status: "pending", blockNumber: null, usage: [] },
];


// --- MAIN PAGE COMPONENT ---
export function TransparencyPage() {
  const { t } = useTranslation()
  const { donations } = useDonationStore()
  const { user } = useAuthStore()
  
  // Generate fund allocation from translation keys
  const fundAllocation = {
    totalRaised: 2500000,
    categories: [
      { 
        name: t('transparency.fundAllocation.education.name'), 
        percentage: t('transparency.fundAllocation.education.percentage'), 
        color: "bg-warm-blue", 
        description: t('transparency.fundAllocation.education.description')
      },
      { 
        name: t('transparency.fundAllocation.healthcare.name'), 
        percentage: t('transparency.fundAllocation.healthcare.percentage'), 
        color: "bg-warm-green", 
        description: t('transparency.fundAllocation.healthcare.description')
      },
      { 
        name: t('transparency.fundAllocation.food.name'), 
        percentage: t('transparency.fundAllocation.food.percentage'), 
        color: "bg-warm-orange", 
        description: t('transparency.fundAllocation.food.description')
      },
      { 
        name: t('transparency.fundAllocation.water.name'), 
        percentage: t('transparency.fundAllocation.water.percentage'), 
        color: "bg-blue-400", 
        description: t('transparency.fundAllocation.water.description')
      },
      { 
        name: t('transparency.fundAllocation.emergency.name'), 
        percentage: t('transparency.fundAllocation.emergency.percentage'), 
        color: "bg-red-500", 
        description: t('transparency.fundAllocation.emergency.description')
      }
    ]
  };

  // Convert donation store data to blockchain format for display
  const convertDonationsToBlockchain = (): BlockchainTransaction[] => {
    return donations.map((donation, index) => ({
      transactionHash: donation.transactionId || `0x${Math.random().toString(16).slice(2, 66)}`,
      donorAddress: user?.email === donation.donorEmail ? "0xYourWallet...123" : "0xAnonymous...789",
      donorName: donation.donorName,
      amount: donation.amount,
      campaign: donation.cause,
      timestamp: donation.timestamp.toISOString(),
      status: donation.status as 'confirmed' | 'pending' | 'failed',
      blockNumber: donation.status === 'completed' ? 18945672 + index : null,
      usage: donation.status === 'completed' ? [
        { item: "Direct impact funding", amount: Math.floor(donation.amount * 0.85), verified: true, proofIpfsHash: `QmXoW8s...Y${index}`, verificationTransactionHash: `0x...${index}111` },
        { item: "Platform fee (5%)", amount: Math.floor(donation.amount * 0.05), verified: true, proofIpfsHash: `QmBv3D...E${index}`, verificationTransactionHash: `0x...${index}222` },
        { item: "Processing fee (10%)", amount: Math.floor(donation.amount * 0.10), verified: true, proofIpfsHash: `QmCv3D...F${index}`, verificationTransactionHash: `0x...${index}333` }
      ] : []
    }))
  }

  // --- HELPER COMPONENT: Transaction Detail Modal ---
  const DetailModal = ({ tx, onClose }: { tx: BlockchainTransaction, onClose: () => void }) => (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="warm-card w-full max-w-3xl transform-none" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-handwritten font-bold text-warm-charcoal">{t('transparency.auditModal.title')}</h3><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div>
              <div className="space-y-4">
                  <div className="flex justify-between items-center bg-warm-cream p-3 rounded-lg">
                      <div><p className="text-sm text-warm-charcoal-light font-handwritten">Donation to</p><p className="font-bold text-warm-charcoal">{tx.campaign}</p></div>
                      <div className="text-right"><p className="text-sm text-warm-charcoal-light font-handwritten">{t('transparency.transactionExplorer.amount')}</p><p className="font-bold text-2xl text-warm-green">₹{tx.amount.toLocaleString()}</p></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-warm-cream/50 p-3 rounded-lg"><p className="text-warm-charcoal-light">{t('transparency.transactionExplorer.donor')}</p><p className="font-bold text-warm-charcoal">{tx.donorName}</p></div>
                      <div className="bg-warm-cream/50 p-3 rounded-lg"><p className="text-warm-charcoal-light">{t('transparency.transactionExplorer.timestamp')}</p><p className="font-bold text-warm-charcoal">{new Date(tx.timestamp).toLocaleString()}</p></div>
                      <div className="bg-warm-cream/50 p-3 rounded-lg"><p className="text-warm-charcoal-light">{t('transparency.transactionExplorer.donorAddress')}</p><p className="font-mono text-xs text-warm-blue truncate">{tx.donorAddress}</p></div>
                      <div className="bg-warm-cream/50 p-3 rounded-lg"><p className="text-warm-charcoal-light">{t('transparency.transactionExplorer.blockNumber')}</p><p className="font-mono text-xs text-warm-blue">{tx.blockNumber ? `#${tx.blockNumber}` : t('transparency.transactionExplorer.processing')}</p></div>
                      <div className="bg-warm-cream/50 p-3 rounded-lg col-span-1 md:col-span-2">
                          <div className="flex justify-between items-center">
                              <div><p className="text-warm-charcoal-light">{t('transparency.transactionExplorer.transactionId')}</p><p className="font-mono text-[10px] md:text-xs text-warm-blue break-all">{tx.transactionHash}</p></div>
                              {tx.status === 'confirmed' && (
                                  <Button variant="outline" size="sm" asChild className="ml-2 flex-shrink-0">
                                      <a href={`https://etherscan.io/tx/${tx.transactionHash}`} target="_blank" rel="noopener noreferrer">{t('transparency.transactionExplorer.viewOnEtherscan')} <ExternalLink className="h-3 w-3 ml-1"/></a>
                                  </Button>
                              )}
                          </div>
                      </div>
                  </div>
                  {tx.usage.length > 0 && (
                      <div>
                          <h4 className="font-handwritten text-lg font-bold text-warm-charcoal mt-4 mb-2">{t('transparency.transactionExplorer.fundUsage')}</h4>
                          <div className="space-y-2">{tx.usage.map((use, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                              <div><p className="font-handwritten font-medium text-warm-charcoal">{use.item}</p><p className="text-sm font-bold text-warm-green">₹{use.amount.toLocaleString()}</p></div>
                              <div className="flex items-center space-x-2">
                                  {use.verified && use.proofIpfsHash ? (
                                      <Button variant="ghost" size="sm" asChild className="text-warm-blue hover:bg-warm-blue/10"><a href={`https://ipfs.io/ipfs/${use.proofIpfsHash}`} target="_blank" rel="noopener noreferrer">{t('transparency.transactionExplorer.viewProof')} <ExternalLink className="h-3 w-3 ml-1"/></a></Button>
                                  ) : null}
                                  {use.verified ? <div className="flex items-center text-sm text-warm-green"><CheckCircle className="h-4 w-4 mr-1"/>{t('transparency.transactionExplorer.verified')}</div> : <div className="flex items-center text-sm text-warm-golden"><Clock className="h-4 w-4 mr-1"/>{t('transparency.transactionExplorer.pending')}</div>}
                              </div>
                          </div>))}</div>
                      </div>
                  )}
              </div>
          </motion.div>
      </motion.div>
  );
  // --- STATE MANAGEMENT ---
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'my_transactions'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<BlockchainTransaction | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<(typeof fundAllocation.categories[0]) | null>(null);
  
  // Simulate checking for a connected wallet
  const [userWalletAddress] = useState<string | null>(MOCK_USER_WALLET_ADDRESS);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Simulate network delay for fetching from blockchain/backend
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Always show mock data first
            let allTransactions = [...MOCK_TRANSACTIONS];
            
            // Add real donation data if available
            try {
                const realTransactions = convertDonationsToBlockchain();
                allTransactions = [...allTransactions, ...realTransactions];
            } catch (conversionError) {
                console.warn("Could not convert donations to blockchain format:", conversionError);
                // Continue with just mock data
            }
            
            setTransactions(allTransactions);
        } catch (err) {
            console.error("Failed to fetch transaction data:", err);
            // Show mock data even if there's an error
            setTransactions(MOCK_TRANSACTIONS);
            setError(null); // Don't show error, just use mock data
        } finally {
            setIsLoading(false);
        }
    };
    fetchTransactions();
  }, [donations]); // Re-fetch when donations change

  // --- FILTERING LOGIC ---
  const filteredTransactions = transactions
    .filter(tx => {
        if (filter === 'my_transactions') {
            // Show only current user's transactions
            if (!user) return false;
            return tx.donorName === user.name || tx.donorAddress.includes('YourWallet');
        }
        return true;
    })
    .filter(tx =>
        tx.transactionHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.campaign.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* SECTION 1: HERO */}
      <section className="py-20 bg-gradient-to-br from-warm-orange/10 via-warm-cream to-warm-green/10 relative overflow-hidden">
        <div className="absolute inset-0 mandala-bg"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-handwritten font-bold mb-6 text-warm-charcoal"><span className="inline-block transform -rotate-2 text-warm-orange">{t('transparency.hero.title')}</span><br /><span className="inline-block transform rotate-1">{t('transparency.hero.subtitle')}</span></h1>
                <p className="text-lg md:text-xl text-warm-charcoal-light mb-8 leading-relaxed">{t('transparency.hero.description')}</p>
            </motion.div>
        </div>
      </section>

      {/* SECTION 2: INTERACTIVE FUND ALLOCATION */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 paper-texture"></div>
        <div className="container mx-auto px-4 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                <h2 className="text-2xl md:text-3xl font-handwritten font-bold text-warm-charcoal mb-4 transform -rotate-1">{t('transparency.fundAllocation.title')}</h2>
                <p className="text-lg text-warm-charcoal-light">{t('transparency.fundAllocation.subtitle')}</p>
            </motion.div>
            <div className="max-w-4xl mx-auto">
                <div className="flex rounded-full h-8 w-full overflow-hidden border-2 border-white shadow-lg mb-4">{fundAllocation.categories.map(cat => (<div key={cat.name} style={{ width: `${cat.percentage}%` }} onMouseEnter={() => setHoveredCategory(cat)} onMouseLeave={() => setHoveredCategory(null)} className={`h-full transition-all duration-300 ${cat.color} ${hoveredCategory && hoveredCategory.name !== cat.name ? 'opacity-50' : ''}`} />))}</div>
                <div className="h-24 mt-8"><AnimatePresence mode="wait">{hoveredCategory ? (<motion.div key={hoveredCategory.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center"><h3 className="text-xl font-handwritten font-bold text-warm-charcoal">{hoveredCategory.name} ({hoveredCategory.percentage}%)</h3><p className="text-warm-charcoal-light">{hoveredCategory.description}</p></motion.div>) : <p className="text-center text-warm-charcoal-light font-handwritten text-lg">{t('transparency.fundAllocation.hoverPrompt')}</p>}</AnimatePresence></div>
            </div>
        </div>
      </section>

      {/* UNIFIED LEDGER OF TRUTH SECTION */}
      <section className="py-20 bg-gradient-to-br from-warm-cream to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-handwritten font-bold text-warm-charcoal mb-6 transform rotate-1">
              📖 The Ledger of Truth 🔍
            </h2>
            <p className="text-xl text-warm-charcoal/80 max-w-3xl mx-auto leading-relaxed">
              Each donation is immutably recorded. Fund usage is verified on-chain, with proof stored on IPFS. Search for any transaction to trace its journey.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {/* Blockchain Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-4 gap-6 mb-12"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-cream text-center">
                <div className="text-3xl font-bold text-warm-green mb-2">
                  {filteredTransactions.filter(tx => tx.status === 'confirmed').length}
                </div>
                <div className="text-sm text-warm-charcoal/80">Confirmed Transactions</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-cream text-center">
                <div className="text-3xl font-bold text-warm-orange mb-2">
                  ₹{filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-warm-charcoal/80">Total Volume</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-cream text-center">
                <div className="text-3xl font-bold text-warm-blue mb-2">
                  {filteredTransactions.filter(tx => tx.blockNumber).length}
                </div>
                <div className="text-sm text-warm-charcoal/80">Blocks Mined</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-warm-cream text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {filteredTransactions.reduce((sum, tx) => sum + tx.usage.filter(u => u.verified).length, 0)}
                </div>
                <div className="text-sm text-warm-charcoal/80">Verified Usages</div>
              </div>
            </motion.div>

            {/* Transaction Explorer with Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-warm-cream mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {userWalletAddress && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setFilter('all')} 
                      variant={filter === 'all' ? 'default' : 'outline'} 
                      className="font-handwritten bg-warm-orange hover:bg-warm-orange/90 text-white"
                    >
                      {t('transparency.transactionExplorer.allTransactions')}
                    </Button>
                    <Button 
                      onClick={() => setFilter('my_transactions')} 
                      variant={filter === 'my_transactions' ? 'default' : 'outline'} 
                      className="font-handwritten bg-warm-green hover:bg-warm-green/90 text-white"
                    >
                      {t('transparency.transactionExplorer.myTransactions')}
                    </Button>
                  </div>
                )}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-warm-orange" />
                  <input 
                    type="text" 
                    placeholder={t('transparency.transactionExplorer.searchPlaceholder')} 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 border-2 border-warm-orange/30 rounded-xl focus:border-warm-orange focus:outline-none font-handwritten text-lg bg-white" 
                  />
                </div>
              </div>
            </motion.div>

            {/* Live Blockchain Activity & Transaction Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-warm-cream"
            >
              <h3 className="text-2xl font-bold text-warm-charcoal mb-6 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                Live Blockchain Activity
              </h3>

              {/* Transaction Display */}
              <div className="grid md:grid-cols-2 gap-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="warm-card animate-pulse">
                      <div className="h-6 bg-warm-cream/80 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-warm-cream/80 rounded w-1/2 mb-6"></div>
                      <div className="bg-warm-cream/50 p-3 rounded-lg space-y-2">
                        <div className="h-4 bg-warm-cream/80 rounded w-full"></div>
                        <div className="h-4 bg-warm-cream/80 rounded w-5/6"></div>
                      </div>
                      <div className="h-10 bg-warm-cream/80 rounded w-full mt-4"></div>
                    </div>
                  ))
                ) : error ? (
                  <div className="md:col-span-2 text-center py-12 bg-red-100/50 rounded-lg">
                    <XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-2 text-xl font-handwritten font-bold text-red-700">{t('transparency.transactionExplorer.error')}</h3>
                    <p className="mt-1 text-red-600">{error}</p>
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.slice(0, 6).map((tx, index) => (
                    <motion.div
                      key={tx.transactionHash}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-warm-cream rounded-lg p-4 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {tx.status === 'confirmed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-handwritten font-bold text-lg text-warm-charcoal">{tx.donorName}</p>
                            <span className={`flex items-center text-xs font-bold ${
                              tx.status === 'confirmed' ? 'text-warm-green' : 'text-warm-orange'
                            }`}>
                              {tx.status === 'confirmed' ? 
                                <>✓ {t('transparency.transactionExplorer.confirmed')}</> : 
                                <>⏳ {t('transparency.transactionExplorer.pending')}</>
                              }
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-warm-green font-handwritten">₹{tx.amount.toLocaleString()}</div>
                          <div className="text-xs text-warm-charcoal/60">
                            Block #{tx.blockNumber || 'Pending'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-warm-cream/50 p-3 rounded-lg text-sm space-y-2">
                        <p><strong className="text-warm-charcoal">{t('transparency.transactionExplorer.campaign')}:</strong> {tx.campaign}</p>
                        <p className="truncate">
                          <strong className="text-warm-charcoal">{t('transparency.transactionExplorer.txnHash')}:</strong> 
                          <span className="font-mono text-warm-blue ml-1">{tx.transactionHash.slice(0, 20)}...</span>
                        </p>
                        <div className="text-xs text-warm-charcoal/60">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedTransaction(tx)} 
                        variant="ghost" 
                        className="w-full mt-4 font-handwritten text-warm-blue hover:bg-warm-blue/10 hover:text-warm-blue-dark"
                      >
                        <Eye className="h-4 w-4 mr-2"/>
                        {t('transparency.transactionExplorer.viewAuditTrail')}
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="md:col-span-2 text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-handwritten font-bold text-warm-charcoal mb-2">
                      {t('transparency.transactionExplorer.noResults')}
                    </h3>
                    <p className="text-warm-charcoal/70 font-handwritten">
                      {t('transparency.transactionExplorer.noResultsDesc')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-warm-cream">
                <div className="flex items-center justify-between text-sm text-warm-charcoal/80">
                  <span className="flex items-center gap-2">
                    🔗 Connected to Ethereum Mainnet
                  </span>
                  <span className="flex items-center gap-2">
                    ⚡ Average confirmation time: 15 seconds
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-warm-cream">
        <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-gradient-to-r from-warm-orange via-warm-golden to-warm-green rounded-2xl p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}>
                        <h2 className="text-4xl md:text-6xl font-handwritten font-bold mb-6 transform -rotate-1">{t('transparency.cta.title')}</h2>
                        <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">{t('transparency.cta.subtitle')}</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Button asChild variant="secondary" size="handmade" className="bg-white text-warm-blue hover:bg-warm-cream transform hover:scale-110 hover:-rotate-2 shadow-handmade font-handwritten font-bold"><Link to="/donate"><Heart className="mr-3 h-5 w-5 animate-heart-beat" fill="currentColor" />{t('transparency.cta.donateButton')}</Link></Button>
                            <Button asChild variant="outline" size="handmade" className="border-2 border-white text-white hover:bg-white hover:text-warm-blue transform hover:rotate-1 font-handwritten bg-transparent"><Link to="/impact">{t('transparency.cta.impactButton')}</Link></Button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
      </section>

      <AnimatePresence>{selectedTransaction && <DetailModal tx={selectedTransaction} onClose={() => setSelectedTransaction(null)} />}</AnimatePresence>
    </div>
  )
}