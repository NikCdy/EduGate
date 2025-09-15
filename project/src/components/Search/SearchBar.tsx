import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import axios from 'axios';

interface SearchBarProps {
  onSearch: (results: any[], term: string) => void;
  placeholder?: string;
  className?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search...", 
  className = "",
  searchTerm,
  setSearchTerm,
  isSearching
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounced search function
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (term: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (term.length >= 2) {
            fetchSuggestions(term);
          } else {
            setSuggestions([]);
          }
        }, 300);
      };
    })(),
    []
  );
  
  // Fetch search suggestions
  const fetchSuggestions = async (term: string) => {
    try {
      // Simple suggestions based on common educational topics
      const commonTopics = [
        'JavaScript programming', 'Python tutorial', 'Machine Learning', 'Data Science',
        'React development', 'Node.js backend', 'Database design', 'Web development',
        'Artificial Intelligence', 'Computer Science', 'Mathematics', 'Physics',
        'Chemistry', 'Biology', 'History', 'Literature'
      ];
      
      const filtered = commonTopics.filter(topic => 
        topic.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };
  
  useEffect(() => {
    if (searchTerm) {
      debounceSearch(searchTerm);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, debounceSearch]);

  const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    try {
      // Perform search
      const response = await axios.get(`http://localhost:5000/api/search.php`, {
        params: {
          q: searchTerm.trim(),
          limit: 20
        }
      });
      
      // Track search activity
      const userId = localStorage.getItem('userId');
      await axios.post("http://localhost:5000/api/track_activity.php", {
        type: 'search',
        userId: userId || null,
        term: searchTerm.trim()
      });
      
      // Return results
      onSearch(response.data.results || [], searchTerm);
    } catch (error) {
      console.error('Search error:', error);
      onSearch([], searchTerm);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };
  
  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-base bg-gray-50 focus:bg-white shadow-inner"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        
        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Loading spinner */}
        {isSearching && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      
      {/* Search suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;