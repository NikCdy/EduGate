import React, { useState, useEffect } from 'react';
import { Search, Menu, X, BookOpen, User } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { generateProfileImage } from '../../utils/profileUtils';
import ProfilePhoto from '../Profile/ProfilePhoto';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://ui-avatars.com/api/?name=User&background=random');
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const signedInStatus = localStorage.getItem('isSignedIn');
    const adminSignedInStatus = localStorage.getItem('isAdminSignedIn');
    const savedPhoto = localStorage.getItem('userPhoto');
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('adminEmail');
    const savedName = localStorage.getItem('userName') || localStorage.getItem('adminName');
    
    if (signedInStatus === 'true' || adminSignedInStatus === 'true') {
      setIsSignedIn(true);
      
      // If we have a saved photo, use it immediately
      if (savedPhoto) {
        setUserPhoto(savedPhoto);
      } else if (userEmail) {
        // Generate a profile image based on name and email if no saved photo
        const savedName = localStorage.getItem('userName');
        const generatedPhoto = generateProfileImage(userEmail, savedName || '');
        setUserPhoto(generatedPhoto);
        localStorage.setItem('userPhoto', generatedPhoto);
      }
      
      // If we have a saved name, use it
      if (savedName) {
        setUserName(savedName);
      }
      
      // If we have the user's email, fetch their profile to get the latest info
      if (userEmail) {
        fetchUserProfile(userEmail);
      }
    }
  }, []);
  
  // Function to fetch user profile from the server
  const fetchUserProfile = async (email: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/get_user_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      if (data.success && data.user) {
        // If user has a profile image, update it
        if (data.user.profileImage) {
          setUserPhoto(data.user.profileImage);
          localStorage.setItem('userPhoto', data.user.profileImage);
        }
        
        // If user has a name, update it
        if (data.user.name) {
          setUserName(data.user.name);
          localStorage.setItem('userName', data.user.name);
          setProfileData(prev => ({ ...prev, name: data.user.name }));
        }
        
        // Update email in profile data
        if (data.user.email) {
          setProfileData(prev => ({ ...prev, email: data.user.email }));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary-600" strokeWidth={2} />
            <span className="ml-2 text-2xl font-bold text-gray-900">
              EduGate
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Home
            </button>
            <button onClick={() => navigate('/features')} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Features
            </button>
            <button onClick={() => navigate('/search-demo')} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Search
            </button>
            <button onClick={() => navigate('/ai-assistant')} className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              AI Assistant
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {!isSignedIn && (
              <Button variant="primary" onClick={() => navigate('/signup')}>
                Sign Up Free
              </Button>
            )}
            <div className="relative">
              {isSignedIn ? (
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                  {userName && <span className="text-sm font-medium text-gray-700">{userName}</span>}
                  <ProfilePhoto 
                    email={localStorage.getItem('userEmail') || ''}
                    name={userName}
                    size="sm"
                    className="hover:ring-2 hover:ring-primary-500 transition-all"
                  />
                </div>
              ) : (
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <User className="h-6 w-6" />
                </button>
              )}
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  {!isSignedIn && (
                    <button
                      onClick={() => {navigate('/login'); setShowUserMenu(false);}}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Login
                    </button>
                  )}
                  {isSignedIn && (
                    <>
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          navigate('/notes');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        My Notes
                      </button>
                      <button
                        onClick={() => {
                          // Navigate to the Edit Profile page instead of showing modal
                          navigate('/profile/edit');
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <hr className="my-1" />
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (localStorage.getItem('isAdminSignedIn') === 'true') {
                        navigate('/admin');
                      } else {
                        navigate('/admin-login');
                      }
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Admin Console
                  </button>
                  {isSignedIn && (
                    <>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          // Remove sign-in status, email, and name
                          localStorage.removeItem('isSignedIn');
                          localStorage.removeItem('userEmail');
                          localStorage.removeItem('userName');
                          // Also remove admin-specific items
                          localStorage.removeItem('isAdminSignedIn');
                          localStorage.removeItem('adminEmail');
                          localStorage.removeItem('adminId');
                          localStorage.removeItem('adminName');
                          // DO NOT remove userPhoto from localStorage
                          
                          setIsSignedIn(false);
                          setUserName('');
                          // Keep the current photo in state
                          setShowUserMenu(false);
                          // Redirect to home page
                          navigate('/');
                          alert('Logged out successfully!');
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => {navigate('/'); setMobileMenuOpen(false);}}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 text-left"
              >
                Home
              </button>
              <button
                onClick={() => {navigate('/features'); setMobileMenuOpen(false);}}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 text-left"
              >
                Features
              </button>
              <button
                onClick={() => {navigate('/search-demo'); setMobileMenuOpen(false);}}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 text-left"
              >
                Search
              </button>
              <button
                onClick={() => {navigate('/ai-assistant'); setMobileMenuOpen(false);}}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors px-4 py-2 text-left"
              >
                AI Assistant
              </button>
              <div className="flex flex-col space-y-2 px-4 pt-2">
                {!isSignedIn && (
                  <Button variant="primary" onClick={() => navigate('/signup')}>
                    Sign Up Free
                  </Button>
                )}
                {isSignedIn && (
                  <>
                    {userName && (
                      <div className="flex items-center p-2 mb-2">
                        <ProfilePhoto 
                          email={localStorage.getItem('userEmail') || ''}
                          name={userName}
                          size="sm"
                          className="mr-2"
                        />
                        <span className="font-medium text-gray-800">{userName}</span>
                      </div>
                    )}
                    <button
                      onClick={() => {navigate('/dashboard'); setMobileMenuOpen(false);}}
                      className="flex items-center p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {navigate('/notes'); setMobileMenuOpen(false);}}
                      className="flex items-center p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      My Notes
                    </button>
                    <button
                      onClick={() => {navigate('/profile/edit'); setMobileMenuOpen(false);}}
                      className="flex items-center p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        if (localStorage.getItem('isAdminSignedIn') === 'true') {
                          navigate('/admin');
                        } else {
                          navigate('/admin-login');
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <User className="h-5 w-5 mr-2" />
                      Admin Console
                    </button>
                    <button
                      onClick={() => {
                        localStorage.removeItem('isSignedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userName');
                        // Also remove admin-specific items
                        localStorage.removeItem('isAdminSignedIn');
                        localStorage.removeItem('adminEmail');
                        localStorage.removeItem('adminId');
                        localStorage.removeItem('adminName');
                        setIsSignedIn(false);
                        setUserName('');
                        setMobileMenuOpen(false);
                        navigate('/');
                        alert('Logged out successfully!');
                      }}
                      className="flex items-center p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Logout
                    </button>
                  </>
                )}
                {!isSignedIn && (
                  <button 
                    onClick={() => {navigate('/login'); setMobileMenuOpen(false);}}
                    className="flex items-center justify-center p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Login
                  </button>
                )}
              </div>

            </nav>
          </div>
        )}
      </div>
      
      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <ProfilePhoto 
                      email={profileData.email || localStorage.getItem('userEmail') || ''}
                      name={profileData.name || userName}
                      size="lg"
                      className="border-2 border-gray-300"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (5MB max)
                        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
                        if (file.size > maxSize) {
                          alert('Image size exceeds 5MB limit. Please choose a smaller image.');
                          e.target.value = ''; // Reset the input
                          return;
                        }
                        
                        setSelectedImage(file);
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setImagePreview(e.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedImage(null);
                  setImagePreview('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Update user name
                    if (profileData.name) {
                      setUserName(profileData.name);
                      localStorage.setItem('userName', profileData.name);
                    }
                    
                    // Upload profile photo if changed
                    if (imagePreview) {
                      const userEmail = localStorage.getItem('userEmail');
                      if (userEmail) {
                        // Upload the image to the server
                        const response = await fetch('http://localhost:5000/api/upload_profile_photo.php', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: userEmail,
                            name: profileData.name,
                            imageData: imagePreview
                          })
                        });
                        
                        const data = await response.json();
                        if (data.success) {
                          // Use the URL returned from the server
                          const photoUrl = `http://localhost:5000${data.photoUrl}`;
                          setUserPhoto(photoUrl);
                          localStorage.setItem('userPhoto', photoUrl);
                        } else {
                          // If server upload fails, use the local preview as fallback
                          setUserPhoto(imagePreview);
                          localStorage.setItem('userPhoto', imagePreview);
                          console.error('Failed to upload profile photo:', data.message);
                        }
                      } else {
                        // No user email, use local preview
                        setUserPhoto(imagePreview);
                        localStorage.setItem('userPhoto', imagePreview);
                      }
                      setIsSignedIn(true);
                    }
                    
                    // Update local user data
                    const savedUsers = localStorage.getItem('adminUsers');
                    if (savedUsers) {
                      const users = JSON.parse(savedUsers);
                      const updatedUsers = users.map((user: any) => 
                        user.status === 'active' ? {...user, name: profileData.name, email: profileData.email} : user
                      );
                      localStorage.setItem('adminUsers', JSON.stringify(updatedUsers));
                    }
                    
                    setShowProfileModal(false);
                    setSelectedImage(null);
                    setImagePreview('');
                    alert('Profile updated successfully!');
                  } catch (error) {
                    console.error('Error updating profile:', error);
                    alert('Failed to update profile. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
