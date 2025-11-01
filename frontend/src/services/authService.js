import axios from 'axios';
import { API_BASE_URL } from '../constants/Constants';



const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // enable cookies
});

// Global error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          authService.logout();
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('Unhandled error', error.response);
      }
    } else if (error.request) {
      console.error('No response received', error.request);
    } else {
      console.error('Error setting up request', error.message);
    }
    return Promise.reject(error);
  }
);

const generateUserColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const authService = {
  // ✅ FIXED: Single login method (with token + user)
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      // Extract token + user
      const { token, user } = response.data;

      // Assign color and login time
      const userColor = generateUserColor();
      const userData = {
        ...user,
        color: userColor,
        loginTime: new Date().toISOString()
      };

      // Store both user and token
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed', error);
      const errorMessage = error.response?.data?.message || 'Login failed, please check your credentials';
      throw new Error(errorMessage);
    }
  },

  signup: async (username, email, password) => {
    try {
      const response = await api.post('/auth/signup', { username, email, password });
      return { success: true, user: response.data };
    } catch (error) {
      console.error('Signup failed', error);
      const errorMessage = error.response?.data?.message || 'Signup failed';
      throw new Error(errorMessage);
    }
  },

  // ✅ Added logout
  logout: async () => {
  try {
    const token = localStorage.getItem('token');
    

    // Send logout request with JWT token
    await api.post(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');

    // Clear all cookies
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    });
  }
},


  fetchCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/getcurrentuser', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Error fetching user data', error);
      if (error.response && error.response.status === 401) await authService.logout();
    }
  },

  fetchOnlineUsers: async () => {
    try {
      const response = await api.get('/auth/getonlineusers');
      return response.data;
    } catch (error) {
      console.error('Fetch online users error:', error);
      throw error;
    }
  },

  fetchAllUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/all-users', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Fetch all users error:', error);
      throw error;
    }
  },

  getCurrentUser: () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) return JSON.parse(currentUserStr);
      return null;
    } catch (error) {
      console.error('Error parsing user data', error);
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  fetchPrivateMessages: async (user1, user2) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/messages/private?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching private messages', error);
      throw error;
    }
  },
  uploadFile: async (file, sender, recipient, color) => {
    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('sender', sender);
      formData.append('recipient', recipient);
      if (color) formData.append('color', color);

      const response = await api.post('/api/files/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      // returns S3 URL
      return response.data;
    } catch (error) {
      console.error('File upload failed', error);
      throw error;
    }
  },
   
  updateProfile: async (username, profileImageFile) => {

  try {
    const formData = new FormData();
    formData.append("username", username);
    if (profileImageFile instanceof File) {
      formData.append("profileImage", profileImageFile);
    }
        const token = localStorage.getItem("token");
    const response = await api.post("/api/profile/update", formData, {
      headers: { "Content-Type": "multipart/form-data" ,
        "Authorization": `Bearer ${token}`  
      },
      withCredentials: true,
      
    });

    const { success, user, message } = response.data;
    if (!success) throw new Error(message || "Profile update failed");

    const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
    const updatedUser = { ...currentUser, ...user };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    return { success: true, user: updatedUser, message };
  } catch (error) {
    console.error("Profile update failed:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
},

  changePassword: async (oldPassword, newPassword) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/auth/change-password",
        { oldPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Change password failed:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to change password.";
      return { success: false, message: errorMessage };
    }
  }

};
