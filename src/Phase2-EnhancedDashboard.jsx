// ============================================================================
// PREMIUM DASHBOARD - Enhanced with Spring Physics + Undo
// ============================================================================
// Linear-level polish, spring animations, glassmorphism

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import GlassCard from './Phase1-GlassCard';
import { 
  formatDate, 
  formatWeight,
  calculateBMI,
  getBMICategory,
  calculateWeeklyAverage,
  calculateDailyAverage,
  getTodayEntries,
  getThisWeekEntries,
  calculateStreak,
  predictGoalDate,
  getRandomQuote
} from './utils/helpers';

// Spring config - Linear standard
const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.9
};

export const DashboardView = ({ user, profile, weightHistory, calorieHistory, wellnessHistory, moodEntries, darkMode }) => {
  // Calculate stats
  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : profile?.start_weight || 0;
  const startWeight = profile?.start_weight || currentWeight;
  const targetWeight = profile?.target_weight || currentWeight;
  const totalLost = startWeight - currentWeight;
  const remaining = currentWeight - targetWeight;
  const progressPercent = targetWeight ? Math.min(100, Math.max(0, ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)) : 0;
  
  const currentBMI = profile?.height_inches ? calculateBMI(currentWeight, profile.height_inches) : null;
  const bmiCategory = currentBMI ? getBMICategory(currentBMI) : null;
  
  const weeklyAvg = calculateWeeklyAverage(weightHistory);
  const predictedDate = predictGoalDate(weightHistory, targetWeight);
  
  const todayCalories = getTodayEntries(calorieHistory);
  const totalCaloriesToday = todayCalories.reduce((sum, e) => sum + e.calories, 0);
  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const calorieDeficit = dailyGoal - totalCaloriesToday;
  
  const todayWellness = getTodayEntries(wellnessHistory)[0];
  const thisWeekWellness = getThisWeekEntries(wellnessHistory);
  const avgSleep = thisWeekWellness.length > 0 
    ? (thisWeekWellness.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / thisWeekWellness.length).toFixed(1)
    : 0;
  const avgWater = thisWeekWellness.length > 0
    ? Math.round(thisWeekWellness.reduce((sum, e) => sum + (e.water_glasses || 0), 0) / thisWeekWellness.length)
    : 0;
  
  const moodStreak = calculateStreak(moodEntries);
  const quote = getRandomQuote();
  
  const thisWeekWeight = getThisWeekEntries(weightHistory);
  const weeklyWeightChange = thisWeekWeight.length >= 2
    ? (thisWeekWeight[0].weight - thisWeekWeight[thisWeekWeight.length - 1].weight).toFixed(1)
    : 0;
  
  // Chart data
  const last30Days = weightHistory.slice(-30);
  const thisWeekCalories = getThisWeekEntries(calorieHistory);
  const caloriesByDay = thisWeekCalories.reduce((acc, entry) => {
    const day = new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!acc[day]) acc[day] = 0;
    acc[day] += entry.calories;
    return acc;
  }, {});
  
  const calorieChartData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
    day,
    calories: caloriesByDay[day] || 0,
    goal: dailyGoal
  }));

  return (
    <div className="space-y-8">
      {/* Hero Section - Glassmorphic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{
          background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(139, 92, 246) 100%)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { ...spring, delay: 0.1 } }}
          >
            Welcome back, {profile?.name || 'Champion'}! 👋
          </motion.h1>
          <motion.p 
            className="text-xl text-white/90 mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, transition: { ...spring, delay: 0.2 } }}
          >
            {quote}
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Weight Card */}
            <GlassCard className="p-6 backdrop-blur-xl bg-white/10 border-white/20">
              <div className="text-white/80 text-sm mb-2 font-medium">Current Weight</div>
              <div className="text-5xl font-bold text-white mb-2">
                {formatWeight(currentWeight)} <span className="text-2xl text-white/70">lbs</span>
              </div>
              {currentBMI && (
                <div className="text-white/90 text-sm">
                  BMI: {currentBMI} • {bmiCategory?.label}
                </div>
              )}
            </GlassCard>
            
            {/* Progress Ring */}
            <GlassCard className="p-6 backdrop-blur-xl bg-white/10 border-white/20 flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="14"
                    fill="none"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="white"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 64}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 64 * (1 - progressPercent / 100),
                      transition: { ...spring, duration: 1.5 }
                    }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-bold text-white"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1, transition: { ...spring, delay: 0.5 } }}
                    >
                      {progressPercent.toFixed(0)}%
                    </motion.div>
                    <div className="text-xs text-white/80">to goal</div>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            {/* Goal Stats */}
            <GlassCard className="p-6 backdrop-blur-xl bg-white/10 border-white/20">
              <div className="text-white/80 text-sm mb-2 font-medium">Total Progress</div>
              <div className="text-5xl font-bold text-white mb-2">
                {totalLost > 0 ? '-' : ''}{Math.abs(totalLost).toFixed(1)} <span className="text-2xl text-white/70">lbs</span>
              </div>
              <div className="text-white/90 text-sm">
                {remaining > 0 ? `${remaining.toFixed(1)} lbs to go` : 'Goal reached! 🎉'}
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: '🍎',
            label: 'Calories Today',
            value: totalCaloriesToday,
            subtitle: `${calorieDeficit >= 0 ? calorieDeficit + ' left' : Math.abs(calorieDeficit) + ' over'}`,
            progress: Math.min(100, (totalCaloriesToday / dailyGoal) * 100),
            color: calorieDeficit >= 0 ? 'green' : 'orange'
          },
          {
            icon: '😴',
            label: 'Sleep',
            value: todayWellness?.sleep_hours ? `${todayWellness.sleep_hours}h` : '--',
            subtitle: `${avgSleep}h avg`,
            color: 'blue'
          },
          {
            icon: '💧',
            label: 'Water',
            value: `${todayWellness?.water_glasses || 0}/8`,
            subtitle: `${avgWater}/8 avg`,
            color: 'cyan'
          },
          {
            icon: '⚖️',
            label: 'Weekly Change',
            value: `${weeklyWeightChange >= 0 ? '↓' : '↑'} ${Math.abs(weeklyWeightChange)}`,
            subtitle: `${weeklyAvg} lbs/wk`,
            color: weeklyWeightChange >= 0 ? 'green' : 'orange'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.1 * index } }}
          >
            <GlassCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="text-4xl">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {stat.subtitle}
              </div>
              {stat.progress !== undefined && (
                <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <motion.div 
                    className={`h-1.5 rounded-full ${stat.color === 'green' ? 'bg-green-500' : 'bg-orange-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%`, transition: { ...spring, delay: 0.5 } }}
                  />
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, transition: spring }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weight Trend</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last30Days}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0}/>
                  </linearGradient>
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
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  labelFormatter={(date) => formatDate(date)}
                  formatter={(value) => [`${value} lbs`, 'Weight']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="rgb(99, 102, 241)" 
                  strokeWidth={3}
                  dot={{ fill: 'rgb(99, 102, 241)', r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#weightGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
            {predictedDate && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                💡 At this rate, you'll reach your goal around <span className="font-semibold text-indigo-600 dark:text-indigo-400">{predictedDate}</span>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Calories Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, transition: spring }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">This Week's Calories</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">Daily intake</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={calorieChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="day" 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px'
                  }}
                />
                <Bar dataKey="calories" fill="rgb(34, 197, 94)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="goal" fill={darkMode ? '#374151' : '#e5e7eb'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              Daily average: <span className="font-semibold text-green-600 dark:text-green-400">{calculateDailyAverage(thisWeekCalories)} cal</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.3 } }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity 🎯</h2>
          {weightHistory.length === 0 && calorieHistory.length === 0 && wellnessHistory.length === 0 ? (
            <div className="text-center py-12">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }}
              >
                📊
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                No activity yet! Start your journey today.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Use the navigation to log your first entry
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                ...weightHistory.slice(-3).map(e => ({ ...e, type: 'weight', icon: '⚖️', label: `Weight: ${e.weight} lbs` })),
                ...calorieHistory.slice(-3).map(e => ({ ...e, type: 'calorie', icon: '🍎', label: `${e.calories} cal • ${e.meal_type}` })),
                ...wellnessHistory.slice(-2).map(e => ({ ...e, type: 'wellness', icon: '💧', label: `${e.sleep_hours}h sleep, ${e.water_glasses} glasses` })),
                ...moodEntries.slice(-2).map(e => ({ ...e, type: 'mood', icon: '😊', label: `Mood: ${e.mood}` }))
              ]
                .sort((a, b) => new Date(b.entry_date || b.created_at) - new Date(a.entry_date || a.created_at))
                .slice(0, 6)
                .map((entry, idx) => (
                  <motion.div 
                    key={`${entry.type}-${entry.id}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0, transition: { ...spring, delay: 0.05 * idx } }}
                    whileHover={{ x: 4, transition: spring }}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  >
                    <span className="text-3xl">{entry.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {entry.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(entry.entry_date || entry.created_at)}
                        {entry.notes && ` • ${entry.notes}`}
                      </div>
                    </div>
                  </motion.div>
                ))
            }
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default DashboardView;
