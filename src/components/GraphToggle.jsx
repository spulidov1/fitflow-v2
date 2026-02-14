import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart3 } from 'lucide-react';

// ============================================================================
// GRAPH TOGGLE - Switch between line and bar charts
// ============================================================================

const GraphToggle = memo(({ value, onChange }) => {
  const options = [
    { id: 'line', icon: LineChart, label: 'Line' },
    { id: 'bar', icon: BarChart3, label: 'Bar' }
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.id;
        
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`
              relative px-3 py-1.5 rounded-lg transition-colors
              ${isActive 
                ? 'text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }
            `}
            aria-label={`Switch to ${option.label} chart`}
          >
            {isActive && (
              <motion.div
                layoutId="graphToggleBg"
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg"
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              />
            )}
            <div className="relative flex items-center gap-1.5">
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span className="text-xs font-medium">{option.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

GraphToggle.displayName = 'GraphToggle';

export default GraphToggle;
