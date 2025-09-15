import React, { useState, useEffect } from 'react';
import { User, Lock, AlertCircle, CheckCircle, Eye, EyeOff, Mail, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { generateProfileImage } from '../../utils/profileUtils';

interface SignupFormProps {
  onSuccess?: () => void;
}

interface ValidationError {
  rule: string;
  message: string;
  isValid: boolean;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [emailError, setEmailError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirmPassword: false, email: false, firstName: false });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd: string): ValidationError[] => {
    const rules = [
      {
        rule: 'length',
        message: 'Password must be between 10-24 characters',
        isValid: pwd.length >= 10 && pwd.length <= 24
      },
      {
        rule: 'spaces',
        message: 'Password cannot contain spaces',
        isValid: !/\s/.test(pwd)
      },
      {
        rule: 'number',
        message: 'Password must contain at least one number',
        isValid: /[0-9]/.test(pwd)
      },
      {
        rule: 'uppercase',
        message: 'Password must contain at least one uppercase letter',
        isValid: /[A-Z]/.test(pwd)
      },
      {
        rule: 'lowercase',
        message: 'Password must contain at least one lowercase letter',
        isValid: /[a-z]/.test(pwd)
      }
    ];

    return rules;
  };

  useEffect(() => {
    if (password || touched.password) {
      setValidationErrors(validatePassword(password));
    } else {
      setValidationErrors([]);
    }
  }, [password, touched.password]);

  useEffect(() => {
    if (touched.email) {
      if (!email) {
        setEmailError('Email is required');
      } else if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
  }, [email, touched.email]);

  useEffect(() => {
    if (touched.confirmPassword && password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  }, [password, confirmPassword, touched.confirmPassword]);

  const isFormValid = (): boolean => {
    return firstName.trim() !== '' &&
           email.trim() !== '' &&
           !emailError &&
           password === confirmPassword &&
           validationErrors.length > 0 && 
           validationErrors.every(error => error.isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post("http://localhost:5000/api/register.php", {
        name: firstName.trim(),
        email: email.trim(),
        password: password
      });
      
      if (response.data.success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('savedEmail', email.trim());
          localStorage.setItem('savedPassword', password);
        }
        
        // Generate and store profile image based on name and email
        const profileImage = generateProfileImage(email.trim(), firstName.trim());
        localStorage.setItem('userPhoto', profileImage);
        localStorage.setItem('userName', firstName.trim());
        
        // Track registration activity
        try {
          await axios.post("http://localhost:5000/api/track_activity.php", {
            type: 'register',
            details: { email: email.trim(), name: firstName.trim() }
          });
        } catch (error) {
          console.error('Failed to track registration activity:', error);
        }
        
        navigate("/login");
        if (onSuccess) onSuccess();
      } else {
        setApiError(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setApiError('User with this email already exists.');
      } else {
        setApiError('Something went wrong, please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const invalidErrors = validationErrors.filter(error => !error.isValid);
  const hasPasswordErrors = invalidErrors.length > 0 && touched.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join our platform with a secure password</p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{apiError}</p>
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
                    if (!touched.email) setTouched(prev => ({ ...prev, email: true }));
                  }}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${emailError && touched.email ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && touched.email && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>



            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="firstName"
                  type="text" 
                  typeof='string'
                  value={firstName}
                  onChange={(e) => {
                    const value = e.target.value;
                     if (/^[a-zA-Z\s]*$/.test(value)) {
                      setFirstName(value);
                     }
                   if (!touched.firstName) {
                     setTouched(prev => ({ ...prev, firstName: true }));
                         }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your name"
                  required
                />
              </div>
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
                    if (!touched.password) setTouched(prev => ({ ...prev, password: true }));
                  }}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    hasPasswordErrors ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
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
            </div>

            {(isPasswordFocused || (touched.password && hasPasswordErrors)) && (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      {error.isValid ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className={error.isValid ? 'text-green-700' : 'text-red-700'}>
                        {error.message}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (!touched.confirmPassword) setTouched(prev => ({ ...prev, confirmPassword: true }));
                  }}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => setIsConfirmPasswordFocused(false)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    passwordMatchError && touched.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {isConfirmPasswordFocused && (
                <div className="flex items-center gap-2 mt-1">
                  {password === confirmPassword && confirmPassword !== '' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-green-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="signup-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="signup-remember-me" className="ml-2 block text-sm text-gray-700">
                Remember my password for future logins
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                isFormValid() && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}