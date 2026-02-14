import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Check } from 'lucide-react';

const EnhancedCalorieInput = ({ 
  value, 
  onChange, 
  onCommit,
  isDirty = false,
  autoCommit = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAutoCommit, setShowAutoCommit] = useState(false);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoCommit && isDirty && localValue) {
      setShowAutoCommit(true);
    } else {
      setShowAutoCommit(false);
    }
  }, [autoCommit, isDirty, localValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleCommit = () => {
    if (!localValue || localValue === '0') return;
    
    onCommit(localValue);
    setShowSuccess(true);
    setShowAutoCommit(false);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 1500);
  };

  const handleAutoCommit = () => {
    setShowAutoCommit(false);
    handleCommit();
  };

  const handleCancelAutoCommit = () => {
    setShowAutoCommit(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommit();
    }
  };

  // Determine color state
  const hasValue = localValue && localValue !== '0';
  const isActive = isFocused || hasValue;

  return (
    <div className="relative w-full">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 transition-all ${
          isActive ? 'scale-110 shadow-lg' : ''
        }`}>
          <Flame className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Calories
        </span>
      </div>

      {/* Input Container */}
      <div className="relative">
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
          }}
          className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
            hasValue && !isFocused
              ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-lg shadow-orange-500/30'
              : 'bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-xl'
          } border-2 ${
            isFocused
              ? 'border-orange-500 shadow-lg shadow-orange-500/30'
              : isDirty && !hasValue
              ? 'border-orange-400'
              : 'border-slate-200/50 dark:border-slate-700/50'
          }`}
        >
          {/* Glow effect when focused */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-20"
              animate={{
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}

          {/* Input */}
          <input
            type="number"
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="0"
            className={`relative w-full px-6 py-4 text-3xl font-bold text-center bg-transparent border-none outline-none transition-colors ${
              hasValue && !isFocused
                ? 'text-white placeholder-white/50'
                : 'text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600'
            }`}
          />

          {/* Unit label */}
          <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium transition-colors ${
            hasValue && !isFocused
              ? 'text-white/80'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            kcal
          </div>

          {/* Auto-commit timer */}
          {showAutoCommit && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2"
            >
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-white/30"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    className="text-white"
                    initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 3, ease: "linear" }}
                    style={{
                      strokeDasharray: 2 * Math.PI * 14
                    }}
                    onAnimationComplete={handleAutoCommit}
                  />
                </svg>
                <button
                  onClick={handleCancelAutoCommit}
                  className="absolute inset-0 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}

          {/* Success checkmark */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-2xl"
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Log Button */}
        {isDirty && !showAutoCommit && hasValue && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleCommit}
            className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            Log Calories
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default EnhancedCalorieInput;
