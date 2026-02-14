import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, useSpring, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Activity, Flame, Droplets, Moon, Heart, Apple, 
  Dumbbell, TrendingUp, User, Users, Sparkles,
  Check, X, Undo2, ChevronRight, Plus, Minus
} from 'lucide-react';

// ============================================================================
// CONSTANTS & CONFIG
// ============================================================================

const SPRING_CONFIG = {
  default: { stiffness: 300, damping: 28, mass: 1 },
  snappy: { stiffness: 340, damping: 26, mass: 0.8 },
  gentle: { stiffness: 280, damping: 34, mass: 1.2 },
  bouncy: { stiffness: 300, damping: 20, mass: 0.9 }
};

const METRIC_TYPES = {
  weight: { 
    icon: Activity, 
    label: 'Weight', 
    unit: 'lbs',
    color: 'from-indigo-500 to-purple-600',
    glowColor: 'rgba(99, 102, 241, 0.3)',
    min: 50,
    max: 400,
    step: 0.5
  },
  calories: { 
    icon: Flame, 
    label: 'Calories', 
    unit: 'kcal',
    color: 'from-orange-500 to-red-600',
    glowColor: 'rgba(249, 115, 22, 0.3)',
    min: 0,
    max: 5000,
    step: 50
  },
  water: { 
    icon: Droplets, 
    label: 'Water', 
    unit: 'glasses',
    color: 'from-blue-500 to-cyan-600',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    min: 0,
    max: 20,
    step: 1
  },
  sleep: { 
    icon: Moon, 
    label: 'Sleep', 
    unit: 'hours',
    color: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    min: 0,
    max: 12,
    step: 0.5
  }
};

// ============================================================================
// RIPPLE EFFECT - Physical feedback
// ============================================================================

const Ripple = memo(({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 2.5, opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 100,
        height: 100,
        marginLeft: -50,
        marginTop: -50,
        borderRadius: '50%',
        border: '2px solid rgba(99, 102, 241, 0.4)',
        pointerEvents: 'none'
      }}
    />
  );
});

Ripple.displayName = 'Ripple';

// ============================================================================
// LIQUID SLIDER - Tactile value adjustment
// ============================================================================

const LiquidSlider = memo(({ 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  color = "from-indigo-500 to-purple-600",
  unit = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);
  const percentage = ((value - min) / (max - min)) * 100;

  // Motion values
  const thumbScale = useSpring(1, SPRING_CONFIG.snappy);
  const liquidHeight = useSpring(percentage, SPRING_CONFIG.gentle);

  useEffect(() => {
    thumbScale.set(isDragging ? 1.2 : 1);
    liquidHeight.set(percentage);
  }, [isDragging, percentage, thumbScale, liquidHeight]);

  const handleInteraction = useCallback((clientX) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = min + ((percent / 100) * (max - min));
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(steppedValue);
  }, [min, max, step, onChange]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    handleInteraction(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleInteraction(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="relative w-full h-12">
      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="relative w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer overflow-hidden"
      >
        {/* Liquid fill */}
        <motion.div
          style={{ width: useTransform(liquidHeight, v => `${v}%`) }}
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${color} rounded-full`}
        >
          {/* Wave effect */}
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [-2, 2, -2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute right-0 top-0 w-20 h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
            }}
          />
        </motion.div>

        {/* Thumb */}
        <motion.div
          style={{ 
            left: `${percentage}%`,
            scale: thumbScale
          }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full shadow-xl border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center"
        >
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color}`} />
        </motion.div>
      </div>

      {/* Value display */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
        {value.toFixed(step < 1 ? 1 : 0)} {unit}
      </div>
    </div>
  );
});

LiquidSlider.displayName = 'LiquidSlider';

// ============================================================================
// ENHANCED BENTO TILE - With slider mode
// ============================================================================

const EnhancedBentoTile = memo(({ 
  type, 
  value, 
  onChange, 
  onCommit,
  isDirty = false,
  mode = 'input' // 'input' or 'slider'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inputMode, setInputMode] = useState(mode);
  const [ripples, setRipples] = useState([]);

  const config = METRIC_TYPES[type];
  const Icon = config.icon;

  // Springs
  const scale = useSpring(1, SPRING_CONFIG.snappy);
  const y = useSpring(0, SPRING_CONFIG.snappy);
  const borderProgress = useSpring(0, SPRING_CONFIG.default);

  useEffect(() => {
    scale.set(isPressed ? 0.96 : isHovered ? 1.02 : 1);
    y.set(isPressed ? 2 : isHovered ? -4 : 0);
  }, [isHovered, isPressed]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y }]);
  };

  const removeRipple = (id) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  };

  const handleCommit = () => {
    onCommit(localValue);
    borderProgress.set(1);
    setShowSuccess(true);
    
    // Enhanced confetti
    confetti({
      particleCount: 12,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899'],
      disableForReducedMotion: true,
      gravity: 1.2,
      ticks: 100
    });

    setTimeout(() => {
      borderProgress.set(0);
      setShowSuccess(false);
    }, 1200);
  };

  const incrementValue = () => {
    const newValue = Math.min(config.max, parseFloat(localValue) + config.step);
    setLocalValue(newValue.toString());
    onChange(newValue.toString());
  };

  const decrementValue = () => {
    const newValue = Math.max(config.min, parseFloat(localValue) - config.step);
    setLocalValue(newValue.toString());
    onChange(newValue.toString());
  };

  const borderPathLength = useTransform(borderProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      style={{ scale, y }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      className="relative group"
    >
      {/* Glassmorphism card */}
      <div 
        className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/8 dark:bg-black/40 border border-slate-200/20 dark:border-slate-700/30 shadow-xl"
        onClick={addRipple}
      >
        {/* Radial glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${config.glowColor}, transparent 70%)`
          }}
        />

        {/* Ripples */}
        {ripples.map(ripple => (
          <Ripple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${config.color}`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {config.label}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {isDirty && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInputMode(inputMode === 'input' ? 'slider' : 'input');
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <TrendingUp className="w-4 h-4 text-slate-500" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Input/Slider modes */}
          {inputMode === 'input' ? (
            <>
              <div className="relative">
                <div className="flex items-center gap-2">
                  <button
                    onClick={decrementValue}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={2} />
                  </button>
                  
                  <input
                    type="number"
                    value={localValue}
                    onChange={(e) => {
                      setLocalValue(e.target.value);
                      onChange(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCommit();
                    }}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    className="flex-1 text-3xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-center"
                    placeholder="0"
                  />
                  
                  <button
                    onClick={incrementValue}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={2} />
                  </button>
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
                  {config.unit}
                </div>
              </div>
            </>
          ) : (
            <div className="pt-6 pb-2">
              <LiquidSlider
                value={parseFloat(localValue) || 0}
                onChange={(v) => {
                  setLocalValue(v.toString());
                  onChange(v.toString());
                }}
                min={config.min}
                max={config.max}
                step={config.step}
                color={config.color}
                unit={config.unit}
              />
            </div>
          )}

          {/* Commit button */}
          {isDirty && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleCommit}
              className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${config.color} text-white font-medium shadow-lg hover:shadow-xl transition-shadow`}
            >
              Log {config.label}
            </motion.button>
          )}
        </div>

        {/* Success border animation */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="24"
            stroke="url(#successGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            style={{
              strokeDashoffset: useTransform(borderPathLength, [0, 1], [1000, 0])
            }}
          />
          <defs>
            <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Success checkmark */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", ...SPRING_CONFIG.snappy }}
              className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

EnhancedBentoTile.displayName = 'EnhancedBentoTile';

export { EnhancedBentoTile, LiquidSlider, Ripple, METRIC_TYPES, SPRING_CONFIG };
