import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, Bell, Activity, Database, BarChart3,
  Users, Target, Menu, X, LogOut, FileText,
  Settings, Zap, ChevronRight,
  BellDot,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MobileNav from './MobileNav';

const InvestigatorLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
      setMobileMenuOpen(false);
    }
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const menuItems = [
    { icon: Activity, label: 'Dashboard', path: '/investigator' },
    { icon: Search, label: 'Investigations', path: '/investigator/cases' },
    { icon: Target, label: 'Threat Intel', path: '/investigator/threats' },
    { icon: Database, label: 'Evidence', path: '/investigator/evidence' },
    { icon: BarChart3, label: 'Reports', path: '/investigator/reports' },
    { icon: Users, label: 'Team', path: '/investigator/team' },
    { icon: BellDot, label: 'Notifications', path: '/investigator/notifications' },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-[#0a0e1a] flex overflow-hidden">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#0d1117] border-r border-cyan-500/10
          z-50 flex flex-col flex-shrink-0
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 p-6 border-b border-cyan-500/10">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <Shield className="w-8 h-8 text-cyan-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider">FRAUDTRACE</h1>
              <p className="text-xs text-cyan-500">INVESTIGATOR PORTAL</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-shrink-0 p-4 border-b border-cyan-500/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">{getInitials(user?.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Investigator'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path !== '/investigator' && location.pathname.startsWith(item.path + '/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-500' : ''}`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <motion.div layoutId="invActiveIndicator" className="absolute right-0 w-1 h-6 bg-cyan-500 rounded-l-full" />
                )}
              </Link>
            );
          })}

        {/* Bottom Section */}
        <div className="flex-shrink-0 p-4 border-t border-cyan-500/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 sticky top-0 z-30 bg-[#0d1117]/95 backdrop-blur-xl border-b border-cyan-500/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu Button (Mobile) */}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>

              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center space-x-2">
                <Shield className="w-6 h-6 text-cyan-500" />
                <span className="text-sm font-bold text-white">FRAUDTRACE</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* System Status */}
              <div className="hidden sm:flex items-center space-x-2 text-xs">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">SYSTEM ACTIVE</span>
              </div>
              <div className="hidden sm:block w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              
              {/* Notifications */}
              <Link to="/investigator/notifications" className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 cursor-pointer">
                <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-6 pb-24 lg:pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav role="investigator" />
    </div>
  );
};

export default InvestigatorLayout;