import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { useAuth } from './context/AuthContext';

/**
 * Écrans chargés à la demande.
 *
 * Les 128 écrans étaient importés au démarrage : ouvrir la page de connexion
 * téléchargeait l'écran de paie, la matrice de compétences et le registre des
 * visiteurs — 4,5 Mo avant le premier affichage utile, sur des connexions
 * mobiles qui ne les supportent pas.
 *
 * Chacun devient un fragment récupéré au moment où on l'ouvre. Les écrans
 * exportent des composants nommés : l'import dynamique les réexpose en export
 * par défaut, seule forme que `lazy` accepte.
 */
const MurAgence = lazy(() => import('./pages/MurAgence').then((m) => ({ default: m.MurAgence })));
const EcransAgence = lazy(() => import('./pages/EcransAgence').then((m) => ({ default: m.EcransAgence })));
const Badges = lazy(() => import('./pages/Badges').then((m) => ({ default: m.Badges })));
const BadgeCarte = lazy(() => import('./pages/BadgePublic').then((m) => ({ default: m.BadgeCarte })));
const BadgeVerification = lazy(() => import('./pages/BadgePublic').then((m) => ({ default: m.BadgeVerification })));
const MonAnnee = lazy(() => import('./pages/MonAnnee').then((m) => ({ default: m.MonAnnee })));
const Retrospectives = lazy(() => import('./pages/Retrospectives').then((m) => ({ default: m.Retrospectives })));
const CarteAgences = lazy(() => import('./pages/CarteAgences').then((m) => ({ default: m.CarteAgences })));
const Pointer = lazy(() => import('./pages/Pointer').then((m) => ({ default: m.Pointer })));
const Emarger = lazy(() => import('./pages/Pointer').then((m) => ({ default: m.Emarger })));
const EcranEmargement = lazy(() => import('./pages/EcranEmargement').then((m) => ({ default: m.EcranEmargement })));
const Passations = lazy(() => import('./pages/Passations').then((m) => ({ default: m.Passations })));
const Emargements = lazy(() => import('./pages/Emargements').then((m) => ({ default: m.Emargements })));
const PrevisionAbsences = lazy(() => import('./pages/PrevisionAbsences').then((m) => ({ default: m.PrevisionAbsences })));
const DroitAcces = lazy(() => import('./pages/DroitAcces').then((m) => ({ default: m.DroitAcces })));
const Virements = lazy(() => import('./pages/Virements').then((m) => ({ default: m.Virements })));
const Stages = lazy(() => import('./pages/Stages').then((m) => ({ default: m.Stages })));
const Avantages = lazy(() => import('./pages/Avantages').then((m) => ({ default: m.Avantages })));
const Rappels = lazy(() => import('./pages/Rappels').then((m) => ({ default: m.Rappels })));
const PrimeAnnuelle = lazy(() => import('./pages/PrimeAnnuelle').then((m) => ({ default: m.PrimeAnnuelle })));
const ProvisionConges = lazy(() => import('./pages/ProvisionConges').then((m) => ({ default: m.ProvisionConges })));
const Astreintes = lazy(() => import('./pages/Astreintes').then((m) => ({ default: m.Astreintes })));
const BilanSocial = lazy(() => import('./pages/BilanSocial').then((m) => ({ default: m.BilanSocial })));
const Retraites = lazy(() => import('./pages/Retraites').then((m) => ({ default: m.Retraites })));
const Missions = lazy(() => import('./pages/Missions').then((m) => ({ default: m.Missions })));
const Remplacements = lazy(() => import('./pages/Remplacements').then((m) => ({ default: m.Remplacements })));
const PreAccueil = lazy(() => import('./pages/PreAccueil').then((m) => ({ default: m.PreAccueil })));
const Bienvenue = lazy(() => import('./pages/Bienvenue').then((m) => ({ default: m.Bienvenue })));
const LivresDor = lazy(() => import('./pages/LivresDor').then((m) => ({ default: m.LivresDor })));
const LivreDorEcrire = lazy(() => import('./pages/LivreDorPublic').then((m) => ({ default: m.LivreDorEcrire })));
const LivreDorRemise = lazy(() => import('./pages/LivreDorPublic').then((m) => ({ default: m.LivreDorRemise })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const EmployeePortal = lazy(() => import('./pages/EmployeePortal').then((m) => ({ default: m.EmployeePortal })));
const Employees = lazy(() => import('./pages/Employees').then((m) => ({ default: m.Employees })));
const EmployeeProfile = lazy(() => import('./pages/EmployeeProfile').then((m) => ({ default: m.EmployeeProfile })));
const OrgChart = lazy(() => import('./pages/OrgChart').then((m) => ({ default: m.OrgChart })));
const OrgSimulation = lazy(() => import('./pages/OrgSimulation').then((m) => ({ default: m.OrgSimulation })));
const PayEquityScanner = lazy(() => import('./pages/PayEquityScanner').then((m) => ({ default: m.PayEquityScanner })));
const JobDescriptionStudio = lazy(() => import('./pages/JobDescriptionStudio').then((m) => ({ default: m.JobDescriptionStudio })));
const RetentionCenter = lazy(() => import('./pages/RetentionCenter').then((m) => ({ default: m.RetentionCenter })));
const Leaves = lazy(() => import('./pages/Leaves').then((m) => ({ default: m.Leaves })));
const Payroll = lazy(() => import('./pages/Payroll').then((m) => ({ default: m.Payroll })));
const Recruitment = lazy(() => import('./pages/Recruitment').then((m) => ({ default: m.Recruitment })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then((m) => ({ default: m.AuditLogs })));
const Performance = lazy(() => import('./pages/Performance').then((m) => ({ default: m.Performance })));
const PayslipViewer = lazy(() => import('./pages/PayslipViewer').then((m) => ({ default: m.PayslipViewer })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const Learning = lazy(() => import('./pages/Learning').then((m) => ({ default: m.Learning })));
const Support = lazy(() => import('./pages/Support').then((m) => ({ default: m.Support })));
const SupportDashboard = lazy(() => import('./pages/SupportDashboard').then((m) => ({ default: m.SupportDashboard })));
const Documents = lazy(() => import('./pages/Documents').then((m) => ({ default: m.Documents })));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder').then((m) => ({ default: m.WorkflowBuilder })));
const PolicyRules = lazy(() => import('./pages/PolicyRules').then((m) => ({ default: m.PolicyRules })));
const Conformite = lazy(() => import('./pages/Conformite').then((m) => ({ default: m.Conformite })));
const PiecesEcheances = lazy(() => import('./pages/PiecesEcheances').then((m) => ({ default: m.PiecesEcheances })));
const Absenteisme = lazy(() => import('./pages/Absenteisme').then((m) => ({ default: m.Absenteisme })));
const JoursFeries = lazy(() => import('./pages/JoursFeries').then((m) => ({ default: m.JoursFeries })));
const Prets = lazy(() => import('./pages/Prets').then((m) => ({ default: m.Prets })));
const SuiviCdd = lazy(() => import('./pages/SuiviCdd').then((m) => ({ default: m.SuiviCdd })));
const Procedures = lazy(() => import('./pages/Procedures').then((m) => ({ default: m.Procedures })));
const Budget = lazy(() => import('./pages/Budget').then((m) => ({ default: m.Budget })));
const Signataires = lazy(() => import('./pages/Signataires').then((m) => ({ default: m.Signataires })));
const Remuneration = lazy(() => import('./pages/Remuneration').then((m) => ({ default: m.Remuneration })));
const Delegations = lazy(() => import('./pages/Delegations').then((m) => ({ default: m.Delegations })));
const FichesPoste = lazy(() => import('./pages/FichesPoste').then((m) => ({ default: m.FichesPoste })));
const Requeteur = lazy(() => import('./pages/Requeteur').then((m) => ({ default: m.Requeteur })));
const ReleveHeures = lazy(() => import('./pages/ReleveHeures').then((m) => ({ default: m.ReleveHeures })));
const Historique = lazy(() => import('./pages/Historique').then((m) => ({ default: m.Historique })));
const TaskBoard = lazy(() => import('./pages/TaskBoard').then((m) => ({ default: m.TaskBoard })));
const SkillsMatrix = lazy(() => import('./pages/SkillsMatrix').then((m) => ({ default: m.SkillsMatrix })));
const Timesheet = lazy(() => import('./pages/Timesheet').then((m) => ({ default: m.Timesheet })));
const Expenses = lazy(() => import('./pages/Expenses').then((m) => ({ default: m.Expenses })));
const Engagement = lazy(() => import('./pages/Engagement').then((m) => ({ default: m.Engagement })));
const Workflows = lazy(() => import('./pages/Workflows').then((m) => ({ default: m.Workflows })));
const HSE = lazy(() => import('./pages/HSE').then((m) => ({ default: m.HSE })));
const Assets = lazy(() => import('./pages/Assets').then((m) => ({ default: m.Assets })));
const Analytics = lazy(() => import('./pages/Analytics').then((m) => ({ default: m.Analytics })));
const Announcements = lazy(() => import('./pages/Announcements').then((m) => ({ default: m.Announcements })));
const SalaryAdvances = lazy(() => import('./pages/SalaryAdvances').then((m) => ({ default: m.SalaryAdvances })));
const Rewards = lazy(() => import('./pages/Rewards').then((m) => ({ default: m.Rewards })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const PublicCareers = lazy(() => import('./pages/PublicCareers').then((m) => ({ default: m.PublicCareers })));
const PublicDocument = lazy(() => import('./pages/PublicDocument').then((m) => ({ default: m.PublicDocument })));
const PublicSignature = lazy(() => import('./pages/PublicSignature').then((m) => ({ default: m.PublicSignature })));
const Referrals = lazy(() => import('./pages/Referrals').then((m) => ({ default: m.Referrals })));
const Mentorship = lazy(() => import('./pages/Mentorship').then((m) => ({ default: m.Mentorship })));
const ContractStudio = lazy(() => import('./pages/ContractStudio').then((m) => ({ default: m.ContractStudio })));
const WhatsappGateway = lazy(() => import('./pages/WhatsappGateway').then((m) => ({ default: m.WhatsappGateway })));
const MedicalVisitsHub = lazy(() => import('./pages/MedicalVisitsHub').then((m) => ({ default: m.MedicalVisitsHub })));
const ClimateSurveys = lazy(() => import('./pages/ClimateSurveys').then((m) => ({ default: m.ClimateSurveys })));
const Offboarding = lazy(() => import('./pages/Offboarding').then((m) => ({ default: m.Offboarding })));
const KudosWall = lazy(() => import('./pages/KudosWall').then((m) => ({ default: m.KudosWall })));
const AiSourcing = lazy(() => import('./pages/AiSourcing').then((m) => ({ default: m.AiSourcing })));
const PayrollSimulation = lazy(() => import('./pages/PayrollSimulation').then((m) => ({ default: m.PayrollSimulation })));
const ShiftScheduler = lazy(() => import('./pages/ShiftScheduler').then((m) => ({ default: m.ShiftScheduler })));
const Benefits = lazy(() => import('./pages/Benefits').then((m) => ({ default: m.Benefits })));
const Ethics = lazy(() => import('./pages/Ethics').then((m) => ({ default: m.Ethics })));
const Subcontractors = lazy(() => import('./pages/Subcontractors').then((m) => ({ default: m.Subcontractors })));
const DeiDashboard = lazy(() => import('./pages/DeiDashboard').then((m) => ({ default: m.DeiDashboard })));
const CareerPath = lazy(() => import('./pages/CareerPath').then((m) => ({ default: m.CareerPath })));
const TeamHealth = lazy(() => import('./pages/TeamHealth').then((m) => ({ default: m.TeamHealth })));
const PublicPortal = lazy(() => import('./pages/PublicPortal').then((m) => ({ default: m.PublicPortal })));
const VerifyDocument = lazy(() => import('./pages/VerifyDocument').then((m) => ({ default: m.VerifyDocument })));
const SimulateurEmbauche = lazy(() => import('./pages/SimulateurEmbauche').then((m) => ({ default: m.SimulateurEmbauche })));
const TalentMarketplace = lazy(() => import('./pages/TalentMarketplace').then((m) => ({ default: m.TalentMarketplace })));
const DoleancesDelegues = lazy(() => import('./pages/DoleancesDelegues').then((m) => ({ default: m.DoleancesDelegues })));
const GestionFDFP = lazy(() => import('./pages/GestionFDFP').then((m) => ({ default: m.GestionFDFP })));
const Feedback360 = lazy(() => import('./pages/Feedback360').then((m) => ({ default: m.Feedback360 })));
const ParcoursOnboarding = lazy(() => import('./pages/ParcoursOnboarding').then((m) => ({ default: m.ParcoursOnboarding })));
const PlanSuccession = lazy(() => import('./pages/PlanSuccession').then((m) => ({ default: m.PlanSuccession })));
const MutuelleSante = lazy(() => import('./pages/MutuelleSante').then((m) => ({ default: m.MutuelleSante })));
const BarometreQVT = lazy(() => import('./pages/BarometreQVT').then((m) => ({ default: m.BarometreQVT })));
const KiosqueAttestations = lazy(() => import('./pages/KiosqueAttestations').then((m) => ({ default: m.KiosqueAttestations })));
const PeriodesEssai = lazy(() => import('./pages/PeriodesEssai').then((m) => ({ default: m.PeriodesEssai })));
const StudioOKR = lazy(() => import('./pages/StudioOKR').then((m) => ({ default: m.StudioOKR })));
const ObservatoireGPEC = lazy(() => import('./pages/ObservatoireGPEC').then((m) => ({ default: m.ObservatoireGPEC })));
const RegistreUniquePersonnel = lazy(() => import('./pages/RegistreUniquePersonnel').then((m) => ({ default: m.RegistreUniquePersonnel })));
const ComiteCSST = lazy(() => import('./pages/ComiteCSST').then((m) => ({ default: m.ComiteCSST })));
const FlotteMobile = lazy(() => import('./pages/FlotteMobile').then((m) => ({ default: m.FlotteMobile })));
const RegistreVisiteurs = lazy(() => import('./pages/RegistreVisiteurs').then((m) => ({ default: m.RegistreVisiteurs })));
const EnquetesAccidents = lazy(() => import('./pages/EnquetesAccidents').then((m) => ({ default: m.EnquetesAccidents })));
const EntretiensDepart = lazy(() => import('./pages/EntretiensDepart').then((m) => ({ default: m.EntretiensDepart })));
const BilansCarriere = lazy(() => import('./pages/BilansCarriere').then((m) => ({ default: m.BilansCarriere })));
const InnovationParticipative = lazy(() => import('./pages/InnovationParticipative').then((m) => ({ default: m.InnovationParticipative })));
const RelationsEcolesCampus = lazy(() => import('./pages/RelationsEcolesCampus').then((m) => ({ default: m.RelationsEcolesCampus })));
const SentinelleBurnout = lazy(() => import('./pages/SentinelleBurnout').then((m) => ({ default: m.SentinelleBurnout })));
const SmartAutomations = lazy(() => import('./pages/SmartAutomations').then((m) => ({ default: m.SmartAutomations })));
const SalaireALaDemande = lazy(() => import('./pages/SalaireALaDemande').then((m) => ({ default: m.SalaireALaDemande })));
const SimulateurCarriereIA = lazy(() => import('./pages/SimulateurCarriereIA').then((m) => ({ default: m.SimulateurCarriereIA })));
const GreenHR = lazy(() => import('./pages/GreenHR').then((m) => ({ default: m.GreenHR })));



import { FloatingChat } from './components/FloatingChat';
import { CommandCenter } from './components/CommandCenter';
import { FeedbackWidget } from './components/FeedbackWidget';
import { BottomNav } from './components/layout/BottomNav';

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


            <Route path="/virements" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Virements />
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

            <Route path="/retraites" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <Retraites />
              </ProtectedRoute>
            } />

            {/* Les responsables demandent une mission pour leur équipe ;
                autoriser et solder restent aux RH, côté serveur. */}
            <Route path="/missions" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <Missions />
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
            <Route path="/plan-succession" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <PlanSuccession />
              </ProtectedRoute>
            } />
            <Route path="/mutuelle-sante" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <MutuelleSante />
              </ProtectedRoute>
            } />
            <Route path="/barometre-qvt" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <BarometreQVT />
              </ProtectedRoute>
            } />
            <Route path="/kiosque-attestations" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <KiosqueAttestations />
              </ProtectedRoute>
            } />
            <Route path="/periodes-essai" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <PeriodesEssai />
              </ProtectedRoute>
            } />
            <Route path="/studio-okr" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <StudioOKR />
              </ProtectedRoute>
            } />
            <Route path="/observatoire-gpec" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <ObservatoireGPEC />
              </ProtectedRoute>
            } />
            <Route path="/registre-personnel" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <RegistreUniquePersonnel />
              </ProtectedRoute>
            } />
            <Route path="/csst-comite" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <ComiteCSST />
              </ProtectedRoute>
            } />
            <Route path="/flotte-mobile" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <FlotteMobile />
              </ProtectedRoute>
            } />
            <Route path="/registre-visiteurs" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <RegistreVisiteurs />
              </ProtectedRoute>
            } />
            <Route path="/enquetes-accidents" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <EnquetesAccidents />
              </ProtectedRoute>
            } />
            <Route path="/entretiens-depart" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <EntretiensDepart />
              </ProtectedRoute>
            } />
            <Route path="/bilans-carriere" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <BilansCarriere />
              </ProtectedRoute>
            } />
            <Route path="/innovation-participative" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <InnovationParticipative />
              </ProtectedRoute>
            } />
            <Route path="/relations-ecoles-campus" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <RelationsEcolesCampus />
              </ProtectedRoute>
            } />
            <Route path="/sentinelle-burnout" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <SentinelleBurnout />
              </ProtectedRoute>
            } />
            <Route path="/smart-automations" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <SmartAutomations />
              </ProtectedRoute>
            } />
            <Route path="/salaire-a-la-demande" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <SalaireALaDemande />
              </ProtectedRoute>
            } />
            <Route path="/simulateur-carriere-ia" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <SimulateurCarriereIA />
              </ProtectedRoute>
            } />
            <Route path="/green-hr" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <GreenHR />
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

/**
 * Attente de chargement d'un écran.
 *
 * Les écrans arrivent désormais par fragments : entre le clic et l'affichage,
 * il s'écoule le temps d'une requête. Sans cet écran d'attente, la page
 * resterait blanche — ce qui se lit comme une panne, pas comme un chargement.
 */
function EcranEnChargement() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-slate-600 font-medium">Chargement de l'écran…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<EcranEnChargement />}>
          <AppContent />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
