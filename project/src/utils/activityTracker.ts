import axios from 'axios';

/**
 * Track user activity in the system
 * @param {string} type - Type of activity (login, search, etc.)
 * @param {string} userId - User ID
 * @param {string} term - Search term (for search activities)
 */
export const trackActivity = async (type: string, userId: string, term?: string) => {
  try {
    await axios.post('http://localhost:5000/api/track_activity.php', {
      type,
      userId,
      term
    });
    console.log(`Activity tracked: ${type}`);
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

export default trackActivity;