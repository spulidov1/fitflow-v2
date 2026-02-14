import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, Activity, Flame, Target, User } from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose, onComplete, user }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    currentWeight: '',
    height: '',
    targetWeight: '',
    dailyCalories: '2000',
    unit: 'imperial' // imperial or metric
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const profileData = {
      name: formData.name,
      start_weight: parseFloat(formData.currentWeight),
      current_weight: parseFloat(formData.currentWeight),
      height_inches: parseFloat(formData.height),
      target_weight: parseFloat(formData.targetWeight),
      daily_calorie_goal: parseInt(formData.dailyCalories),
      unit_preference: formData.unit
    };

    await onComplete(profileData);
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.currentWeight && formData.height;
      case 3:
        return formData.targetWeight;
      case 4:
        return formData.dailyCalories;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-2 bg-slate-200 dark:bg-slate-700">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 1: Welcome & Name */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <User className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Welcome to FitFlow! 👋
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Let's personalize your fitness journey
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Current Stats */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <Activity className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Your Starting Point
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Let's record where you are today
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Current Weight (lbs)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                      placeholder="185"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Height (inches)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="70"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Example: 5'10" = 70 inches
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Goal Weight */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <Target className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Your Target
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    What's your goal weight?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Target Weight (lbs)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder="170"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-2xl font-bold text-center"
                  />
                  
                  {formData.currentWeight && formData.targetWeight && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                    >
                      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                        Goal: {formData.currentWeight > formData.targetWeight ? 'Lose' : 'Gain'}{' '}
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {Math.abs(parseFloat(formData.currentWeight) - parseFloat(formData.targetWeight)).toFixed(1)} lbs
                        </span>
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Daily Calorie Goal */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
                    <Flame className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Daily Nutrition Goal
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Set your target daily calories
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Daily Calorie Goal
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={formData.dailyCalories}
                    onChange={(e) => setFormData({ ...formData, dailyCalories: e.target.value })}
                    placeholder="2000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-2xl font-bold text-center"
                  />
                  
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[1500, 2000, 2500].map((cal) => (
                      <button
                        key={cal}
                        type="button"
                        onClick={() => setFormData({ ...formData, dailyCalories: cal.toString() })}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          formData.dailyCalories === cal.toString()
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {cal}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              
              <button
                onClick={step === totalSteps ? handleSubmit : handleNext}
                disabled={!canProceed()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {step === totalSteps ? (
                  <>
                    <Check className="w-5 h-5" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === step
                      ? 'w-6 bg-indigo-500'
                      : i < step
                      ? 'bg-indigo-400'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
