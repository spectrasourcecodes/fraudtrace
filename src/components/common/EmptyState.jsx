import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Package,
  title = 'No data available',
  description = 'There are no items to display at this time.',
  actionLabel,
  actionIcon,
  onAction,
  className = '',
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-slate-800/30 border border-slate-700/50 rounded-2xl',
    compact: 'bg-transparent',
    card: 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex flex-col items-center justify-center text-center
        ${variants[variant]}
        ${variant === 'compact' ? 'py-8 px-4' : 'py-16 px-8'}
        ${className}
      `}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6"
      >
        <Icon className="w-10 h-10 text-gray-600" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-gray-400 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-gray-500 max-w-md mb-8"
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onAction}
            icon={actionIcon}
            size="lg"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;