import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, Globe, Shield, Camera, Save, Key,
  CheckCircle, AlertTriangle, Clock, MapPin, Calendar,
  LockKeyhole,
} from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    preferredLanguage: 'en',
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [profileChanged, setProfileChanged] = useState(false);
  const [sendingGuide, setSendingGuide] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('profile');

  // User stats
  const [userStats, setUserStats] = useState(null);

  // Fetch fresh user data
  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, []);

  const fetchUserData = async () => {
    setFetchingUser(true);
    try {
      const data = await authService.getCurrentUser();
      const userData = data.user || data;
      
      const profileData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        country: userData.country || '',
        preferredLanguage: userData.preferredLanguage || 'en',
      };
      
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setFetchingUser(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      if (user) {
        setUserStats({
          memberSince: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || new Date().toISOString(),
          role: user.role || 'user',
          emailVerified: user.emailVerified || false,
          status: user.status || 'active',
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
    setProfileChanged(true);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: profile.name,
        phone: profile.phone,
        country: profile.country,
        preferredLanguage: profile.preferredLanguage,
      };

      await updateProfile(updateData);
      
      setOriginalProfile({ ...profile });
      setProfileChanged(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = {};
    if (!passwords.current) {
      errors.current = 'Current password is required';
    }
    if (!passwords.new) {
      errors.new = 'New password is required';
    } else if (passwords.new.length < 6) {
      errors.new = 'Password must be at least 6 characters';
    }
    if (passwords.new !== passwords.confirm) {
      errors.confirm = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) return;

    setChangingPassword(true);
    try {
      await changePassword(passwords.current, passwords.new);
      
      // Clear form
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors({});
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (fetchingUser) {
    return (
      <UserLayout title="Profile">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading profile..." />
        </div>
      </UserLayout>
    );
  }

const handleSendVerificationGuide = async () => {
  setSendingGuide(true);
  try {
    // Call the backend endpoint that sends the verification guide email
    await authService.sendVerificationGuide();
    toast.success('Verification guide sent to your email. Please check your inbox.');
  } catch (err) {
    console.error('Failed to send verification guide:', err);
    toast.error(err.response?.data?.message || 'Failed to send guide');
  } finally {
    setSendingGuide(false);
  }
};


  return (
    <UserLayout title="Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/25">
                  <User className="text-3xl sm:text-4xl font-bold text-white"/>
                </div>
                <button
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-700 hover:bg-slate-600 border-2 border-slate-900 rounded-xl flex items-center justify-center transition-colors"
                  title="Change avatar"
                >
                  <Camera className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-white">{profile.name || 'User'}</h1>
                <p className="text-gray-400 mt-1">{profile.email}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                  <Badge color={userStats?.status === 'active' ? 'emerald' : 'yellow'} variant="dot" size="sm">
                    {userStats?.status || 'active'}
                  </Badge>
                  <Badge color="cyan" size="sm">
                    {userStats?.role || 'user'}
                  </Badge>
                  {userStats?.emailVerified ? (
                    <Badge color="emerald" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge color="yellow" size="sm">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* User Stats */}
        {userStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="text-center p-4">
                <Calendar className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Member Since</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {formatDate(userStats.memberSince)}
                </p>
              </Card>
              <Card className="text-center p-4">
                <Clock className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Last Login</p>
                <p className="text-sm font-semibold text-white mt-1">
                  {formatDate(userStats.lastLogin)}
                </p>
              </Card>
              <Card className="text-center p-4">
                <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Account Status</p>
                <p className="text-sm font-semibold text-white mt-1 capitalize">
                  {userStats.status}
                </p>
              </Card>
              <Card className="text-center p-4">
                <User className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-semibold text-white mt-1 capitalize">
                  {userStats.role}
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Password</span>
          </button>
        </div>

        {/* Profile Form */}
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Profile Information</h2>
                {profileChanged && (
                  <Badge color="yellow" size="xs">Unsaved changes</Badge>
                )}
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <Input
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  icon={User}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Email Address"
                  name="email"
                  value={profile.email}
                  disabled
                  icon={Mail}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    icon={Phone}
                    placeholder="+1234567890"
                  />

                  <Input
                    label="Country"
                    name="country"
                    value={profile.country}
                    onChange={handleProfileChange}
                    icon={MapPin}
                    placeholder="Your country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Language
                  </label>
                  <select
                    name="preferredLanguage"
                    value={profile.preferredLanguage}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="pt">Português</option>
                    <option value="ar">العربية</option>
                    <option value="zh">中文</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" loading={loading} disabled={!profileChanged} icon={Save}>
                    Save Changes
                  </Button>
                  {profileChanged && (
                    <Button type="button" variant="ghost" onClick={() => {
                      setProfile({ ...originalProfile });
                      setProfileChanged(false);
                    }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Password Form */}
        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <Input
                  label="Current Password"
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={(e) => {
                    setPasswords(prev => ({ ...prev, current: e.target.value }));
                    if (passwordErrors.current) setPasswordErrors(prev => ({ ...prev, current: '' }));
                  }}
                  icon={LockKeyhole}
                  placeholder="Enter current password"
                  error={passwordErrors.current}
                />

                <Input
                  label="New Password"
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={(e) => {
                    setPasswords(prev => ({ ...prev, new: e.target.value }));
                    if (passwordErrors.new) setPasswordErrors(prev => ({ ...prev, new: '' }));
                  }}
                  icon={LockKeyhole}
                  placeholder="Enter new password (min. 6 characters)"
                  error={passwordErrors.new}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={(e) => {
                    setPasswords(prev => ({ ...prev, confirm: e.target.value }));
                    if (passwordErrors.confirm) setPasswordErrors(prev => ({ ...prev, confirm: '' }));
                  }}
                  icon={LockKeyhole}
                  placeholder="Re-enter new password"
                  error={passwordErrors.confirm}
                />

                <Button type="submit" loading={changingPassword} icon={Key}>
                  Change Password
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Account Actions */}
        <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Account Actions</h2>
        <div className="space-y-3">
            {!userStats?.emailVerified ? (
            <div className="flex items-center justify-between p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <div>
                    <p className="text-sm text-white">Verify Your Account</p>
                    <p className="text-xs text-gray-400">
                    Your account is not yet verified. Request a guide to complete verification.
                    </p>
                </div>
                </div>
                <Button
                variant="outline"
                size="sm"
                onClick={handleSendVerificationGuide}
                loading={sendingGuide}
                >
                {sendingGuide ? 'Sending...' : 'Send Guide'}
                </Button>
            </div>
            ) : (
            <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div>
                    <p className="text-sm text-white">Email Verified</p>
                    <p className="text-xs text-gray-400">Your email has been verified.</p>
                </div>
                </div>
            </div>
            )}

            {/* Two-Factor Authentication (placeholder) */}
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
            <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                <p className="text-sm text-white">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400">Add extra security to your account</p>
                </div>
            </div>
            <Button variant="outline" size="sm">Setup</Button>
            </div>
        </div>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Profile;