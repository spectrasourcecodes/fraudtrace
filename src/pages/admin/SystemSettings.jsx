import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Globe, Shield, Mail, Database,
  Save, RefreshCw, Trash2, CheckCircle, AlertTriangle,
  MessageCircle, Send, Loader,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/feedback/Alert';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSecretModal, setShowSecretModal] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General
    siteName: '',
    siteDescription: '',
    supportEmail: '',
    supportPhone: '',
    
    // Security
    jwtSecret: '••••••••••••••••',
    sessionTimeout: '30',
    maxLoginAttempts: '5',
    twoFactorRequired: false,
    
    // Email
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPassword: '',
    
    // Support Links
    telegramLink: '',
    whatsappLink: '',
    emailLink: '',
    
    // Features
    enableRegistration: true,
    enableCaseTracking: true,
    enableNotifications: true,
    maintenanceMode: false,
  });

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchSupportLinks();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/admin/settings');
      const data = response.data?.data || response.data;
      
      setSettings(prev => ({
        ...prev,
        ...data,
      }));
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportLinks = async () => {
    try {
      const response = await api.get('/api/support/links');
      const data = response.data?.data || response.data;
      
      setSettings(prev => ({
        ...prev,
        telegramLink: data.telegram || prev.telegramLink,
        whatsappLink: data.whatsapp || prev.whatsappLink,
        emailLink: data.email || prev.emailLink,
      }));
    } catch (err) {
      console.error('Failed to fetch support links:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Save general settings
  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', {
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
      });
      toast.success('General settings saved successfully');
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Save security settings
  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', {
        sessionTimeout: settings.sessionTimeout,
        maxLoginAttempts: settings.maxLoginAttempts,
        twoFactorRequired: settings.twoFactorRequired,
      });
      toast.success('Security settings saved successfully');
    } catch (err) {
      console.error('Failed to save security settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Save email settings
  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPassword: settings.smtpPassword,
      });
      toast.success('Email settings saved successfully');
    } catch (err) {
      console.error('Failed to save email settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Send test email
  const handleSendTestEmail = async () => {
    try {
      await api.post('/api/admin/test-email', {
        email: settings.supportEmail,
      });
      toast.success('Test email sent successfully');
    } catch (err) {
      console.error('Failed to send test email:', err);
      toast.error(err.response?.data?.message || 'Failed to send test email');
    }
  };

  // Save support links
  const handleSaveSupportLinks = async () => {
    setSaving(true);
    try {
      await api.put('/api/support/links', {
        telegram: settings.telegramLink,
        whatsapp: settings.whatsappLink,
        email: settings.emailLink,
      });
      toast.success('Support links updated successfully');
    } catch (err) {
      console.error('Failed to update support links:', err);
      toast.error(err.response?.data?.message || 'Failed to update support links');
    } finally {
      setSaving(false);
    }
  };

  // Save feature settings
  const handleSaveFeatures = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', {
        enableRegistration: settings.enableRegistration,
        enableCaseTracking: settings.enableCaseTracking,
        enableNotifications: settings.enableNotifications,
        maintenanceMode: settings.maintenanceMode,
      });
      toast.success('Feature settings saved successfully');
    } catch (err) {
      console.error('Failed to save feature settings:', err);
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Clear cache
  const handleClearCache = async () => {
    try {
      await api.post('/api/admin/clear-cache');
      toast.success('Cache cleared successfully');
    } catch (err) {
      console.error('Failed to clear cache:', err);
      toast.error(err.response?.data?.message || 'Failed to clear cache');
    }
  };

  // Rotate JWT secret
  const handleRotateSecret = async () => {
    try {
      await api.post('/api/admin/rotate-secret');
      toast.success('JWT secret rotated successfully. All users will need to login again.');
      setShowSecretModal(false);
    } catch (err) {
      console.error('Failed to rotate secret:', err);
      toast.error(err.response?.data?.message || 'Failed to rotate secret');
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'support', label: 'Support Links', icon: MessageCircle },
    { id: 'features', label: 'Features', icon: Database },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading settings..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Configure platform settings and preferences</p>
        </motion.div>

        {/* Section Navigation */}
        <div className="flex space-x-1 bg-slate-800/30 rounded-xl p-1 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === section.id ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeSection === 'general' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">General Settings</h2>
              <div className="space-y-4">
                <Input label="Site Name" name="siteName" value={settings.siteName} onChange={handleChange} />
                <Input label="Site Description" name="siteDescription" value={settings.siteDescription} onChange={handleChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Support Email" name="supportEmail" type="email" value={settings.supportEmail} onChange={handleChange} />
                  <Input label="Support Phone" name="supportPhone" value={settings.supportPhone} onChange={handleChange} />
                </div>
                <Button icon={Save} onClick={handleSaveGeneral} loading={saving}>
                  Save General Settings
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security Settings */}
        {activeSection === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input label="JWT Secret Key" name="jwtSecret" value={settings.jwtSecret} type="password" disabled className="flex-1" />
                  <Button variant="outline" size="sm" icon={RefreshCw} className="mt-6" onClick={() => setShowSecretModal(true)}>
                    Rotate
                  </Button>
                </div>
                <Input label="Session Timeout (minutes)" name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange} type="number" />
                <Input label="Max Login Attempts" name="maxLoginAttempts" value={settings.maxLoginAttempts} onChange={handleChange} type="number" />
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                  <div>
                    <p className="text-white text-sm">Two-Factor Authentication</p>
                    <p className="text-gray-500 text-xs">Require 2FA for all users</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, twoFactorRequired: !prev.twoFactorRequired }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.twoFactorRequired ? 'bg-purple-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.twoFactorRequired ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <Button icon={Save} onClick={handleSaveSecurity} loading={saving}>
                  Save Security Settings
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Email Settings */}
        {activeSection === 'email' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Email Configuration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="SMTP Host" name="smtpHost" value={settings.smtpHost} onChange={handleChange} />
                  <Input label="SMTP Port" name="smtpPort" value={settings.smtpPort} onChange={handleChange} />
                </div>
                <Input label="SMTP Username" name="smtpUser" value={settings.smtpUser} onChange={handleChange} />
                <Input label="SMTP Password" name="smtpPassword" type="password" value={settings.smtpPassword} onChange={handleChange} placeholder="Enter SMTP password" />
                <div className="flex items-center gap-3">
                  <Button icon={Save} onClick={handleSaveEmail} loading={saving}>
                    Save Email Settings
                  </Button>
                  <Button variant="outline" icon={Send} onClick={handleSendTestEmail}>
                    Send Test Email
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Support Links */}
        {activeSection === 'support' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Support Links Configuration</h2>
              <p className="text-sm text-gray-400 mb-6">
                Configure the links that appear in the floating support button and support page for users.
              </p>
              <div className="space-y-4">
                <Input
                  label="Telegram Support Link"
                  name="telegramLink"
                  value={settings.telegramLink}
                  onChange={handleChange}
                  icon={Send}
                  placeholder="https://t.me/yourusername"
                />
                <Input
                  label="WhatsApp Support Link"
                  name="whatsappLink"
                  value={settings.whatsappLink}
                  onChange={handleChange}
                  icon={MessageCircle}
                  placeholder="https://wa.me/1234567890"
                />
                <Input
                  label="Email Support Link"
                  name="emailLink"
                  value={settings.emailLink}
                  onChange={handleChange}
                  icon={Mail}
                  placeholder="mailto:support@fraudtracerecovery.com"
                />
                <Button icon={Save} onClick={handleSaveSupportLinks} loading={saving}>
                  Save Support Links
                </Button>
              </div>
            </Card>

            {/* Preview */}
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-400">
                  <Send className="w-4 h-4" />
                  <span>Telegram: {settings.telegramLink || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: {settings.whatsappLink || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Mail className="w-4 h-4" />
                  <span>Email: {settings.emailLink || 'Not set'}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Feature Toggles */}
        {activeSection === 'features' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-white mb-6">Feature Management</h2>
              <div className="space-y-4">
                {[
                  { key: 'enableRegistration', label: 'User Registration', desc: 'Allow new users to register on the platform' },
                  { key: 'enableCaseTracking', label: 'Case Tracking', desc: 'Enable real-time case tracking features' },
                  { key: 'enableNotifications', label: 'Notifications', desc: 'Enable push and email notifications' },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put site in maintenance mode (only admins can access)' },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <p className="text-white text-sm">{feature.label}</p>
                      <p className="text-gray-500 text-xs">{feature.desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, [feature.key]: !prev[feature.key] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${settings[feature.key] ? 'bg-purple-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[feature.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
                <Button icon={Save} onClick={handleSaveFeatures} loading={saving}>
                  Save Feature Settings
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card>
              <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div>
                    <p className="text-white text-sm">Clear All Cache</p>
                    <p className="text-gray-500 text-xs">Clear system cache and temporary data</p>
                  </div>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={handleClearCache}>
                    Clear Cache
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Rotate Secret Modal */}
      <Modal isOpen={showSecretModal} onClose={() => setShowSecretModal(false)} title="Rotate JWT Secret" size="sm">
        <div className="space-y-4">
          <Alert
            type="warning"
            message="Rotating the JWT secret will invalidate all existing user sessions. All users will need to log in again. This action cannot be undone."
          />
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setShowSecretModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={handleRotateSecret}>
              Rotate Secret
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default SystemSettings;