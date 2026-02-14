import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Sun, Moon as MoonIcon, Cookie } from 'lucide-react';

const MealTypeSelector = ({ onSelect, currentMealType = null }) => {
  const [selectedMeal, setSelectedMeal] = useState(currentMealType);

  const mealTypes = [
    {
      id: 'breakfast',
      label: 'Breakfast',
      icon: Coffee,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      id: 'lunch',
      label: 'Lunch',
      icon: Sun,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      id: 'dinner',
      label: 'Dinner',
      icon: MoonIcon,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'snack',
      label: 'Snack',
      icon: Cookie,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-600 dark:text-pink-400'
    }
  ];

  const handleSelect = (mealType) => {
    setSelectedMeal(mealType.id);
    onSelect(mealType.id);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Meal Type
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {mealTypes.map((meal) => {
          const Icon = meal.icon;
          const isSelected = selectedMeal === meal.id;
          
          return (
            <motion.button
              key={meal.id}
              type="button"
              onClick={() => handleSelect(meal)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${meal.bgColor} ${meal.borderColor} shadow-lg`
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-2 ${
                isSelected
                  ? `bg-gradient-to-br ${meal.color}`
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}>
                <Icon 
                  className={isSelected ? 'text-white' : 'text-slate-500'} 
                  size={20} 
                  strokeWidth={2}
                />
              </div>
              
              {/* Label */}
              <div className={`text-sm font-medium ${
                isSelected 
                  ? meal.textColor 
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {meal.label}
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Auto-suggestion based on time */}
      {!selectedMeal && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-slate-500 dark:text-slate-400 text-center"
        >
          💡 Tip: Select the meal type for accurate tracking
        </motion.div>
      )}
    </div>
  );
};

// Standalone component for when used in forms
export const MealTypeBadge = ({ mealType }) => {
  const mealConfig = {
    breakfast: { icon: Coffee, color: 'bg-yellow-500', label: 'Breakfast' },
    lunch: { icon: Sun, color: 'bg-orange-500', label: 'Lunch' },
    dinner: { icon: MoonIcon, color: 'bg-purple-500', label: 'Dinner' },
    snack: { icon: Cookie, color: 'bg-pink-500', label: 'Snack' }
  };

  const config = mealConfig[mealType] || mealConfig.breakfast;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.color}/20 text-xs font-medium`}>
      <Icon size={12} className={`${config.color.replace('bg-', 'text-')}`} />
      {config.label}
    </span>
  );
};

// Helper function to auto-detect meal type based on time
export const getMealTypeFromTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 20) return 'dinner';
  return 'snack';
};

export default MealTypeSelector;
