import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Package,
  Bell,
  MessageSquare,
  Settings,
  Shield,
  LogOut,
  Activity,
  Database,
  Search,
  Users,
  BarChart3,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const userMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'My Cases', path: '/cases' },
  { icon: AlertTriangle, label: 'Report Fraud', path: '/report-fraud' },
  { icon: Package, label: 'Evidence Center', path: '/evidence' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: MessageSquare, label: 'Support', path: '/support' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const investigatorMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/investigator' },
  { icon: Search, label: 'Case Investigations', path: '/investigator/cases' },
  { icon: Activity, label: 'Threat Intelligence', path: '/investigator/threats' },
  { icon: Database, label: 'Evidence Analysis', path: '/investigator/evidence' },
  { icon: BarChart3, label: 'Reports', path: '/investigator/reports' },
  { icon: Users, label: 'Team', path: '/investigator/team' },
  { icon: Settings, label: 'Settings', path: '/investigator/settings' },
];

const Sidebar = ({ isOpen, onToggle, role = 'user' }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuItems = role === 'investigator' ? investigatorMenuItems : userMenuItems;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const handleLogout = () => {
    if (window.innerWidth < 1024) {
      onToggle();
    }
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -300,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800
          z-50 flex flex-col flex-shrink-0
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4 z-10">
          <button
            onClick={onToggle}
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
              <Shield className="w-8 h-8 text-cyan-500" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FraudTrace</h1>
              <p className="text-xs text-cyan-400">Recovery Platform</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-shrink-0 p-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/25">
              <User className="text-white font-bold text-sm"/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-500' : ''}`} />
                <span className="text-sm font-medium">{item.label}</span>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-cyan-500 rounded-l-full"
                  />
                )}
              </Link>
            );
          })}

        {/* Bottom Section - Logout */}
          <div className="flex-shrink-0 p-4 border-t border-slate-800 bg-slate-900">
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
    </>
  );
};

export default Sidebar;