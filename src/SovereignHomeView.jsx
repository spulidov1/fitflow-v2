import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Activity, Flame, Droplets, Moon, Heart, Apple,
  Dumbbell, TrendingUp, User, Users, Sparkles,
  Check, X, Undo2, ChevronRight, Plus, Minus, Wifi, WifiOff
} from 'lucide-react';

import { weightService, calorieService, wellnessService } from './services/data.service';
import { METRIC_TYPES, SPRING_CONFIG } from './App-Phase2-Components';

import ScrollPicker from './components/ScrollPicker';
import EnhancedCalorieInput from './components/EnhancedCalorieInput';
import MiniDashboard from './components/MiniDashboard';
import FitFlowRunner from './components/FitFlowRunner';
// ============================================================================
// TACTILE RIPPLE - Radial gradient ripple
// ============================================================================

const TactileRipple = memo(({ x, y, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 300);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.6 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 120,
        height: 120,
        marginLeft: -60,
        marginTop: -60,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
        pointerEvents: 'none'
      }}
    />
  );
});

TactileRipple.displayName = 'TactileRipple';

// ============================================================================
// GHOST INPUT - Faded predictive suggestion
// ============================================================================

const GhostInput = memo(({ suggestion, onAccept, type }) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef(null);

  const handlePressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      onAccept(suggestion);
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  };

  if (!suggestion) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      className="w-full text-left px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-3 h-3 text-purple-500" strokeWidth={2} />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Suggested: <span className="font-medium text-slate-700 dark:text-slate-300">{suggestion}</span>
        </span>
        <span className="ml-auto text-xs text-slate-400">long-press</span>
      </div>
    </motion.button>
  );
});

GhostInput.displayName = 'GhostInput';

// ============================================================================
// AUTO-COMMIT TIMER - 3s with progress arc
// ============================================================================

const AutoCommitTimer = memo(({ duration = 3000, onComplete, onCancel }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        onComplete();
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className="absolute top-2 right-2">
      <svg width="32" height="32" className="transform -rotate-90">
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-slate-300 dark:text-slate-600"
        />
        <motion.circle
          cx="16"
          cy="16"
          r="14"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 14}
          strokeDashoffset={2 * Math.PI * 14 * (1 - progress / 100)}
          className="text-indigo-500"
        />
      </svg>
      <button
        onClick={onCancel}
        className="absolute inset-0 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        aria-label="Cancel auto-commit"
      >
        <X className="w-3 h-3" strokeWidth={2} />
      </button>
    </div>
  );
});

AutoCommitTimer.displayName = 'AutoCommitTimer';

// ============================================================================
// ENHANCED BENTO TILE - With all features
// ============================================================================

const EnhancedBentoTile = memo(({ 
  type, 
  value, 
  onChange, 
  onCommit,
  isDirty = false,
  ghostSuggestion = null,
  autoCommit = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [showAutoCommit, setShowAutoCommit] = useState(false);

  const config = METRIC_TYPES[type];
  const Icon = config.icon;

  // Springs
  const scale = useSpring(1, SPRING_CONFIG.snappy);
  const y = useSpring(0, SPRING_CONFIG.snappy);
  const borderProgress = useSpring(0, SPRING_CONFIG.default);

useEffect(() => {
    // Reduced motion: smaller scale changes and less vertical movement
    scale.set(isPressed ? 0.98 : isHovered ? 1.005 : showSuccess ? 1.02 : 1);
    y.set(isPressed ? 1 : isHovered ? -2 : showSuccess ? -4 : 0);
  }, [isHovered, isPressed, showSuccess]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Auto-commit logic
  useEffect(() => {
    if (autoCommit && isDirty) {
      setShowAutoCommit(true);
    } else {
      setShowAutoCommit(false);
    }
  }, [autoCommit, isDirty]);

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
    
    // Enhanced confetti - 5 particles
    confetti({
      particleCount: 5,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7'],
      disableForReducedMotion: true,
      gravity: 1.2,
      ticks: 80,
      scalar: 0.8
    });

    setTimeout(() => {
      borderProgress.set(0);
      setShowSuccess(false);
    }, 1200);
  };

  const handleAutoCommit = () => {
    setShowAutoCommit(false);
    handleCommit();
  };

  const handleCancelAutoCommit = () => {
    setShowAutoCommit(false);
  };

  const handleGhostAccept = (suggestion) => {
    setLocalValue(suggestion);
    onChange(suggestion);
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

        {/* Tactile ripples */}
        {ripples.map(ripple => (
          <TactileRipple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            onComplete={() => removeRipple(ripple.id)}
          />
        ))}

        {/* Auto-commit timer */}
        {showAutoCommit && (
          <AutoCommitTimer
            duration={3000}
            onComplete={handleAutoCommit}
            onCancel={handleCancelAutoCommit}
          />
        )}

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
            
            {isDirty && !showAutoCommit && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-indigo-500 rounded-full"
              />
            )}
          </div>

          {/* Ghost Input */}
          {ghostSuggestion && !isDirty && (
            <GhostInput
              suggestion={ghostSuggestion}
              onAccept={handleGhostAccept}
              type={type}
            />
          )}

          {/* Input */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={decrementValue}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors touch-target"
                aria-label={`Decrease ${config.label}`}
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
                className="flex-1 text-3xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-center focus-ring"
                placeholder="0"
                aria-label={`${config.label} input`}
              />
              
              <button
                onClick={incrementValue}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors touch-target"
                aria-label={`Increase ${config.label}`}
              >
                <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={2} />
              </button>
            </div>
            
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
              {config.unit}
            </div>
          </div>

          {/* Commit button */}
          {isDirty && !showAutoCommit && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleCommit}
              className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${config.color} text-white font-medium shadow-lg hover:shadow-xl transition-shadow touch-target`}
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

        {/* Success checkmark with lift */}
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

// ============================================================================
// OFFLINE TOAST - "Saved locally"
// ============================================================================

const OfflineToast = memo(({ isOnline }) => {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="backdrop-blur-xl bg-amber-500/90 rounded-2xl shadow-2xl px-4 py-2 flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-white" strokeWidth={2} />
        <span className="text-sm text-white font-medium">
          Offline • Saved locally
        </span>
      </div>
    </motion.div>
  );
});

OfflineToast.displayName = 'OfflineToast';

// ============================================================================
// INTERACTIVE RING - Enhanced
// ============================================================================

const InteractiveRing = memo(({ 
  size = 240, 
  progress = 0.65, 
  label = "Today",
  value = "2,150",
  unit = "kcal",
  target = "2,500",
  onClick,
  showMood = false,       
  moodEmoji = null,        
  moodType = null
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  const scale = useSpring(1, SPRING_CONFIG.default);
  const ringOpacity = useSpring(0.2, SPRING_CONFIG.gentle);
  const glowIntensity = useSpring(0, SPRING_CONFIG.gentle);

  useEffect(() => {
    // Reduced motion: subtle hover scale
    scale.set(isHovered ? 1.02 : isTapped ? 0.98 : 1);
    ringOpacity.set(isHovered ? 0.4 : 0.2);
    glowIntensity.set(isHovered ? 0.6 : 0);
  }, [isHovered, isTapped]);

  const handleTap = () => {
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 150);
    onClick?.();
  };

  return (
    <motion.div
      style={{ scale }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTap={handleTap}
      className="relative cursor-pointer select-none"
    >
      <motion.div
        style={{ opacity: glowIntensity }}
        className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-br from-indigo-500 to-purple-600"
      />

      <div className="relative" style={{ width: size, height: size }}/>
        <svg width={size} height={size} className="transform -rotate-90">
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-slate-200 dark:text-slate-700"
            style={{ opacity: ringOpacity }}
          />
          
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          />
          
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" />
            </linearGradient>
          </defs>
        </svg>

       <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            {showMood && moodEmoji ? (
              <>
                <div className="text-6xl mb-2">
                  {moodEmoji}
                </div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {moodType}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  Latest Mood
                </div>
              </>
            ) : (
              <>
               <div className="flex flex-col items-center justify-center">
  <div className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
    {value}
  </div>
  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
    of {target} {unit}
  </div>
</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  of {target} {unit}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
                  {label}
                </div>
              </>
            )}
          </motion.div> 
        </div>

      <AnimatePresence>
        {isTapped && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 rounded-full border-2 border-indigo-500"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

InteractiveRing.displayName = 'InteractiveRing';

// ============================================================================
// GHOST INTELLIGENCE - Dynamic with AI
// ============================================================================

const GhostIntelligence = memo(({ insights = [], isLoading = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const primaryInsight = insights[0] || {
    text: "You're doing great. Keep up the momentum.",
    reasoning: "Based on your consistent logging pattern."
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full"
    >
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left">
        <div className="backdrop-blur-xl bg-white/6 dark:bg-black/35 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6 hover:bg-white/10 dark:hover:bg-black/45 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    {primaryInsight.text}
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-slate-500 dark:text-slate-400 mt-2"
                      >
                        {primaryInsight.reasoning}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <ChevronRight 
              className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              strokeWidth={2}
            />
          </div>
        </div>
      </button>
    </motion.div>
  );
});

GhostIntelligence.displayName = 'GhostIntelligence';

// ============================================================================
// FAMILY PULSE - Breathing avatars (scale 1.0 → 1.05)
// ============================================================================

const FamilyPulse = memo(({ members = [] }) => {
  if (members.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="w-full"
    >
      <div className="backdrop-blur-xl bg-white/6 dark:bg-black/35 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2} />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Family Momentum
          </span>
        </div>

        <div className="flex items-center gap-3">
          {members.slice(0, 4).map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: 0.6 + (i * 0.1), 
                type: "spring", 
                ...SPRING_CONFIG.gentle 
              }}
              className="relative"
            >
              {/* Breathing animation - scale 1.0 → 1.05 */}
              <motion.div
                animate={{ 
                  // Reduced breathing animation
                  scale: [1.0, 1.02, 1.0],
                  opacity: [0.3, 0.4, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-indigo-500 blur-md"
              />
              
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-lg">
                {member.initials}
              </div>
            </motion.div>
          ))}

          {members.length > 4 && (
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs font-medium">
              +{members.length - 4}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Everyone's staying consistent this week 💪
        </div>
      </div>
    </motion.div>
  );
});

FamilyPulse.displayName = 'FamilyPulse';

// ============================================================================
// UNDO TOAST
// ============================================================================

const UndoToast = memo(({ message, onUndo, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          onDismiss();
          return 0;
        }
        return prev - 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", ...SPRING_CONFIG.default }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      role="status"
      aria-live="polite"
    >
      <div className="backdrop-blur-xl bg-slate-900/90 dark:bg-slate-800/90 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden min-w-[320px]">
        <div className="h-1 bg-slate-700">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: "100%" }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 flex items-center gap-4">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" strokeWidth={2} />
          <span className="flex-1 text-sm text-white font-medium">
            {message}
          </span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white font-medium transition-colors touch-target"
            aria-label="Undo action"
          >
            <Undo2 className="w-4 h-4" strokeWidth={2} />
            Undo
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors touch-target"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

UndoToast.displayName = 'UndoToast';

// ============================================================================
// SOVEREIGN HOME VIEW - Enhanced with all features
// ============================================================================

const SovereignHomeView = ({ 
  user, 
  profile,
  weightHistory = [],
  calorieHistory = [],
  wellnessHistory = [],
  moodEntries = [],      // ← NEW: for mood ring
  darkMode,              // ← NEW: dark mode state
  setDarkMode,           // ← NEW: dark mode setter
  onNavigate
}) => {
  const [metrics, setMetrics] = useState({
    weight: '185',
    calories: '2150',
    water: '6',
    sleep: '7.5'
  });

  const [dirtyMetrics, setDirtyMetrics] = useState(new Set());
  const [undoStack, setUndoStack] = useState([]);
  const [showUndo, setShowUndo] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [ghostSuggestions, setGhostSuggestions] = useState({});

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateGhostSuggestions = () => {
    const recentWeight = weightHistory.slice(-7).map(w => parseFloat(w.weight));
    const recentCalories = calorieHistory.slice(-7).map(c => parseFloat(c.calories));
    const recentWater = wellnessHistory.slice(-7).map(w => parseFloat(w.water_glasses));
    const recentSleep = wellnessHistory.slice(-7).map(w => parseFloat(w.sleep_hours));

    const avgWeight = recentWeight.length
      ? (recentWeight.reduce((a, b) => a + b, 0) / recentWeight.length).toFixed(1)
      : null;

    const avgCalories = recentCalories.length
      ? Math.round(recentCalories.reduce((a, b) => a + b, 0) / recentCalories.length)
      : null;

    const avgWater = recentWater.length
      ? Math.round(recentWater.reduce((a, b) => a + b, 0) / recentWater.length)
      : null;

    const avgSleep = recentSleep.length
      ? (recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length).toFixed(1)
      : null;

    setGhostSuggestions({
      weight: avgWeight,
      calories: avgCalories,
      water: avgWater,
      sleep: avgSleep
    });
  };

  // Get today's data from history + refresh ghost suggestions
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    const todayWeight = weightHistory.find(w => w.entry_date === today);
    const todayCalories = calorieHistory.find(c => c.entry_date === today);
    const todayWellness = wellnessHistory.find(w => w.entry_date === today);

    setMetrics({
      weight: (todayWeight?.weight ?? profile?.current_weight ?? '185').toString(),
      calories: (todayCalories?.calories ?? profile?.daily_calorie_goal ?? '2150').toString(),
      water: (todayWellness?.water_glasses ?? '6').toString(),
      sleep: (todayWellness?.sleep_hours ?? '7.5').toString(),
    });

    generateGhostSuggestions();
  }, [weightHistory, calorieHistory, wellnessHistory, profile]);

  const handleMetricChange = (type, value) => {
    setMetrics(prev => ({ ...prev, [type]: value }));
    setDirtyMetrics(prev => new Set(prev).add(type));
  };

  const handleCommit = async (type, value) => {
    const previousValue = metrics[type];

    setUndoStack([{ type, previousValue, timestamp: Date.now() }]);

    setDirtyMetrics(prev => {
      const next = new Set(prev);
      next.delete(type);
      return next;
    });

    setShowUndo(true);

    const date = new Date().toISOString().split('T')[0];

    try {
      if (!user?.id) throw new Error('Missing user id');

      console.log(`[Saving] ${type}: ${value}`, isOnline ? 'online' : 'offline');

      if (type === 'weight') {
        await weightService.addWeightEntry(user.id, value, date);
      } else if (type === 'calories') {
       const hour = new Date().getHours();
  const mealType = 
    hour >= 5 && hour < 11 ? 'breakfast' :
    hour >= 11 && hour < 15 ? 'lunch' :
    hour >= 15 && hour < 20 ? 'dinner' :
    'snack';
  
        await calorieService.addCalorieEntry(user.id, value, date, mealType);
      } else if (type === 'water') {
        await wellnessService.addWellnessEntry(user.id, metrics.sleep, value, date);
      } else if (type === 'sleep') {
        await wellnessService.addWellnessEntry(user.id, value, metrics.water, date);
      }

      console.log(`[Saved] ${type}: ${value}`);
    } catch (err) {
      console.error('Commit failed:', err);
      setDirtyMetrics(prev => new Set(prev).add(type));
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      setMetrics(prev => ({ ...prev, [lastAction.type]: lastAction.previousValue }));
      setUndoStack([]);
      setShowUndo(false);
    }
  };

 
  const mockFamilyMembers = [
    { id: 1, initials: 'JD', name: 'John' },
    { id: 2, initials: 'SM', name: 'Sarah' },
    { id: 3, initials: 'EW', name: 'Emma' }
  ];

  const mockInsights = [
  {
    text: "You're on track for your weekly goal. Great consistency!",
    reasoning:
      "You've logged 6 out of 7 days this week, maintaining 95% adherence to your calorie target. Your water intake has improved by 30% compared to last week."
  }
];

// Calculate weight loss (FIXED)
const weightLost = profile?.start_weight && metrics.weight
  ? (parseFloat(profile.start_weight) - parseFloat(metrics.weight)).toFixed(1)
  : '0.0';

// How much you STILL NEED to lose (current to target)
const weightToLose = metrics.weight && profile?.target_weight
  ? (parseFloat(metrics.weight) - parseFloat(profile.target_weight)).toFixed(1)
  : null;

// Total goal (start to target)
const totalWeightGoal = profile?.start_weight && profile?.target_weight
  ? (parseFloat(profile.start_weight) - parseFloat(profile.target_weight)).toFixed(1)
  : null;

// Progress percentage (what you lost / total goal)
const progressPercent = weightLost && totalWeightGoal && parseFloat(totalWeightGoal) > 0
  ? ((parseFloat(weightLost) / parseFloat(totalWeightGoal)) * 100).toFixed(0)
  : '0';

// Mood data
const latestMood = moodEntries.length > 0 
  ? moodEntries[moodEntries.length - 1]
  : null;

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  anxious: '😰',
  calm: '😌',
  neutral: '😐',
  angry: '😠',
  tired: '😴',
  energetic: '⚡'
};

const showMoodRing = latestMood !== null;
const moodEmoji = latestMood ? moodEmojis[latestMood.mood_type] : null;

// Time-based greeting
const timeOfDay = new Date().getHours();
const greeting = timeOfDay < 12 ? 'morning' : timeOfDay < 18 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-8 pb-12">
      {/* Offline indicator */}
      <AnimatePresence>
        <OfflineToast isOnline={isOnline} />
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
       
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Good {greeting}
        </h1>
        
        {/* ↓ ADD DARK MODE TOGGLE ↓ */}
        {setDarkMode && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setDarkMode(!darkMode)}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            <div className="flex items-center gap-2">
              {darkMode ? (
                <>
                  <span className="text-xl">☀️</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Light Mode</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🌙</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                </>
              )}
            </div>
          </motion.button>
        )}
    
        <p className="text-slate-600 dark:text-slate-400">
          Your daily ritual, simplified
        </p>
      </motion.div>

      {/* Interactive Rings */}
      <MiniDashboard
  calories={metrics.calories}
  calorieGoal={profile?.daily_calorie_goal || 2500}
  water={metrics.water}
  sleep={metrics.sleep}
  weightLost={weightLost}
  progressPercent={progressPercent}
  weightToLose={weightToLose}
/>

      
      {/* FitFlow Runner Animation */}
      <FitFlowRunner />


      {/* Ghost Intelligence */}
      <GhostIntelligence insights={mockInsights} />

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Clean Input Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Weight - Scroll Picker */}
  <div className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6">
    <ScrollPicker
  value={metrics.weight}
  onChange={(v) => handleMetricChange('weight', v)}
  min={Math.max(50, parseFloat(metrics.weight) - 50)}
  max={Math.min(400, parseFloat(metrics.weight) + 50)}
  step={0.50}
  unit="lbs"
  color="from-indigo-500 to-purple-600"
  glowColor="rgba(99, 102, 241, 0.3)"
  label="Weight"
/>
    {dirtyMetrics.has('weight') && (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => handleCommit('weight', metrics.weight)}
        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Log Weight
      </motion.button>
    )}
  </div>

  {/* Calories - Enhanced Input */}
  <div className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6">
    <EnhancedCalorieInput
      value={metrics.calories}
      onChange={(v) => handleMetricChange('calories', v)}
      onCommit={(v) => handleCommit('calories', v)}
      isDirty={dirtyMetrics.has('calories')}
      autoCommit={true}
    />
  </div>

  {/* Water - Scroll Picker */}
  <div className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6">
    <ScrollPicker
      value={metrics.water}
      onChange={(v) => handleMetricChange('water', v)}
      min={0}
      max={20}
      step={1}
      unit="glasses"
      color="from-blue-500 to-cyan-600"
      glowColor="rgba(59, 130, 246, 0.3)"
      label="Water"
    />
    {dirtyMetrics.has('water') && (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => handleCommit('water', metrics.water)}
        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Log Water
      </motion.button>
    )}
  </div>

  {/* Sleep - Scroll Picker */}
  <div className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6">
    <ScrollPicker
      value={metrics.sleep}
      onChange={(v) => handleMetricChange('sleep', v)}
      min={0}
      max={12}
      step={0.5}
      unit="hours"
      color="from-purple-500 to-pink-600"
      glowColor="rgba(168, 85, 247, 0.3)"
      label="Sleep"
    />
    {dirtyMetrics.has('sleep') && (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => handleCommit('sleep', metrics.sleep)}
        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        Log Sleep
      </motion.button>
    )}
  </div>
</div>

      </div>
        {/* Family Pulse - Disabled for now */}
      {/* <FamilyPulse members={mockFamilyMembers} /> */}

      {/* Undo Toast */}
      <AnimatePresence>
        {showUndo && undoStack.length > 0 && (
          <UndoToast
            message={`${METRIC_TYPES[undoStack[0].type].label} logged successfully`}
            onUndo={handleUndo}
            onDismiss={() => setShowUndo(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SovereignHomeView;