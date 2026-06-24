import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Phone, Globe, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', country: '',
    password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    if (stepNum === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    }
    if (stepNum === 2) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
      });
    } catch (error) {
      setErrors({ general: error.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900/30 via-slate-900 to-purple-900/30 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-lg px-12">
          <Shield className="w-16 h-16 text-cyan-500 mb-6" />
          <h2 className="text-5xl font-bold text-white mb-6">Start Your Recovery Journey</h2>
          <p className="text-gray-400 text-lg mb-10">Join thousands of users who have successfully reported and tracked fraud cases through our secure platform.</p>
          <div className="space-y-4">
            {['Free account creation', 'Secure case submission', 'Real-time tracking', 'Expert support 24/7'].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.15 }} className="flex items-center space-x-3 text-gray-300">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-cyan-500 mx-auto mb-4 lg:hidden" />
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Step {step} of 2</p>
          </div>

          <div className="flex items-center mb-8">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-cyan-500' : 'bg-slate-700'}`} />
            <div className={`flex-1 h-2 rounded-full ml-1 ${step >= 2 ? 'bg-cyan-500' : 'bg-slate-700'}`} />
          </div>

          {errors.general && <Alert type="error" message={errors.general} className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={User} placeholder="John Doe" error={errors.name} />
                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="you@example.com" error={errors.email} />
                <Input label="Phone (Optional)" name="phone" value={formData.phone} onChange={handleChange} icon={Phone} placeholder="+1234567890" />
                <Input label="Country (Optional)" name="country" value={formData.country} onChange={handleChange} icon={Globe} placeholder="Your country" />
                <Button type="button" onClick={handleNext} fullWidth icon={ArrowRight} iconPosition="right">Continue</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} icon={Lock} placeholder="Min. 8 characters" error={errors.password} />
                <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} icon={Lock} placeholder="Re-enter password" error={errors.confirmPassword} />
                
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 mt-0.5" />
                  <span className="text-sm text-gray-400">
                    I agree to the{' '}
                    <a href="/terms" className="text-cyan-500 hover:text-cyan-400">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-cyan-500 hover:text-cyan-400">Privacy Policy</a>
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-sm text-red-400">{errors.agreeToTerms}</p>}

                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                  <Button type="submit" loading={loading} className="flex-1" icon={CheckCircle}>Create Account</Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-500 hover:text-cyan-400 font-semibold">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;