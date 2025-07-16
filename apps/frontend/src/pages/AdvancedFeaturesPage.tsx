import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Search, 
  Bell, 
  Smartphone, 
  BarChart3, 
  Target, 
  Sparkles, 
  TrendingUp,
  Users,
  Shield,
  Zap,
  Heart,
  ArrowRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'

export function AdvancedFeaturesPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuthStore()

  const features = [
    {
      title: 'AI-Powered Features',
      description: 'Smart recommendations, fraud detection, and predictive analytics powered by machine learning',
      icon: Brain,
      path: '/ai-features',
      color: 'from-purple-500 to-indigo-600',
      benefits: ['Smart Recommendations', 'Fraud Detection', 'Impact Prediction'],
      requiresAuth: true,
      badge: 'AI-Powered'
    },
    {
      title: 'Advanced Search',
      description: 'Powerful search and filtering tools to find the perfect campaigns to support',
      icon: Search,
      path: '/search',
      color: 'from-blue-500 to-cyan-600',
      benefits: ['Smart Filters', 'Trending Searches', 'Saved Searches'],
      requiresAuth: false,
      badge: 'Enhanced'
    },
    {
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications about campaigns, donations, and impact',
      icon: Bell,
      path: '/notifications',
      color: 'from-green-500 to-emerald-600',
      benefits: ['Push Notifications', 'Real-time Updates', 'Custom Alerts'],
      requiresAuth: true,
      badge: 'Real-time'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and insights for administrators and power users',
      icon: BarChart3,
      path: '/analytics',
      color: 'from-indigo-500 to-purple-600',
      benefits: ['Real-time Analytics', 'Advanced Reporting', 'Data Insights'],
      requiresAuth: true,
      adminOnly: true,
      badge: 'Admin Only'
    },
    {
      title: 'Security & 2FA',
      description: 'Advanced security settings including two-factor authentication',
      icon: Shield,
      path: '/security',
      color: 'from-red-500 to-pink-600',
      benefits: ['Two-Factor Auth', 'Security Monitoring', 'Account Protection'],
      requiresAuth: true,
      badge: 'Security'
    }
  ]

  const stats = [
    { label: 'AI Accuracy', value: '94%', icon: Brain },
    { label: 'Search Speed', value: '<0.3s', icon: Zap },
    { label: 'User Satisfaction', value: '4.8/5', icon: Heart },
    { label: 'Active Features', value: '15+', icon: Target }
  ]

  const FeatureCard = ({ feature }: { feature: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
          <feature.icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
          <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
            {feature.badge}
          </Badge>
        </div>
        <CardDescription className="text-gray-600">
          {feature.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="space-y-2">
            {feature.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                {benefit}
              </div>
            ))}
          </div>
          
          {(!feature.requiresAuth || isAuthenticated) && (!feature.adminOnly || user?.role === 'admin') ? (
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 group-hover:shadow-md transition-all">
              <Link to={feature.path}>
                Explore Feature
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full bg-gray-100 border border-gray-300 text-gray-500">
              {feature.adminOnly ? 'Admin Only' : 'Login Required'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Features
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover powerful tools and AI-driven features designed to enhance your charitable giving experience and maximize your impact.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Info Sections */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* What's New */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>What's New</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">AI Recommendation Engine v2.0</p>
                    <p className="text-sm text-gray-600">Improved accuracy with 94% success rate</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Enhanced Search Filters</p>
                    <p className="text-sm text-gray-600">More granular filtering options added</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Real-time Analytics</p>
                    <p className="text-sm text-gray-600">Live dashboard with instant updates</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <span>Coming Soon</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Voice Assistant Integration</p>
                    <p className="text-sm text-gray-600">Donate using voice commands</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Blockchain Voting</p>
                    <p className="text-sm text-gray-600">Community governance features</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">NFT Rewards System</p>
                    <p className="text-sm text-gray-600">Digital collectibles for donors</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white text-center">
          <CardContent className="p-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Experience the future of charitable giving with our advanced features. 
              Join thousands of users who are already making a bigger impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <Button size="lg" className="bg-white text-blue-600 border border-white hover:bg-blue-50">
                  <Users className="h-5 w-5 mr-2" />
                  Sign Up to Access Features
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-white text-blue-600 border border-white hover:bg-blue-50">
                  <Link to="/ai-features">
                    <Brain className="h-5 w-5 mr-2" />
                    Start with AI Features
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                <Link to="/search">
                  <Search className="h-5 w-5 mr-2" />
                  Try Advanced Search
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
