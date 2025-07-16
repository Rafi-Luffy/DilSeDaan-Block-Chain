import React, { useState, useEffect } from 'react'
import AdvancedSearchComponent from '@/components/search/AdvancedSearchComponent'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, TrendingUp, Clock, MapPin, Heart, DollarSign, Users, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDonationStore } from '@/store/donationStore'

export function AdvancedSearchPage() {
  const { t } = useTranslation()
  const { campaigns } = useDonationStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Perform search when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      setIsSearching(true)
      const timer = setTimeout(() => {
        const filtered = campaigns.filter(campaign =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setSearchResults(filtered)
        setIsSearching(false)
      }, 500) // Debounce search

      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchTerm, campaigns])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Trigger search immediately
      const filtered = campaigns.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSearchResults(filtered)
    }
  }

  const trendingSearches = [
    'education children',
    'medical emergency',
    'animal welfare',
    'disaster relief',
    'elderly care',
    'environmental conservation'
  ]

  const recentSearches = [
    'cancer treatment',
    'flood victims',
    'school building',
    'stray animals'
  ]

  const popularCategories = [
    { name: 'Medical Emergency', count: 487, color: 'bg-red-100 text-red-700' },
    { name: 'Education', count: 342, color: 'bg-blue-100 text-blue-700' },
    { name: 'Disaster Relief', count: 198, color: 'bg-orange-100 text-orange-700' },
    { name: 'Animal Welfare', count: 156, color: 'bg-green-100 text-green-700' },
    { name: 'Environmental', count: 89, color: 'bg-emerald-100 text-emerald-700' },
    { name: 'Elderly Care', count: 67, color: 'bg-purple-100 text-purple-700' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('search.advanced.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('search.advanced.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <Card className="mb-8 bg-white border border-warm-orange/20">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
              <Button size="lg" className="px-8" onClick={handleSearch}>
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Search Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Advanced Search Component */}
            {showAdvancedFilters && (
              <Card className="bg-white border border-warm-orange/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                    <Filter className="h-5 w-5" />
                    <span>Advanced Filters</span>
                  </CardTitle>
                  <CardDescription>
                    Use advanced filters to find exactly what you're looking for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedSearchComponent />
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {searchTerm && (
              <Card className="bg-white border border-warm-orange/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-warm-charcoal">
                    <span>Search Results</span>
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    ) : (
                      <Badge variant="outline">
                        {searchResults.length} results for "{searchTerm}"
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((campaign) => (
                        <div key={campaign.id} className="border border-warm-cream rounded-lg p-4 bg-warm-cream/30 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                {campaign.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {campaign.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {campaign.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {campaign.donorCount} donors
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {campaign.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-green-600">
                                ₹{campaign.raisedAmount.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                of ₹{campaign.targetAmount.toLocaleString()}
                              </div>
                              <div className="mt-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Heart className="h-3 w-3 mr-1" />
                                  Donate
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, (campaign.raisedAmount / campaign.targetAmount) * 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{Math.round((campaign.raisedAmount / campaign.targetAmount) * 100)}% completed</span>
                              <span>{campaign.beneficiaries ? `${campaign.beneficiaries} beneficiaries` : ''}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No campaigns found for "{searchTerm}"</p>
                      <p className="text-sm text-gray-500 mt-1">Try different keywords or browse categories</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Searches */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trending Searches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => setSearchTerm(search)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                      {search}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                  <Clock className="h-5 w-5" />
                  <span>Recent Searches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => setSearchTerm(search)}
                    >
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {search}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-warm-charcoal">
                  <Heart className="h-5 w-5" />
                  <span>Popular Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Badge variant="outline" className={category.color}>
                        {category.name}
                      </Badge>
                      <span className="text-sm text-gray-500">{category.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card className="bg-white border border-warm-orange/20">
              <CardHeader>
                <CardTitle className="text-warm-charcoal">Search Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Use specific keywords for better results</p>
                <p>• Filter by location to find local campaigns</p>
                <p>• Sort by urgency to help critical cases</p>
                <p>• Use category filters for focused browsing</p>
                <p>• Save searches to get notifications</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
