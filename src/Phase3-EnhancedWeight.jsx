// ============================================================================
// PREMIUM WEIGHT VIEW - With Undo System & Spring Physics
// ============================================================================
import GraphToggle from './components/GraphToggle';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './Phase1-GlassCard';
import { useAppContext } from './Phase1-AppContext';
import { 
  formatDate, 
  formatDateForInput,
  formatWeight,
  calculateBMI,
  getBMICategory,
  isValidWeight,
  calculateWeeklyAverage,
  predictGoalDate
} from './utils/helpers';
import { weightService } from './services/data.service';
import { Scale, TrendingDown, Target, Activity, Award, Heart } from 'lucide-react';
import BackdateModal from './components/BackdateModal';
const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.9
};

export const WeightView = ({ user, profile, weightHistory, setWeightHistory, showToast, darkMode }) => {
  const { addUndo } = useAppContext();
  
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(formatDateForInput());
  const [newNotes, setNewNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartRange, setChartRange] = useState('30');
  const [chartType, setChartType] = useState('line');
  const [showBackdateModal, setShowBackdateModal] = useState(false);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    
    if (!isValidWeight(newWeight)) {
      showToast('Please enter a valid weight (50-500 lbs)', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await weightService.addWeightEntry(
        user.id,
        parseFloat(newWeight),
        newDate,
        newNotes
      );

      if (error) throw error;

      const newHistory = [...weightHistory, data].sort((a, b) => 
        new Date(a.entry_date) - new Date(b.entry_date)
      );
      setWeightHistory(newHistory);
      showToast('Weight logged successfully!', 'success');
      
      setNewWeight('');
      setNewNotes('');
      setNewDate(formatDateForInput());
    } catch (error) {
      showToast('Failed to log weight', 'error');
    } finally {
      setLoading(false);
    }
  };

  // UNDO SYSTEM - Instant delete with undo
  const handleDeleteWeight = async (entry) => {
    // Immediately remove from UI
    const newHistory = weightHistory.filter(w => w.id !== entry.id);
    setWeightHistory(newHistory);
    
    // Track if undo was used
    let undoUsed = false;
    
    // Show undo toast
    addUndo({
      message: `Deleted ${entry.weight} lbs entry`,
      onUndo: () => {
        undoUsed = true;
        // Restore entry
        const restoredHistory = [...newHistory, entry].sort((a, b) => 
          new Date(a.entry_date) - new Date(b.entry_date)
        );
        setWeightHistory(restoredHistory);
        showToast('Weight entry restored', 'success');
      },
      duration: 5000
    });
    
    // Actually delete from database after undo window
    setTimeout(async () => {
      if (!undoUsed) {
        try {
          await weightService.deleteWeightEntry(entry.id, user.id);
        } catch (error) {
          console.error('Failed to delete from database:', error);
        }
      }
    }, 5000);
  };

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

  // Filter chart data
  const getChartData = () => {
    if (chartRange === 'all') return weightHistory;
    const days = parseInt(chartRange);
    return weightHistory.slice(-days);
  };

  const chartData = getChartData();

  // Stat cards config
  const statCards = [
    {
      icon: Scale,
      label: 'Current',
      value: formatWeight(currentWeight),
      unit: 'lbs',
      gradient: 'from-blue-500 to-blue-600',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Activity,
      label: 'Start',
      value: formatWeight(startWeight),
      unit: 'lbs',
      gradient: 'from-green-500 to-green-600',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Target,
      label: 'Target',
      value: formatWeight(targetWeight),
      unit: 'lbs',
      gradient: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: TrendingDown,
      label: 'Lost',
      value: totalLost > 0 ? `-${Math.abs(totalLost).toFixed(1)}` : Math.abs(totalLost).toFixed(1),
      unit: 'lbs',
      gradient: 'from-orange-500 to-orange-600',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: Award,
      label: 'Weekly',
      value: weeklyAvg,
      unit: 'lbs/wk',
      gradient: 'from-pink-500 to-pink-600',
      iconColor: 'text-pink-600 dark:text-pink-400'
    },
    {
      icon: Heart,
      label: 'BMI',
      value: currentBMI || '--',
      unit: bmiCategory?.label || 'N/A',
      gradient: bmiCategory?.gradient || 'from-gray-500 to-gray-600',
      iconColor: 'text-gray-600 dark:text-gray-400'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Weight Tracking ⚖️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your weight journey with precision
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.1 * index } }}
            >
              <GlassCard className="p-6 h-full">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} strokeWidth={2} />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">
                  {stat.label}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {stat.unit}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      {targetWeight && targetWeight !== currentWeight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: spring }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Progress to Goal
              </h3>
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-end pr-4"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%`, transition: { ...spring, duration: 1.5 } }}
              >
                {progressPercent > 15 && (
                  <span className="text-white text-sm font-semibold">
                    {totalLost.toFixed(1)} lbs lost
                  </span>
                )}
              </motion.div>
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-600 dark:text-gray-400">{formatWeight(startWeight)} lbs</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {remaining > 0 ? `${remaining.toFixed(1)} lbs to go` : 'Goal reached! 🎉'}
              </span>
              <span className="text-gray-600 dark:text-gray-400">{formatWeight(targetWeight)} lbs</span>
            </div>
            {predictedDate && remaining > 0 && (
              <motion.div 
                className="mt-4 text-center text-sm bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.5 } }}
              >
                💡 At your current rate, you'll reach your goal around{' '}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {predictedDate}
                </span>
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Log Weight Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Log Weight
          </h2>
          <form onSubmit={handleAddWeight} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (lbs) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Enter weight"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
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
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="Feeling great!"
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
                '✓ Log Weight'
              )}
            </motion.button>
          </form>

<button
  onClick={() => setShowBackdateModal(true)}
  className="w-full mt-4 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
>
  📅 Add Past Entry
</button>

        </GlassCard>
      </motion.div>

      {/* Weight Chart */}
      {weightHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: spring }}
        >
          <GlassCard className="p-6">
<div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Weight Progress
              </h2>
              <div className="flex gap-2">
                {['7', '30', '90', 'all'].map(range => (
                  <motion.button
                    key={range}
                    onClick={() => setChartRange(range)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      chartRange === range
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.05, transition: spring }}
                    whileTap={{ scale: 0.95, transition: spring }}
                  >
                    {range === 'all' ? 'All' : `${range}d`}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <GraphToggle value={chartType} onChange={setChartType} />
            </div>

            {chartType === 'line' ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
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
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    labelFormatter={(date) => formatDate(date)}
                    formatter={(value, name, props) => {
                      const notes = props.payload.notes;
                      return [
                        <div key="weight">
                          <div className="font-bold text-lg">{value} lbs</div>
                          {notes && <div className="text-sm text-gray-500 mt-1">📝 {notes}</div>}
                        </div>
                      ];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="rgb(99, 102, 241)" 
                    strokeWidth={3}
                    dot={{ fill: 'rgb(99, 102, 241)', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                    fill="url(#weightGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
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
                      border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    labelFormatter={(date) => formatDate(date)}
                    formatter={(value, name, props) => {
                      const notes = props.payload.notes;
                      return [
                        <div key="weight">
                          <div className="font-bold text-lg">{value} lbs</div>
                          {notes && <div className="text-sm text-gray-500 mt-1">📝 {notes}</div>}
                        </div>
                      ];
                    }}
                  />
                  <Bar 
                    dataKey="weight" 
                    fill="rgb(99, 102, 241)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Weight History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: spring }}
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            History
          </h2>
          {weightHistory.length === 0 ? (
            <div className="text-center py-12">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }}
              >
                ⚖️
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No weight entries yet. Log your first weight above!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {[...weightHistory].reverse().map((entry, idx) => (
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
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        idx === 0 
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <span className="text-xl">{idx === 0 ? '📍' : '•'}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-lg">
                          {entry.weight} lbs
                          {idx === 0 && (
                            <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(entry.entry_date)}
                          {entry.notes && ` • ${entry.notes}`}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => handleDeleteWeight(entry)}
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
      <BackdateModal
        isOpen={showBackdateModal}
        onClose={() => setShowBackdateModal(false)}
        onSubmit={async (data) => {
          try {
            const { data: entry, error } = await weightService.addWeightEntry(
              user.id,
              parseFloat(data.weight),
              data.date,
              data.notes || ''
            );

            if (error) throw error;

            const newHistory = [...weightHistory, entry].sort((a, b) => 
              new Date(a.entry_date) - new Date(b.entry_date)
            );
            setWeightHistory(newHistory);
            showToast('Past entry added successfully!', 'success');
          } catch (error) {
            showToast('Failed to add entry', 'error');
          }
        }}
        title="Add Past Weight Entry"
        fields={[
          {
            id: 'weight',
            label: 'Weight',
            type: 'number',
            placeholder: 'Enter weight',
            min: 50,
            max: 500,
            step: 0.1,
            required: true
          },
          {
            id: 'notes',
            label: 'Notes',
            type: 'textarea',
            placeholder: 'Optional notes about this entry'
          }
        ]}
      />
    </div>
  );
};

export default WeightView;
