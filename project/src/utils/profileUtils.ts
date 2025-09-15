/**
 * Generates a profile image URL based on the user's name or email
 * Uses the UI Avatars service to generate consistent profile images
 * 
 * @param email User's email address
 * @param name User's name (optional)
 * @returns URL for the profile image
 */
export function generateProfileImage(email: string, name?: string): string {
  if (!email && !name) {
    return 'https://ui-avatars.com/api/?name=User&background=random';
  }
  
  let initials = '';
  let colorSeed = 0;
  
  if (name) {
    // Use name for initials if available
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      // Get first letter of first and last name
      initials = (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      // If only one name, use first letter and second letter
      initials = nameParts[0].charAt(0).toUpperCase();
      if (nameParts[0].length > 1) {
        initials += nameParts[0].charAt(1).toUpperCase();
      }
    }
    
    // Use name for color seed
    for (let i = 0; i < name.length; i++) {
      colorSeed += name.charCodeAt(i);
    }
  } else {
    // Fallback to email if no name
    const cleanEmail = email.trim().toLowerCase();
    const namePart = cleanEmail.split('@')[0];
    const domainPart = cleanEmail.split('@')[1]?.split('.')[0] || '';
    initials = (namePart.charAt(0) + (domainPart.charAt(0) || '')).toUpperCase();
    
    // Use email for color seed
    colorSeed = namePart.charCodeAt(0) + (domainPart.charCodeAt(0) || 0);
  }
  
  // Generate a consistent color based on the seed
  const colorIndex = colorSeed % 10;
  const colors = [
    '0D8ABC', '16A085', '27AE60', '2980B9', '8E44AD', 
    'F39C12', 'D35400', 'C0392B', '7F8C8D', '2C3E50'
  ];
  
  return `https://ui-avatars.com/api/?name=${initials}&background=${colors[colorIndex]}&color=fff`;
}

/**
 * Uploads a profile photo to the server
 * 
 * @param email User's email address
 * @param imageData Base64 encoded image data
 * @param name User's name (optional)
 * @returns Promise with the URL of the uploaded photo
 */
export async function uploadProfilePhoto(email: string, imageData: string, name?: string): Promise<string> {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    const response = await fetch(`${API_URL}/upload_profile_photo.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        imageData
      })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.photoUrl;
    } else {
      throw new Error(data.message || 'Failed to upload profile photo');
    }
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
}

/**
 * Retrieves a profile photo URL from the server based on email
 * 
 * @param email User's email address
 * @returns Promise with the URL of the profile photo or null if not found
 */
export async function getProfilePhoto(email: string): Promise<string | null> {
  const API_URL = 'http://localhost:5000/api';
  
  try {
    const response = await fetch(`${API_URL}/get_profile_photo.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.photoUrl;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving profile photo:', error);
    return null;
  }
}

/**
 * Compresses an image to reduce its size
 * 
 * @param base64Image Base64 encoded image data
 * @returns Promise with compressed base64 image data
 */
export function compressImage(base64Image: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 800px width/height)
      let width = img.width;
      let height = img.height;
      const maxSize = 800;
      
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      
      // Set canvas dimensions and draw image
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Get compressed image as JPEG with 80% quality
      const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressedImage);
    };
  });
}