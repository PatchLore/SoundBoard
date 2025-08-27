import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedMusicLibrary from './components/EnhancedMusicLibrary';
import OverlayJukebox from './components/OverlayJukebox';
import AgencyDashboard from './components/AgencyDashboard';
import ProfessionalAudioDashboard from './components/ProfessionalAudioDashboard';
import IntegrationDashboard from './components/IntegrationDashboard';
import StreamerMode from './components/StreamerMode';
import AuthFlow from './components/AuthFlow';
import PricingPage from './components/PricingPage';
import HomePage from './components/HomePage';
import authService, { User } from './services/authService';
// Enhanced music library with role-based access control

function App() {
  const [currentPage, setCurrentPage] = useState<'soundboard' | 'jukebox' | 'agency' | 'professional' | 'integrations'>('soundboard');
  const [isStreamerMode, setIsStreamerMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showHomePage, setShowHomePage] = useState(true);

  // Check for existing user on app load
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Route to appropriate dashboard based on user type
      if (user.userType === 'agency') {
        setCurrentPage('agency');
      } else {
        setCurrentPage('soundboard');
      }
    } else {
      setShowAuth(true);
    }
  }, []);

  // Handle HomePage signup
  const handleHomePageSignup = (userType: 'streamer' | 'agency', plan: string, email: string) => {
    console.log('HomePage signup:', { userType, plan, email });
    setShowHomePage(false);
    setShowAuth(true);
  };

  // Handle authentication success
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuth(false);
    setShowHomePage(false);
    // Route to appropriate dashboard
    if (user.userType === 'agency') {
      setCurrentPage('agency');
    } else {
      setCurrentPage('soundboard');
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowAuth(true);
    setCurrentPage('soundboard');
  };

  // Show HomePage if requested
  if (showHomePage) {
    return (
      <HomePage onSignup={handleHomePageSignup} />
    );
  }

  // Show auth flow if no user
  if (showAuth) {
    return (
      <AuthFlow 
        onAuthSuccess={handleAuthSuccess}
        onShowPricing={() => setShowPricing(true)}
      />
    );
  }

  // Show pricing page if requested
  if (showPricing) {
    return (
      <PricingPage 
        onSelectPlan={(userType, plan) => {
          setShowPricing(false);
          setShowAuth(true);
        }}
      />
    );
  }

  // Don't render main app if no user
  if (!currentUser) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-stream-dark">
        {/* Navigation Header */}
        <motion.header 
          className="bg-stream-darker border-b border-stream-light shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">Stream Soundboard</h1>
              </div>
              <nav className="flex items-center space-x-4">
                {/* User Profile */}
                <div className="flex items-center space-x-3 bg-stream-gray px-4 py-2 rounded-2xl">
                  <div className="text-sm text-gray-300">
                    <span className="font-medium">{currentUser.email}</span>
                    <span className="ml-2 text-xs bg-stream-accent px-2 py-1 rounded-full text-white">
                      {currentUser.userType === 'streamer' ? '🎮' : '🏢'} {currentUser.plan}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
                {/* Streamer Mode Toggle - Only for streamers */}
                {currentUser.userType === 'streamer' && (
                  <button
                    onClick={() => setIsStreamerMode(!isStreamerMode)}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                      isStreamerMode
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    {isStreamerMode ? '🎮 Exit Streamer Mode' : '🎮 Streamer Mode'}
                  </button>
                )}
                <button
                  onClick={() => setCurrentPage('soundboard')}
                  className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                    currentPage === 'soundboard'
                      ? 'bg-stream-accent text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-stream-gray'
                  }`}
                >
                  Soundboard
                </button>
                {/* Conditional navigation based on user type and plan */}
                {currentUser.userType === 'streamer' && (
                  <>
                    <button
                      onClick={() => setCurrentPage('jukebox')}
                      className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                        currentPage === 'jukebox'
                          ? 'bg-stream-accent text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-stream-gray'
                      }`}
                    >
                      Overlay Jukebox
                    </button>
                    {currentUser.plan === 'pro' && (
                      <>
                        <button
                          onClick={() => setCurrentPage('professional')}
                          className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                            currentPage === 'professional'
                              ? 'bg-stream-accent text-white shadow-lg'
                              : 'text-gray-300 hover:text-white hover:bg-stream-gray'
                          }`}
                        >
                          Professional Audio
                        </button>
                        <button
                          onClick={() => setCurrentPage('integrations')}
                          className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                            currentPage === 'integrations'
                              ? 'bg-stream-accent text-white shadow-lg'
                              : 'text-gray-300 hover:text-white hover:bg-stream-gray'
                          }`}
                        >
                          Integrations
                        </button>
                      </>
                    )}
                  </>
                )}
                
                {currentUser.userType === 'agency' && (
                  <button
                    onClick={() => setCurrentPage('agency')}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                      currentPage === 'agency'
                        ? 'bg-stream-accent text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-stream-gray'
                    }`}
                  >
                    Agency Dashboard
                  </button>
                )}
              </nav>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {currentPage === 'soundboard' ? (
              <motion.div
                key="soundboard"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <EnhancedMusicLibrary userRole={{ type: currentUser.userType, permissions: [], userId: currentUser.id || 'user' }} />
              </motion.div>
            ) : currentPage === 'jukebox' && currentUser.userType === 'streamer' ? (
              <motion.div
                key="jukebox"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <OverlayJukebox />
              </motion.div>
            ) : currentPage === 'agency' && currentUser.userType === 'agency' ? (
              <motion.div
                key="agency"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <AgencyDashboard />
              </motion.div>
            ) : currentPage === 'professional' && currentUser.userType === 'streamer' && currentUser.plan === 'pro' ? (
              <motion.div
                key="professional"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <ProfessionalAudioDashboard />
              </motion.div>
            ) : currentPage === 'integrations' && currentUser.userType === 'streamer' && currentUser.plan === 'pro' ? (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
              >
                <IntegrationDashboard />
              </motion.div>
            ) : (
              <motion.div
                key="fallback"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                className="text-center py-20"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Page Not Available</h2>
                <p className="text-gray-400 mb-6">
                  This page is not available for your current plan or user type.
                </p>
                <button
                  onClick={() => setCurrentPage('soundboard')}
                  className="bg-stream-accent hover:bg-stream-accent/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  Go to Soundboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Streamer Mode Overlay - Only for streamers */}
      {currentUser.userType === 'streamer' && (
        <StreamerMode 
          isActive={isStreamerMode} 
          onToggle={() => setIsStreamerMode(false)} 
        />
      )}
    </>
  );
}

export default App;

