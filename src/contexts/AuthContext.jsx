import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount and token change
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const data = await authService.getCurrentUser();
          setUser(data.user || data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Auth initialization failed:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authService.register(userData);
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast.success('Account created successfully!');
      navigate('/dashboard');
      
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Login function
    const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
        const data = await authService.login(email, password);
        
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        toast.success('Welcome back!');
        
        // Use setTimeout to avoid navigation during render
        setTimeout(() => {
        switch (data.user.role) {
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
        console.error('AuthContext login error:', err);
        const message = err.response?.data?.message || err.message || 'Login failed';
        setError(message);
        toast.error(message);
        throw err;
    } finally {
        setLoading(false);
    }
    }, [navigate]);

  // Logout function
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

  // Update user profile
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await authService.updateProfile(userData);
      setUser(data.user || data);
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

  // Change password
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setLoading(true);
    try {
      const data = await authService.changePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password';
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      const data = await authService.forgotPassword(email);
      toast.success('Password reset email sent');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      throw err;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (token, password) => {
    try {
      const data = await authService.resetPassword(token, password);
      toast.success('Password reset successful. Please login.');
      navigate('/login');
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      throw err;
    }
  }, [navigate]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(user?.role);
  }, [user]);

  // Context value
  const contextValue = useMemo(() => ({
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