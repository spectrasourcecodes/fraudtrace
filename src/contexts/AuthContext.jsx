import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// ============================================
// CREATE CONTEXT
// ============================================
export const AuthContext = createContext(null);

// ============================================
// CUSTOM HOOK
// ============================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // ============================================
  // INITIALIZE AUTH ON MOUNT
  // ============================================
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await authService.getCurrentUser();
          console.log('Auth init - getCurrentUser response:', data);

          // Handle different possible response structures
          const userData = data?.user || data?.data?.user || data?.data || data;

          if (userData && userData._id) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.warn('Auth init - No valid user data found');
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Auth init - Failed:', err.message);
          // Only clear token if it's an authentication error (401/403)
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('token');
            setToken(null);
          }
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // ============================================
  // REGISTER
  // ============================================
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.register(userData);
      console.log('Register response:', data);

      if (!data?.token || !data?.user) {
        throw new Error('Invalid registration response from server');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      toast.success('Account created successfully!');
      navigate('/dashboard');

      return data;
    } catch (err) {
      console.error('Register error:', err);
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============================================
  // LOGIN
  // ============================================
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.login(email, password);
      console.log('Login response:', data);

      // Validate response structure
      if (!data?.token || !data?.user) {
        console.error('Invalid login response:', data);
        throw new Error('Invalid response from server. Please try again.');
      }

      // Store token and update state
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

      toast.success('Welcome back!');

      // Navigate based on role (with safe fallback)
      setTimeout(() => {
        const role = data.user?.role || 'user';

        switch (role) {
          case 'investigator':
            navigate('/investigator');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/dashboard');
        }
      }, 100);

      return data;
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============================================
  // LOGOUT
  // ============================================
  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);

    toast.success('Logged out successfully');
    navigate('/');
  }, [navigate]);

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await authService.updateProfile(userData);
      const updatedUser = data?.user || data?.data?.user || data?.data || data;
      setUser(updatedUser);
      toast.success('Profile updated successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // CHANGE PASSWORD
  // ============================================
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // FORGOT PASSWORD
  // ============================================
  const forgotPassword = useCallback(async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      throw err;
    }
  }, []);

  // ============================================
  // RESET PASSWORD
  // ============================================
  const resetPassword = useCallback(async (resetToken, password) => {
    try {
      await authService.resetPassword(resetToken, password);
      toast.success('Password reset successful. Please login with your new password.');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      throw err;
    }
  }, [navigate]);

  // ============================================
  // ROLE CHECK HELPERS
  // ============================================
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const contextValue = useMemo(() => ({
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Auth actions
    login,
    register,
    logout,

    // Profile actions
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,

    // Role helpers
    hasRole,
    hasAnyRole,
  }), [
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    hasRole,
    hasAnyRole,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;