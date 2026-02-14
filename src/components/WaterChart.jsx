import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';

const WaterChart = ({ wellnessHistory = [] }) => {
  // Get last 7 days of water data
  const last7Days = wellnessHistory.slice(-7);
  
  // Format data for chart
  const chartData = last7Days.map(entry => {
    const date = new Date(entry.entry_date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return {
      day: dayName,
      date: monthDay,
      glasses: entry.water_glasses || 0,
      fullDate: entry.entry_date
    };
  });

  // Calculate average
  const average = chartData.length > 0
    ? (chartData.reduce((sum, day) => sum + day.glasses, 0) / chartData.length).toFixed(1)
    : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-slate-900/90 dark:bg-slate-800/90 rounded-xl p-3 border border-slate-700/50 shadow-xl">
          <p className="text-white font-semibold">{payload[0].payload.day}</p>
          <p className="text-slate-300 text-sm">{payload[0].payload.date}</p>
          <p className="text-blue-400 font-bold text-lg mt-1">
            {payload[0].value} glasses
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
            <Droplets className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Water Intake
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Last 7 Days
            </p>
          </div>
        </div>
        
        {/* Average badge */}
        <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30">
          <p className="text-xs text-slate-600 dark:text-slate-400">Avg</p>
          <p className="text-lg font-bold text-blue-500">{average}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#334155" 
                opacity={0.1}
                vertical={false}
              />
              <XAxis 
                dataKey="day"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 12]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar 
                dataKey="glasses" 
                fill="url(#blueGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={50}
              />
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Droplets className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">No water data yet</p>
          <p className="text-xs mt-1">Start logging to see your progress</p>
        </div>
      )}

      {/* Goal indicator */}
      <div className="mt-4 pt-4 border-t border-slate-200/20 dark:border-slate-700/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Daily Goal</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">8 glasses</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WaterChart;
