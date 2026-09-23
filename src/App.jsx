import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Sidebar } from './components/layout/Sidebar';
import { MurAgence } from './pages/MurAgence';
import { EcransAgence } from './pages/EcransAgence';
import { Badges } from './pages/Badges';
import { BadgeCarte, BadgeVerification } from './pages/BadgePublic';
import { MonAnnee } from './pages/MonAnnee';
import { Retrospectives } from './pages/Retrospectives';
import { CarteAgences } from './pages/CarteAgences';
import { Pointer, Emarger } from './pages/Pointer';
import { EcranEmargement } from './pages/EcranEmargement';
import { Passations } from './pages/Passations';
import { Emargements } from './pages/Emargements';
import { PrevisionAbsences } from './pages/PrevisionAbsences';
import { DroitAcces } from './pages/DroitAcces';
import { Grille } from './pages/Grille';
import { Virements } from './pages/Virements';
import { Delegues } from './pages/Delegues';
import { Stages } from './pages/Stages';
import { Avantages } from './pages/Avantages';
import { Rappels } from './pages/Rappels';
import { PrimeAnnuelle } from './pages/PrimeAnnuelle';
import { ProvisionConges } from './pages/ProvisionConges';
import { Astreintes } from './pages/Astreintes';
import { BilanSocial } from './pages/BilanSocial';
import { Remplacements } from './pages/Remplacements';
import { PreAccueil } from './pages/PreAccueil';
import { Bienvenue } from './pages/Bienvenue';
import { LivresDor } from './pages/LivresDor';
import { LivreDorEcrire, LivreDorRemise } from './pages/LivreDorPublic';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { EmployeePortal } from './pages/EmployeePortal';
import { Employees } from './pages/Employees';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { OrgChart } from './pages/OrgChart';
import { OrgSimulation } from './pages/OrgSimulation';
import { PayEquityScanner } from './pages/PayEquityScanner';
import { JobDescriptionStudio } from './pages/JobDescriptionStudio';
import { RetentionCenter } from './pages/RetentionCenter';
import { Leaves } from './pages/Leaves';
import { Payroll } from './pages/Payroll';
import { Recruitment } from './pages/Recruitment';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';
import { Performance } from './pages/Performance';
import { PayslipViewer } from './pages/PayslipViewer';
import { Onboarding } from './pages/Onboarding';
import { Learning } from './pages/Learning';
import { Support } from './pages/Support';
import { SupportDashboard } from './pages/SupportDashboard';
import { Documents } from './pages/Documents';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { PolicyRules } from './pages/PolicyRules';
import { Conformite } from './pages/Conformite';
import { PiecesEcheances } from './pages/PiecesEcheances';
import { Absenteisme } from './pages/Absenteisme';
import { JoursFeries } from './pages/JoursFeries';
import { Prets } from './pages/Prets';
import { SuiviCdd } from './pages/SuiviCdd';
import { Procedures } from './pages/Procedures';
import { Budget } from './pages/Budget';
import { Signataires } from './pages/Signataires';
import { Remuneration } from './pages/Remuneration';
import { Delegations } from './pages/Delegations';
import { FichesPoste } from './pages/FichesPoste';
import { Requeteur } from './pages/Requeteur';
import { ReleveHeures } from './pages/ReleveHeures';
import { Historique } from './pages/Historique';
import { TaskBoard } from './pages/TaskBoard';
import { SkillsMatrix } from './pages/SkillsMatrix';
import { Timesheet } from './pages/Timesheet';
import { Expenses } from './pages/Expenses';
import { Engagement } from './pages/Engagement';
import { Workflows } from './pages/Workflows';
import { HSE } from './pages/HSE';
import { Assets } from './pages/Assets';
import { Analytics } from './pages/Analytics';
import { Announcements } from './pages/Announcements';
import { SalaryAdvances } from './pages/SalaryAdvances';
import { Rewards } from './pages/Rewards';
import { Login } from './pages/Login';
import { useAuth } from './context/AuthContext';
import { PublicCareers } from './pages/PublicCareers';
import { PublicDocument } from './pages/PublicDocument';
import { PublicSignature } from './pages/PublicSignature';

import { Referrals } from './pages/Referrals';
import { Mentorship } from './pages/Mentorship';
import { ContractStudio } from './pages/ContractStudio';
import { WhatsappGateway } from './pages/WhatsappGateway';
import { MedicalVisitsHub } from './pages/MedicalVisitsHub';
import { ClimateSurveys } from './pages/ClimateSurveys';
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
import { TeamHealth } from './pages/TeamHealth';
import { FeedbackWidget } from './components/FeedbackWidget';
import { PublicPortal } from './pages/PublicPortal';
import { VerifyDocument } from './pages/VerifyDocument';
import { BottomNav } from './components/layout/BottomNav';
import { SimulateurEmbauche } from './pages/SimulateurEmbauche';
import { TalentMarketplace } from './pages/TalentMarketplace';
import { DoleancesDelegues } from './pages/DoleancesDelegues';
import { GestionFDFP } from './pages/GestionFDFP';
import { Feedback360 } from './pages/Feedback360';
import { ParcoursOnboarding } from './pages/ParcoursOnboarding';

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-full space-y-4">
    <div className="text-4xl">🛑</div>
    <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
    <p className="text-slate-500">You do not have permission to view this page.</p>
  </div>
);

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDomain, setCurrentDomain] = useState('Accueil'); // 'Accueil', 'Mon Espace', 'Mon Équipe', 'Collaborateurs', 'Gestion RH', 'Analytique'

  // Vérification publique d'un document (QR d'attestation) : rendue hors de
  // toute session, qu'un utilisateur soit connecté ou non — le visiteur est
  // typiquement un tiers (banque, bailleur) sans compte.
  /**
   * Retrait d'un document remis par la RH. Rendu hors de toute session, comme
   * la vérification : les salariés n'ouvrent plus de compte, et c'est le jeton
   * du lien qui vaut autorisation.
   */
  if (location.pathname.startsWith('/document/')) {
    return (
      <Routes>
        <Route path="/document/:token" element={<PublicDocument />} />
      </Routes>
    );
  }

  // Écran d'agence, badge et bilan annuel : ouverts par jeton, hors session.
  // La TV de la boutique, le client qui scanne et le salarié qui ouvre son
  // bilan n'ont pas de compte.
  if (location.pathname.startsWith('/ecran/')) {
    return (
      <Routes>
        <Route path="/ecran/:token" element={<MurAgence />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/badge/')) {
    return (
      <Routes>
        <Route path="/badge/verifier/:jeton" element={<BadgeVerification />} />
        <Route path="/badge/:jeton" element={<BadgeCarte />} />
      </Routes>
    );
  }

  if (location.pathname === '/emarger') {
    return (
      <Routes>
        <Route path="/emarger" element={<Emarger />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/emargement/')) {
    return (
      <Routes>
        <Route path="/emargement/:token" element={<EcranEmargement />} />
      </Routes>
    );
  }

  if (location.pathname === '/pointer') {
    return (
      <Routes>
        <Route path="/pointer" element={<Pointer />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/bienvenue/')) {
    return (
      <Routes>
        <Route path="/bienvenue/:token" element={<Bienvenue />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/livre-dor/')) {
    return (
      <Routes>
        <Route path="/livre-dor/remise/:jeton" element={<LivreDorRemise />} />
        <Route path="/livre-dor/:jeton" element={<LivreDorEcrire />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/mon-annee/')) {
    return (
      <Routes>
        <Route path="/mon-annee/:token" element={<MonAnnee />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/verify/')) {
    return (
      <Routes>
        <Route path="/verify/:token" element={<VerifyDocument />} />
      </Routes>
    );
  }

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
        <Route path="/sign/:token" element={<PublicSignature />} />
        <Route path="/portal" element={<PublicPortal />} />
        <Route path="/verify/:token" element={<VerifyDocument />} />
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
          <ErrorBoundary>
          <Routes>
            {/* Redirect root based on role */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Redirect legacy /my-space to root */}
            <Route path="/my-space" element={<Navigate to="/" replace />} />

            {/* Employee Accessible Routes (Self-Service) */}
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/expenses" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Expenses />
              </ProtectedRoute>
            } />
            <Route path="/absences" element={
              <ProtectedRoute>
                <Timesheet />
              </ProtectedRoute>
            } />
            <Route path="/payroll/:id" element={<PayslipViewer />} />
            
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
            <Route path="/org-simulation" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <OrgSimulation />
              </ProtectedRoute>
            } />
            <Route path="/pay-equity" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <PayEquityScanner />
              </ProtectedRoute>
            } />
            <Route path="/job-studio" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <JobDescriptionStudio />
              </ProtectedRoute>
            } />
            <Route path="/retention-center" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <RetentionCenter />
              </ProtectedRoute>
            } />
            
            {/* Other Restricted Routes */}
            <Route path="/timesheet" element={
              <ProtectedRoute>
                <Timesheet />
              </ProtectedRoute>
            } />
            <Route path="/performance" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Performance />
              </ProtectedRoute>
            } />
            <Route path="/learning" element={
              <ProtectedRoute>
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

            <Route path="/historique" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Historique />
              </ProtectedRoute>
            } />

            <Route path="/requeteur" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Requeteur />
              </ProtectedRoute>
            } />

            <Route path="/releve-heures" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <ReleveHeures />
              </ProtectedRoute>
            } />

            <Route path="/fiches-poste" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <FichesPoste />
              </ProtectedRoute>
            } />

            <Route path="/remunerations" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Remuneration />
              </ProtectedRoute>
            } />

            <Route path="/delegations" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Delegations />
              </ProtectedRoute>
            } />

            <Route path="/signataires" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Signataires />
              </ProtectedRoute>
            } />

            <Route path="/budget" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Budget />
              </ProtectedRoute>
            } />

            <Route path="/procedures" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Procedures />
              </ProtectedRoute>
            } />

            <Route path="/conformite" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Conformite />
              </ProtectedRoute>
            } />

            <Route path="/pieces" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <PiecesEcheances />
              </ProtectedRoute>
            } />

            <Route path="/absenteisme" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <Absenteisme />
              </ProtectedRoute>
            } />

            <Route path="/jours-feries" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <JoursFeries />
              </ProtectedRoute>
            } />

            <Route path="/prets" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Prets />
              </ProtectedRoute>
            } />

            <Route path="/ecrans" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <EcransAgence />
              </ProtectedRoute>
            } />

            <Route path="/badges" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Badges />
              </ProtectedRoute>
            } />

            <Route path="/retrospectives" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Retrospectives />
              </ProtectedRoute>
            } />

            <Route path="/grille" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Grille />
              </ProtectedRoute>
            } />

            <Route path="/virements" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Virements />
              </ProtectedRoute>
            } />

            <Route path="/delegues" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Delegues />
              </ProtectedRoute>
            } />

            <Route path="/stages" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Stages />
              </ProtectedRoute>
            } />

            <Route path="/avantages" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Avantages />
              </ProtectedRoute>
            } />

            <Route path="/rappels" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Rappels />
              </ProtectedRoute>
            } />

            <Route path="/prime-annuelle" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <PrimeAnnuelle />
              </ProtectedRoute>
            } />

            <Route path="/provisions" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <ProvisionConges />
              </ProtectedRoute>
            } />

            {/* Le planning d'astreinte est aussi celui des responsables : ils
                inscrivent leurs équipes, la compensation reste aux RH. */}
            <Route path="/astreintes" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <Astreintes />
              </ProtectedRoute>
            } />

            <Route path="/bilan-social" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <BilanSocial />
              </ProtectedRoute>
            } />

            <Route path="/droit-acces" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <DroitAcces />
              </ProtectedRoute>
            } />

            <Route path="/passations" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Passations />
              </ProtectedRoute>
            } />

            <Route path="/emargements" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Emargements />
              </ProtectedRoute>
            } />

            <Route path="/prevision-absences" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <PrevisionAbsences />
              </ProtectedRoute>
            } />

            <Route path="/remplacements" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <Remplacements />
              </ProtectedRoute>
            } />

            <Route path="/pre-accueil" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <PreAccueil />
              </ProtectedRoute>
            } />

            <Route path="/livres-dor" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <LivresDor />
              </ProtectedRoute>
            } />

            <Route path="/carte-agences" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <CarteAgences />
              </ProtectedRoute>
            } />

            <Route path="/cdd" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <SuiviCdd />
              </ProtectedRoute>
            } />

            <Route path="/policy-rules" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <PolicyRules />
              </ProtectedRoute>
            } />

            <Route path="/workflow-builder" element={
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

            <Route path="/simulateur-embauche" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee']}>
                <SimulateurEmbauche />
              </ProtectedRoute>
            } />

            <Route path="/marketplace-talents" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee']}>
                <TalentMarketplace />
              </ProtectedRoute>
            } />

            <Route path="/mentorship" element={
              <ProtectedRoute>
                <Mentorship />
              </ProtectedRoute>
            } />

            <Route path="/contracts" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <ContractStudio />
              </ProtectedRoute>
            } />

            <Route path="/whatsapp-bot" element={
              <ProtectedRoute>
                <WhatsappGateway />
              </ProtectedRoute>
            } />

            <Route path="/medical-hub" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Social Worker']}>
                <MedicalVisitsHub />
              </ProtectedRoute>
            } />

            <Route path="/climate-surveys" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <ClimateSurveys />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <AuditLogs />
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



            {/* V4 Modules */}
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/kudos" element={<ProtectedRoute><KudosWall /></ProtectedRoute>} />
            <Route path="/ai-sourcing" element={<ProtectedRoute allowedRoles={['Administrator', 'HR']}><AiSourcing /></ProtectedRoute>} />
            <Route path="/payroll-simulation" element={<ProtectedRoute allowedRoles={['Administrator', 'HR']}><PayrollSimulation /></ProtectedRoute>} />
            <Route path="/team-health" element={<ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}><TeamHealth /></ProtectedRoute>} />
            <Route path="/workflows" element={<ProtectedRoute allowedRoles={['Administrator', 'HR']}><Workflows /></ProtectedRoute>} />
            <Route path="/career-path" element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
            <Route path="/advances" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <SalaryAdvances />
              </ProtectedRoute>
            } />
            {/* L'ancienne page /medical faisait doublon avec le Hub, en saisissant
                moins de champs (ni statut d'aptitude, ni date de prochain contrôle,
                pourtant nécessaire aux alertes de replanification). */}
            <Route path="/medical" element={<Navigate to="/medical-hub" replace />} />
            <Route path="/rewards" element={<Rewards />} />

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
            <Route path="/referrals" element={
              <ProtectedRoute>
                <Referrals />
              </ProtectedRoute>
            } />

            {/* Nouveaux modules RH & Dialogue Social */}
            <Route path="/doleances-delegues" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <DoleancesDelegues />
              </ProtectedRoute>
            } />
            <Route path="/fdfp-gestion" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <GestionFDFP />
              </ProtectedRoute>
            } />
            <Route path="/feedback-360" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <Feedback360 />
              </ProtectedRoute>
            } />
            <Route path="/parcours-onboarding" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <ParcoursOnboarding />
              </ProtectedRoute>
            } />

            {/* System Routes */}
            <Route path="/portal" element={<PublicPortal />} />
            {/* Alias : d'anciens fallbacks pointent vers /dashboard alors que le tableau de bord est sur / */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<div className="p-8 text-center text-slate-500">Page under construction!</div>} />
          </Routes>
          </ErrorBoundary>
        </main>
      </div>
      
      {/* Navigation inférieure : mobile uniquement */}
      <BottomNav onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Chatbot Flottant - Accessible depuis toutes les pages */}
      <FloatingChat />
      <FeedbackWidget />
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
