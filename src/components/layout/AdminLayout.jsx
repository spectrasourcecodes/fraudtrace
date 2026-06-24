import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Users, FileText, Settings,
  Activity, Database, BarChart3, Bell, Search,
  LogOut, Menu, X, BellDot, User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    logout();
    navigate('/');
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const menuItems = [
    {
      section: 'Main Navigation',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: FileText, label: 'Case Management', path: '/admin/cases' },
        { icon: Activity, label: 'System Monitor', path: '/admin/monitor' },
        { icon: BellDot, label: 'Notifications', path: '/admin/notifications' },
      ],
    },
    {
      section: 'Configuration',
      items: [
        { icon: Settings, label: 'General Settings', path: '/admin/settings' },
      ],
    },
    {
      section: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
      ],
    },
  ];

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
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
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800
          z-50 flex flex-col flex-shrink-0
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0 p-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="relative flex-shrink-0">
              <Shield className="w-8 h-8 text-purple-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-purple-400">System Control</p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path || 
                                  (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-xl
                        transition-all duration-200 group relative
                        ${isActive
                          ? 'bg-purple-500/10 text-purple-400'
                          : 'text-gray-400 hover:text-white hover:bg-slate-800'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="adminActiveIndicator"
                          className="absolute right-0 w-1 h-6 bg-purple-500 rounded-l-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section - User Info & Logout */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-900 space-y-3">
          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{user.email || ''}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-shrink-0 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center space-x-3">
              {/* Hamburger Menu Button (Mobile) */}
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">Admin Dashboard</h1>
              <span className="hidden sm:inline px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-medium">
                ADMIN
              </span>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500 w-40 lg:w-64"
                />
              </div>
              
              {/* Notifications */}
              <Link
                to="/admin/notifications"
                className="p-2 hover:bg-slate-800 rounded-xl relative flex-shrink-0 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>

              {/* User Avatar */}
              <Link
                to="/admin/settings"
                className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 cursor-pointer"
                title={user?.name || 'Admin'}
              >
                <span className="text-white font-bold text-xs sm:text-sm">
                  {getInitials(user?.name)}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;