import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { EmployeePortal } from './pages/EmployeePortal';
import { Employees } from './pages/Employees';
import { EmployeeProfile } from './pages/EmployeeProfile';
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
import { Announcements } from './pages/Announcements';
import { SalaryAdvances } from './pages/SalaryAdvances';
import { MedicalVisits } from './pages/MedicalVisits';
import { Rewards } from './pages/Rewards';
import { GPEC } from './pages/GPEC';
import { TalentManagement } from './pages/TalentManagement';
import { Login } from './pages/Login';
import { useAuth } from './context/AuthContext';
import { PublicCareers } from './pages/PublicCareers';
import { PublicSignature } from './pages/PublicSignature';
import { Absences } from './pages/Absences';

// V5 New Components
import { Offboarding } from './pages/Offboarding';
import { KudosWall } from './pages/KudosWall';
import { AiSourcing } from './pages/AiSourcing';
import { PayrollSimulation } from './pages/PayrollSimulation';
import { ShiftScheduler } from './pages/ShiftScheduler';
import { Benefits } from './pages/Benefits';
import { Ethics } from './pages/Ethics';
import { Subcontractors } from './pages/Subcontractors';
import { DeiDashboard } from './pages/DeiDashboard';

import { FloatingChat } from './components/FloatingChat';
import { CareerPath } from './pages/CareerPath';
import { CommandCenter } from './components/CommandCenter';

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
  const [currentDomain, setCurrentDomain] = useState('Accueil'); // 'Accueil', 'Mon Espace', 'Mon Équipe', 'Collaborateurs', 'Gestion RH', 'Analytique'

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
        <Route path="/ethics" element={<Ethics />} />
        <Route path="/login" element={<Login />} />
        <Route path="/careers" element={<PublicCareers />} />
        <Route path="/sign/:id" element={<PublicSignature />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans relative">

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Full Width Top Navigation (Header) */}
      <Header 
        onMenuClick={() => setIsMobileMenuOpen(true)} 
        currentDomain={currentDomain}
        setCurrentDomain={setCurrentDomain}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Contextual Sidebar */}
        <Sidebar
          className={`fixed inset-y-0 left-0 z-50 shrink-0 transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          currentDomain={currentDomain}
        />
        
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <Routes>
            {/* Redirect root based on role */}
            <Route path="/" element={
              user.role === 'EMPLOYEE' ? <Navigate to="/my-space" replace /> : <Dashboard />
            } />
            
            {/* Everyone can view their space */}
            <Route path="/my-space" element={<EmployeePortal />} />

            {/* Employee Accessible Routes (Self-Service) */}
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/absences" element={<Absences />} />
            
            {/* Restricted Directory Routes */}
            <Route path="/employees" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/employees/:id" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <EmployeeProfile />
              </ProtectedRoute>
            } />
            <Route path="/org-chart" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <OrgChart />
              </ProtectedRoute>
            } />
            
            {/* Other Restricted Routes */}
            <Route path="/timesheet" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Timesheet />
              </ProtectedRoute>
            } />
            <Route path="/performance" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Performance />
              </ProtectedRoute>
            } />
            <Route path="/learning" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Learning />
              </ProtectedRoute>
            } />

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
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
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
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
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

            {/* V4 Modules */}
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/kudos" element={<ProtectedRoute><KudosWall /></ProtectedRoute>} />
            <Route path="/ai-sourcing" element={<ProtectedRoute allowedRoles={['Administrator', 'HR']}><AiSourcing /></ProtectedRoute>} />
            <Route path="/payroll-simulation" element={<ProtectedRoute allowedRoles={['Administrator', 'HR']}><PayrollSimulation /></ProtectedRoute>} />
            <Route path="/career-path" element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
            <Route path="/advances" element={<SalaryAdvances />} />
            <Route path="/medical" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <MedicalVisits />
              </ProtectedRoute>
            } />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/gpec" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <GPEC />
              </ProtectedRoute>
            } />
            <Route path="/talent-management" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <TalentManagement />
              </ProtectedRoute>
            } />

            {/* V5 Modules */}
            <Route path="/offboarding" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Offboarding />
              </ProtectedRoute>
            } />
            <Route path="/shifts" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <ShiftScheduler />
              </ProtectedRoute>
            } />
            <Route path="/benefits" element={<Benefits />} />
            <Route path="/ethics" element={<Ethics />} />
            <Route path="/subcontractors" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Subcontractors />
              </ProtectedRoute>
            } />
            <Route path="/dei-dashboard" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <DeiDashboard />
              </ProtectedRoute>
            } />


            {/* System Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<div className="p-8 text-center text-slate-500">Page under construction!</div>} />
          </Routes>
        </main>
      </div>
      
      {/* Chatbot Flottant - Accessible depuis toutes les pages */}
      <FloatingChat />
      <CommandCenter />
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
