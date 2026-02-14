// ============================================================================
// PREMIUM CALORIES VIEW - With Undo System & Spring Physics
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './Phase1-GlassCard';
import { useAppContext } from './Phase1-AppContext';
import { 
  formatDate, 
  formatDateForInput,
  isValidCalories,
  calculateDailyAverage,
  getTodayEntries,
  getThisWeekEntries
} from './utils/helpers';
import { calorieService } from './services/data.service';
import { Apple, Target, TrendingDown, Flame, Coffee, Utensils, Moon, Candy } from 'lucide-react';

const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.9
};

const MEAL_COLORS = {
  breakfast: '#10b981',
  lunch: '#3b82f6',
  dinner: '#f59e0b',
  snack: '#8b5cf6'
};

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Utensils,
  dinner: Moon,
  snack: Candy
};

export const CaloriesView = ({ user, profile, calorieHistory, setCalorieHistory, showToast, darkMode }) => {
  const { addUndo } = useAppContext();
  
  const [newCalories, setNewCalories] = useState('');
  const [calorieDate, setCalorieDate] = useState(formatDateForInput());
  const [calorieMeal, setCalorieMeal] = useState('breakfast');
  const [calorieNotes, setCalorieNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCalories = async (e) => {
    e.preventDefault();
    
    if (!isValidCalories(newCalories)) {
      showToast('Please enter valid calories (0-5000)', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await calorieService.addCalorieEntry(
        user.id,
        parseInt(newCalories),
        calorieDate,
        calorieMeal,
        calorieNotes
      );

      if (error) throw error;

      const newHistory = [...calorieHistory, data].sort((a, b) => 
        new Date(a.entry_date) - new Date(b.entry_date)
      );
      setCalorieHistory(newHistory);
      showToast('Calories logged successfully!', 'success');
      
      setNewCalories('');
      setCalorieNotes('');
      setCalorieDate(formatDateForInput());
    } catch (error) {
      showToast('Failed to log calories', 'error');
    } finally {
      setLoading(false);
    }
  };

  // UNDO SYSTEM
  const handleDeleteCalories = async (entry) => {
    const newHistory = calorieHistory.filter(c => c.id !== entry.id);
    setCalorieHistory(newHistory);
    
    let undoUsed = false;
    
    addUndo({
      message: `Deleted ${entry.calories} cal ${entry.meal_type}`,
      onUndo: () => {
        undoUsed = true;
        const restoredHistory = [...newHistory, entry].sort((a, b) => 
          new Date(a.entry_date) - new Date(b.entry_date)
        );
        setCalorieHistory(restoredHistory);
        showToast('Calorie entry restored', 'success');
      },
      duration: 5000
    });
    
    setTimeout(async () => {
      if (!undoUsed) {
        try {
          await calorieService.deleteCalorieEntry(entry.id, user.id);
        } catch (error) {
          console.error('Failed to delete from database:', error);
        }
      }
    }, 5000);
  };

  // Calculate stats
  const todayTotal = getTodayEntries(calorieHistory).reduce((sum, e) => sum + e.calories, 0);
  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const remaining = dailyGoal - todayTotal;
  const thisWeekCalories = getThisWeekEntries(calorieHistory);
  const weeklyAverage = calculateDailyAverage(thisWeekCalories);

  // Meal breakdown for pie chart
  const mealBreakdown = thisWeekCalories.reduce((acc, entry) => {
    acc[entry.meal_type] = (acc[entry.meal_type] || 0) + entry.calories;
    return acc;
  }, {});

  const pieData = Object.entries(mealBreakdown).map(([name, value]) => ({ name, value }));

  // Bar chart data - calories by day
  const caloriesByDay = thisWeekCalories.reduce((acc, entry) => {
    const day = new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!acc[day]) acc[day] = {};
    acc[day][entry.meal_type] = (acc[day][entry.meal_type] || 0) + entry.calories;
    return acc;
  }, {});

  const barChartData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
    day,
    breakfast: caloriesByDay[day]?.breakfast || 0,
    lunch: caloriesByDay[day]?.lunch || 0,
    dinner: caloriesByDay[day]?.dinner || 0,
    snack: caloriesByDay[day]?.snack || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Calorie Tracking 🍎
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your daily nutrition intake
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: spring }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-7 h-7 text-green-600 dark:text-green-400" strokeWidth={2} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Today's Total
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {todayTotal}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              calories consumed
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.1 } }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-7 h-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Daily Goal
            </div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {dailyGoal}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              calorie target
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.2 } }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className={`w-7 h-7 ${remaining >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-orange-600 dark:text-orange-400'}`} strokeWidth={2} />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
              {remaining >= 0 ? 'Remaining' : 'Over Goal'}
            </div>
            <div className={`text-4xl font-bold ${remaining >= 0 ? 'text-cyan-600 dark:text-cyan-400' : 'text-orange-600 dark:text-orange-400'} mb-1`}>
              {Math.abs(remaining)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              calories {remaining >= 0 ? 'left' : 'over'}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Progress
            </h3>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {((todayTotal / dailyGoal) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
            <motion.div 
              className={`absolute inset-y-0 left-0 flex items-center justify-end pr-4 ${
                remaining >= 0 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (todayTotal / dailyGoal) * 100)}%`,
                transition: { ...spring, duration: 1.5 }
              }}
            >
              {todayTotal > 0 && (
                <span className="text-white text-sm font-semibold">
                  {todayTotal} cal
                </span>
              )}
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{todayTotal} consumed</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {remaining >= 0 ? `${remaining} cal left` : `${Math.abs(remaining)} cal over`}
            </span>
            <span className="text-gray-600 dark:text-gray-400">{dailyGoal} goal</span>
          </div>
        </GlassCard>
      </motion.div>

      {/* Log Calories Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Log Calories
          </h2>
          <form onSubmit={handleAddCalories} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calories *
                </label>
                <input
                  type="number"
                  value={newCalories}
                  onChange={(e) => setNewCalories(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meal Type *
                </label>
                <select
                  value={calorieMeal}
                  onChange={(e) => setCalorieMeal(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="breakfast">🍳 Breakfast</option>
                  <option value="lunch">🥗 Lunch</option>
                  <option value="dinner">🍽️ Dinner</option>
                  <option value="snack">🍿 Snack</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={calorieDate}
                  onChange={(e) => setCalorieDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={calorieNotes}
                  onChange={(e) => setCalorieNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="What did you eat?"
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
                '✓ Log Calories'
              )}
            </motion.button>
          </form>
        </GlassCard>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Daily Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, transition: spring }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              This Week by Day
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="breakfast" stackId="a" fill={MEAL_COLORS.breakfast} radius={[2, 2, 0, 0]} />
                <Bar dataKey="lunch" stackId="a" fill={MEAL_COLORS.lunch} radius={[2, 2, 0, 0]} />
                <Bar dataKey="dinner" stackId="a" fill={MEAL_COLORS.dinner} radius={[2, 2, 0, 0]} />
                <Bar dataKey="snack" stackId="a" fill={MEAL_COLORS.snack} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Weekly average: <span className="font-semibold text-green-600 dark:text-green-400">{weeklyAverage} cal/day</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Pie Chart - Meal Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: spring }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Meal Breakdown
            </h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MEAL_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500 dark:text-gray-400">
                No data for this week yet
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Calorie History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            History
          </h2>
          {calorieHistory.length === 0 ? (
            <div className="text-center py-12">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }}
              >
                🍎
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No calorie entries yet. Log your first meal above!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {[...calorieHistory].reverse().map((entry, idx) => {
                  const MealIcon = MEAL_ICONS[entry.meal_type];
                  return (
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
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${MEAL_COLORS[entry.meal_type]}20` }}
                        >
                          <MealIcon className="w-6 h-6" style={{ color: MEAL_COLORS[entry.meal_type] }} strokeWidth={2} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {entry.calories} cal • {entry.meal_type}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(entry.entry_date)}
                            {entry.notes && ` • ${entry.notes}`}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleDeleteCalories(entry)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
                        whileHover={{ scale: 1.05, transition: spring }}
                        whileTap={{ scale: 0.95, transition: spring }}
                      >
                        Delete
                      </motion.button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CaloriesView;
