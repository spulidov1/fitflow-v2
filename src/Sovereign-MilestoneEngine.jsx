// ============================================================================
// MILESTONE ENGINE - Streak detection & celebration
// ============================================================================
// Detects achievements, triggers confetti, displays refined badge
// Celebration: <2 seconds, leaves pride not distraction

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import GlassCard from './Phase1-GlassCard';
import { Award, Flame, Target, Zap } from 'lucide-react';

const spring = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
  mass: 0.8
};

// Milestone definitions
const MILESTONES = {
  WEIGHT_STREAK_7: {
    id: 'weight_streak_7',
    title: '7-Day Streak',
    message: 'A week of consistent tracking',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    check: (data) => data.weightStreak >= 7
  },
  WEIGHT_STREAK_30: {
    id: 'weight_streak_30',
    title: '30-Day Streak',
    message: 'One month of dedication',
    icon: Award,
    color: 'from-purple-500 to-pink-500',
    check: (data) => data.weightStreak >= 30
  },
  CALORIE_STREAK_7: {
    id: 'calorie_streak_7',
    title: 'Nutrition Warrior',
    message: '7 days of calorie tracking',
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
    check: (data) => data.calorieStreak >= 7
  },
  GOAL_REACHED: {
    id: 'goal_reached',
    title: 'Goal Achieved',
    message: 'You reached your target weight',
    icon: Target,
    color: 'from-indigo-500 to-purple-500',
    check: (data) => data.goalReached
  },
  WATER_WEEK: {
    id: 'water_week',
    title: 'Hydration Master',
    message: '7 days of 8+ glasses',
    icon: Award,
    color: 'from-cyan-500 to-blue-500',
    check: (data) => data.waterStreak >= 7
  }
};

const MilestoneEngine = ({ 
  weightHistory, 
  calorieHistory, 
  wellnessHistory, 
  moodEntries,
  profile 
}) => {
  const [achievedMilestone, setAchievedMilestone] = useState(null);
  const [celebratedMilestones, setCelebratedMilestones] = useState(() => {
    const saved = localStorage.getItem('celebratedMilestones');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate streaks
  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.entry_date || b.created_at) - new Date(a.entry_date || a.created_at)
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.entry_date || entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  };

  // Calculate water streak
  const calculateWaterStreak = () => {
    const sorted = [...wellnessHistory].sort((a, b) => 
      new Date(b.entry_date) - new Date(a.entry_date)
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const entry of sorted) {
      if (entry.water_glasses >= 8) {
        const entryDate = new Date(entry.entry_date);
        entryDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else if (daysDiff > streak) {
          break;
        }
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Check goal reached
  const checkGoalReached = () => {
    if (!profile?.target_weight || weightHistory.length === 0) return false;
    const currentWeight = weightHistory[weightHistory.length - 1].weight;
    return currentWeight <= profile.target_weight;
  };

  // Check for new milestones
  useEffect(() => {
    const data = {
      weightStreak: calculateStreak(weightHistory),
      calorieStreak: calculateStreak(calorieHistory),
      moodStreak: calculateStreak(moodEntries),
      waterStreak: calculateWaterStreak(),
      goalReached: checkGoalReached()
    };

    // Check each milestone
    for (const milestone of Object.values(MILESTONES)) {
      if (milestone.check(data) && !celebratedMilestones.includes(milestone.id)) {
        // New milestone achieved!
        setAchievedMilestone(milestone);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
        });

        // Mark as celebrated
        const newCelebrated = [...celebratedMilestones, milestone.id];
        setCelebratedMilestones(newCelebrated);
        localStorage.setItem('celebratedMilestones', JSON.stringify(newCelebrated));

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setAchievedMilestone(null);
        }, 5000);

        break; // Only celebrate one at a time
      }
    }
  }, [weightHistory, calorieHistory, wellnessHistory, moodEntries, profile]);

  return (
    <AnimatePresence>
      {achievedMilestone && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="pointer-events-auto"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0, transition: spring }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
          >
            <GlassCard className="max-w-md mx-auto backdrop-blur-2xl bg-white/90 dark:bg-gray-900/90 border-white/20">
              <div className="p-8 text-center">
                {/* Icon with gradient background */}
                <motion.div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${achievedMilestone.color} flex items-center justify-center`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    transition: { ...spring, delay: 0.2 }
                  }}
                >
                  <achievedMilestone.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>

                {/* Title */}
                <motion.h2
                  className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                >
                  {achievedMilestone.title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  className="text-lg text-gray-600 dark:text-gray-400 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.4 } }}
                >
                  {achievedMilestone.message}
                </motion.p>

                {/* Dismiss hint */}
                <motion.button
                  onClick={() => setAchievedMilestone(null)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.5 } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MilestoneEngine;
