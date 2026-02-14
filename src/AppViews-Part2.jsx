// ============================================================================
// FITFLOW V2.0 - VIEW COMPONENTS PART 2
// ============================================================================
// Remaining view components: Wellness, Photos, Mood, Training, Settings
// ============================================================================

import React, { useState } from 'react';
import { 
  formatDate, 
  formatDateForInput,
  isValidSleepHours,
  isValidWaterGlasses,
  exportToCSV,
  storage
} from './utils/helpers';
import { wellnessService, moodService, userService } from './services/data.service.js';
import photoService from './services/photo.service';
import authService from './services/auth.service';

// ============================================================================
// WELLNESS VIEW (Sleep & Water)
// ============================================================================

export const WellnessView = ({ user, wellnessHistory, setWellnessHistory, showToast, setConfirmDialog, darkMode }) => {
  const [sleepHours, setSleepHours] = useState('');
  const [waterGlasses, setWaterGlasses] = useState('');
  const [wellnessDate, setWellnessDate] = useState(formatDateForInput());
  const [loading, setLoading] = useState(false);

  const handleAddWellness = async (e) => {
    e.preventDefault();
    
    if (sleepHours && !isValidSleepHours(sleepHours)) {
      showToast('Sleep hours must be between 0-24', 'error');
      return;
    }

    if (waterGlasses && !isValidWaterGlasses(waterGlasses)) {
      showToast('Water glasses must be between 0-30', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await wellnessService.addWellnessEntry(
        user.id,
        parseFloat(sleepHours) || 0,
        parseInt(waterGlasses) || 0,
        wellnessDate
      );

      if (error) throw error;

      setWellnessHistory([...wellnessHistory, data]);
      showToast('Wellness logged successfully!', 'success');
      setSleepHours('');
      setWaterGlasses('');
      setWellnessDate(formatDateForInput());
    } catch (error) {
      showToast('Failed to log wellness', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWellness = (entryId) => {
    setConfirmDialog({
      title: 'Delete Wellness Entry',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await wellnessService.deleteWellnessEntry(entryId, user.id);
          setWellnessHistory(wellnessHistory.filter(w => w.id !== entryId));
          showToast('Wellness entry deleted', 'success');
        } catch (error) {
          showToast('Failed to delete entry', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wellness Tracking 💧</h1>

      {/* Add Wellness Form */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log Sleep & Water</h2>
        <form onSubmit={handleAddWellness} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                😴 Sleep (hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="8"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                💧 Water (glasses)
              </label>
              <input
                type="number"
                value={waterGlasses}
                onChange={(e) => setWaterGlasses(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="8"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={wellnessDate}
                onChange={(e) => setWellnessDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 rounded-button font-medium transition-colors"
          >
            {loading ? 'Adding...' : 'Log Wellness'}
          </button>
        </form>
      </div>

      {/* Wellness History */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">History</h2>
        {wellnessHistory.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            No wellness entries yet. Add your first one above!
          </p>
        ) : (
          <div className="space-y-2">
            {[...wellnessHistory].reverse().map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-button">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    😴 {entry.sleep_hours}h sleep • 💧 {entry.water_glasses} glasses
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(entry.entry_date)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteWellness(entry.id)}
                  className="text-red-500 hover:text-red-600 px-3 py-1 rounded-button hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// PHOTOS VIEW
// ============================================================================

export const PhotosView = ({ user, progressPhotos, setProgressPhotos, showToast, setConfirmDialog, darkMode }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoDate, setPhotoDate] = useState(formatDateForInput());
  const [photoNotes, setPhotoNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Please upload a JPEG, PNG, or WebP image', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showToast('Please select a photo', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await photoService.uploadPhoto(
        user.id,
        selectedFile,
        photoDate,
        photoNotes
      );

      if (error) throw error;

      setProgressPhotos([data, ...progressPhotos]);
      showToast('Photo uploaded successfully!', 'success');
      
      // Reset form
      setSelectedFile(null);
      setPhotoPreview(null);
      setPhotoNotes('');
      setPhotoDate(formatDateForInput());
    } catch (error) {
      showToast(error.message || 'Failed to upload photo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (photoId) => {
    setConfirmDialog({
      title: 'Delete Photo',
      message: 'Are you sure you want to delete this photo? This cannot be undone.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await photoService.deletePhoto(photoId, user.id);
          setProgressPhotos(progressPhotos.filter(p => p.id !== photoId));
          showToast('Photo deleted', 'success');
        } catch (error) {
          showToast('Failed to delete photo', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Photos 📷</h1>

      {/* Upload Form */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Upload Photo</h2>
        <form onSubmit={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Photo
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Max 5MB. JPEG, PNG, or WebP format.
            </p>
          </div>

          {photoPreview && (
            <div className="border-2 border-gray-200 dark:border-gray-600 rounded-card p-2">
              <img src={photoPreview} alt="Preview" className="w-full h-64 object-contain" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={photoDate}
                onChange={(e) => setPhotoDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="How are you feeling?"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 rounded-button font-medium transition-colors"
          >
            {loading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      </div>

      {/* Photo Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gallery</h2>
        {progressPhotos.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            No photos yet. Upload your first progress photo above!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {progressPhotos.map(photo => (
              <div key={photo.id} className="bg-gray-50 dark:bg-gray-700 rounded-card overflow-hidden">
                <img 
                  src={photo.photo_url} 
                  alt="Progress" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(photo.photo_date)}
                  </div>
                  {photo.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {photo.notes}
                    </div>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="mt-3 w-full text-red-500 hover:text-red-600 py-2 rounded-button hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MOOD VIEW
// ============================================================================

export const MoodView = ({ user, moodEntries, setMoodEntries, showToast, setConfirmDialog, darkMode }) => {
  const [selectedMood, setSelectedMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [moodNotes, setMoodNotes] = useState('');
  const [moodDate, setMoodDate] = useState(formatDateForInput());
  const [loading, setLoading] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😌', label: 'Calm', value: 'calm' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😔', label: 'Sad', value: 'sad' },
    { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
    { emoji: '😰', label: 'Anxious', value: 'anxious' }
  ];

  const handleAddMood = async (e) => {
    e.preventDefault();
    
    if (!selectedMood) {
      showToast('Please select a mood', 'error');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await moodService.addMoodEntry(
        user.id,
        selectedMood,
        energyLevel,
        moodNotes,
        moodDate
      );

      if (error) throw error;

      setMoodEntries([data, ...moodEntries]);
      showToast('Mood logged successfully!', 'success');
      
      // Reset form
      setSelectedMood('');
      setEnergyLevel(5);
      setMoodNotes('');
      setMoodDate(formatDateForInput());
    } catch (error) {
      showToast('Failed to log mood', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMood = (entryId) => {
    setConfirmDialog({
      title: 'Delete Mood Entry',
      message: 'Are you sure you want to delete this entry?',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: async () => {
        try {
          await moodService.deleteMoodEntry(entryId, user.id);
          setMoodEntries(moodEntries.filter(m => m.id !== entryId));
          showToast('Mood entry deleted', 'success');
        } catch (error) {
          showToast('Failed to delete entry', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mood Tracker 😊</h1>

      {/* Add Mood Form */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How are you feeling?</h2>
        <form onSubmit={handleAddMood} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Mood
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {moods.map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-card border-2 transition-all ${
                    selectedMood === mood.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mood.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Energy Level: {energyLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={moodDate}
                onChange={(e) => setMoodDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={moodNotes}
                onChange={(e) => setMoodNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="What's on your mind?"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 rounded-button font-medium transition-colors"
          >
            {loading ? 'Saving...' : 'Log Mood'}
          </button>
        </form>
      </div>

      {/* Mood History */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mood History</h2>
        {moodEntries.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            No mood entries yet. Log your first mood above!
          </p>
        ) : (
          <div className="space-y-2">
            {moodEntries.map(entry => {
              const mood = moods.find(m => m.value === entry.mood);
              return (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-button">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mood?.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {mood?.label} • Energy: {entry.energy_level}/10
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(entry.entry_date)}
                        {entry.notes && ` • ${entry.notes}`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMood(entry.id)}
                    className="text-red-500 hover:text-red-600 px-3 py-1 rounded-button hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TRAINING VIEW (Placeholder)
// ============================================================================

export const TrainingView = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training Lab 🏋️</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-card p-12 shadow-lg text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Coming Soon!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Workout tracking, exercise library, and training programs will be available in the next update.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// SETTINGS VIEW
// ============================================================================

export const SettingsView = ({ 
  user, 
  profile, 
  setProfile, 
  darkMode, 
  setDarkMode, 
  showToast, 
  setConfirmDialog,
  weightHistory,
  calorieHistory,
  wellnessHistory
}) => {
  const [name, setName] = useState(profile?.name || '');
  const [heightFt, setHeightFt] = useState(Math.floor((profile?.height_inches || 70) / 12));
  const [heightIn, setHeightIn] = useState((profile?.height_inches || 70) % 12);
  const [targetWeight, setTargetWeight] = useState(profile?.target_weight || '');
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(profile?.daily_calorie_goal || 2000);
  const [unitPreference, setUnitPreference] = useState(profile?.unit_preference || 'lbs');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalHeightInches = (parseInt(heightFt) * 12) + parseInt(heightIn);
      
      const { data, error } = await userService.updateProfile(user.id, {
        name,
        height_inches: totalHeightInches,
        target_weight: parseFloat(targetWeight) || 0,
        daily_calorie_goal: parseInt(dailyCalorieGoal),
        unit_preference: unitPreference
      });

      if (error) throw error;

      setProfile(data);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    try {
      if (weightHistory.length > 0) {
        exportToCSV(weightHistory, 'fitflow-weight-history.csv');
      }
      if (calorieHistory.length > 0) {
        exportToCSV(calorieHistory, 'fitflow-calorie-history.csv');
      }
      if (wellnessHistory.length > 0) {
        exportToCSV(wellnessHistory, 'fitflow-wellness-history.csv');
      }
      showToast('Data exported successfully!', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleDeleteAccount = () => {
    setConfirmDialog({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.',
      confirmText: 'Delete Account',
      type: 'danger',
      onConfirm: async () => {
        try {
          await userService.deleteAccount(user.id);
          await authService.signOut();
          showToast('Account deleted', 'success');
        } catch (error) {
          showToast('Failed to delete account', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings ⚙️</h1>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Height
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Feet"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Inches"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Weight (lbs)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Calorie Goal
              </label>
              <input
                type="number"
                value={dailyCalorieGoal}
                onChange={(e) => setDailyCalorieGoal(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-2 rounded-button font-medium transition-colors"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark theme
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data</h2>
        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-button font-medium transition-colors"
          >
            📥 Export My Data (CSV)
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-button font-medium transition-colors"
        >
          Delete Account
        </button>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This will permanently delete your account and all data. This action cannot be undone.
        </p>
      </div>
    </div>
  );
};

export default {
  WellnessView,
  PhotosView,
  MoodView,
  TrainingView,
  SettingsView
};
