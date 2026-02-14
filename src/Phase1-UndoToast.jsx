// ============================================================================
// UNDO TOAST - Bottom notification with progress countdown
// ============================================================================
// Spring physics entrance/exit, animated progress bar
// Design: Linear instant-delete + undo philosophy

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './Phase1-AppContext';
import { Undo2, X } from 'lucide-react';

const UndoToastContainer = () => {
  const { undoQueue } = useAppContext();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-3 px-4">
      <AnimatePresence mode="popLayout">
        {undoQueue.map((item, index) => (
          <UndoToast key={item.id} item={item} index={index} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const UndoToast = ({ item, index }) => {
  const { executeUndo, dismissUndo } = useAppContext();
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  // Countdown progress
  useEffect(() => {
    if (isHovered) return; // Pause on hover

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - item.createdAt;
      const remaining = Math.max(0, 100 - (elapsed / item.duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [item.createdAt, item.duration, isHovered]);

  // Spring physics config
  const springConfig = {
    type: 'spring',
    stiffness: 320,
    damping: 28,
    mass: 0.9
  };

  return (
    <motion.div
      className="pointer-events-auto"
      initial={{ y: 100, opacity: 0, scale: 0.95 }}
      animate={{ 
        y: 0, 
        opacity: 1, 
        scale: 1,
        transition: springConfig
      }}
      exit={{ 
        y: 20, 
        opacity: 0, 
        scale: 0.95,
        transition: { ...springConfig, stiffness: 400 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        translateY: index * -60 // Stack offset
      }}
    >
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500/20"
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>

        {/* Toast content */}
        <div className="relative backdrop-blur-xl bg-gray-900/90 dark:bg-gray-800/90 border border-white/10 rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 min-w-[320px] max-w-md">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <Undo2 className="w-5 h-5 text-indigo-400" strokeWidth={2} />
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {item.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Undo button */}
            <motion.button
              onClick={() => executeUndo(item.id)}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg transition-colors"
              whileHover={{ scale: 1.05, transition: springConfig }}
              whileTap={{ scale: 0.95, transition: { ...springConfig, stiffness: 400 } }}
            >
              Undo
            </motion.button>

            {/* Dismiss button */}
            <motion.button
              onClick={() => dismissUndo(item.id)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1, transition: springConfig }}
              whileTap={{ scale: 0.9, transition: { ...springConfig, stiffness: 400 } }}
            >
              <X className="w-4 h-4 text-gray-400" strokeWidth={2} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UndoToastContainer;
