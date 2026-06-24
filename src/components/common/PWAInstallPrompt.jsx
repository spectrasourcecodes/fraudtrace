import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import Button from './Button';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('========== PWA DEBUG ==========');

    // Check standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    console.log('Standalone Mode:', standalone);

    if (standalone) {
      console.log('✅ App already installed');
      setIsInstalled(true);
      return;
    }

    // Manifest check
    const manifest = document.querySelector(
      'link[rel="manifest"]'
    );

    console.log(
      'Manifest Found:',
      !!manifest,
      manifest?.href
    );

    // Service worker check
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then((regs) => {
          console.log(
            'Service Workers Registered:',
            regs.length
          );

          if (regs.length > 0) {
            console.log('✅ Service Worker Active');
          } else {
            console.warn(
              '❌ No Service Worker Registered'
            );
          }
        });
    } else {
      console.warn(
        '❌ Service Worker API Unsupported'
      );
    }

    const handleBeforeInstallPrompt = (e) => {
      console.log(
        '🎉 beforeinstallprompt EVENT FIRED'
      );

      e.preventDefault();

      setDeferredPrompt(e);

      setTimeout(() => {
        console.log(
          '📦 Showing custom install UI'
        );
        setShowPrompt(true);
      }, 2000);
    };

    const handleInstalled = () => {
      console.log(
        '✅ APP INSTALLED SUCCESSFULLY'
      );

      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      'appinstalled',
      handleInstalled
    );

    console.log(
      '👂 Listening for beforeinstallprompt'
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        'appinstalled',
        handleInstalled
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.warn(
        '❌ No deferred prompt available'
      );

      alert(
        'Install prompt not available. Check browser console.'
      );

      return;
    }

    console.log('🚀 Triggering install prompt');

    deferredPrompt.prompt();

    const choiceResult =
      await deferredPrompt.userChoice;

    console.log(
      'Install Result:',
      choiceResult.outcome
    );

    if (choiceResult.outcome === 'accepted') {
      console.log(
        '✅ User accepted installation'
      );

      setDeferredPrompt(null);
      setShowPrompt(false);
    } else {
      console.log(
        '❌ User dismissed installation'
      );
    }
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-md"
      >
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5">
          <button
            onClick={() => setShowPrompt(false)}
            className="absolute top-3 right-3"
          >
            <X size={18} />
          </button>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
              <Download className="text-cyan-500" />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Install FraudTrace
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                Install for offline access and a better experience.
              </p>

              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Smartphone size={14} />
                  Mobile
                </span>

                <span className="flex items-center gap-1">
                  <Monitor size={14} />
                  Desktop
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1"
                >
                  Install
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPrompt(false)}
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;