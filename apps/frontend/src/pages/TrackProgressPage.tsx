import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Users, 
  Target,
  TrendingUp,
  Download,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface DonationProgress {
  donationId: string;
  amount: number;
  campaignTitle: string;
  campaignId: string;
  date: string;
  status: 'completed' | 'processing' | 'verified';
  transactionId: string;
  blockchainHash?: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    date?: string;
    amount: number;
    progress: number;
  }[];
  impact: {
    beneficiaries: number;
    totalRaised: number;
    goalAmount: number;
    progressPercentage: number;
  };
  updates: {
    id: string;
    title: string;
    description: string;
    date: string;
    image?: string;
    type: 'milestone' | 'update' | 'completion';
  }[];
}

export function TrackProgressPage() {
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donationId');
  const [progress, setProgress] = useState<DonationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    if (donationId) {
      setTimeout(() => {
        setProgress({
          donationId: donationId,
          amount: 5000,
          campaignTitle: "Education for Underprivileged Children",
          campaignId: "camp_123",
          date: "2025-01-10",
          status: 'completed',
          transactionId: "TXN123456789",
          blockchainHash: "0x742d35cc6cd34b3c4c4c4c6cd34b3c5b73e1b56",
          milestones: [
            {
              id: 'milestone_1',
              title: 'Books & Supplies Purchased',
              description: 'Educational materials bought for 50 students',
              completed: true,
              date: '2025-01-12',
              amount: 2500,
              progress: 100
            },
            {
              id: 'milestone_2', 
              title: 'Teacher Training Conducted',
              description: 'Training sessions for local teachers',
              completed: true,
              date: '2025-01-15',
              amount: 1500,
              progress: 100
            },
            {
              id: 'milestone_3',
              title: 'School Infrastructure',
              description: 'Renovation of classrooms and facilities',
              completed: false,
              amount: 1000,
              progress: 60
            }
          ],
          impact: {
            beneficiaries: 75,
            totalRaised: 150000,
            goalAmount: 200000,
            progressPercentage: 75
          },
          updates: [
            {
              id: 'update_1',
              title: 'Books Distributed Successfully!',
              description: 'Your donation helped us distribute textbooks to 50 children in rural schools.',
              date: '2025-01-12',
              type: 'milestone'
            },
            {
              id: 'update_2',
              title: 'Teacher Training Completed',
              description: 'Local teachers received training on modern teaching methods.',
              date: '2025-01-15',
              type: 'milestone'
            },
            {
              id: 'update_3',
              title: 'Classroom Renovation in Progress',
              description: 'Work has begun on renovating school facilities.',
              date: '2025-01-18',
              type: 'update'
            }
          ]
        });
        setLoading(false);
      }, 1000);
    }
  }, [donationId]);

  const handleShare = () => {
    navigator.share?.({
      title: 'My Donation Impact',
      text: `See how my donation is making a difference!`,
      url: window.location.href
    }).catch(() => {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard"
      });
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-orange mx-auto mb-4"></div>
          <p className="text-warm-charcoal">Loading your donation progress...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-warm-orange mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-warm-charcoal mb-2">Donation Not Found</h1>
          <p className="text-warm-charcoal-light mb-4">We couldn't find details for this donation ID.</p>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header */}
      <div className="bg-white border-b border-warm-orange/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-warm-charcoal">Track Your Donation Impact</h1>
              <p className="text-warm-charcoal-light">Donation ID: {progress.donationId}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donation Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="warm-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-warm-charcoal">Your Donation</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  progress.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : progress.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-warm-orange/10 text-warm-orange'
                }`}>
                  {progress.status === 'completed' && <CheckCircle className="inline h-4 w-4 mr-1" />}
                  {progress.status === 'processing' && <Clock className="inline h-4 w-4 mr-1" />}
                  {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-warm-charcoal mb-2">{progress.campaignTitle}</h3>
                  <div className="space-y-2 text-sm text-warm-charcoal-light">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Amount: ₹{progress.amount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date: {new Date(progress.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {progress.transactionId}
                      </span>
                    </div>
                  </div>
                </div>

                {progress.blockchainHash && (
                  <div>
                    <h4 className="font-semibold text-warm-charcoal mb-2">Blockchain Verification</h4>
                    <div className="text-xs font-mono bg-green-50 p-2 rounded border">
                      <div className="text-green-700 mb-1">Verified on Polygon Network</div>
                      <div className="text-green-600 break-all">{progress.blockchainHash}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Milestones Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="warm-card p-6"
            >
              <h2 className="text-xl font-bold text-warm-charcoal mb-6">Project Milestones</h2>
              
              <div className="space-y-6">
                {progress.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative">
                    {index < progress.milestones.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.completed 
                          ? 'bg-green-500 text-white' 
                          : milestone.progress > 0
                          ? 'bg-warm-orange text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {milestone.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : milestone.progress > 0 ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-warm-charcoal">{milestone.title}</h3>
                          <span className="text-sm text-warm-orange font-medium">
                            ₹{milestone.amount.toLocaleString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-warm-charcoal-light mb-3">{milestone.description}</p>
                        
                        {!milestone.completed && milestone.progress > 0 && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs text-warm-charcoal-light mb-1">
                              <span>Progress</span>
                              <span>{milestone.progress}%</span>
                            </div>
                            <Progress value={milestone.progress} className="h-2" />
                          </div>
                        )}
                        
                        {milestone.date && (
                          <div className="text-xs text-warm-charcoal-light flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {milestone.completed ? 'Completed' : 'Expected'}: {new Date(milestone.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Updates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="warm-card p-6"
            >
              <h2 className="text-xl font-bold text-warm-charcoal mb-6">Recent Updates</h2>
              
              <div className="space-y-4">
                {progress.updates.map((update) => (
                  <div key={update.id} className="border-l-4 border-warm-orange pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-warm-charcoal">{update.title}</h3>
                      <span className="text-xs text-warm-charcoal-light">
                        {new Date(update.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-warm-charcoal-light">{update.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Impact Summary */}
          <div className="space-y-6">
            {/* Campaign Impact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="warm-card p-6"
            >
              <h2 className="text-lg font-bold text-warm-charcoal mb-4">Campaign Impact</h2>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warm-orange">
                    {progress.impact.beneficiaries}
                  </div>
                  <div className="text-sm text-warm-charcoal-light">Lives Impacted</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Campaign Progress</span>
                    <span>{progress.impact.progressPercentage}%</span>
                  </div>
                  <Progress value={progress.impact.progressPercentage} className="h-3" />
                  <div className="flex items-center justify-between text-xs text-warm-charcoal-light mt-1">
                    <span>₹{progress.impact.totalRaised.toLocaleString()}</span>
                    <span>₹{progress.impact.goalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="warm-card p-6"
            >
              <h2 className="text-lg font-bold text-warm-charcoal mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link to={`/campaigns/${progress.campaignId}`}>
                  <Button className="w-full" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    View Full Campaign
                  </Button>
                </Link>
                
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Donate Again
                </Button>
                
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View My Impact
                </Button>
              </div>
            </motion.div>

            {/* Certificate */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="warm-card p-6 text-center"
            >
              <h2 className="text-lg font-bold text-warm-charcoal mb-4">Tax Certificate</h2>
              <p className="text-sm text-warm-charcoal-light mb-4">
                Download your 80G tax exemption certificate
              </p>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
