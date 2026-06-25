import { api } from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log(response)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      // Log the error for debugging
      console.error('Login API error:', error);
      
      // If axios error with response
      if (error.response) {
        const message = error.response.data?.message || 'Invalid email or password';
        const customError = new Error(message);
        customError.response = error.response;
        customError.status = error.response.status;
        throw customError;
      }
      
      // Network error
      if (error.request) {
        const customError = new Error('Unable to connect to server. Please check your internet connection.');
        customError.isNetworkError = true;
        throw customError;
      }
      
      // Other errors
      throw new Error('An unexpected error occurred. Please try again.');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.put(`/api/auth/reset-password/${token}`, { password });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/api/auth/verify-email/${token}`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/auth/update-profile', userData);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/api/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  sendVerificationGuide: async () => {
    const response = await api.post('/api/auth/send-verification-guide');
    return response.data;
  },
};

export default authService;