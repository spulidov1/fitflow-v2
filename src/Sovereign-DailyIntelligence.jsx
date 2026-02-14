// ============================================================================
// DAILY INTELLIGENCE - Contextual AI-like insights
// ============================================================================
// Analyzes user patterns and surfaces ONE calm, human insight
// Design: Apple Health intelligence + Calm app tone

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './Phase1-GlassCard';
import { Brain, TrendingUp, Award, Zap, Moon, Droplets } from 'lucide-react';
import { getThisWeekEntries, getTodayEntries, calculateStreak } from './utils/helpers';

const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 28,
  mass: 0.9
};

const DailyIntelligence = ({ weightHistory, calorieHistory, wellnessHistory, moodEntries, profile }) => {
  
  // Generate contextual insight
  const insight = useMemo(() => {
    const insights = [];

    // Analyze weight trends
    const recentWeight = weightHistory.slice(-7);
    if (recentWeight.length >= 5) {
      const avgLoss = (recentWeight[0].weight - recentWeight[recentWeight.length - 1].weight) / recentWeight.length;
      if (avgLoss > 0.3) {
        insights.push({
          icon: TrendingUp,
          title: 'Excellent Progress',
          message: `You're losing an average of ${avgLoss.toFixed(1)} lbs per day this week. Your consistency is paying off.`,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        });
      }
    }

    // Analyze sleep and mood correlation
    const wellnessWithMood = wellnessHistory
      .map(w => {
        const sameDayMood = moodEntries.find(m => 
          new Date(m.entry_date).toDateString() === new Date(w.entry_date).toDateString()
        );
        return { wellness: w, mood: sameDayMood };
      })
      .filter(item => item.mood);

    if (wellnessWithMood.length >= 5) {
      const goodSleepMoods = wellnessWithMood
        .filter(item => item.wellness.sleep_hours >= 7)
        .map(item => item.mood.energy_level || 5);
      
      const poorSleepMoods = wellnessWithMood
        .filter(item => item.wellness.sleep_hours < 7)
        .map(item => item.mood.energy_level || 5);

      if (goodSleepMoods.length > 0 && poorSleepMoods.length > 0) {
        const goodAvg = goodSleepMoods.reduce((a, b) => a + b, 0) / goodSleepMoods.length;
        const poorAvg = poorSleepMoods.reduce((a, b) => a + b, 0) / poorSleepMoods.length;
        
        if (goodAvg - poorAvg >= 1) {
          insights.push({
            icon: Moon,
            title: 'Sleep Quality Matters',
            message: `Your energy is ${Math.round(((goodAvg - poorAvg) / poorAvg) * 100)}% higher on days you sleep 7+ hours. Prioritize rest.`,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
          });
        }
      }
    }

    // Analyze water and consistency
    const thisWeekWellness = getThisWeekEntries(wellnessHistory);
    const waterConsistency = thisWeekWellness.filter(w => w.water_glasses >= 8).length;
    if (waterConsistency >= 5) {
      insights.push({
        icon: Droplets,
        title: 'Hydration Streak',
        message: `You've hit your water goal ${waterConsistency} days this week. This consistency builds lasting habits.`,
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
      });
    }

    // Analyze calorie consistency
    const thisWeekCalories = getThisWeekEntries(calorieHistory);
    const dailyGoal = profile?.daily_calorie_goal || 2000;
    const caloriesByDay = {};
    
    thisWeekCalories.forEach(entry => {
      const day = new Date(entry.entry_date).toDateString();
      caloriesByDay[day] = (caloriesByDay[day] || 0) + entry.calories;
    });

    const daysWithinGoal = Object.values(caloriesByDay).filter(total => 
      Math.abs(total - dailyGoal) <= 200
    ).length;

    if (daysWithinGoal >= 5) {
      insights.push({
        icon: Zap,
        title: 'Calorie Mastery',
        message: `${daysWithinGoal} days within 200 calories of your goal. You're developing precision and control.`,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      });
    }

    // Check for streaks
    const weightStreak = calculateStreak(weightHistory);
    const moodStreak = calculateStreak(moodEntries);
    
    if (weightStreak >= 7) {
      insights.push({
        icon: Award,
        title: 'Tracking Streak',
        message: `${weightStreak} days of consistent tracking. You're building the discipline that creates transformation.`,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      });
    }

    // Default insight if no patterns detected
    if (insights.length === 0) {
      const todayLogs = getTodayEntries([...weightHistory, ...calorieHistory, ...wellnessHistory, ...moodEntries]);
      
      if (todayLogs.length > 0) {
        insights.push({
          icon: Brain,
          title: 'Building Momentum',
          message: 'Every log builds your data foundation. Patterns will emerge as you continue tracking.',
          color: 'text-indigo-600 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
        });
      } else {
        insights.push({
          icon: Brain,
          title: 'Start Your Day Right',
          message: 'Log your first entry today. Small actions compound into remarkable results.',
          color: 'text-indigo-600 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
        });
      }
    }

    // Return the most relevant insight (first one found)
    return insights[0];
  }, [weightHistory, calorieHistory, wellnessHistory, moodEntries, profile]);

  if (!insight) return null;

  const Icon = insight.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: spring }}
    >
      <GlassCard className={`p-6 ${insight.bgColor} border-0`}>
        <div className="flex items-start gap-4">
          <motion.div
            className={`w-12 h-12 rounded-xl ${insight.color} bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0`}
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { ...spring, delay: 0.2 } }}
          >
            <Icon className="w-6 h-6" strokeWidth={2} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <motion.h3 
              className={`text-lg font-bold ${insight.color} mb-1`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0, transition: { ...spring, delay: 0.3 } }}
            >
              {insight.title}
            </motion.h3>
            <motion.p 
              className="text-gray-700 dark:text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.4 } }}
            >
              {insight.message}
            </motion.p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default DailyIntelligence;
