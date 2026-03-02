import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { OrgChart } from './pages/OrgChart';
import { Leaves } from './pages/Leaves';
import { Payroll } from './pages/Payroll';
import { Recruitment } from './pages/Recruitment';
import { Settings } from './pages/Settings';
import { Performance } from './pages/Performance';
import { Onboarding } from './pages/Onboarding';
import { Learning } from './pages/Learning';
import { Support } from './pages/Support';
import { SupportDashboard } from './pages/SupportDashboard';
import { Documents } from './pages/Documents';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { TaskBoard } from './pages/TaskBoard';
import { SkillsMatrix } from './pages/SkillsMatrix';
import { Timesheet } from './pages/Timesheet';
import { Expenses } from './pages/Expenses';
import { Engagement } from './pages/Engagement';
import { HSE } from './pages/HSE';
import { Assets } from './pages/Assets';
import { Analytics } from './pages/Analytics';
import { Compensation } from './pages/Compensation';
import { Trainings } from './pages/Trainings';
import { Login } from './pages/Login';
import { useAuth } from './context/AuthContext';

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4">
    <div className="text-4xl">🛑</div>
    <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
    <p className="text-slate-500">You do not have permission to view this page.</p>
  </div>
);

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans relative">

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        className={`fixed inset - y - 0 left - 0 z - 50 transform transition - transform duration - 300 ease -in -out md:relative md: translate - x - 0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} `}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto w-full">
          <Routes>
            {/* Everyone can view the dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Employee Viewing Routes */}
            <Route path="/employees" element={<Employees />} />
            <Route path="/org-chart" element={<OrgChart />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/timesheet" element={<Timesheet />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/learning" element={<Learning />} />

            {/* Restricted Routes */}
            <Route path="/engagement" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Engagement />
              </ProtectedRoute>
            } />

            <Route path="/recruitment" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Recruitment />
              </ProtectedRoute>
            } />

            <Route path="/onboarding" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Onboarding />
              </ProtectedRoute>
            } />

            <Route path="/payroll" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <Payroll />
              </ProtectedRoute>
            } />

            <Route path="/documents" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Social Worker']}>
                <Documents />
              </ProtectedRoute>
            } />

            <Route path="/workflows" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <WorkflowBuilder />
              </ProtectedRoute>
            } />

            <Route path="/task-board" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <TaskBoard />
              </ProtectedRoute>
            } />

            <Route path="/skills" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <SkillsMatrix />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <Settings />
              </ProtectedRoute>
            } />

            <Route path="/social-support" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Social Worker']}>
                <Support />
              </ProtectedRoute>
            } />

            <Route path="/social-worker-dashboard" element={
              <ProtectedRoute allowedRoles={['Administrator', 'Social Worker']}>
                <SupportDashboard />
              </ProtectedRoute>
            } />

            <Route path="/hse" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Social Worker']}>
                <HSE />
              </ProtectedRoute>
            } />

            <Route path="/assets" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Assets />
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Analytics />
              </ProtectedRoute>
            } />

            <Route path="/compensation" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Compensation />
              </ProtectedRoute>
            } />

            <Route path="/trainings" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Trainings />
              </ProtectedRoute>
            } />

            {/* System Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<div className="p-8 text-center text-slate-500">Page under construction!</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
