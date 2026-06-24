import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const UserLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar - Fixed position */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar
          isOpen={true}
          onToggle={() => {}}
          role="user"
        />
      </div>

      {/* Mobile Sidebar - Overlay */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          role="user"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0">
          <Header
            onMenuToggle={toggleSidebar}
            title={title}
          />
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-6">
          <div className="p-4 sm:p-6">
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
      <MobileNav role="user" />
    </div>
  );
};

export default UserLayout;