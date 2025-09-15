import React, { useState } from 'react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

interface SearchResult {
  id: string | number;
  title: string;
  description?: string;
  url?: string;
  link?: string;
  type?: string;
  source?: string;
  thumbnail?: string;
  abstract?: string;
  authors?: string[];
  videoId?: string;
  publishedAt?: string;
  channelTitle?: string;
}

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (results: any[], term: string) => {
    setSearchResults(results);
    setSearchTerm(term);
    setTotalResults(results.length);
    setIsLoading(false);
    setIsSearching(false);
    
    // Auto-fetch fresh content if results are empty or limited
    if (results.length < 5 && term.trim()) {
      try {
        await fetch(`http://localhost:5000/api/index_content.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: term })
        });
        
        // Re-search after indexing
        setTimeout(() => performSearch(), 2000);
      } catch (error) {
        console.error('Error auto-indexing content:', error);
      }
    }
  };

  const performSearch = async (retryCount = 0) => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    
    try {
      const searchUrl = `http://localhost:5000/api/search.php?q=${encodeURIComponent(searchTerm)}&type=${selectedFilter}${aiAssistantEnabled ? '&ai=true' : ''}&limit=20`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
        setTotalResults(data.total || 0);
        
        // Show cache indicator if results are cached
        if (data.cached) {
          console.log('Results served from cache');
        }
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Retry logic for network errors
      if (retryCount < 2 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log(`Retrying search... (${retryCount + 1}/2)`);
        setTimeout(() => performSearch(retryCount + 1), 1000);
        return;
      }
      
      setSearchResults([]);
      setTotalResults(0);
      
      // Show user-friendly error message
      if (error.name === 'AbortError') {
        console.error('Search timed out. Please try again.');
      } else {
        console.error('Search failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };
  
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setIsLoading(true);
    
    // Re-fetch results with the new filter
    if (searchTerm) {
      const searchUrl = `http://localhost:5000/api/search.php?q=${encodeURIComponent(searchTerm)}&type=${filter}${aiAssistantEnabled ? '&ai=true' : ''}`;
      fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setSearchResults(data.results || []);
            setTotalResults(data.total || 0);
          } else {
            setSearchResults([]);
            setTotalResults(0);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching filtered results:', error);
          setSearchResults([]);
          setTotalResults(0);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          {/* AI Assistant Toggle */}
          <div className="absolute top-0 right-0">
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-700">AI Assistant</span>
              <button
                onClick={() => setAiAssistantEnabled(!aiAssistantEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  aiAssistantEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    aiAssistantEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              {aiAssistantEnabled && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Search EduGate
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover courses, research papers, videos, and educational resources from across the web
            {aiAssistantEnabled && (
              <span className="block text-sm text-blue-600 mt-2 font-medium">
                ✨ AI Assistant is helping you find better results
              </span>
            )}
          </p>
        </div>
        
        {/* Search Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex gap-4">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search for courses, topics, or resources..." 
                className="flex-1"
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isSearching={isSearching}
              />
              <button
                onClick={performSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {/* Filter Pills */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { key: 'all', label: 'All', icon: '🔍' },
                  { key: 'blog', label: 'Blogs', icon: '📝' },
                  { key: 'paper', label: 'Papers', icon: '📄' },
                  { key: 'video', label: 'Videos', icon: '🎥' },
                  { key: 'image', label: 'Images', icon: '🖼️' },
                  { key: 'pdf', label: 'PDFs', icon: '📋' },
                  { key: 'scholar', label: 'Scholar', icon: '🎓' }
                ].map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterChange(filter.key)}
                    className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 transform hover:scale-105 ${
                      selectedFilter === filter.key 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="mr-2">{filter.icon}</span>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="max-w-5xl mx-auto">
          <SearchResults 
            results={searchResults} 
            searchTerm={searchTerm}
            isLoading={isLoading}
            totalResults={totalResults}
            activeFilter={selectedFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;