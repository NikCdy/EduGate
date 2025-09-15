import React from 'react';
import { Search } from 'lucide-react';

interface SearchResult {
  id: string | number;
  title: string;
  description?: string;
  url?: string;
  type?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  searchTerm: string;
  isLoading?: boolean;
  totalResults?: number;
  activeFilter?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  searchTerm,
  isLoading = false,
  totalResults = 0,
  activeFilter = 'all'
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Searching for results...</p>
      </div>
    );
  }

  if (!searchTerm) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
          <Search className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to explore?</h3>
        <p className="text-gray-500">Enter a search term above to discover amazing educational content</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
        <p className="text-gray-500">
          We couldn't find anything for "{searchTerm}"
          {activeFilter !== 'all' ? ` in ${activeFilter}s` : ''}
        </p>
        <p className="text-sm text-gray-400 mt-2">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
            {totalResults > 0 ? totalResults.toLocaleString() : results.length}
          </span>
          result{(totalResults || results.length) !== 1 ? 's' : ''} for "{searchTerm}"
          {activeFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {activeFilter}s
            </span>
          )}
        </p>
      </div>
      
      {results.map((result, index) => {
        const url = result.url || result.link;
        const resultType = result.type || 'unknown';
        const relevanceScore = result.relevanceScore || 0;
        
        return (
          <div 
            key={result.id} 
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-200 hover:-translate-y-1 group relative"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Relevance indicator */}
            {relevanceScore > 5 && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                High Relevance
              </div>
            )}
            {/* Enhanced thumbnail for videos and images */}
            {(resultType === 'video' || resultType === 'image') && result.thumbnail && (
              <div className="mb-4 relative">
                <img 
                  src={result.thumbnail} 
                  alt={result.title} 
                  className="w-full h-40 object-cover rounded-lg shadow-sm"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {resultType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-60 rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Source indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {result.source && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {result.source}
                  </span>
                )}
                {resultType && (
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full
                    ${resultType === 'video' ? 'bg-red-100 text-red-800' : 
                      resultType === 'image' ? 'bg-green-100 text-green-800' : 
                      resultType === 'paper' ? 'bg-purple-100 text-purple-800' : 
                      resultType === 'pdf' ? 'bg-orange-100 text-orange-800' : 
                      resultType === 'blog' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {resultType.charAt(0).toUpperCase() + resultType.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
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
            
            {/* Show snippet for Google Scholar results */}
            {result.snippet && !result.abstract && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">{result.snippet}</p>
            )}
            
            {/* Show description for other content types */}
            {result.description && !result.abstract && !result.snippet && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">{result.description}</p>
            )}
            
            {/* Show authors for research papers */}
            {result.authors && (
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-medium">Authors:</span> {Array.isArray(result.authors) ? result.authors.join(', ') : result.authors}
              </div>
            )}
            
            {/* Show citation info for Google Scholar results */}
            {result.citedBy && (
              <div className="mt-1 text-xs text-gray-400">
                {result.citedBy}
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
  );
};

export default SearchResults;