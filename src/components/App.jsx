// App.jsx - Complete example with Phase 2 changes marked

import React, { useState, useEffect } from 'react';
import SovereignHomeView from './SovereignHomeView';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import ErrorBoundary from './components/ErrorBoundary';

import authService from './services/authService.js';
import { 
  weightService, 
  calorieService, 
  wellnessService,
  moodService  // ← PHASE 2: ADD THIS IMPORT
} from './services/dataservices';

function App() {
  // ============================================================================
  // AUTH STATE
  // ============================================================================
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // DATA STATE
  // ============================================================================
  const [profile, setProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [calorieHistory, setCalorieHistory] = useState([]);
  const [wellnessHistory, setWellnessHistory] = useState([]);
  const [moodEntries, setMoodEntries] = useState([]);  // ← PHASE 2: ADD THIS

  // ============================================================================
  // UI STATE
  // ============================================================================
  const [currentView, setCurrentView] = useState('home');
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [darkMode, setDarkMode] = useState(false);  // ← PHASE 2: ADD THIS

  // ============================================================================
  // PHASE 2: DARK MODE EFFECT
  // ============================================================================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // ============================================================================
  // AUTH CHECK
  // ============================================================================
  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FETCH USER DATA
  // ============================================================================
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData } = await userService.getProfile(user.id);
        if (profileData) setProfile(profileData);

        // Fetch weight history
        const { data: weightData } = await weightService.getWeightHistory(user.id);
        if (weightData) setWeightHistory(weightData);

        // Fetch calorie history
        const { data: calorieData } = await calorieService.getCalorieHistory(user.id);
        if (calorieData) setCalorieHistory(calorieData);

        // Fetch wellness history
        const { data: wellnessData } = await wellnessService.getWellnessHistory(user.id);
        if (wellnessData) setWellnessHistory(wellnessData);

        // ↓ PHASE 2: ADD MOOD ENTRIES FETCH ↓
        const { data: moodData } = await moodService.getMoodHistory(user.id);
        if (moodData) setMoodEntries(moodData);
        // ↑ END PHASE 2 ADD ↑

      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error loading data', 'error');
      }
    };

    fetchData();
  }, [user]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setWeightHistory([]);
      setCalorieHistory([]);
      setWellnessHistory([]);
      setMoodEntries([]);  // ← PHASE 2: CLEAR MOOD ENTRIES TOO
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // NOT AUTHENTICATED
  // ============================================================================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        {/* Your login/signup UI here */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to FitFlow
          </h1>
          <button
            onClick={() => {/* handle login */}}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN APP
  // ============================================================================
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
        {/* Navigation */}
        <Navigation
          currentView={currentView}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
          user={user}
          profile={profile}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'home' && (
            <SovereignHomeView
              user={user}
              profile={profile}
              weightHistory={weightHistory}
              calorieHistory={calorieHistory}
              wellnessHistory={wellnessHistory}
              moodEntries={moodEntries}        // ← PHASE 2: ADD THIS
              darkMode={darkMode}              // ← PHASE 2: ADD THIS
              setDarkMode={setDarkMode}        // ← PHASE 2: ADD THIS
              onNavigate={handleNavigate}
            />
          )}

          {/* Add other views here as needed */}
          {currentView === 'settings' && (
            <div>Settings View</div>
          )}
        </main>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Confirm Dialog */}
        {confirmDialog && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={() => {
              confirmDialog.onConfirm();
              setConfirmDialog(null);
            }}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
