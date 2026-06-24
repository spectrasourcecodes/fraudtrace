import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Globe, Shield, Moon, Sun, Monitor, Smartphone } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageSelector from '../../components/support/LanguageSelector';

const SettingsPage = () => {
  const { theme, toggleTheme, fontSize, setFontSize, reducedMotion, toggleReducedMotion } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    caseUpdates: true,
    marketingEmails: false,
    twoFactorAuth: false,
    sessionTimeout: '30',
    language: 'en',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <UserLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>

        {/* Appearance */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark', icon: Moon, label: 'Dark' },
                  { id: 'light', icon: Sun, label: 'Light' },
                  { id: 'cyber', icon: Monitor, label: 'Cyber' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => toggleTheme()}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all ${
                      theme === t.id ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-slate-700 text-gray-400 hover:border-slate-500'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    <span className="text-sm">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Font Size</label>
              <div className="flex items-center gap-2">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                      fontSize === size ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white bg-slate-800/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Reduced Motion</p>
                <p className="text-gray-500 text-xs">Minimize animations</p>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`relative w-12 h-6 rounded-full transition-colors ${reducedMotion ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your cases' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get browser notifications' },
              { key: 'caseUpdates', label: 'Case Updates', desc: 'Notifications when case status changes' },
              { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Tips and platform updates' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Language */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Language</h2>
          <LanguageSelector
            currentLang={settings.language}
            onLanguageChange={(lang) => setSettings(prev => ({ ...prev, language: lang }))}
            variant="inline"
          />
        </Card>

        {/* Security */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm">Two-Factor Authentication</p>
                <p className="text-gray-500 text-xs">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => handleToggle('twoFactorAuth')}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.twoFactorAuth ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Session Timeout (minutes)</label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500"
              >
                {['15', '30', '60', '120'].map((time) => (
                  <option key={time} value={time}>{time} minutes</option>
                ))}
              </select>
            </div>

            <Button variant="outline" fullWidth icon={Shield}>View Security Log</Button>
          </div>
        </Card>

        {/* Save Button */}
        <Button fullWidth size="lg">Save All Settings</Button>
      </div>
    </UserLayout>
  );
};

export default SettingsPage;