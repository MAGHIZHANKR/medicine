import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIScheduleModal } from './components/AIScheduleModal';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Medicines } from './pages/Medicines';
import { AddMedicine } from './pages/AddMedicine';
import { History } from './pages/History';
import { Caregiver } from './pages/Caregiver';
import { CaregiverDashboard } from './pages/CaregiverDashboard';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

import { Medicine, AIReminderParseResult } from './types';

const MainApp: React.FC = () => {
  const { user, loading } = useAuthContext();

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Synchronize initial tab based on user auth status
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (currentTab === 'landing' || currentTab === 'login' || currentTab === 'register') {
          setCurrentTab(user.role === 'caregiver' ? 'caregiver-dashboard' : 'dashboard');
        }
      } else {
        if (currentTab !== 'landing' && currentTab !== 'login' && currentTab !== 'register') {
          setCurrentTab('landing');
        }
      }
    }
  }, [user, loading]);

  const handleNavigate = (tab: string) => {
    if (tab !== 'add-medicine') {
      setEditingMedicine(null);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setCurrentTab('add-medicine');
  };

  const handleAiParsedReview = (parsed: AIReminderParseResult) => {
    setEditingMedicine({
      id: '',
      userId: user?.uid || '',
      name: parsed.name,
      dosage: parsed.dosage,
      time: parsed.time,
      frequency: parsed.frequency,
      foodInstruction: parsed.foodInstruction,
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      notes: parsed.notes,
      createdAt: new Date().toISOString()
    });
    setCurrentTab('add-medicine');
  };

  const isPublicPage = currentTab === 'landing' || currentTab === 'login' || currentTab === 'register';

  return (
    <div className="min-h-screen bg-[#F7F9F9] text-[#1A2E2E] flex flex-col font-sans antialiased selection:bg-[#E0F2F1] selection:text-[#0D5A5A]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Global AI Setup Modal */}
      <AIScheduleModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccessNavigate={() => handleNavigate('medicines')}
        onOpenEditForm={handleAiParsedReview}
      />

      {/* Main Body */}
      {isPublicPage ? (
        <main className="flex-1">
          {currentTab === 'landing' && <Landing onNavigate={handleNavigate} />}
          {currentTab === 'login' && <Login onNavigate={handleNavigate} />}
          {currentTab === 'register' && <Register onNavigate={handleNavigate} />}
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={handleNavigate}
            onOpenAiModal={() => setIsAiModalOpen(true)}
          />

          {/* Main Dashboard Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
            {currentTab === 'dashboard' && (
              <ProtectedRoute
                requiredRole="patient"
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('caregiver-dashboard')}
              >
                <Dashboard
                  onNavigate={handleNavigate}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />
              </ProtectedRoute>
            )}

            {currentTab === 'medicines' && (
              <ProtectedRoute
                requiredRole="patient"
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('caregiver-dashboard')}
              >
                <Medicines
                  onNavigate={handleNavigate}
                  onEditMedicine={handleEditMedicine}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />
              </ProtectedRoute>
            )}

            {currentTab === 'add-medicine' && (
              <ProtectedRoute
                requiredRole="patient"
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('caregiver-dashboard')}
              >
                <AddMedicine
                  initialMedicine={editingMedicine}
                  onNavigate={handleNavigate}
                  onSuccess={() => setEditingMedicine(null)}
                />
              </ProtectedRoute>
            )}

            {currentTab === 'history' && (
              <ProtectedRoute
                requiredRole="patient"
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('caregiver-dashboard')}
              >
                <History onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}

            {currentTab === 'caregiver' && (
              <ProtectedRoute
                requiredRole="patient"
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('caregiver-dashboard')}
              >
                <Caregiver onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}

            {(currentTab === 'caregiver-dashboard' || currentTab === 'connect-patient') && (
              <ProtectedRoute
                requiredRole="caregiver"
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('dashboard')}
              >
                <CaregiverDashboard onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}

            {currentTab === 'settings' && (
              <ProtectedRoute
                onRedirectToLogin={() => handleNavigate('login')}
                onRedirectToHome={() => handleNavigate('dashboard')}
              >
                <Settings onNavigate={handleNavigate} />
              </ProtectedRoute>
            )}

            {![
              'dashboard',
              'medicines',
              'add-medicine',
              'history',
              'caregiver',
              'caregiver-dashboard',
              'connect-patient',
              'settings'
            ].includes(currentTab) && <NotFound onNavigate={handleNavigate} />}
          </main>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
