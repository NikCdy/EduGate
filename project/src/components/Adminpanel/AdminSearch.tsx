import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { trackActivity } from '../../utils/activityTracker';

interface AdminSearchProps {
  onSearch: (term: string) => void;
}

const AdminSearch: React.FC<AdminSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    
    // Track search activity
    const adminId = localStorage.getItem('adminId');
    if (adminId && searchTerm.trim()) {
      await trackActivity('search', adminId, searchTerm);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Real-time search
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    onSearch(''); // Clear search results
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Users</h3>
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by name or email..."
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Search
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        Search activities are tracked and displayed in the dashboard statistics.
      </p>
    </div>
  );
};

export default AdminSearch;