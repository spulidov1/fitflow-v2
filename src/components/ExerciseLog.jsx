import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, Clock, Flame, Zap, X } from 'lucide-react';

const ExerciseLog = ({ onAddExercise, todayExercises = [] }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('cardio');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!exerciseName || !duration) return;

    onAddExercise({
      name: exerciseName,
      duration: parseInt(duration),
      type,
      timestamp: new Date().toISOString(),
      calories_burned: type === 'cardio' ? duration * 8 : duration * 5 // Rough estimate
    });

    // Reset form
    setExerciseName('');
    setDuration('');
    setShowForm(false);
  };

  const totalMinutes = todayExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const totalCalories = todayExercises.reduce((sum, ex) => sum + (ex.calories_burned || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="backdrop-blur-xl bg-white/8 dark:bg-black/40 rounded-3xl border border-slate-200/20 dark:border-slate-700/30 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Dumbbell className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Exercise Log
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Today's Activity
            </p>
          </div>
        </div>

        {/* Add button */}
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="p-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
          </motion.button>
        )}
      </div>

      {/* Stats Summary */}
      {todayExercises.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Time</span>
            </div>
            <p className="text-2xl font-bold text-purple-500">{totalMinutes}</p>
            <p className="text-xs text-slate-500">minutes</p>
          </div>
          
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-slate-600 dark:text-slate-400">Burned</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{totalCalories}</p>
            <p className="text-xs text-slate-500">calories</p>
          </div>
        </div>
      )}

      {/* Exercise Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 mb-4"
          >
            {/* Type selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('cardio')}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  type === 'cardio'
                    ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Cardio</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('strength')}
                className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                  type === 'strength'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  <span>Strength</span>
                </div>
              </button>
            </div>

            {/* Exercise name */}
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="Exercise name (e.g., Running, Squats)"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />

            {/* Duration */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Duration (minutes)"
                min="1"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!exerciseName || !duration}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log Exercise
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Exercise List */}
      {todayExercises.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Today's Exercises
          </p>
          <AnimatePresence>
            {todayExercises.map((exercise, index) => (
              <motion.div
                key={exercise.timestamp || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    exercise.type === 'cardio' 
                      ? 'bg-red-500/20 text-red-500' 
                      : 'bg-purple-500/20 text-purple-500'
                  }`}>
                    {exercise.type === 'cardio' ? (
                      <Zap className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <Dumbbell className="w-4 h-4" strokeWidth={2} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {exercise.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {exercise.duration} min • ~{exercise.calories_burned || 0} cal
                    </p>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  exercise.type === 'cardio'
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                }`}>
                  {exercise.type}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        !showForm && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Dumbbell className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No exercises logged today</p>
            <p className="text-xs mt-1">Click + to add your workout</p>
          </div>
        )
      )}
    </motion.div>
  );
};

export default ExerciseLog;
