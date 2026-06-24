import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Search, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', native: 'Português' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', native: 'Polski' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', native: 'Tiếng Việt' },
];

const LanguageSelector = ({ onLanguageChange, variant = 'dropdown' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState(() => {
    // Try to detect current language from Google Translate cookie or localStorage
    const saved = localStorage.getItem('activeLanguage');
    if (saved && languages.find(l => l.code === saved)) return saved;
    
    // Try to read from Google Translate cookie
    const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
    if (cookie) {
      const langCode = cookie.split('/').pop();
      if (languages.find(l => l.code === langCode)) return langCode;
    }
    
    return 'en';
  });
  
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find((lang) => lang.code === activeLang) || languages[0];

  const filteredLanguages = languages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Listen for Google Translate changes
  useEffect(() => {
    const checkGoogleTranslate = () => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo && combo.value) {
        const langCode = combo.value;
        if (languages.find(l => l.code === langCode) && langCode !== activeLang) {
          setActiveLang(langCode);
          localStorage.setItem('activeLanguage', langCode);
        }
      }
    };

    // Check periodically for Google Translate changes
    const interval = setInterval(checkGoogleTranslate, 1000);
    
    return () => clearInterval(interval);
  }, [activeLang]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (langCode) => {
    // Update local state immediately
    setActiveLang(langCode);
    localStorage.setItem('activeLanguage', langCode);
    
    // Call the parent callback
    if (onLanguageChange) {
      onLanguageChange(langCode);
    } else {
      // Fallback: use Google Translate directly
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
      } else {
        document.cookie = `googtrans=/en/${langCode};path=/`;
        window.location.reload();
      }
    }
    
    setIsOpen(false);
    setSearchQuery('');
  };

  if (variant === 'inline') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`
              flex items-center space-x-3 p-3 rounded-xl border transition-all
              ${activeLang === lang.code
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                : 'border-slate-700 text-gray-400 hover:border-slate-500'
              }
            `}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="text-left">
              <p className="text-sm font-medium">{lang.native}</p>
              <p className="text-xs opacity-70">{lang.name}</p>
            </div>
            {activeLang === lang.code && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-500 transition-colors"
        title={`${currentLanguage.name} (${currentLanguage.native})`}
      >
        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
        <span className="text-lg sm:text-xl">{currentLanguage.flag}</span>
        <span className="text-xs sm:text-sm font-medium text-gray-300 uppercase">
          {currentLanguage.code}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Search */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search languages..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Language List */}
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredLanguages.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ x: 5 }}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors
                    ${activeLang === lang.code
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }
                  `}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{lang.native}</p>
                      <span className="text-xs text-gray-500 font-mono uppercase">{lang.code}</span>
                    </div>
                    <p className="text-xs opacity-70">{lang.name}</p>
                  </div>
                  {activeLang === lang.code && (
                    <Check className="w-4 h-4 text-cyan-500" />
                  )}
                </motion.button>
              ))}

              {filteredLanguages.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No languages found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;