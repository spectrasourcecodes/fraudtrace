import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'p-6',
  variant = 'default',
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-800/50 backdrop-blur-xl border border-slate-700/50',
    elevated: 'bg-slate-800/80 backdrop-blur-xl border border-slate-700 shadow-xl',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    glow: 'bg-slate-800/50 backdrop-blur-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10',
    dark: 'bg-slate-900/80 backdrop-blur-xl border border-slate-800',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={onClick}
      className={`
        rounded-2xl ${padding}
        ${variants[variant]}
        ${hover ? 'cursor-pointer hover:shadow-2xl transition-shadow duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;