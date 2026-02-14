import React, { useState, useEffect, memo } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Zap, Clock, Target, Dumbbell, Heart, 
  CheckCircle2, Play, Pause, RotateCcw, Send, Bell, 
  BellOff, Calendar, TrendingUp, Award, Info, X
} from 'lucide-react';
import { formatDate } from './utils/helpers';

// ============================================================================
// CONSTANTS
// ============================================================================

const SPRING_CONFIG = {
  default: { stiffness: 300, damping: 28, mass: 1 },
  snappy: { stiffness: 340, damping: 26, mass: 0.8 },
  gentle: { stiffness: 280, damping: 34, mass: 1.2 }
};

const ENERGY_LEVELS = [
  { id: 'high', label: 'High Energy', emoji: '⚡', color: 'from-yellow-500 to-orange-600' },
  { id: 'medium', label: 'Medium Energy', emoji: '💪', color: 'from-blue-500 to-indigo-600' },
  { id: 'low', label: 'Low Energy', emoji: '🌙', color: 'from-purple-500 to-pink-600' }
];

const TIME_OPTIONS = [
  { id: '15', label: '15 min', value: 15 },
  { id: '30', label: '30 min', value: 30 },
  { id: '45', label: '45 min', value: 45 },
  { id: '60', label: '60 min', value: 60 }
];

const EQUIPMENT_OPTIONS = [
  { id: 'none', label: 'No Equipment', icon: '🏃' },
  { id: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { id: 'resistance', label: 'Resistance Bands', icon: '💪' },
  { id: 'full', label: 'Full Gym', icon: '🏢' }
];

// ============================================================================
// ENERGY SELECTOR
// ============================================================================

const EnergySelector = memo(({ selected, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        How's your energy today?
      </label>
      <div className="grid grid-cols-3 gap-3">
        {ENERGY_LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`
              relative p-4 rounded-2xl border-2 transition-all
              ${selected === level.id 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{level.emoji}</div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {level.label}
              </div>
            </div>
            {selected === level.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-500" strokeWidth={2} />
              </motion.div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

EnergySelector.displayName = 'EnergySelector';

// ============================================================================
// TIME SELECTOR
// ============================================================================

const TimeSelector = memo(({ selected, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        How much time do you have?
      </label>
      <div className="grid grid-cols-4 gap-3">
        {TIME_OPTIONS.map((time) => (
          <button
            key={time.id}
            onClick={() => onSelect(time.value)}
            className={`
              p-3 rounded-xl border-2 transition-all
              ${selected === time.value 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <div className="text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-slate-600 dark:text-slate-400" strokeWidth={2} />
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {time.label}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

TimeSelector.displayName = 'TimeSelector';

// ============================================================================
// EQUIPMENT SELECTOR
// ============================================================================

const EquipmentSelector = memo(({ selected, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        What equipment do you have?
      </label>
      <div className="grid grid-cols-2 gap-3">
        {EQUIPMENT_OPTIONS.map((equipment) => (
          <button
            key={equipment.id}
            onClick={() => onSelect(equipment.id)}
            className={`
              p-4 rounded-2xl border-2 transition-all
              ${selected === equipment.id 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{equipment.icon}</div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {equipment.label}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

EquipmentSelector.displayName = 'EquipmentSelector';

// ============================================================================
// GENERATED WORKOUT CARD
// ============================================================================

const WorkoutCard = memo(({ workout, onStart, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {workout.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {workout.description}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            {workout.duration} min
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-xl bg-white/50 dark:bg-black/30">
          <Target className="w-5 h-5 mx-auto mb-1 text-indigo-500" strokeWidth={2} />
          <div className="text-xs text-slate-600 dark:text-slate-400">Target</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{workout.target}</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/50 dark:bg-black/30">
          <Zap className="w-5 h-5 mx-auto mb-1 text-orange-500" strokeWidth={2} />
          <div className="text-xs text-slate-600 dark:text-slate-400">Intensity</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{workout.intensity}</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/50 dark:bg-black/30">
          <Dumbbell className="w-5 h-5 mx-auto mb-1 text-purple-500" strokeWidth={2} />
          <div className="text-xs text-slate-600 dark:text-slate-400">Equipment</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{workout.equipment}</div>
        </div>
      </div>

      {/* Exercises Preview */}
      <div className="space-y-2 mb-4">
        {workout.exercises.slice(0, isExpanded ? undefined : 3).map((exercise, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-black/20"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {exercise.name}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {exercise.sets} × {exercise.reps} {exercise.rest && `• ${exercise.rest}s rest`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {workout.exercises.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium mb-4"
        >
          {isExpanded ? 'Show Less' : `Show ${workout.exercises.length - 3} More Exercises`}
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onStart}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          <Play className="w-4 h-4" strokeWidth={2} />
          Start Workout
        </button>
        <button
          onClick={onSave}
          className="px-4 py-3 bg-white/10 dark:bg-black/30 hover:bg-white/20 dark:hover:bg-black/40 rounded-xl transition-colors"
          aria-label="Save workout"
        >
          <Heart className="w-5 h-5 text-slate-600 dark:text-slate-400" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
});

WorkoutCard.displayName = 'WorkoutCard';

// ============================================================================
// AI REASONING CARD
// ============================================================================

const AIReasoning = memo(({ reasoning, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="backdrop-blur-xl bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        
        <div className="flex-1">
          <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
            Why this workout?
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {reasoning}
          </p>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-400" strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
});

AIReasoning.displayName = 'AIReasoning';

// ============================================================================
// PUSH NOTIFICATION SETTINGS
// ============================================================================

const PushSettings = memo(({ enabled, onToggle, time, onTimeChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Workout Reminders
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Get gentle suggestions when it's a good time to move
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`
            relative w-12 h-7 rounded-full transition-colors
            ${enabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}
          `}
        >
          <motion.div
            animate={{ x: enabled ? 20 : 0 }}
            transition={{ type: "spring", ...SPRING_CONFIG.snappy }}
            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow"
          />
        </button>
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-slate-200/20 dark:border-slate-700/30">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Preferred time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full px-4 py-2 bg-white/50 dark:bg-black/30 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                We'll send observational suggestions, never nagging reminders
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

PushSettings.displayName = 'PushSettings';

// ============================================================================
// TRAINING LAB VIEW - Main Component
// ============================================================================

const TrainingLabView = ({ user, showToast, darkMode }) => {
  const [energy, setEnergy] = useState('medium');
  const [time, setTime] = useState(30);
  const [equipment, setEquipment] = useState('none');
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushTime, setPushTime] = useState('18:00');

  // Mock AI workout generator
  const generateWorkout = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const workouts = {
        high: {
          title: 'High-Intensity Circuit',
          description: 'Fast-paced workout to match your energy',
          duration: time,
          target: 'Full Body',
          intensity: 'High',
          equipment: equipment === 'none' ? 'Bodyweight' : 'Mixed',
          exercises: [
            { name: 'Burpees', sets: 3, reps: 15, rest: 30 },
            { name: 'Jump Squats', sets: 3, reps: 20, rest: 30 },
            { name: 'Mountain Climbers', sets: 3, reps: 30, rest: 30 },
            { name: 'Push-ups', sets: 3, reps: 15, rest: 30 },
            { name: 'High Knees', sets: 3, reps: 45, rest: 30 },
          ],
          reasoning: `Your high energy today pairs well with intensity. This ${time}-minute circuit keeps your heart rate up and maximizes calorie burn while you're feeling strong.`
        },
        medium: {
          title: 'Balanced Strength Session',
          description: 'Steady-paced strength building',
          duration: time,
          target: 'Strength',
          intensity: 'Moderate',
          equipment: equipment === 'none' ? 'Bodyweight' : 'Weights',
          exercises: [
            { name: 'Squats', sets: 4, reps: 12, rest: 60 },
            { name: 'Push-ups', sets: 3, reps: 12, rest: 60 },
            { name: 'Lunges', sets: 3, reps: '10 each', rest: 60 },
            { name: 'Plank Hold', sets: 3, reps: '45s', rest: 60 },
            { name: 'Bent-over Rows', sets: 3, reps: 12, rest: 60 },
          ],
          reasoning: `With medium energy, we're focusing on controlled movements and strength. The ${time}-minute duration and 60-second rests let you maintain good form throughout.`
        },
        low: {
          title: 'Gentle Active Recovery',
          description: 'Low-impact movement to support recovery',
          duration: time,
          target: 'Recovery',
          intensity: 'Low',
          equipment: 'None',
          exercises: [
            { name: 'Walking', sets: 1, reps: '10 min', rest: 0 },
            { name: 'Gentle Stretching', sets: 1, reps: '5 min', rest: 0 },
            { name: 'Yoga Flow', sets: 1, reps: '10 min', rest: 0 },
            { name: 'Deep Breathing', sets: 1, reps: '5 min', rest: 0 },
          ],
          reasoning: `Your lower energy suggests active recovery today. This ${time}-minute session keeps you moving without taxing your system, supporting tomorrow's performance.`
        }
      };

      setGeneratedWorkout(workouts[energy]);
      setShowReasoning(true);
      setIsGenerating(false);
    }, 1500); // Simulate AI thinking
  };

  const handleStartWorkout = () => {
    showToast('Workout started! Timer will appear here.', 'success');
    // TODO: Navigate to workout timer view
  };

  const handleSaveWorkout = () => {
    showToast('Workout saved to your library', 'success');
    // TODO: Save to database
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          AI Training Lab
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Workouts that adapt to your context, energy, and goals
        </p>
      </motion.div>

      {/* Context Inputs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6 space-y-6"
      >
        <EnergySelector selected={energy} onSelect={setEnergy} />
        <TimeSelector selected={time} onSelect={setTime} />
        <EquipmentSelector selected={equipment} onSelect={setEquipment} />

        <button
          onClick={generateWorkout}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Sparkles className="w-5 h-5" strokeWidth={2} />
          {isGenerating ? 'Generating...' : 'Generate Workout'}
        </button>
      </motion.div>

      {/* AI Reasoning */}
      <AnimatePresence>
        {showReasoning && generatedWorkout && (
          <AIReasoning
            reasoning={generatedWorkout.reasoning}
            onDismiss={() => setShowReasoning(false)}
          />
        )}
      </AnimatePresence>

      {/* Generated Workout */}
      {generatedWorkout && (
        <WorkoutCard
          workout={generatedWorkout}
          onStart={handleStartWorkout}
          onSave={handleSaveWorkout}
        />
      )}

      {/* Push Notification Settings */}
      <PushSettings
        enabled={pushEnabled}
        onToggle={() => setPushEnabled(!pushEnabled)}
        time={pushTime}
        onTimeChange={setPushTime}
      />
    </div>
  );
};

export default TrainingLabView;
