import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import Modal from './components/Modal';
import ConfirmDialog from './components/ConfirmDialog';
import LoadingSkeleton from './components/LoadingSkeleton';
import Navigation from './components/Navigation';

// Services
import authService from './services/auth.service';
import photoService from './services/photo.service';
import { weightService, calorieService, wellnessService, moodService, userService } from './services/data.service.js';

// Utils
import {
  formatDate,
  formatDateForInput,
  formatWeight,
  calculateBMI,
  getBMICategory,
  isValidWeight,
  isValidCalories,
  isValidSleepHours,
  isValidWaterGlasses,
  isValidEmail,
  isValidPassword,
  calculateWeeklyAverage,
  calculateDailyAverage,
  getTodayEntries,
  getThisWeekEntries,
  calculateStreak,
  predictGoalDate,
  getRandomQuote,
  exportToCSV,
  storage
} from './utils/helpers';

// Import PREMIUM views
import { DashboardView } from './Phase2-EnhancedDashboard';
import { WeightView } from './Phase3-EnhancedWeight';
import { CaloriesView } from './Phase4-EnhancedCalories';
import DailyIntelligence from './Sovereign-DailyIntelligence';
import MilestoneEngine from './Sovereign-MilestoneEngine';
import { WellnessView } from './Sovereign-WellnessView';
import SovereignHomeView from './SovereignHomeView';
import {
  PhotosView,
  MoodView,
  TrainingView,
  SettingsView
} from './AppViews-Part2';
import TrainingLabView from './TrainingLabView';
import DailyLogView from './DailyLogView';
import { useAppContext } from './Phase1-AppContext';
import CommandPalette from './Phase1-CommandPalette';
import UndoToastContainer from './Phase1-UndoToast';
import OnboardingModal from './components/OnboardingModal';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => {
  // Get context
  const { navigationCallback } = useAppContext();
  
  // Auth & User State
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
 useEffect(() => {
    console.log('🔍 currentView changed to:', currentView);
  }, [currentView]);

  // Data State
  const [weightHistory, setWeightHistory] = useState([]);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [wellnessHistory, setWellnessHistory] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  
  // UI State // 
  // Smart dark mode: auto-detect based on time, allow override
const getInitialDarkMode = () => {
  const saved = storage.get('darkMode', null);
  if (saved !== null) return saved; // User preference exists
  
  // Auto-detect based on time (6pm - 6am = dark mode)
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
};

const [darkMode, setDarkMode] = useState(getInitialDarkMode());
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authRememberMe, setAuthRememberMe] = useState(false);

  // ============================================================================
  // INITIALIZATION & AUTH
  // ============================================================================

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        loadUserData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setCurrentView('home');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  
    // Persist dark mode
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

 
  const checkUser = async () => {
    try {
      const { user: currentUser } = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const [profileData, weights, calories, wellness, moods, photos] = await Promise.all([
        userService.getProfile(userId),
        weightService.getWeightHistory(userId),
        calorieService.getCalorieHistory(userId),
        wellnessService.getWellnessHistory(userId),
        moodService.getMoodEntries(userId),
        photoService.getPhotos(userId)
      ]);

      if (profileData.data) setProfile(profileData.data);
      if (weights.data) setWeightHistory(weights.data);
      if (calories.data) setCalorieHistory(calories.data);
      if (wellness.data) setWellnessHistory(wellness.data);
      if (moods.data) setMoodEntries(moods.data);
      if (photos.data) setProgressPhotos(photos.data);

      // Check if new user needs onboarding
      if (profileData.data && !profileData.data.start_weight) {
        setShowOnboarding(true);
        setCurrentView('home');
      } else {
        setCurrentView('home');
      }


    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('Failed to load data', 'error');
    }
  };

  // ============================================================================
  // AUTH FUNCTIONS
  // ============================================================================

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!isValidEmail(authEmail)) {
      setAuthError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(authPassword)) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    if (!authName.trim()) {
      setAuthError('Please enter your name');
      return;
    }

    try {
      const { data, error } = await authService.signUp(authEmail, authPassword, authName);
      if (error) throw error;
      showToast('Account created! Please check your email to verify.', 'success');
      setShowAuthModal(false);
      resetAuthForm();
    } catch (error) {
      setAuthError(error.message || 'Failed to create account');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!isValidEmail(authEmail)) {
      setAuthError('Please enter a valid email address');
      return;
    }

    try {
      const { data, error } = await authService.signIn(authEmail, authPassword, authRememberMe);
      if (error) throw error;
      setShowAuthModal(false);
      resetAuthForm();
    } catch (error) {
      setAuthError(error.message || 'Invalid email or password');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      setAuthError(error.message || 'Failed to sign in with Google');
    }
  };

  const handleOnboardingComplete = async (profileData) => {
  try {
    if (!user?.id) return;

    // Update profile with onboarding data
    const { data, error } = await userService.updateProfile(user.id, profileData);
    
    if (error) throw error;

    // Reload user data
    await loadUserData(user.id);
    
    showToast('Profile setup complete! 🎉', 'success');
  } catch (error) {
    console.error('Error completing onboarding:', error);
    showToast('Failed to save profile', 'error');
  }
};

  const handleSignOut = async () => {
    setConfirmDialog({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Sign Out',
      type: 'info',
      onConfirm: async () => {
        try {
          await authService.signOut();
          showToast('Signed out successfully', 'success');
        } catch (error) {
          showToast('Failed to sign out', 'error');
        }
      }
    });
  };

  const resetAuthForm = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError('');
    setAuthRememberMe(false);
  };

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  const showToast = (message, type = 'success', showUndo = false, onUndo = null) => {
    setToast({ message, type, showUndo, onUndo });
  };

  const closeToast = () => {
    setToast(null);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">
          Loading FitFlow...
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          
          {/* Navigation - Only show when logged in */}
          {user && (
            <Navigation
              currentView={currentView}
              setCurrentView={setCurrentView}
              user={user}
              onSignOut={handleSignOut}
              darkMode={darkMode}
            />
          )}

          {/* Main Content */}
<main className="w-full px-6 py-8"> {!user ? (
              <LandingPage
                onGetStarted={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                onSignIn={() => {
                  setAuthMode('signin');
                  setShowAuthModal(true);
                }}
              />
            ) : (
              <>
{currentView === 'home' && (
  <SovereignHomeView 
    user={user} 
    profile={profile}
    weightHistory={weightHistory}
    calorieHistory={calorieHistory}
    wellnessHistory={wellnessHistory}
    onNavigate={setCurrentView}
  />
)}
 {currentView === 'dashboard' && user && (
  <>
    {/* Daily Intelligence Card - appears first */}
    <div className="mb-8">
      <DailyIntelligence
        weightHistory={weightHistory}
        calorieHistory={calorieHistory}
        wellnessHistory={wellnessHistory}
        moodEntries={moodEntries}
        profile={profile}
      />
    </div>
    
    {/* Dashboard below intelligence */}
    <DashboardView
      user={user}
      profile={profile}
      weightHistory={weightHistory}
      calorieHistory={calorieHistory}
      wellnessHistory={wellnessHistory}
      moodEntries={moodEntries}
      darkMode={darkMode}
    />
  </>
)}
                {currentView === 'weight' && (
                  <WeightView
                    user={user}
                    profile={profile}
                    weightHistory={weightHistory}
                    setWeightHistory={setWeightHistory}
                    showToast={showToast}
                    setConfirmDialog={setConfirmDialog}
                    darkMode={darkMode}
                  />
                )}
                {currentView === 'calories' && (
                  <CaloriesView
                    user={user}
                    profile={profile}
                    calorieHistory={calorieHistory}
                    setCalorieHistory={setCalorieHistory}
                    showToast={showToast}
                    setConfirmDialog={setConfirmDialog}
                    darkMode={darkMode}
                  />
                )}
                {currentView === 'wellness' && (
                  <WellnessView
                    user={user}
                    wellnessHistory={wellnessHistory}
                    setWellnessHistory={setWellnessHistory}
                    showToast={showToast}
                    setConfirmDialog={setConfirmDialog}
                    darkMode={darkMode}
                  />
                )}
                {currentView === 'photos' && (
                  <PhotosView
                    user={user}
                    progressPhotos={progressPhotos}
                    setProgressPhotos={setProgressPhotos}
                    showToast={showToast}
                    setConfirmDialog={setConfirmDialog}
                    darkMode={darkMode}
                  />
                )}
                {currentView === 'mood' && (
                  <DailyLogView 
                    user={user}
                    moodEntries={moodEntries}
                    setMoodEntries={setMoodEntries}
                    showToast={showToast}
                    setConfirmDialog={setConfirmDialog}
                    darkMode={darkMode}
                  />
                )}
                {currentView === 'training' && (
                  <TrainingLabView 
                    user={user}
                   showToast={showToast}
                    darkMode={darkMode}
                   />
        )}
                {currentView === 'settings' && (
                  <SettingsView
                    user={user}
                    profile={profile}
                    setProfile={setProfile}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    showToast={showToast}
                    setConfirmDialog={setConfirmDialog}
                    weightHistory={weightHistory}
                    calorieHistory={calorieHistory}
                    wellnessHistory={wellnessHistory}
                  />
                )}
              </>
            )}
          </main>

          {/* Auth Modal */}
          {showAuthModal && (
            <Modal
              isOpen={showAuthModal}
              onClose={() => {
                setShowAuthModal(false);
                resetAuthForm();
              }}
              title={authMode === 'signin' ? 'Sign In' : 'Create Account'}
            >
              <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
                {authError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-button">
                    {authError}
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-button bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {authMode === 'signin' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={authRememberMe}
                      onChange={(e) => setAuthRememberMe(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-button font-medium transition-colors"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-button font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {authMode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthError('');
                        }}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setAuthError('');
                        }}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </form>
            </Modal>
          )}

            {showOnboarding && user && (
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onComplete={handleOnboardingComplete}
            user={user}
          />
        )}

          {/* Toast Notifications */}
          {toast && (
            <div className="fixed bottom-4 right-4 z-50">
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
                showUndo={toast.showUndo}
                onUndo={toast.onUndo}
              />
            </div>
          )}

          {/* Confirm Dialog */}
          {confirmDialog && (
            <ConfirmDialog
              isOpen={!!confirmDialog}
              onClose={() => setConfirmDialog(null)}
              onConfirm={confirmDialog.onConfirm}
              title={confirmDialog.title}
              message={confirmDialog.message}
              confirmText={confirmDialog.confirmText}
              type={confirmDialog.type}
            />
          )}

           <CommandPalette />
          <UndoToastContainer />
          
          {/* Milestone Engine - celebrates achievements */}
          {user && (
            <MilestoneEngine
              weightHistory={weightHistory}
              calorieHistory={calorieHistory}
              wellnessHistory={wellnessHistory}
              moodEntries={moodEntries}
              profile={profile}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

// ============================================================================
// VIEW COMPONENTS - These will be defined below
// ============================================================================

// Landing Page Component
const LandingPage = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="text-center py-20">
      <div className="mb-8">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            💪 FitFlow
          </span>
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-400">
          Track Your Fitness Journey
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
          <div className="text-4xl mb-4">⚖️</div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Weight Tracking</h3>
          <p className="text-gray-600 dark:text-gray-400">Monitor your progress with detailed charts</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
          <div className="text-4xl mb-4">🍎</div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Calorie Logging</h3>
          <p className="text-gray-600 dark:text-gray-400">Track your daily nutrition intake</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-card p-6 shadow-lg">
          <div className="text-4xl mb-4">📷</div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Progress Photos</h3>
          <p className="text-gray-600 dark:text-gray-400">Visual journey of your transformation</p>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={onGetStarted}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-button font-medium text-lg transition-colors"
        >
          Get Started Free
        </button>
        <button
          onClick={onSignIn}
          className="border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-8 py-3 rounded-button font-medium text-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

// Home Page (logged in)
const HomePage = ({ user, profile }) => {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome back, {profile?.name || user.email}! 👋
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        Ready to continue your fitness journey?
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-card p-8 max-w-2xl mx-auto shadow-lg">
        <p className="text-gray-700 dark:text-gray-300">
          Use the navigation above to access your dashboard, log new data, or view your progress!
        </p>
      </div>
    </div>
  );
};

// NOTE: The view components (DashboardView, WeightView, etc.) are too large for one file.
// I'll create them in a separate file that you'll download next.

export default App;
