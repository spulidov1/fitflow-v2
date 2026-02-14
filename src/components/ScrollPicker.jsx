import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const ScrollPicker = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  unit = '',
  color = 'from-indigo-500 to-purple-600',
  glowColor = 'rgba(99, 102, 241, 0.3)',
  label = 'Value'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const constraintsRef = useRef(null);
  const y = useMotionValue(0);
  
  // Calculate item height
  const itemHeight = 48;
  const visibleItems = 5;
  const centerIndex = Math.floor(visibleItems / 2);
  
  // Generate values array
  const values = [];
  for (let i = min; i <= max; i += step) {
    values.push(Number(i.toFixed(2)));
  }
  
  // Find current value index
  const currentIndex = values.findIndex(v => v === parseFloat(value));
  const initialY = -currentIndex * itemHeight + centerIndex * itemHeight;
  
  useEffect(() => {
    y.set(initialY);
  }, []);
  
  // Snap to nearest value on drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    const currentY = y.get();
    const index = Math.round(-currentY / itemHeight + centerIndex);
    const clampedIndex = Math.max(0, Math.min(values.length - 1, index));
    const snappedY = -clampedIndex * itemHeight + centerIndex * itemHeight;
    
    animate(y, snappedY, {
      type: 'spring',
      stiffness: 400,  // Increased from 300 - faster snap
      damping: 25      // Decreased from 30 - less resistance
    });
    
    onChange(values[clampedIndex].toString());
  };
  
  return (
    <div className="relative w-full">
      {/* Label */}
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        {label}
      </div>
      
      {/* Picker Container */}
      <div 
        ref={constraintsRef}
        className="relative h-60 overflow-hidden rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50"
      >
        {/* Selection highlight (center) */}
        <div 
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${color.replace('from-', '').replace(' to-', ', ')})`,
            opacity: 0.15,
            borderRadius: '12px',
            boxShadow: `0 0 20px ${glowColor}`
          }}
        />
        
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-100/80 dark:from-slate-800/80 to-transparent pointer-events-none z-10" />
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-100/80 dark:from-slate-800/80 to-transparent pointer-events-none z-10" />
        
        {/* Scrollable values */}
        <motion.div
          drag="y"
          dragConstraints={{ top: -1000, bottom: 1000 }}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ y }}
          className="relative py-24"
        >
          {values.map((val, index) => {
            const offset = useTransform(
              y,
              (latest) => {
                const centerY = -index * itemHeight + centerIndex * itemHeight;
                const distance = Math.abs(latest - centerY);
                return distance;
              }
            );
            
            const opacity = useTransform(
              offset,
              [0, itemHeight, itemHeight * 2],
              [1, 0.5, 0.2]
            );
            
            const scale = useTransform(
              offset,
              [0, itemHeight, itemHeight * 2],
              [1.1, 0.9, 0.7]
            );
            
            return (
              <motion.div
                key={`${val}-${index}`}
                style={{ 
                  opacity,
                  scale,
                  height: itemHeight
                }}
                className="flex items-center justify-center text-2xl font-bold transition-colors"
              >
                <span 
                  className={
                    parseFloat(value) === val && !isDragging
                      ? `bg-gradient-to-r ${color} bg-clip-text text-transparent`
                      : 'text-slate-600 dark:text-slate-400'
                  }
                >
                  {val.toFixed(step < 1 ? 2 : step === 0.5 ? 1 : 0)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Unit label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          {unit}
        </div>
      </div>
    </div>
  );
};

export default ScrollPicker;
