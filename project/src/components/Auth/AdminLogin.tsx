import React, { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { trackActivity } from '../../utils/activityTracker';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const navigate = useNavigate();
  
  // Load saved admin credentials
  useEffect(() => {
    const savedAdminEmail = localStorage.getItem('savedAdminEmail');
    const savedAdminPassword = localStorage.getItem('savedAdminPassword');
    if (savedAdminEmail && savedAdminPassword) {
      setEmail(savedAdminEmail);
      setPassword(savedAdminPassword);
      setRememberMe(true);
    }
  }, []);
  
  // Redirect to admin panel if already signed in as admin
  useEffect(() => {
    if (localStorage.getItem('isAdminSignedIn') === 'true') {
      navigate('/admin');
    }
    
    // Check if server is running
    const checkServer = async () => {
      setServerStatus('checking');
      try {
        await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
        console.log('Server is running');
        setServerStatus('online');
        setApiError('');
      } catch (error) {
        console.error('Server check failed:', error);
        setServerStatus('offline');
        setApiError('Server is not running. Please start the server and refresh this page.');
      }
    };
    
    checkServer();
    
    // Set up interval to check server status every 10 seconds
    const statusInterval = setInterval(checkServer, 10000);
    
    return () => clearInterval(statusInterval);
  }, [navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email.trim());
    setEmailError(isValid ? '' : 'Please enter a valid email address');
    return isValid;
  };

  const validatePassword = (password: string): boolean => {
    const isValid = password.length >= 6;
    setPasswordError(isValid ? '' : 'Password must be at least 6 characters');
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    
    // Validate form before submission
    if (!validateEmail(email) || !validatePassword(password)) return;
    
    // Check if server is online
    if (serverStatus !== 'online') {
      setApiError('Server is offline. Please make sure the server is running before trying to log in.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the server endpoint with .php extension
      const response = await axios.post("http://localhost:5000/api/admin_login.php", {
        username: email.trim(),
        password: password
      });
      
      console.log('Admin login response:', response.data);
      
      if (response.data.success) {
        // Save or remove admin credentials based on remember me
        if (rememberMe) {
          localStorage.setItem('savedAdminEmail', email.trim());
          localStorage.setItem('savedAdminPassword', password);
        } else {
          localStorage.removeItem('savedAdminEmail');
          localStorage.removeItem('savedAdminPassword');
        }
        
        // Save admin data to local storage
        localStorage.setItem('isAdminSignedIn', 'true');
        localStorage.setItem('adminEmail', response.data.user.email);
        localStorage.setItem('adminId', response.data.user.id);
        localStorage.setItem('isSignedIn', 'true'); // Also set regular sign-in flag
        
        if (response.data.user.name) {
          localStorage.setItem('adminName', response.data.user.name);
          localStorage.setItem('userName', response.data.user.name); // Also set regular user name
        }
        
        // Track admin login activity
        await trackActivity('login', response.data.user.id);
        
        // Redirect to admin panel
        navigate('/admin');
      } else {
        setApiError(response.data.message || 'Invalid admin credentials');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      if (error.response?.status === 401) {
        setApiError('Invalid username or password.');
      } else if (error.code === 'ERR_NETWORK') {
        setApiError('Network error. Please check if the server is running.');
      } else {
        setApiError(`Error: ${error.message || 'Unknown error'}. Make sure the server is running.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Admin Login</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${serverStatus === 'online' ? 'bg-green-100 text-green-800' : serverStatus === 'offline' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
              Server: {serverStatus === 'online' ? 'Online' : serverStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-red-700 text-sm">
                <p>{apiError}</p>
                {serverStatus === 'offline' && (
                  <div className="mt-2">
                    <p className="font-medium">Troubleshooting steps:</p>
                    <ol className="list-decimal list-inside mt-1">
                      <li>Make sure MongoDB is running</li>
                      <li>Check if the server is started with <code>node server.js</code> in the server directory</li>
                      <li>Verify the server is running on port 5000</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${emailError ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Admin email"
                  required
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${passwordError ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="admin-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="admin-remember-me" className="ml-2 block text-sm text-gray-700">
                Remember my password
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Admin Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Forgot admin password?
            </button>
          </div>
        </div>
        
        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Reset Admin Password</h3>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                    setResetMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {resetMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  resetMessage.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {resetMessage}
                </div>
              )}
              
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmail('');
                      setResetMessage('');
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;