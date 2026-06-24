import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  solid: '',
  outline: 'bg-transparent border',
  subtle: 'bg-opacity-10 border-0',
  dot: 'bg-transparent border-0',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-xs rounded-md',
  sm: 'px-2 py-0.5 text-xs rounded-lg',
  md: 'px-2.5 py-1 text-sm rounded-lg',
  lg: 'px-3 py-1.5 text-sm rounded-xl',
};

const colorMap = {
  gray: {
    solid: 'bg-slate-700 text-slate-300',
    outline: 'border-slate-600 text-slate-400',
    subtle: 'bg-slate-500/10 text-slate-400',
    dot: 'text-slate-400',
  },
  red: {
    solid: 'bg-red-500/20 text-red-400',
    outline: 'border-red-500/30 text-red-400',
    subtle: 'bg-red-500/10 text-red-400',
    dot: 'text-red-400',
  },
  orange: {
    solid: 'bg-orange-500/20 text-orange-400',
    outline: 'border-orange-500/30 text-orange-400',
    subtle: 'bg-orange-500/10 text-orange-400',
    dot: 'text-orange-400',
  },
  yellow: {
    solid: 'bg-amber-500/20 text-amber-400',
    outline: 'border-amber-500/30 text-amber-400',
    subtle: 'bg-amber-500/10 text-amber-400',
    dot: 'text-amber-400',
  },
  emerald: {
    solid: 'bg-emerald-500/20 text-emerald-400',
    outline: 'border-emerald-500/30 text-emerald-400',
    subtle: 'bg-emerald-500/10 text-emerald-400',
    dot: 'text-emerald-400',
  },
  cyan: {
    solid: 'bg-cyan-500/20 text-cyan-400',
    outline: 'border-cyan-500/30 text-cyan-400',
    subtle: 'bg-cyan-500/10 text-cyan-400',
    dot: 'text-cyan-400',
  },
  blue: {
    solid: 'bg-blue-500/20 text-blue-400',
    outline: 'border-blue-500/30 text-blue-400',
    subtle: 'bg-blue-500/10 text-blue-400',
    dot: 'text-blue-400',
  },
  purple: {
    solid: 'bg-purple-500/20 text-purple-400',
    outline: 'border-purple-500/30 text-purple-400',
    subtle: 'bg-purple-500/10 text-purple-400',
    dot: 'text-purple-400',
  },
  pink: {
    solid: 'bg-pink-500/20 text-pink-400',
    outline: 'border-pink-500/30 text-pink-400',
    subtle: 'bg-pink-500/10 text-pink-400',
    dot: 'text-pink-400',
  },
};

const Badge = ({
  children,
  color = 'gray',
  variant = 'solid',
  size = 'sm',
  icon: Icon,
  iconPosition = 'left',
  dot = false,
  pulse = false,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const colorStyle = colorMap[color]?.[variant] || colorMap.gray.solid;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        inline-flex items-center gap-1.5 font-medium whitespace-nowrap
        ${variants[variant]}
        ${sizes[size]}
        ${colorStyle}
        ${className}
      `}
      {...props}
    >
      {/* Dot indicator */}
      {(dot || variant === 'dot') && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorStyle.split(' ').find(c => c.startsWith('bg-'))}`}>
          </span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${colorStyle.split(' ').find(c => c.startsWith('bg-'))}`}>
          </span>
        </span>
      )}

      {/* Pulse animation */}
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}

      {/* Left Icon */}
      {Icon && iconPosition === 'left' && (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      )}

      {/* Content */}
      <span>{children}</span>

      {/* Right Icon */}
      {Icon && iconPosition === 'right' && (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      )}

      {/* Remove Button */}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 p-0.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.span>
  );
};

// Status Badge Preset
export const StatusBadge = ({ status, ...props }) => {
  const statusConfig = {
    submitted: { color: 'blue', label: 'Submitted' },
    under_review: { color: 'yellow', label: 'Under Review' },
    evidence_verification: { color: 'purple', label: 'Evidence Check' },
    investigation: { color: 'cyan', label: 'Investigating' },
    escalated: { color: 'red', label: 'Escalated' },
    resolved: { color: 'emerald', label: 'Resolved' },
    closed: { color: 'gray', label: 'Closed' },
  };

  const config = statusConfig[status] || { color: 'gray', label: status };
  
  return (
    <Badge color={config.color} variant="dot" {...props}>
      {config.label}
    </Badge>
  );
};

// Risk Badge Preset
export const RiskBadge = ({ level, ...props }) => {
  const riskConfig = {
    low: { color: 'emerald', label: 'Low Risk' },
    medium: { color: 'yellow', label: 'Medium Risk' },
    high: { color: 'orange', label: 'High Risk', pulse: true },
    critical: { color: 'red', label: 'Critical Risk', pulse: true },
  };

  const config = riskConfig[level] || { color: 'gray', label: level };
  
  return (
    <Badge color={config.color} variant="subtle" pulse={config.pulse} {...props}>
      {config.label}
    </Badge>
  );
};

export default Badge;