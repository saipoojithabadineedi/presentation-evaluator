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
import { AppView } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleQuickDemo = () => {
    login('name@example.com', 'password');
    setCurrentView('dashboard');
  };

  const handleEvaluationComplete = () => {
    setCurrentView('evaluation');
  };

  const isAuthPage = currentView === 'login' || currentView === 'register';
  const isLandingPage = currentView === 'landing';
  const isInApp = isAuthenticated && !isAuthPage && !isLandingPage;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Layout Container with LEFT SIDEBAR on in-app pages */}
      <div className="flex-1 flex w-full">
        
        {/* Left Side Profile Dashboard Sidebar (Persistent on Desktop, Slide-out on Mobile) */}
        {isInApp && (
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
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1">
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

      {/* Modals for Upload & AI Processing Pipeline */}
      <UploadModal onEvaluationComplete={handleEvaluationComplete} />
      <ProcessingModal />

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
