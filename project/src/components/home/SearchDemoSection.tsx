import React, { useState } from 'react';
import { Search } from 'lucide-react';

// Add custom CSS for line clamping
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = customStyles;
  document.head.appendChild(styleSheet);
}

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

const SearchDemoSection: React.FC = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [totalResults, setTotalResults] = useState(0);
  const [sourceStats, setSourceStats] = useState<{[key: string]: number}>({});
  
  const handleSearch = (results: any[], term: string) => {
    setSearchResults(results);
    setSearchTerm(term);
    setTotalResults(results.length);
    setIsLoading(false);
    setIsSearching(false);
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    
    try {
      // First, trigger content indexing for the search term
      const indexUrl = `http://localhost:5000/api/index_content.php`;
      await fetch(indexUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchTerm })
      });
      
      // Then perform the search
      const searchUrl = `http://localhost:5000/api/search.php?q=${encodeURIComponent(searchTerm)}&type=${selectedFilter}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
        setTotalResults(data.total || 0);
        
        // Calculate source statistics
        const stats: {[key: string]: number} = {};
        (data.results || []).forEach((result: SearchResult) => {
          const source = result.source || 'Unknown';
          stats[source] = (stats[source] || 0) + 1;
        });
        setSourceStats(stats);
      } else {
        setSearchResults([]);
        setTotalResults(0);
        setSourceStats({});
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalResults(0);
      setSourceStats({});
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleFilterChange = async (filter: string) => {
    setSelectedFilter(filter);
    setIsLoading(true);
    
    // Re-fetch results with the new filter
    if (searchTerm) {
      try {
        const searchUrl = `http://localhost:5000/api/search.php?q=${encodeURIComponent(searchTerm)}&type=${filter}`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.results || []);
          setTotalResults(data.total || 0);
          
          // Calculate source statistics
          const stats: {[key: string]: number} = {};
          (data.results || []).forEach((result: SearchResult) => {
            const source = result.source || 'Unknown';
            stats[source] = (stats[source] || 0) + 1;
          });
          setSourceStats(stats);
        } else {
          setSearchResults([]);
          setTotalResults(0);
          setSourceStats({});
        }
      } catch (error) {
        console.error('Error fetching filtered results:', error);
        setSearchResults([]);
        setTotalResults(0);
        setSourceStats({});
      }
    }
    setIsLoading(false);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
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
          </p>
        </div>
        
        {/* Search Section */}
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for courses, topics, or resources..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-base bg-gray-50 focus:bg-white shadow-inner"
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
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
                  { key: 'scholar', label: 'Scholar', icon: '🎓' },
                  { key: 'medium', label: 'Medium', icon: '📰' },
                  { key: 'devto', label: 'Dev.to', icon: '💻' }
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
        {searchResults.length > 0 && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Found <span className="font-semibold text-blue-600">{totalResults}</span> results for 
                  <span className="font-medium"> "{searchTerm}"</span>
                  {selectedFilter !== 'all' && (
                    <span> in <span className="font-medium">{selectedFilter}</span></span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {Object.keys(sourceStats).length > 0 && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Sources:</span>
                      {Object.entries(sourceStats).slice(0, 3).map(([source, count]) => (
                        <span key={source} className="bg-gray-100 px-2 py-1 rounded">
                          {source}: {count}
                        </span>
                      ))}
                      {Object.keys(sourceStats).length > 3 && (
                        <span className="text-gray-400">+{Object.keys(sourceStats).length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((result, index) => (
                <div key={result.id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  {/* Result Card Content */}
                  <div className="p-6">
                    {/* Source Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        result.source === 'arXiv' ? 'bg-purple-100 text-purple-800' :
                        result.source === 'Google Scholar' ? 'bg-blue-100 text-blue-800' :
                        result.source === 'ResearchGate' ? 'bg-green-100 text-green-800' :
                        result.source === 'YouTube' ? 'bg-red-100 text-red-800' :
                        result.source === 'Pexels' ? 'bg-pink-100 text-pink-800' :

                        result.source === 'Medium' ? 'bg-gray-100 text-gray-800' :
                        result.source === 'Dev.to' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.source}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        result.type === 'paper' ? 'bg-blue-50 text-blue-700' :
                        result.type === 'video' ? 'bg-red-50 text-red-700' :
                        result.type === 'image' ? 'bg-green-50 text-green-700' :
                        result.type === 'blog' ? 'bg-purple-50 text-purple-700' :
                        result.type === 'pdf' ? 'bg-orange-50 text-orange-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {result.type.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Thumbnail for images and videos */}
                    {(result.type === 'image' || result.type === 'video') && result.thumbnail && (
                      <div className="mb-4">
                        <img 
                          src={result.thumbnail || result.src} 
                          alt={result.title}
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {result.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {result.description || result.abstract || result.snippet || 'No description available'}
                    </p>
                    
                    {/* Authors */}
                    {result.authors && result.authors.length > 0 && (
                      <p className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">Authors:</span> {Array.isArray(result.authors) ? result.authors.join(', ') : result.authors}
                      </p>
                    )}
                    
                    {/* Published Date */}
                    {(result.published || result.publishedAt) && (
                      <p className="text-xs text-gray-500 mb-3">
                        <span className="font-medium">Published:</span> {new Date(result.published || result.publishedAt).toLocaleDateString()}
                      </p>
                    )}
                    
                    {/* Action Button */}
                    <div className="flex items-center justify-between">
                      <a
                        href={result.url || result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        {result.type === 'video' ? 'Watch' :
                         result.type === 'image' ? 'View' :
                         result.type === 'pdf' ? 'Download' :
                         'Read More'}
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      
                      {/* Additional info for specific types */}
                      {result.type === 'video' && result.channelTitle && (
                        <span className="text-xs text-gray-500">{result.channelTitle}</span>
                      )}
                      {result.type === 'paper' && result.citedBy && (
                        <span className="text-xs text-gray-500">{result.citedBy}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm && !isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          ) : null}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Searching for results...</p>
            </div>
          ) : !searchTerm ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to explore?</h3>
              <p className="text-gray-500">Enter a search term above to discover amazing educational content</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
              <p className="text-gray-500">
                We couldn't find anything for "{searchTerm}"
                {selectedFilter !== 'all' ? ` in ${selectedFilter}s` : ''}
              </p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                    {totalResults > 0 ? totalResults.toLocaleString() : searchResults.length}
                  </span>
                  result{(totalResults || searchResults.length) !== 1 ? 's' : ''} for "{searchTerm}"
                  {selectedFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {selectedFilter}s
                    </span>
                  )}
                </p>
              </div>
              
              {searchResults.map((result) => {
                const url = result.url || result.link;
                const resultType = result.type || 'unknown';
                
                return (
                  <div 
                    key={result.id} 
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200 hover:-translate-y-1 group"
                  >
                    {/* Thumbnail for videos and images */}
                    {(resultType === 'video' || resultType === 'image') && result.thumbnail && (
                      <div className="mb-3">
                        <img 
                          src={result.thumbnail} 
                          alt={result.title} 
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                          {url ? (
                            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2">
                              {result.title}
                              {resultType === 'pdf' && (
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                              )}
                              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            result.title
                          )}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {result.type && (
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                              ${resultType === 'video' ? 'bg-red-100 text-red-800' : 
                                resultType === 'image' ? 'bg-green-100 text-green-800' : 
                                resultType === 'paper' ? 'bg-purple-100 text-purple-800' : 
                                resultType === 'pdf' ? 'bg-orange-100 text-orange-800' : 
                                'bg-gray-100 text-gray-800'}`}
                            >
                              {resultType.charAt(0).toUpperCase() + resultType.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Show abstract for research papers */}
                    {result.abstract && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{result.abstract}</p>
                    )}
                    
                    {/* Show description for other content types */}
                    {result.description && !result.abstract && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{result.description}</p>
                    )}
                    
                    {/* Show authors for research papers */}
                    {result.authors && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Authors:</span> {Array.isArray(result.authors) ? result.authors.join(', ') : result.authors}
                      </div>
                    )}
                    
                    {/* Show channel info for videos */}
                    {resultType === 'video' && result.channelTitle && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Channel:</span> {result.channelTitle}
                        {result.publishedAt && (
                          <span> • {new Date(result.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Show publication info for papers */}
                    {(resultType === 'paper' || resultType === 'pdf') && (result.published || result.updated) && (
                      <div className="mt-2 text-sm text-gray-500">
                        {result.published && (
                          <span>Published: {new Date(result.published).toLocaleDateString()}</span>
                        )}
                        {result.updated && result.updated !== result.published && (
                          <span> • Updated: {new Date(result.updated).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SearchDemoSection;