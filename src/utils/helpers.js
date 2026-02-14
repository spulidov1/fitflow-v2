// ============================================================================
// FITFLOW V2.0 - UTILITIES
// ============================================================================

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Convert pounds to kilograms
 */
export const lbsToKg = (lbs) => {
  return (lbs * 0.453592).toFixed(1);
};

/**
 * Convert kilograms to pounds
 */
export const kgToLbs = (kg) => {
  return (kg * 2.20462).toFixed(1);
};

/**
 * Format weight based on user preference
 */
export const formatWeight = (weight, unit = 'lbs') => {
  if (unit === 'kg') {
    return `${lbsToKg(weight)} kg`;
  }
  return `${weight} lbs`;
};

/**
 * Calculate BMI
 */
export const calculateBMI = (weightLbs, heightInches) => {
  if (!weightLbs || !heightInches || heightInches === 0) return 0;
  return ((weightLbs / (heightInches * heightInches)) * 703).toFixed(1);
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-500' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-500' };
  return { label: 'Obese', color: 'text-red-500' };
};

/**
 * Validation: Positive number
 */
export const isPositiveNumber = (value) => {
  return !isNaN(value) && parseFloat(value) > 0;
};

/**
 * Validation: Weight range (50-500 lbs)
 */
export const isValidWeight = (weight) => {
  const num = parseFloat(weight);
  return !isNaN(num) && num >= 50 && num <= 500;
};

/**
 * Validation: Calories range (0-5000)
 */
export const isValidCalories = (calories) => {
  const num = parseFloat(calories);
  return !isNaN(num) && num >= 0 && num <= 5000;
};

/**
 * Validation: Sleep hours (0-24)
 */
export const isValidSleepHours = (hours) => {
  const num = parseFloat(hours);
  return !isNaN(num) && num >= 0 && num <= 24;
};

/**
 * Validation: Water glasses (0-30)
 */
export const isValidWaterGlasses = (glasses) => {
  const num = parseInt(glasses);
  return !isNaN(num) && num >= 0 && num <= 30;
};

/**
 * Validation: Email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validation: Password strength (min 6 chars)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Calculate weekly average weight loss
 */
export const calculateWeeklyAverage = (entries) => {
  if (entries.length < 2) return 0;
  const sorted = [...entries].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];
  const daysDiff = Math.max(1, (new Date(lastEntry.entry_date) - new Date(firstEntry.entry_date)) / (1000 * 60 * 60 * 24));
  const weightLost = firstEntry.weight - lastEntry.weight;
  return (weightLost / daysDiff * 7).toFixed(2);
};

/**
 * Calculate daily calorie average
 */
export const calculateDailyAverage = (entries) => {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  return Math.round(total / entries.length);
};

/**
 * Get entries for today
 */
export const getTodayEntries = (entries, dateField = 'entry_date') => {
  const today = formatDateForInput();
  return entries.filter(entry => entry[dateField] === today);
};

/**
 * Get entries for current week
 */
export const getThisWeekEntries = (entries, dateField = 'entry_date') => {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry[dateField]);
    return entryDate >= weekStart;
  });
};

/**
 * Get entries for last week
 */
export const getLastWeekEntries = (entries, dateField = 'entry_date') => {
  const now = new Date();
  const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  thisWeekStart.setHours(0, 0, 0, 0);
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry[dateField]);
    return entryDate >= lastWeekStart && entryDate < thisWeekStart;
  });
};

/**
 * Calculate streak (consecutive days with any activity)
 */
export const calculateStreak = (allEntries) => {
  if (allEntries.length === 0) return 0;
  
  // Get unique dates and sort descending
  const uniqueDates = [...new Set(allEntries.map(e => e.entry_date || e.photo_date))].sort().reverse();
  
  let streak = 0;
  const today = formatDateForInput();
  
  // Check if there's an entry today or yesterday (grace period)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateForInput(yesterday);
  
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
    return 0; // Streak broken
  }
  
  // Count consecutive days
  let checkDate = new Date(uniqueDates[0]);
  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = formatDateForInput(checkDate);
    if (uniqueDates.includes(currentDate)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

/**
 * Predict goal date based on current progress
 */
export const predictGoalDate = (entries, targetWeight) => {
  if (entries.length < 2) return null;
  
  const weeklyLoss = parseFloat(calculateWeeklyAverage(entries));
  if (weeklyLoss <= 0) return null;
  
  const currentWeight = entries[entries.length - 1].weight;
  const weightToLose = currentWeight - targetWeight;
  
  if (weightToLose <= 0) return null;
  
  const weeksNeeded = Math.ceil(weightToLose / weeklyLoss);
  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + (weeksNeeded * 7));
  
  return goalDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Generate random motivational quote
 */
const motivationalQuotes = [
  "Every step forward is progress. Keep going! 💪",
  "You're stronger than you think!",
  "Small changes lead to big results.",
  "Consistency is the key to success.",
  "Believe in yourself and all that you are.",
  "Your health is an investment, not an expense.",
  "Progress, not perfection.",
  "Make today count!",
  "You've got this! 🌟",
  "One day at a time, one step at a time.",
];

export const getRandomQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
};

/**
 * Compress image before upload
 */
export const compressImage = async (file, maxSizeMB = 2, maxWidthOrHeight = 1200) => {
  // Check if browser-image-compression is available
  if (typeof window !== 'undefined' && window.imageCompression) {
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    };
    try {
      return await window.imageCompression(file, options);
    } catch (error) {
      console.error('Image compression failed:', error);
      return file;
    }
  }
  return file;
};

/**
 * Check if file is valid image
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB before compression
  
  return {
    valid: validTypes.includes(file.type) && file.size <= maxSize,
    error: !validTypes.includes(file.type) 
      ? 'Please upload a JPEG, PNG, or WebP image.' 
      : file.size > maxSize 
      ? 'File size must be less than 5MB.'
      : null
  };
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Handle values that contain commas by wrapping in quotes
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate unique filename for storage
 */
export const generateUniqueFileName = (userId, originalName) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${userId}/${timestamp}.${extension}`;
};

/**
 * Debounce function for search/filter
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};
