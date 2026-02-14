import React, { useState } from 'react';

const Navigation = ({ currentView, setCurrentView, user, onSignOut, darkMode }) => {
  const [showLogData, setShowLogData] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const NavButton = ({ view, label, onClick }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            setCurrentView(view);
            setShowMobileMenu(false);
          }
        }}
        className={`px-4 py-2 rounded-button font-medium transition-all ${
          isActive
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-md'
            : 'text-white hover:bg-white/10'
        }`}
      >
        {label}
      </button>
    );
  };

  const DropdownButton = ({ label, isOpen, setIsOpen, children }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-button font-medium text-white hover:bg-white/10 transition-all flex items-center gap-1"
      >
        {label}
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-button shadow-xl py-2 min-w-[160px] z-50">
          {children}
        </div>
      )}
    </div>
  );

  const DropdownItem = ({ view, label, icon }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setShowLogData(false);
        setShowProgress(false);
        setShowMobileMenu(false);
      }}
      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('home')}
              className="text-2xl font-bold text-white hover:scale-105 transition-transform"
            >
              💪 FitFlow
            </button>
            
            <div className="flex items-center gap-2">
              <NavButton view="home" label="Home" />
              <NavButton view="dashboard" label="Dashboard" />
              
              <DropdownButton
                label="Log Data"
                isOpen={showLogData}
                setIsOpen={setShowLogData}
              >
                <DropdownItem view="weight" label="Weight" icon="⚖️" />
                <DropdownItem view="calories" label="Calories" icon="🍎" />
                <DropdownItem view="wellness" label="Sleep & Water" icon="💧" />
              </DropdownButton>

              <DropdownButton
                label="Progress"
                isOpen={showProgress}
                setIsOpen={setShowProgress}
              >
                <DropdownItem view="photos" label="Photos" icon="📷" />
                <DropdownItem view="mood" label="Mood" icon="😊" />
              </DropdownButton>

              <NavButton view="training" label="Training" />
              <NavButton view="settings" label="Settings" />
            </div>
          </div>

          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-button font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-gradient-to-r from-primary-500 to-secondary-500 shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('home')}
            className="text-xl font-bold text-white"
          >
            💪 FitFlow
          </button>
          
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-white text-2xl p-2"
          >
            {showMobileMenu ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="bg-white dark:bg-gray-800 shadow-xl">
            <div className="px-4 py-2 space-y-1">
              <MobileNavItem view="home" label="🏠 Home" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <MobileNavItem view="dashboard" label="📊 Dashboard" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1">LOG DATA</div>
              <MobileNavItem view="weight" label="⚖️ Weight" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <MobileNavItem view="calories" label="🍎 Calories" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <MobileNavItem view="wellness" label="💧 Sleep & Water" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1">PROGRESS</div>
              <MobileNavItem view="photos" label="📷 Photos" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <MobileNavItem view="mood" label="😊 Mood" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <MobileNavItem view="training" label="🏋️ Training" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <MobileNavItem view="settings" label="⚙️ Settings" setCurrentView={setCurrentView} setShowMobileMenu={setShowMobileMenu} currentView={currentView} />
              <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              <button
                onClick={() => {
                  onSignOut();
                  setShowMobileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-button transition-colors font-medium"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

const MobileNavItem = ({ view, label, setCurrentView, setShowMobileMenu, currentView }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => {
        setCurrentView(view);
        setShowMobileMenu(false);
      }}
      className={`w-full text-left px-3 py-2 rounded-button transition-colors font-medium ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );
};

export default Navigation;
