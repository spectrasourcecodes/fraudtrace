import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  show = true,
  className = '',
  action,
}) => {
  const config = {
    info: {
      icon: Info,
      containerClass: 'bg-cyan-500/10 border-cyan-500/20',
      iconClass: 'text-cyan-500',
      titleClass: 'text-cyan-400',
    },
    success: {
      icon: CheckCircle,
      containerClass: 'bg-emerald-500/10 border-emerald-500/20',
      iconClass: 'text-emerald-500',
      titleClass: 'text-emerald-400',
    },
    warning: {
      icon: AlertTriangle,
      containerClass: 'bg-amber-500/10 border-amber-500/20',
      iconClass: 'text-amber-500',
      titleClass: 'text-amber-400',
    },
    error: {
      icon: XCircle,
      containerClass: 'bg-red-500/10 border-red-500/20',
      iconClass: 'text-red-500',
      titleClass: 'text-red-400',
    },
  };

  const { icon: Icon, containerClass, iconClass, titleClass } = config[type] || config.info;

  return (
    <AnimatePresence>
      {show && message && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className={`flex items-start space-x-3 p-4 rounded-xl border ${containerClass} ${className}`}
        >
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconClass}`} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-semibold mb-1 ${titleClass}`}>{title}</h4>
            )}
            <p className="text-sm text-gray-300">{message}</p>
            
            {action && (
              <div className="mt-3">{action}</div>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;