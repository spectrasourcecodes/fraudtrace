import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Bell,
  Settings,
  Shield,
  Search,
  Activity,
  Database,
} from 'lucide-react';

const MobileNav = ({ role = 'user' }) => {
  const location = useLocation();

  const userNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: FileText, label: 'Cases', path: '/cases' },
    { icon: AlertTriangle, label: 'Report', path: '/report-fraud' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const investigatorNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/investigator' },
    { icon: Search, label: 'Cases', path: '/investigator/cases' },
    { icon: Activity, label: 'Threats', path: '/investigator/threats' },
    { icon: Database, label: 'Evidence', path: '/investigator/evidence' },
    { icon: Settings, label: 'Settings', path: '/investigator/settings' },
  ];

  const navItems = role === 'investigator' ? investigatorNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center px-3 py-2 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <item.icon
                className={`w-5 h-5 mb-1 transition-colors duration-200 ${
                  isActive ? 'text-cyan-500' : 'text-gray-500'
                }`}
              />
              
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  isActive ? 'text-cyan-500' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="mobileNavBg"
                  className="absolute inset-0 bg-cyan-500/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;