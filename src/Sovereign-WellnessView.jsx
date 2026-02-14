// ============================================================================
// SOVEREIGN WELLNESS VIEW - Sleep & Water with undo
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './Phase1-GlassCard';
import { useAppContext } from './Phase1-AppContext';
import { 
  formatDate, 
  formatDateForInput,
  isValidSleepHours,
  isValidWaterGlasses,
  getTodayEntries,
  getThisWeekEntries
} from './utils/helpers';
import { wellnessService } from './services/data.service.js';
import { Moon, Droplets, TrendingUp, Target } from 'lucide-react';

const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.9
};

export const WellnessView = ({ user, wellnessHistory, setWellnessHistory, showToast, darkMode }) => {
  const { addUndo } = useAppContext();
  
  const [sleepHours, setSleepHours] = useState('');
  const [waterGlasses, setWaterGlasses] = useState('');
  const [wellnessDate, setWellnessDate] = useState(formatDateForInput());
  const [loading, setLoading] = useState(false);

  // Quick add buttons
  const quickSleepOptions = [6, 7, 8, 9];
  const quickWaterOptions = [4, 6, 8, 10];

  const handleAddWellness = async (e) => {
    e.preventDefault();
    
    if (sleepHours && !isValidSleepHours(sleepHours)) {
      showToast('Sleep hours must be between 0-24', 'error');
      return;
    }

    if (waterGlasses && !isValidWaterGlasses(waterGlasses)) {
      showToast('Water glasses must be between 0-30', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await wellnessService.addWellnessEntry(
        user.id,
        parseFloat(sleepHours) || 0,
        parseInt(waterGlasses) || 0,
        wellnessDate
      );

      if (error) throw error;

      const newHistory = [...wellnessHistory, data].sort((a, b) => 
        new Date(a.entry_date) - new Date(b.entry_date)
      );
      setWellnessHistory(newHistory);
      showToast('Wellness logged successfully!', 'success');
      
      setSleepHours('');
      setWaterGlasses('');
      setWellnessDate(formatDateForInput());
    } catch (error) {
      showToast('Failed to log wellness', 'error');
    } finally {
      setLoading(false);
    }
  };

  // UNDO SYSTEM
  const handleDeleteWellness = async (entry) => {
    const newHistory = wellnessHistory.filter(w => w.id !== entry.id);
    setWellnessHistory(newHistory);
    
    let undoUsed = false;
    
    addUndo({
      message: `Deleted ${entry.sleep_hours}h sleep / ${entry.water_glasses} glasses`,
      onUndo: () => {
        undoUsed = true;
        const restoredHistory = [...newHistory, entry].sort((a, b) => 
          new Date(a.entry_date) - new Date(b.entry_date)
        );
        setWellnessHistory(restoredHistory);
        showToast('Wellness entry restored', 'success');
      },
      duration: 5000
    });
    
    setTimeout(async () => {
      if (!undoUsed) {
        try {
          await wellnessService.deleteWellnessEntry(entry.id, user.id);
        } catch (error) {
          console.error('Failed to delete from database:', error);
        }
      }
    }, 5000);
  };

  // Calculate stats
  const todayEntry = getTodayEntries(wellnessHistory)[0];
  const thisWeekEntries = getThisWeekEntries(wellnessHistory);
  
  const avgSleep = thisWeekEntries.length > 0
    ? (thisWeekEntries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / thisWeekEntries.length).toFixed(1)
    : 0;
    
  const avgWater = thisWeekEntries.length > 0
    ? Math.round(thisWeekEntries.reduce((sum, e) => sum + (e.water_glasses || 0), 0) / thisWeekEntries.length)
    : 0;

  // Progress calculation
  const sleepProgress = todayEntry ? (todayEntry.sleep_hours / 8) * 100 : 0;
  const waterProgress = todayEntry ? (todayEntry.water_glasses / 8) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Wellness 💧
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your sleep and hydration
        </p>
      </motion.div>

      {/* Progress Rings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: spring }}
        >
          <GlassCard className="p-8">
            <div className="flex flex-col items-center">
              <Moon className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4" strokeWidth={2} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Sleep
              </h3>
              
              {/* Progress Ring */}
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 70 * (1 - sleepProgress / 100),
                      transition: { ...spring, duration: 1.5 }
                    }}
                    strokeLinecap="round"
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div 
                    className="text-4xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1, transition: { ...spring, delay: 0.5 } }}
                  >
                    {todayEntry?.sleep_hours || 0}
                  </motion.div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">hours</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Goal: 8 hours
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Weekly avg: {avgSleep}h
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Water Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.1 } }}
        >
          <GlassCard className="p-8">
            <div className="flex flex-col items-center">
              <Droplets className="w-8 h-8 text-cyan-600 dark:text-cyan-400 mb-4" strokeWidth={2} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Hydration
              </h3>
              
              {/* Progress Ring */}
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 70 * (1 - waterProgress / 100),
                      transition: { ...spring, duration: 1.5 }
                    }}
                    strokeLinecap="round"
                    className="text-cyan-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div 
                    className="text-4xl font-bold text-gray-900 dark:text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1, transition: { ...spring, delay: 0.5 } }}
                  >
                    {todayEntry?.water_glasses || 0}
                  </motion.div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">/ 8 glasses</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Goal: 8 glasses
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Weekly avg: {avgWater}/8
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Add & Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Log Wellness
          </h2>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sleep Quick Add */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Add Sleep
              </label>
              <div className="grid grid-cols-4 gap-2">
                {quickSleepOptions.map(hours => (
                  <motion.button
                    key={hours}
                    type="button"
                    onClick={() => setSleepHours(hours.toString())}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      sleepHours === hours.toString()
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05, transition: spring }}
                    whileTap={{ scale: 0.95, transition: spring }}
                  >
                    {hours}h
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Water Quick Add */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Add Water
              </label>
              <div className="grid grid-cols-4 gap-2">
                {quickWaterOptions.map(glasses => (
                  <motion.button
                    key={glasses}
                    type="button"
                    onClick={() => setWaterGlasses(glasses.toString())}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                      waterGlasses === glasses.toString()
                        ? 'bg-cyan-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05, transition: spring }}
                    whileTap={{ scale: 0.95, transition: spring }}
                  >
                    {glasses}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleAddWellness} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  😴 Sleep (hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💧 Water (glasses)
                </label>
                <input
                  type="number"
                  value={waterGlasses}
                  onChange={(e) => setWaterGlasses(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={wellnessDate}
                  onChange={(e) => setWellnessDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all"
              whileHover={{ scale: 1.02, transition: spring }}
              whileTap={{ scale: 0.98, transition: spring }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                '✓ Log Wellness'
              )}
            </motion.button>
          </form>
        </GlassCard>
      </motion.div>

      {/* Sleep Chart */}
      {wellnessHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: spring }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Sleep Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wellnessHistory}>
                <defs>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(59, 130, 246)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {/* Ideal sleep range band */}
                <defs>
                  <pattern id="idealRange" patternUnits="userSpaceOnUse" width="4" height="4">
                    <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#10b981" strokeWidth="1" opacity="0.1"/>
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="entry_date" 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                  domain={[0, 12]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px'
                  }}
                  labelFormatter={(date) => formatDate(date)}
                  formatter={(value) => [`${value} hours`, 'Sleep']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sleep_hours" 
                  stroke="rgb(59, 130, 246)" 
                  strokeWidth={3}
                  dot={{ fill: 'rgb(59, 130, 246)', r: 5 }}
                  activeDot={{ r: 7 }}
                  fill="url(#sleepGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              💡 Optimal sleep: 7-9 hours per night
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            History
          </h2>
          {wellnessHistory.length === 0 ? (
            <div className="text-center py-12">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }}
              >
                💧
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No wellness entries yet. Log your first one above!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {[...wellnessHistory].reverse().map((entry, idx) => (
                  <motion.div 
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { ...spring, delay: 0.03 * idx } }}
                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                    whileHover={{ x: 4, transition: spring }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Moon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                          <Droplets className="w-5 h-5" strokeWidth={2} />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          😴 {entry.sleep_hours}h sleep • 💧 {entry.water_glasses} glasses
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(entry.entry_date)}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleDeleteWellness(entry)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
                      whileHover={{ scale: 1.05, transition: spring }}
                      whileTap={{ scale: 0.95, transition: spring }}
                    >
                      Delete
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default WellnessView;
