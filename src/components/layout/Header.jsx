import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Settings, Menu, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../support/LanguageSelector';
import { api } from '../../services/api';

const Header = ({ onMenuToggle, title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/api/notifications/unread-count');
        setUnreadCount(response.data?.unreadCount || 0);
      } catch (error) {
        // Silently fail - don't show error for notification count
        console.error('Failed to fetch unread count:', error);
      }
    };

    // Fetch immediately
    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLanguageChange = (langCode) => {
    // Hide Google Translate banner
    const banner = document.querySelector('.goog-te-banner-frame');
    if (banner) {
      banner.style.display = 'none';
      banner.style.visibility = 'hidden';
      banner.style.height = '0px';
    }
    document.body.style.top = '0px';
    
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change'));
      
      setTimeout(() => {
        const bannerAfter = document.querySelector('.goog-te-banner-frame');
        if (bannerAfter) {
          bannerAfter.style.display = 'none';
        }
        document.body.style.top = '0px';
      }, 100);
    } else {
      document.cookie = `googtrans=/en/${langCode};path=/`;
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="px-3 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          
          {/* LEFT SECTION: Hamburger + Site Name + Page Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2">
            {/* Hamburger Menu Button (Mobile) */}
            <button
              onClick={onMenuToggle}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors lg:hidden flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>

            {/* Site Name / Logo */}
            <div 
              className="flex items-center space-x-2 flex-shrink-0 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-500 hidden sm:block" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent whitespace-nowrap">
                FraudTrace
              </span>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-slate-700 mx-1" />

            {/* Page Title */}
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                {title || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-400 hidden md:block truncate">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Language Selector */}
            <LanguageSelector
              onLanguageChange={handleLanguageChange}
              variant="dropdown"
            />

            {/* Search (hidden on small screens) */}
            <div className="hidden lg:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-40 xl:w-64"
              />
            </div>

            {/* Notifications with Unread Count */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/notifications')}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors relative"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="w-5 h-5 text-gray-400" />
              
              {/* Unread Count Badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-slate-900"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Settings */}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>

            {/* User Icon (replaces initials) */}
            <div 
              className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-cyan-500/25 flex-shrink-0"
              onClick={() => navigate('/profile')}
              title={user?.name || 'Profile'}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;