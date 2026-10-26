import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EvaluationProvider } from './context/EvaluationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { EvaluationResultView } from './components/evaluation/EvaluationResultView';
import { ReportPreviewModal } from './components/reports/ReportPreviewModal';
import { ProfileDashboardView } from './components/profile/ProfileDashboardView';
import { RecentPresentationsView } from './components/profile/RecentPresentationsView';
import { AllEvaluationsView } from './components/profile/AllEvaluationsView';
import { ReportsArchiveView } from './components/profile/ReportsArchiveView';
import { SettingsView } from './components/profile/SettingsView';
import { UploadModal } from './components/upload/UploadModal';
import { ProcessingModal } from './components/upload/ProcessingModal';
import { AuthToastNotification } from './components/common/AuthToastNotification';
import { pingBackendHealth } from './services/api';
import { AppView } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, login, toastState, closeToast } = useAuth();
  
  // Warm up Render backend immediately on page load
  React.useEffect(() => {
    pingBackendHealth();
  }, []);

  const [currentView, setCurrentView] = useState<AppView>(() => {
    const savedUser = localStorage.getItem('pe_auth_user');
    const isUserLoggedIn = !!savedUser;
    const savedView = sessionStorage.getItem('pe_current_view') as AppView;

    if (isUserLoggedIn) {
      if (savedView && savedView !== 'landing' && savedView !== 'login' && savedView !== 'register') {
        return savedView;
      }
      return 'dashboard';
    }
    return 'landing';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync currentView to sessionStorage
  React.useEffect(() => {
    sessionStorage.setItem('pe_current_view', currentView);
  }, [currentView]);

  // Automatically enforce view state depending on authentication status
  React.useEffect(() => {
    if (isAuthenticated) {
      if (currentView === 'landing' || currentView === 'login' || currentView === 'register') {
        setCurrentView('dashboard');
      }
    } else {
      if (currentView !== 'login' && currentView !== 'register') {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated]);

  const handleQuickDemo = () => {
    login('name@example.com', 'password');
    setCurrentView('dashboard');
  };

  const handleEvaluationComplete = () => {
    setCurrentView('evaluation');
  };

  const isAuthPage = currentView === 'login' || currentView === 'register';
  const isLandingPage = currentView === 'landing';
  const isProfileSection = currentView === 'profile' || 
                           currentView === 'recent-presentations' || 
                           currentView === 'all-evaluations' || 
                           currentView === 'reports-archive';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col w-full max-w-full overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full max-w-full min-w-0 overflow-x-hidden">
        
        {/* Left Side Profile Dashboard Sidebar (Shown ONLY when viewing Profile Dashboard sections) */}
        {isAuthenticated && isProfileSection && (
          <>
            {/* Desktop Left Sidebar */}
            <Sidebar 
              isOpen={true} 
              onClose={() => setIsSidebarOpen(false)}
              currentView={currentView}
              setCurrentView={setCurrentView}
              isDesktopStatic={true}
            />

            {/* Mobile Left Drawer */}
            <Sidebar 
              isOpen={isSidebarOpen} 
              onClose={() => setIsSidebarOpen(false)}
              currentView={currentView}
              setCurrentView={setCurrentView}
              isDesktopStatic={false}
            />
          </>
        )}

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
          <main className="flex-1 page-fade-enter" key={currentView}>
            {currentView === 'landing' && (
              <LandingPage 
                setCurrentView={setCurrentView} 
                onQuickDemo={handleQuickDemo}
              />
            )}

            {currentView === 'login' && (
              <LoginForm setCurrentView={setCurrentView} />
            )}

            {currentView === 'register' && (
              <RegisterForm setCurrentView={setCurrentView} />
            )}

            {currentView === 'dashboard' && (
              <Dashboard 
                setCurrentView={setCurrentView} 
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}

            {currentView === 'evaluation' && (
              <EvaluationResultView setCurrentView={setCurrentView} />
            )}

            {currentView === 'report' && (
              <ReportPreviewModal setCurrentView={setCurrentView} />
            )}

            {currentView === 'profile' && (
              <ProfileDashboardView setCurrentView={setCurrentView} />
            )}

            {currentView === 'recent-presentations' && (
              <RecentPresentationsView setCurrentView={setCurrentView} />
            )}

            {currentView === 'all-evaluations' && (
              <AllEvaluationsView setCurrentView={setCurrentView} />
            )}

            {currentView === 'reports-archive' && (
              <ReportsArchiveView setCurrentView={setCurrentView} />
            )}

            {currentView === 'settings' && (
              <SettingsView setCurrentView={setCurrentView} />
            )}
          </main>

          {/* Footer */}
          <Footer />
        </div>

      </div>

      {/* Modals for Upload, AI Processing Pipeline & Auth Popups */}
      <UploadModal onEvaluationComplete={handleEvaluationComplete} />
      <ProcessingModal />
      <AuthToastNotification 
        isOpen={toastState.isOpen}
        message={toastState.message}
        type={toastState.type}
        onClose={closeToast}
      />

    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EvaluationProvider>
          <MainAppContent />
        </EvaluationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
