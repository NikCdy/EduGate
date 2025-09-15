import React, { useState, useEffect } from 'react';
import { User, Mail, Eye, EyeOff, Save, Camera, Bookmark } from 'lucide-react';
import UserNotes from '../Notes/UserNotes';
import { compressImage, uploadProfilePhoto, getProfilePhoto } from '../../utils/profileUtils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  profileImage?: string;
}

const EditProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: ''
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notes'>('profile');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const response = await fetch(`${API_URL}/get_user_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          profileImage: ''
        });
        
        // Try to get profile photo from the file system
        try {
          const photoUrl = await getProfilePhoto(userEmail);
          if (photoUrl) {
            localStorage.setItem('userPhoto', photoUrl);
          } else if (data.user.profileImage) {
            // Fallback to database image if available
            localStorage.setItem('userPhoto', data.user.profileImage);
          }
        } catch (photoError) {
          console.error('Error fetching profile photo:', photoError);
          // Fallback to database image if available
          if (data.user.profileImage) {
            localStorage.setItem('userPhoto', data.user.profileImage);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // First, update the profile information
      const response = await fetch(`${API_URL}/update_profile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          name: formData.name,
          email: formData.email,
          // Don't store the image in the database anymore
          profileImage: ''
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // If we have a new profile image, upload it to the file system
        if (formData.profileImage) {
          try {
            // Check if profile image is too large
            let imageToUpload = formData.profileImage;
            if (imageToUpload.length > 2000000) { // 2MB
              // Compress the image client-side before sending
              imageToUpload = await compressImage(imageToUpload);
            }
            
            // Upload the profile photo to the server
            const photoUrl = await uploadProfilePhoto(formData.email, imageToUpload, formData.name);
            
            // Update local storage with the new photo URL
            localStorage.setItem('userPhoto', photoUrl);
          } catch (uploadError) {
            console.error('Error uploading profile photo:', uploadError);
            setErrorMessage('Profile updated but failed to upload photo. Please try again.');
          }
        }
        
        alert('Profile updated successfully!');
        localStorage.setItem('userEmail', formData.email);
        
        // Update profile with returned user data
        if (data.user) {
          setProfile(data.user);
        }
      } else {
        setErrorMessage(data.message || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordChange = async () => {
    if (!profile) return;
    
    // Validate password
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordErrorMessage('New passwords do not match');
      return;
    }
    
    if (!formData.currentPassword) {
      setPasswordErrorMessage('Current password is required');
      return;
    }
    
    setIsPasswordLoading(true);
    setPasswordErrorMessage('');
    
    try {
      const response = await fetch(`${API_URL}/update_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Password updated successfully!');
        setFormData({...formData, currentPassword: '', newPassword: '', confirmPassword: ''});
        setShowPasswordSection(false);
      } else {
        setPasswordErrorMessage(data.message || 'Error updating password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordErrorMessage('Network error. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };
  
  // compressImage function moved to profileUtils.ts

  if (!profile) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-6 font-medium flex items-center ${activeTab === 'profile' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          <User className="w-5 h-5 mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-6 font-medium flex items-center ${activeTab === 'notes' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Bookmark className="w-5 h-5 mr-2" />
          My Notes
        </button>
      </div>
      
      {activeTab === 'profile' && (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <img 
              src={localStorage.getItem('userPhoto') || profile.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size
                      if (file.size > 5 * 1024 * 1024) { // 5MB
                        setErrorMessage('Image is too large. Maximum size is 5MB.');
                        return;
                      }
                      
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const imageUrl = event.target?.result as string;
                        
                        try {
                          // Compress image if it's large
                          let finalImage = imageUrl;
                          if (imageUrl.length > 500000) { // 500KB
                            finalImage = await compressImage(imageUrl);
                          }
                          
                          // Store in local storage temporarily
                          localStorage.setItem('userPhoto', finalImage);
                          
                          // Update form data with the image
                          setFormData(prev => ({
                            ...prev,
                            profileImage: finalImage
                          }));
                          
                          // Clear any previous errors
                          setErrorMessage('');
                        } catch (error) {
                          console.error('Error processing image:', error);
                          setErrorMessage('Error processing image. Please try a different one.');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {errorMessage}
            </div>
          )}
          
          <button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating Profile...
              </div>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Update Profile
              </>
            )}
          </button>
          
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Password Settings</h3>
              <button 
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            
            {showPasswordSection && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Current password"
                />
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                
                {passwordErrorMessage && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                    {passwordErrorMessage}
                  </div>
                )}
                
                <button
                  onClick={handlePasswordChange}
                  disabled={isPasswordLoading || !formData.currentPassword || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {isPasswordLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating Password...
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      
      {activeTab === 'notes' && <UserNotes />}
    </div>
  );
};

export default EditProfile;