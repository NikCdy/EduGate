import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Search, LogIn, UserPlus } from 'lucide-react';

// Default data in case API fails
const defaultUserStats = [
  { month: 'Jan', registrations: 0, logins: 0 },
  { month: 'Feb', registrations: 0, logins: 0 },
  { month: 'Mar', registrations: 0, logins: 0 },
  { month: 'Apr', registrations: 0, logins: 0 },
  { month: 'May', registrations: 0, logins: 0 },
  { month: 'Jun', registrations: 0, logins: 0 },
];

const defaultSearchStats = [
  { term: 'No data', count: 0 },
];

const defaultUserTypes = [
  { name: 'user', value: 0 },
  { name: 'admin', value: 0 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DashboardStatsProps {
  serverStatus?: 'online' | 'offline' | 'checking';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ serverStatus = 'checking' }) => {
  const [userStats, setUserStats] = useState(defaultUserStats);
  const [searchStats, setSearchStats] = useState(defaultSearchStats);
  const [userTypes, setUserTypes] = useState(defaultUserTypes);
  const [totals, setTotals] = useState({ users: 0, logins: 0, searches: 0, activeUsers: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchStats = async () => {
    if (serverStatus === 'offline') {
      setError('Server is offline. Please check server status.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      // Fetch dashboard stats
      const response = await fetch('http://localhost:5000/api/get_dashboard_stats.php');
      const data = await response.json();
      
      console.log('Dashboard stats response:', data);
      
      if (data.success) {
        if (data.userStats) setUserStats(data.userStats);
        if (data.searchStats) setSearchStats(data.searchStats);
        if (data.userTypes) setUserTypes(data.userTypes);
        if (data.totals) setTotals(data.totals);
        setLastUpdated(new Date().toLocaleString());
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
        console.warn('API error:', data.message);
      }
    } catch (error) {
      setError(`Error fetching dashboard data: ${error.message}`);
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (serverStatus === 'online') {
      fetchStats();
    }
  }, [serverStatus]);
  
  useEffect(() => {
    // Set up auto-refresh every 12 hours if server is online
    if (serverStatus === 'online') {
      // 12 hours in milliseconds = 12 * 60 * 60 * 1000 = 43,200,000
      const refreshInterval = setInterval(fetchStats, 43200000);
      return () => clearInterval(refreshInterval);
    }
  }, [serverStatus]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          {lastUpdated && <p className="text-sm text-gray-500">Last updated: {lastUpdated} (Auto-refreshes every 12 hours)</p>}
        </div>
        <button 
          onClick={fetchStats}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Registrations</p>
                  <p className="text-2xl font-semibold text-gray-900">{totals.users || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Logins</p>
                  <p className="text-2xl font-semibold text-gray-900">{totals.logins || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Search className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Searches</p>
                  <p className="text-2xl font-semibold text-gray-900">{totals.searches || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{totals.activeUsers || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Activity Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity (Refreshed Every 12 Hours)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="registrations" name="Registrations" fill="#4F46E5" />
                  <Bar dataKey="logins" name="Logins" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User Types Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Types (Refreshed Every 12 Hours)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Search Trends Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Search Terms (Refreshed Every 12 Hours)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={searchStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="term" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Search Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends (Refreshed Every 12 Hours)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="registrations" name="Registrations" stroke="#4F46E5" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="logins" name="Logins" stroke="#10B981" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardStats;