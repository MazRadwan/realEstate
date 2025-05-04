const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Service for user-related API calls
 */
const userService = {
  /**
   * Register a new user in the MongoDB database after Firebase authentication
   * @param {string} idToken - Firebase ID token
   * @param {object} userData - User data to register
   * @returns {Promise<object>} - The registered user object
   */
  registerUser: async (idToken, userData) => {
    try {
      console.log('Registering user at:', `${API_BASE}/api/auth/register`);
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        // Check content type before parsing as JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to register user');
        } else {
          // Handle non-JSON responses (likely HTML error pages)
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 100) + '...');
          throw new Error(`Server error (${response.status}): Backend server may not be running correctly`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Registration API error:', error);
      throw error;
    }
  },

  /**
   * Get the current user profile
   * @param {string} idToken - Firebase ID token
   * @returns {Promise<object>} - The user profile
   */
  getUserProfile: async (idToken) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get user profile');
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 100) + '...');
          throw new Error(`Server error (${response.status}): Backend server may not be running correctly`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile API error:', error);
      throw error;
    }
  },

  /**
   * Update the user profile
   * @param {string} idToken - Firebase ID token
   * @param {object} profileData - Profile data to update
   * @returns {Promise<object>} - The updated user profile
   */
  updateUserProfile: async (idToken, profileData) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        } else {
          const text = await response.text();
          console.error('Non-JSON error response:', text.substring(0, 100) + '...');
          throw new Error(`Server error (${response.status}): Backend server may not be running correctly`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  }
};

export default userService; 