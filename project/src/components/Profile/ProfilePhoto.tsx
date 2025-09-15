import React, { useState, useEffect } from 'react';
import { getProfilePhoto, generateProfileImage } from '../../utils/profileUtils';

interface ProfilePhotoProps {
  email: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfilePhoto: React.FC<ProfilePhotoProps> = ({ 
  email, 
  name, 
  size = 'md',
  className = '' 
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  useEffect(() => {
    const loadProfilePhoto = async () => {
      setIsLoading(true);
      
      try {
        // First check localStorage
        const cachedPhoto = localStorage.getItem('userPhoto');
        const userEmail = localStorage.getItem('userEmail');
        
        // If this is the current user and we have a cached photo, use it
        if (userEmail === email && cachedPhoto) {
          setPhotoUrl(cachedPhoto);
          setIsLoading(false);
          return;
        }
        
        // Otherwise fetch from server
        const photoFromServer = await getProfilePhoto(email);
        if (photoFromServer) {
          setPhotoUrl(photoFromServer);
          
          // If this is the current user, cache it
          if (userEmail === email) {
            localStorage.setItem('userPhoto', photoFromServer);
          }
        } else {
          // Fallback to generated avatar
          setPhotoUrl(generateProfileImage(email, name));
        }
      } catch (error) {
        console.error('Error loading profile photo:', error);
        // Fallback to generated avatar
        setPhotoUrl(generateProfileImage(email, name));
      } finally {
        setIsLoading(false);
      }
    };
    
    if (email) {
      loadProfilePhoto();
    } else {
      setPhotoUrl(generateProfileImage('', name));
      setIsLoading(false);
    }
  }, [email, name]);

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      {isLoading ? (
        <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded-full`}></div>
      ) : (
        <img 
          src={photoUrl || generateProfileImage(email, name)}
          alt={name || 'Profile'}
          className="w-full h-full object-cover"
          onError={() => setPhotoUrl(generateProfileImage(email, name))}
        />
      )}
    </div>
  );
};

export default ProfilePhoto;