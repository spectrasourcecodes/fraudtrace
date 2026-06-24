import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Login = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    rememberMe: false 
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear errors when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // CRITICAL: Prevent default form submission (page reload)
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous errors
    setLoginError('');
    
    // Validate form
    if (!validateForm()) {
      return false;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Attempt login - navigation will happen inside AuthContext if successful
      await login(formData.email, formData.password);
      // If we get here, login was successful (but navigation should have already happened)
    } catch (error) {
      // Login failed - show error
      console.log('Login failed:', error);
      const message = error.response?.data?.message || error.message || 'Invalid email or password';
      setLoginError(message);
    } finally {
      setLoading(false);
    }
    
    // Return false to prevent any default behavior
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full filter blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }} 
          className="relative z-10 max-w-lg px-12"
        >
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-16 h-16 text-cyan-500" />
            <div>
              <h1 className="text-4xl font-bold text-white">FraudTrace</h1>
              <p className="text-cyan-400 text-lg">Recovery Platform</p>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Secure Portal for Fraud Recovery
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Access your secure dashboard to track cases, upload evidence, and communicate with professional investigators.
          </p>
          
          <div className="space-y-4">
            {[
              'End-to-end encrypted communications',
              'Real-time case tracking and updates',
              'Professional investigation support 24/7',
              'Secure evidence management system',
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.8 + index * 0.15 }} 
                className="flex items-center space-x-3 text-gray-300"
              >
                <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />
                </div>
                <span className="text-base">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-6">
              <Shield className="w-12 h-12 text-cyan-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to your account to continue</p>
          </div>

          {/* Error Display */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400 flex-1">{loginError}</p>
                <button 
                  type="button"
                  onClick={() => setLoginError('')}
                  className="text-red-400 hover:text-red-300 flex-shrink-0 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Form - using onSubmit on the form element */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              placeholder="you@example.com"
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              placeholder="Enter your password"
              error={fieldErrors.password}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit button with type="submit" */}
            <Button 
              type="submit"
              loading={loading} 
              fullWidth 
              size="lg" 
              icon={ArrowRight} 
              iconPosition="right"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-gray-400 pt-4">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-cyan-500 hover:text-cyan-400 font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;