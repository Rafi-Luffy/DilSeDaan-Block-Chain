import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Star, MapPin, Calendar, Target } from 'lucide-react';

interface SearchResult {
  _id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  category: string;
  location?: {
    city: string;
    state: string;
  };
  creator: {
    name: string;
    isVerified: boolean;
  };
  donorCount: number;
  completionPercentage: number;
  urgencyScore: number;
  relevanceScore: number;
  images: Array<{ url: string }>;
  createdAt: string;
  endDate: string;
}

interface FilterOptions {
  categories: Array<{ category: string; count: number }>;
  locations: Array<{ state: string; count: number }>;
  amounts: Array<{ label: string; min: number; max: number }>;
  sortOptions: Array<{ value: string; label: string }>;
}

const AdvancedSearchComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Array<{ suggestion: string; type: string }>>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [amountRange, setAmountRange] = useState({ min: 0, max: 10000000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/search/filters');
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category: selectedCategory,
        location: selectedLocation,
        minAmount: amountRange.min.toString(),
        maxAmount: amountRange.max.toString(),
        sortBy,
        page: page.toString(),
        limit: '12'
      });

      const response = await fetch(`/api/search/campaigns?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
        setPagination(data.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    performSearch(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedLocation('');
    setAmountRange({ min: 0, max: 10000000 });
    setSortBy('relevance');
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUrgencyBadge = (urgencyScore: number, category: string) => {
    if (category === 'emergency' || urgencyScore > 8) {
      return <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">URGENT</span>;
    }
    if (urgencyScore > 6) {
      return <span className="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded-full">HIGH PRIORITY</span>;
    }
    return null;
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Campaigns to Support</h1>
        <p className="text-lg text-gray-600">Discover meaningful causes and make a difference</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for campaigns, causes, or locations..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center"
              >
                {suggestion.type === 'campaign' ? (
                  <Target className="w-4 h-4 text-blue-500 mr-3" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-3" />
                )}
                <span className="text-gray-700">{suggestion.suggestion}</span>
                <span className="ml-auto text-xs text-gray-400 capitalize">{suggestion.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          {(selectedCategory || selectedLocation || amountRange.min > 0 || amountRange.max < 10000000) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedCategory}
              </span>
            )}
            {selectedLocation && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {selectedLocation}
              </span>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {filterOptions?.sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && filterOptions && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((cat) => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category} ({cat.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map((loc) => (
                  <option key={loc.state} value={loc.state}>
                    {loc.state} ({loc.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal Amount</label>
              <div className="space-y-2">
                {filterOptions.amounts.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setAmountRange({ min: range.min, max: range.max })}
                    className={`w-full text-left px-3 py-2 rounded-lg border ${
                      amountRange.min === range.min && amountRange.max === range.max
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div>
          {/* Results Header */}
          {searchResults.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, pagination.totalResults)} of {pagination.totalResults} campaigns
              </p>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={campaign.images[0]?.url || '/images/placeholder.png'}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    {getUrgencyBadge(campaign.urgencyScore, campaign.category)}
                  </div>
                  <div className="absolute top-4 right-4">
                    {campaign.creator.isVerified && (
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <Star className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {campaign.category}
                    </span>
                    {campaign.location && (
                      <div className="flex items-center text-gray-500 text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {campaign.location.city}, {campaign.location.state}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {campaign.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Raised: {formatCurrency(campaign.raisedAmount)}</span>
                      <span className="text-gray-600">{Math.round(campaign.completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(campaign.completionPercentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Goal: {formatCurrency(campaign.goalAmount)}</span>
                      <span className="text-gray-500">{campaign.donorCount} donors</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {getDaysLeft(campaign.endDate)} days left
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => performSearch(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => performSearch(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* No Results */}
          {searchResults.length === 0 && !loading && searchQuery && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No campaigns found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchComponent;
