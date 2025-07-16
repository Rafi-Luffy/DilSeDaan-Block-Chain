import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Heart, 
  Users, 
  DollarSign,
  Star,
  Bot,
  Lightbulb,
  BarChart3,
  Zap
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function AIFeaturesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('recommendations')
  const [loading, setLoading] = useState(false)

  const recommendations = [
    {
      id: 1,
      title: 'Help Save Children in Rural Schools',
      category: 'Education',
      confidence: 94,
      reason: 'Based on your previous donations to education causes',
      amount: '₹50,000',
      progress: 67,
      urgency: 'high',
      image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=300'
    },
    {
      id: 2,
      title: 'Emergency Medical Fund for Cancer Patient',
      category: 'Medical',
      confidence: 89,
      reason: 'Similar campaigns you supported achieved 120% funding',
      amount: '₹2,00,000',
      progress: 45,
      urgency: 'critical',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'
    },
    {
      id: 3,
      title: 'Animal Rescue Shelter Expansion',
      category: 'Animal Welfare',
      confidence: 82,
      reason: 'High impact potential in your local area',
      amount: '₹75,000',
      progress: 78,
      urgency: 'medium',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300'
    }
  ]

  const insights = [
    {
      title: 'Donation Pattern',
      value: 'Monthly Giver',
      description: 'You tend to donate every 3-4 weeks',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Preferred Causes',
      value: 'Education & Health',
      description: '78% of your donations go to these categories',
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Impact Score',
      value: '9.2/10',
      description: 'Your donations have high success rates',
      icon: Star,
      color: 'text-warm-golden'
    },
    {
      title: 'Giving Potential',
      value: 'High Capacity',
      description: 'AI suggests you can increase impact by 40%',
      icon: Zap,
      color: 'text-blue-600'
    }
  ]

  const aiFeatures = [
    {
      name: 'Smart Recommendations',
      description: 'AI-powered campaign suggestions based on your preferences',
      accuracy: 94,
      status: 'Active'
    },
    {
      name: 'Fraud Detection',
      description: 'Machine learning algorithms to identify suspicious campaigns',
      accuracy: 98,
      status: 'Active'
    },
    {
      name: 'Impact Prediction',
      description: 'Predict campaign success probability before you donate',
      accuracy: 87,
      status: 'Active'
    },
    {
      name: 'Optimal Timing',
      description: 'AI suggests the best time to launch or donate to campaigns',
      accuracy: 76,
      status: 'Beta'
    },
    {
      name: 'Sentiment Analysis',
      description: 'Analyze campaign descriptions and updates for authenticity',
      accuracy: 91,
      status: 'Active'
    },
    {
      name: 'Smart Notifications',
      description: 'Personalized alerts based on your donation behavior',
      accuracy: 89,
      status: 'Active'
    }
  ]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-warm-golden/10 text-warm-golden border-warm-golden/30'
      default: return 'bg-green-100 text-green-700 border-green-200'
    }
  }

  const generateNewRecommendations = async () => {
    setLoading(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warm-orange/10 rounded-lg">
              <Brain className="h-6 w-6 text-warm-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-warm-charcoal">
                AI-Powered Features
              </h1>
              <p className="text-warm-charcoal/70 mt-1">
                Intelligent recommendations and insights to maximize your impact
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-warm-orange/10 text-warm-orange border-warm-orange/30">
              <Bot className="h-3 w-3 mr-1" />
              Machine Learning
            </Badge>
            <Badge variant="outline" className="bg-warm-blue/10 text-warm-blue border-warm-blue/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart Recommendations
            </Badge>
            <Badge variant="outline" className="bg-warm-green/10 text-warm-green border-warm-green/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              Predictive Analytics
            </Badge>
          </div>
        </div>

        {/* AI Insights Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          {insights.map((insight, index) => (
            <Card key={index} className="bg-white border border-warm-orange/20">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-warm-cream/50 rounded-lg">
                    <insight.icon className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{insight.value}</p>
                    <p className="text-sm font-medium text-warm-charcoal">{insight.title}</p>
                    <p className="text-xs text-warm-charcoal/70">{insight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommendations">
                  <Target className="h-4 w-4 mr-2" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="features">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Features
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="insights">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <span>Smart Recommendations</span>
                        </CardTitle>
                        <CardDescription>
                          AI-curated campaigns based on your giving history and preferences
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={generateNewRecommendations} 
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? (
                          <>
                            <Bot className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Refresh
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 border border-warm-cream rounded-lg bg-warm-cream/30 hover:shadow-md transition-shadow">
                          <div className="flex space-x-4">
                            <img 
                              src={rec.image} 
                              alt={rec.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg">{rec.title}</h3>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className={getUrgencyColor(rec.urgency)}>
                                    {rec.urgency}
                                  </Badge>
                                  <Badge variant="outline">
                                    {rec.confidence}% match
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-warm-charcoal/70 mb-3">{rec.reason}</p>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Goal: {rec.amount}</span>
                                  <span>{rec.progress}% funded</span>
                                </div>
                                <Progress value={rec.progress} className="h-2" />
                              </div>
                              
                              <div className="flex space-x-2 mt-4">
                                <Button size="sm">
                                  <Heart className="h-4 w-4 mr-2" />
                                  Donate Now
                                </Button>
                                <Button size="sm" variant="outline">
                                  Learn More
                                </Button>
                                <Button size="sm" variant="ghost">
                                  Save for Later
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Features Tab */}
              <TabsContent value="features">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">AI-Powered Features</CardTitle>
                    <CardDescription>
                      Advanced machine learning capabilities enhancing your giving experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiFeatures.map((feature, index) => (
                        <div key={index} className="p-4 border border-warm-cream rounded-lg bg-warm-cream/30">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{feature.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant={feature.status === 'Active' ? 'default' : 'outline'}>
                                {feature.status}
                              </Badge>
                              <span className="text-sm text-warm-charcoal/60">{feature.accuracy}%</span>
                            </div>
                          </div>
                          <p className="text-sm text-warm-charcoal/70 mb-3">{feature.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Accuracy</span>
                              <span>{feature.accuracy}%</span>
                            </div>
                            <Progress value={feature.accuracy} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">AI Analytics Dashboard</CardTitle>
                    <CardDescription>
                      Real-time insights powered by machine learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Donation Prediction</h3>
                        <p className="text-2xl font-bold text-blue-600">₹12,450</p>
                        <p className="text-sm text-warm-charcoal/70">Predicted next month</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Impact Score</h3>
                        <p className="text-2xl font-bold text-green-600">9.2/10</p>
                        <p className="text-sm text-warm-charcoal/70">Based on campaign outcomes</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Fraud Prevention</h3>
                        <p className="text-2xl font-bold text-orange-600">23</p>
                        <p className="text-sm text-warm-charcoal/70">Suspicious campaigns blocked</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <h3 className="font-semibold mb-2">Success Rate</h3>
                        <p className="text-2xl font-bold text-purple-600">94%</p>
                        <p className="text-sm text-warm-charcoal/70">Of recommended campaigns</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights">
                <Card className="bg-white border border-warm-orange/20">
                  <CardHeader>
                    <CardTitle className="text-warm-charcoal">Personalized Insights</CardTitle>
                    <CardDescription>
                      AI-generated insights about your giving patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Giving Pattern Analysis</h3>
                        <p className="text-sm text-blue-800">
                          You typically donate on weekends and prefer education causes. 
                          Consider setting up monthly recurring donations for consistent impact.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-2">Impact Optimization</h3>
                        <p className="text-sm text-green-800">
                          Your donations have 15% higher success rates than average. 
                          Try diversifying into environmental causes for broader impact.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-2">Timing Recommendation</h3>
                        <p className="text-sm text-orange-800">
                          Campaigns you support early (within first 48 hours) are 3x more likely to succeed. 
                          Enable early-bird notifications for maximum impact.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-2">Social Impact</h3>
                        <p className="text-sm text-purple-800">
                          Your donations have helped 47 individuals and families. 
                          Sharing campaigns increases their reach by 40% on average.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Status */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                  <Bot className="h-5 w-5" />
                  <span>AI Engine Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recommendation Engine</span>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fraud Detection</span>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Impact Prediction</span>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Learning Engine</span>
                  <Badge className="bg-blue-100 text-blue-700">Training</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">AI Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Brain className="h-4 w-4 mr-2" />
                  Retrain Preferences
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  Update Goals
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Reset Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* AI Tips */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">AI Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-warm-charcoal/70 space-y-2">
                <p>• The more you use the platform, the better our recommendations become</p>
                <p>• Rate campaigns to improve AI accuracy</p>
                <p>• Set giving goals for personalized insights</p>
                <p>• Enable notifications for timely recommendations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
