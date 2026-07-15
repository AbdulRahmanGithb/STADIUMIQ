import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AIAssistant } from './components/ai/AIAssistant';
import { useAppStore } from './store/appStore';

import Dashboard from './pages/Dashboard';
import NavigationPage from './pages/NavigationPage';
import CrowdPage from './pages/CrowdPage';
import TransportPage from './pages/TransportPage';
import AccessibilityPage from './pages/AccessibilityPage';
import SustainabilityPage from './pages/SustainabilityPage';
import OperationsPage from './pages/OperationsPage';
import VolunteerPage from './pages/VolunteerPage';
import OrganizerPage from './pages/OrganizerPage';

import { Onboarding } from './components/layout/Onboarding';

// Simple route guard based on role
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { role } = useAppStore();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { role, hasOnboarded, highContrast, textSizeLevel } = useAppStore();

  const themeClass = highContrast ? 'theme-high-contrast' : '';
  const textClass = textSizeLevel === 1 ? 'text-lg' : textSizeLevel === 2 ? 'text-xl' : '';

  if (!hasOnboarded) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <div className={`app-layout ${themeClass} ${textClass}`}>
        <Sidebar />
        <div className="main-content">
          <TopBar title={
            role === 'fan' ? 'Fan Portal' :
            role === 'staff' ? 'Operations Dashboard' :
            role === 'volunteer' ? 'Volunteer Hub' : 'Command Center'
          } />
          
          <main id="main-content" className="page-content">
            <Routes>
              {/* Everyone sees the dashboard, but its content changes based on role */}
              <Route path="/" element={<Dashboard />} />

              {/* Fan / Volunteer Routes */}
              <Route path="/navigation" element={
                <ProtectedRoute allowedRoles={['fan', 'volunteer']}>
                  <NavigationPage />
                </ProtectedRoute>
              } />
              
              {/* Staff / Organizer Routes */}
              <Route path="/crowd" element={
                <ProtectedRoute allowedRoles={['staff', 'organizer']}>
                  <CrowdPage />
                </ProtectedRoute>
              } />

              {/* All Roles */}
              <Route path="/transport" element={
                <ProtectedRoute allowedRoles={['fan', 'staff', 'organizer', 'volunteer']}>
                  <TransportPage />
                </ProtectedRoute>
              } />
              
              {/* Fan / Volunteer / Staff */}
              <Route path="/accessibility" element={
                <ProtectedRoute allowedRoles={['fan', 'volunteer', 'staff']}>
                  <AccessibilityPage />
                </ProtectedRoute>
              } />

              {/* Staff / Organizer */}
              <Route path="/sustainability" element={
                <ProtectedRoute allowedRoles={['staff', 'organizer']}>
                  <SustainabilityPage />
                </ProtectedRoute>
              } />

              <Route path="/operations" element={
                <ProtectedRoute allowedRoles={['staff', 'organizer']}>
                  <OperationsPage />
                </ProtectedRoute>
              } />

              {/* Specific Roles */}
              <Route path="/volunteer" element={
                <ProtectedRoute allowedRoles={['volunteer', 'organizer']}>
                  <VolunteerPage />
                </ProtectedRoute>
              } />

              <Route path="/organizer" element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerPage />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global AI Assistant */}
        <AIAssistant />
      </div>
    </BrowserRouter>
  );
}
