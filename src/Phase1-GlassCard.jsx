// ============================================================================
// GLASS CARD - Premium glassmorphic container
// ============================================================================
// Spring physics hover/tap, inner glow, backdrop blur
// Design: Linear + Facebook 2024 glassmorphism

import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true, 
  tap = true,
  glow = true,
  blur = 'xl',
  onClick,
  ...props 
}) => {
  // Spring physics config - Linear standard
  const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
    mass: 1
  };

  // Hover animation - subtle lift + scale
  const hoverAnimation = hover ? {
    scale: 1.02,
    y: -2,
    transition: springConfig
  } : {};

  // Tap animation - gentle press
  const tapAnimation = tap ? {
    scale: 0.98,
    y: 1,
    transition: { ...springConfig, stiffness: 400 }
  } : {};

  // Blur intensity mapping
  const blurClass = {
    'sm': 'backdrop-blur-sm',
    'md': 'backdrop-blur-md',
    'lg': 'backdrop-blur-lg',
    'xl': 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl'
  }[blur] || 'backdrop-blur-xl';

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 dark:bg-black/30
        border border-white/8 dark:border-white/5
        ${blurClass}
        shadow-lg
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      onClick={onClick}
      {...props}
    >
      {/* Inner glow effect */}
      {glow && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
