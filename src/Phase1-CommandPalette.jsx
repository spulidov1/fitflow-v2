// ============================================================================
// COMMAND PALETTE - Command+K quick actions
// ============================================================================
// Fuzzy search, keyboard navigation, spring animations
// Design: Linear/Raycast command system

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from './Phase1-AppContext';
import { 
  Search, 
  Home, 
  BarChart3, 
  Scale, 
  Apple,
  Heart,
  Camera,
  Smile,
  Dumbbell,
  Settings,
  ChevronRight
} from 'lucide-react';

// Command definitions
const COMMANDS = [
  // Navigation
  { id: 'nav-home', label: 'Go to Home', icon: Home, type: 'navigate', view: 'home', keywords: ['home', 'dashboard'] },
  { id: 'nav-dashboard', label: 'Go to Dashboard', icon: BarChart3, type: 'navigate', view: 'dashboard', keywords: ['dashboard', 'stats'] },
  { id: 'nav-weight', label: 'Go to Weight', icon: Scale, type: 'navigate', view: 'weight', keywords: ['weight', 'scale'] },
  { id: 'nav-calories', label: 'Go to Calories', icon: Apple, type: 'navigate', view: 'calories', keywords: ['calories', 'food', 'nutrition'] },
  { id: 'nav-wellness', label: 'Go to Wellness', icon: Heart, type: 'navigate', view: 'wellness', keywords: ['wellness', 'sleep', 'water'] },
  { id: 'nav-photos', label: 'Go to Photos', icon: Camera, type: 'navigate', view: 'photos', keywords: ['photos', 'pictures', 'progress'] },
  { id: 'nav-mood', label: 'Go to Mood', icon: Smile, type: 'navigate', view: 'mood', keywords: ['mood', 'feelings', 'emotion'] },
  { id: 'nav-training', label: 'Go to Training', icon: Dumbbell, type: 'navigate', view: 'training', keywords: ['training', 'workout', 'exercise'] },
  { id: 'nav-settings', label: 'Go to Settings', icon: Settings, type: 'navigate', view: 'settings', keywords: ['settings', 'preferences'] },
];

const CommandPalette = () => {
  const { 
    isCommandOpen, 
    commandQuery, 
    setCommandQuery, 
    closeCommand, 
    executeCommand 
  } = useAppContext();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Fuzzy search - simple substring match
  const filteredCommands = useMemo(() => {
    if (!commandQuery.trim()) return COMMANDS;
    
    const query = commandQuery.toLowerCase();
    return COMMANDS.filter(cmd => 
      cmd.label.toLowerCase().includes(query) ||
      cmd.keywords.some(kw => kw.includes(query))
    );
  }, [commandQuery]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [commandQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCommandOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isCommandOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, filteredCommands, selectedIndex, executeCommand]);

  const springConfig = {
    type: 'spring',
    stiffness: 300,
    damping: 28,
    mass: 0.9
  };

  return (
    <AnimatePresence>
      {isCommandOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCommand}
          />

          {/* Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              className="w-full max-w-2xl pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: springConfig }}
              exit={{ opacity: 0, scale: 0.95, y: -20, transition: { ...springConfig, stiffness: 400 } }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                  <Search className="w-5 h-5 text-gray-400" strokeWidth={2} />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a command or search..."
                    value={commandQuery}
                    onChange={(e) => setCommandQuery(e.target.value)}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-base focus:outline-none"
                  />
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                    ESC
                  </kbd>
                </div>

                {/* Commands list */}
                <div className="max-h-96 overflow-y-auto">
                  {filteredCommands.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No commands found</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredCommands.map((command, index) => {
                        const Icon = command.icon;
                        const isSelected = index === selectedIndex;

                        return (
                          <motion.button
                            key={command.id}
                            onClick={() => executeCommand(command)}
                            className={`
                              w-full flex items-center gap-3 px-5 py-3 text-left transition-colors
                              ${isSelected 
                                ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                              }
                            `}
                            whileHover={{ x: 4, transition: springConfig }}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className={`
                              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                              ${isSelected 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                              }
                            `}>
                              <Icon className="w-5 h-5" strokeWidth={2} />
                            </div>
                            
                            <span className={`
                              flex-1 font-medium
                              ${isSelected 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                              }
                            `}>
                              {command.label}
                            </span>

                            {isSelected && (
                              <ChevronRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑↓</kbd>
                      {' '}to navigate
                    </span>
                    <span>
                      <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
                      {' '}to select
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
