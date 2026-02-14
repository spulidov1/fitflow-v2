import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Droplet, Moon, TrendingDown, Target } from 'lucide-react';

const MiniDashboard = ({ 
  calories,
  calorieGoal,
  water,
  sleep,
  weightLost,
  progressPercent,
  weightToLose 
}) => {
  const caloriesPercent = ((parseFloat(calories) / parseFloat(calorieGoal)) * 100).toFixed(0);
  const caloriesRemaining = (parseFloat(calorieGoal) - parseFloat(calories)).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Today's Summary
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your daily snapshot
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" strokeWidth={2} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Calories
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              {calories}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {caloriesRemaining} remaining
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(caloriesPercent, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-600"
              />
            </div>
          </div>

          {/* Water */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-blue-500" strokeWidth={2} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Water
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
              {water}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              of 8 glasses
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(parseFloat(water) / 8) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
              />
            </div>
          </div>

          {/* Sleep */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-5 h-5 text-purple-500" strokeWidth={2} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Sleep
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
              {sleep}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              hours
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(parseFloat(sleep) / 8) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600"
              />
            </div>
          </div>

          {/* Weight Progress */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-500" strokeWidth={2} />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Progress
              </span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              {weightLost}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              lbs lost
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Weight Goal Summary (if available) */}
        {weightToLose && parseFloat(weightToLose) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t border-slate-200/20 dark:border-slate-700/30 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Target className="w-4 h-4" />
              <span>
                {weightToLose} lbs to goal • {progressPercent}% complete
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MiniDashboard;
