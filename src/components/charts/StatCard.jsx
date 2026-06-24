import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'cyan',
  change,
  changeType = 'neutral',
  subtitle,
  onClick,
  className = '',
}) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20',
    yellow: 'from-amber-500/20 to-amber-500/5 border-amber-500/20',
  };

  const iconColorMap = {
    cyan: 'text-cyan-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    emerald: 'text-emerald-500',
    red: 'text-red-500',
    yellow: 'text-amber-500',
  };

  const bgColorMap = {
    cyan: 'bg-cyan-500/10',
    blue: 'bg-blue-500/10',
    purple: 'bg-purple-500/10',
    emerald: 'bg-emerald-500/10',
    red: 'bg-red-500/10',
    yellow: 'bg-amber-500/10',
  };

  const changeConfig = {
    increase: { icon: TrendingUp, color: 'text-emerald-500' },
    decrease: { icon: TrendingDown, color: 'text-red-500' },
    neutral: { icon: Minus, color: 'text-gray-400' },
  };

  const ChangeIcon = changeConfig[changeType]?.icon || Minus;
  const changeColor = changeConfig[changeType]?.color || 'text-gray-400';

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${colorMap[color]}
        border backdrop-blur-xl
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full border-2 border-current rounded-full" />
        <div className="absolute top-2 right-2 w-24 h-24 border-2 border-current rounded-full" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${bgColorMap[color]} rounded-xl`}>
            <Icon className={`w-6 h-6 ${iconColorMap[color]}`} />
          </div>
          
          {change && (
            <div className={`flex items-center space-x-1 ${changeColor}`}>
              <ChangeIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{change}</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>

        {/* Title */}
        <p className="text-sm text-gray-400">{title}</p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;