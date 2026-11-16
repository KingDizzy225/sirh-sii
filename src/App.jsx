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
import { PlanSuccession } from './pages/PlanSuccession';
import { MutuelleSante } from './pages/MutuelleSante';
import { BarometreQVT } from './pages/BarometreQVT';
import { KiosqueAttestations } from './pages/KiosqueAttestations';
import { PeriodesEssai } from './pages/PeriodesEssai';
import { StudioOKR } from './pages/StudioOKR';
import { ObservatoireGPEC } from './pages/ObservatoireGPEC';
import { RegistreUniquePersonnel } from './pages/RegistreUniquePersonnel';
import { ComiteCSST } from './pages/ComiteCSST';
import { FlotteMobile } from './pages/FlotteMobile';
import { RegistreVisiteurs } from './pages/RegistreVisiteurs';
import { EnquetesAccidents } from './pages/EnquetesAccidents';
import { EntretiensDepart } from './pages/EntretiensDepart';
import { BilansCarriere } from './pages/BilansCarriere';
import { InnovationParticipative } from './pages/InnovationParticipative';
import { RelationsEcolesCampus } from './pages/RelationsEcolesCampus';
import { SentinelleBurnout } from './pages/SentinelleBurnout';
import { SmartAutomations } from './pages/SmartAutomations';
import { SalaireALaDemande } from './pages/SalaireALaDemande';
import { SimulateurCarriereIA } from './pages/SimulateurCarriereIA';
import { GreenHR } from './pages/GreenHR';
import { ConseillerJuridique } from './pages/ConseillerJuridique';
import { ContinuiteActivite } from './pages/ContinuiteActivite';
import { CovoiturageSecurite } from './pages/CovoiturageSecurite';
import { AgenceBattle } from './pages/AgenceBattle';
import { QuizVenteMatin } from './pages/QuizVenteMatin';
import { OuvertureAgence } from './pages/OuvertureAgence';
import { BourseStock } from './pages/BourseStock';
import { SanteExpress } from './pages/SanteExpress';
import { TitularisationHonneur } from './pages/TitularisationHonneur';
import { CaisseSecurite } from './pages/CaisseSecurite';
import { TontineRh } from './pages/TontineRh';
import { AssistanceSilence } from './pages/AssistanceSilence';
import { BerceauSii } from './pages/BerceauSii';
import { ClesCoffres } from './pages/ClesCoffres';
import { SmartphoneSecours } from './pages/SmartphoneSecours';
import { SecourismeBoutique } from './pages/SecourismeBoutique';
import { SolidariteConges } from './pages/SolidariteConges';
import { MeteoConfort } from './pages/MeteoConfort';
import { EquipementsDemo } from './pages/EquipementsDemo';
import { PopoteAgence } from './pages/PopoteAgence';
import { ParrainageStagiaires } from './pages/ParrainageStagiaires';
import { CommissionsLive } from './pages/CommissionsLive';
import { EtoileOmbre } from './pages/EtoileOmbre';
import { PassDeluge } from './pages/PassDeluge';
import { PermutationQuartier } from './pages/PermutationQuartier';
import { ConstatMoto } from './pages/ConstatMoto';
import { BadgeuseNomade } from './pages/BadgeuseNomade';
import { SimSwapArtci } from './pages/SimSwapArtci';
import { SosMicroAvance } from './pages/SosMicroAvance';
import { RentreeScolaire } from './pages/RentreeScolaire';
import { BonsFestifs } from './pages/BonsFestifs';
import { CagnotteSolidarite } from './pages/CagnotteSolidarite';
import { AlloIncivilites } from './pages/AlloIncivilites';
import { PasseportHauteur } from './pages/PasseportHauteur';
import { AmbassadeurFibre } from './pages/AmbassadeurFibre';
import { FraisCarburant } from './pages/FraisCarburant';
import { TopVendeurRegions } from './pages/TopVendeurRegions';
import { KiosqueUniformes } from './pages/KiosqueUniformes';
import { AcademieManager } from './pages/AcademieManager';
import { AuditClientMystere } from './pages/AuditClientMystere';
import { PasseportEvenements } from './pages/PasseportEvenements';
import { BilanSanteBoutique } from './pages/BilanSanteBoutique';
import { AlumniElite } from './pages/AlumniElite';
import { GasoilGroupe } from './pages/GasoilGroupe';
import { UrgenceProvince } from './pages/UrgenceProvince';
import { SavCartesSim } from './pages/SavCartesSim';
import { ObjetsTrouves } from './pages/ObjetsTrouves';
import { RequisitionsArtci } from './pages/RequisitionsArtci';
import { VentePriveeStaff } from './pages/VentePriveeStaff';
import { MaracanaLigue } from './pages/MaracanaLigue';
import { SprintFinMois } from './pages/SprintFinMois';
import { FastCnps } from './pages/FastCnps';
import { LeadershipFeminin } from './pages/LeadershipFeminin';
import { RecyclageBoutique } from './pages/RecyclageBoutique';
import { KitEnergieNomade } from './pages/KitEnergieNomade';
import { VoiceToHr } from './pages/VoiceToHr';
import { ChurnPredictor } from './pages/ChurnPredictor';
import { AttestationsSecurisees } from './pages/AttestationsSecurisees';
import { OfflineModeSync } from './pages/OfflineModeSync';
import { EntraideMateriel } from './pages/EntraideMateriel';
import { MaintenanceQhse } from './pages/MaintenanceQhse';
import { PassSante } from './pages/PassSante';
import { RetourVillage } from './pages/RetourVillage';
import { BourseScolaire } from './pages/BourseScolaire';
import { BiometriePresence } from './pages/BiometriePresence';
import { AuditCaissesSim } from './pages/AuditCaissesSim';
import { BouclierMeps } from './pages/BouclierMeps';
import { TitresCedeao } from './pages/TitresCedeao';
import { CaravaneStreetMarketing } from './pages/CaravaneStreetMarketing';
import { JobDatingQr } from './pages/JobDatingQr';
import { EcoScoreMoto } from './pages/EcoScoreMoto';
import { PassLagunaire } from './pages/PassLagunaire';
import { PodcastsDialectes } from './pages/PodcastsDialectes';
import { ChocDesGuichets } from './pages/ChocDesGuichets';
import { ConciergeriePapiers } from './pages/ConciergeriePapiers';
import { EcouteSerenite } from './pages/EcouteSerenite';

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

            <Route path="/conseiller-juridique" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR']}>
                <ConseillerJuridique />
              </ProtectedRoute>
            } />

            <Route path="/continuite-agences" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <ContinuiteActivite />
              </ProtectedRoute>
            } />

            <Route path="/retour-serein" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <CovoiturageSecurite />
              </ProtectedRoute>
            } />

            <Route path="/battle-agences" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <AgenceBattle />
              </ProtectedRoute>
            } />

            <Route path="/quiz-vente" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <QuizVenteMatin />
              </ProtectedRoute>
            } />

            <Route path="/ouverture-agence" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <OuvertureAgence />
              </ProtectedRoute>
            } />

            <Route path="/bourse-stock" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <BourseStock />
              </ProtectedRoute>
            } />

            <Route path="/sante-express" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SanteExpress />
              </ProtectedRoute>
            } />

            <Route path="/titularisation-honneur" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <TitularisationHonneur />
              </ProtectedRoute>
            } />

            <Route path="/caisse-securite" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <CaisseSecurite />
              </ProtectedRoute>
            } />

            <Route path="/tontine-rh" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <TontineRh />
              </ProtectedRoute>
            } />

            <Route path="/assistance-silence" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <AssistanceSilence />
              </ProtectedRoute>
            } />

            <Route path="/berceau-sii" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <BerceauSii />
              </ProtectedRoute>
            } />

            <Route path="/cles-coffres" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <ClesCoffres />
              </ProtectedRoute>
            } />

            <Route path="/smartphone-secours" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SmartphoneSecours />
              </ProtectedRoute>
            } />

            <Route path="/secourisme-boutique" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SecourismeBoutique />
              </ProtectedRoute>
            } />

            <Route path="/solidarite-conges" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SolidariteConges />
              </ProtectedRoute>
            } />

            <Route path="/meteo-confort" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <MeteoConfort />
              </ProtectedRoute>
            } />

            <Route path="/equipements-demo" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <EquipementsDemo />
              </ProtectedRoute>
            } />

            <Route path="/popote-agence" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <PopoteAgence />
              </ProtectedRoute>
            } />

            <Route path="/parrainage-stagiaires" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <ParrainageStagiaires />
              </ProtectedRoute>
            } />

            <Route path="/commissions-live" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <CommissionsLive />
              </ProtectedRoute>
            } />

            <Route path="/etoile-ombre" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <EtoileOmbre />
              </ProtectedRoute>
            } />

            <Route path="/pass-deluge" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <PassDeluge />
              </ProtectedRoute>
            } />

            <Route path="/permutation-quartier" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <PermutationQuartier />
              </ProtectedRoute>
            } />

            <Route path="/constat-moto" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <ConstatMoto />
              </ProtectedRoute>
            } />

            <Route path="/badgeuse-nomade" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <BadgeuseNomade />
              </ProtectedRoute>
            } />

            <Route path="/sim-swap-artci" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SimSwapArtci />
              </ProtectedRoute>
            } />

            <Route path="/sos-micro-avance" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SosMicroAvance />
              </ProtectedRoute>
            } />

            <Route path="/rentree-scolaire" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <RentreeScolaire />
              </ProtectedRoute>
            } />

            <Route path="/bons-festifs" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <BonsFestifs />
              </ProtectedRoute>
            } />

            <Route path="/cagnotte-solidarite" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <CagnotteSolidarite />
              </ProtectedRoute>
            } />

            <Route path="/allo-incivilites" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <AlloIncivilites />
              </ProtectedRoute>
            } />

            <Route path="/passeport-hauteur" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <PasseportHauteur />
              </ProtectedRoute>
            } />

            <Route path="/ambassadeur-fibre" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <AmbassadeurFibre />
              </ProtectedRoute>
            } />

            <Route path="/frais-carburant" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <FraisCarburant />
              </ProtectedRoute>
            } />

            <Route path="/top-vendeur-regions" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <TopVendeurRegions />
              </ProtectedRoute>
            } />

            <Route path="/kiosque-uniformes" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <KiosqueUniformes />
              </ProtectedRoute>
            } />

            <Route path="/academie-manager" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <AcademieManager />
              </ProtectedRoute>
            } />

            <Route path="/audit-client-mystere" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <AuditClientMystere />
              </ProtectedRoute>
            } />

            <Route path="/passeport-evenements" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <PasseportEvenements />
              </ProtectedRoute>
            } />

            <Route path="/bilan-sante-boutique" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <BilanSanteBoutique />
              </ProtectedRoute>
            } />

            <Route path="/alumni-elite" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <AlumniElite />
              </ProtectedRoute>
            } />

            <Route path="/gasoil-groupe" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <GasoilGroupe />
              </ProtectedRoute>
            } />

            <Route path="/urgence-province" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <UrgenceProvince />
              </ProtectedRoute>
            } />

            <Route path="/sav-cartes-sim" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SavCartesSim />
              </ProtectedRoute>
            } />

            <Route path="/objets-trouves" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <ObjetsTrouves />
              </ProtectedRoute>
            } />

            <Route path="/requisitions-artci" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <RequisitionsArtci />
              </ProtectedRoute>
            } />

            <Route path="/vente-privee-staff" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <VentePriveeStaff />
              </ProtectedRoute>
            } />

            <Route path="/maracana-ligue" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <MaracanaLigue />
              </ProtectedRoute>
            } />

            <Route path="/sprint-fin-mois" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <SprintFinMois />
              </ProtectedRoute>
            } />

            <Route path="/fast-cnps" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <FastCnps />
              </ProtectedRoute>
            } />

            <Route path="/leadership-feminin" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <LeadershipFeminin />
              </ProtectedRoute>
            } />

            <Route path="/recyclage-boutique" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <RecyclageBoutique />
              </ProtectedRoute>
            } />

            <Route path="/kit-energie-nomade" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager', 'Employee']}>
                <KitEnergieNomade />
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

            {/* Innovations Opérationnelles & Résilience (Axes 2 à 5) */}
            <Route path="/voice-to-hr" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <VoiceToHr />
              </ProtectedRoute>
            } />
            <Route path="/churn-predictor" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <ChurnPredictor />
              </ProtectedRoute>
            } />
            <Route path="/attestations-securisees" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <AttestationsSecurisees />
              </ProtectedRoute>
            } />
            <Route path="/offline-sync" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <OfflineModeSync />
              </ProtectedRoute>
            } />
            <Route path="/entraide-materiel" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <EntraideMateriel />
              </ProtectedRoute>
            } />
            <Route path="/maintenance-qhse" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <MaintenanceQhse />
              </ProtectedRoute>
            } />
            <Route path="/pass-sante" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <PassSante />
              </ProtectedRoute>
            } />
            <Route path="/retour-village" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <RetourVillage />
              </ProtectedRoute>
            } />
            <Route path="/bourse-scolaire" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <BourseScolaire />
              </ProtectedRoute>
            } />
            <Route path="/biometrie-presence" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <BiometriePresence />
              </ProtectedRoute>
            } />
            <Route path="/audit-caisses-sim" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <AuditCaissesSim />
              </ProtectedRoute>
            } />

            {/* Pack 4 : Sérénité Juridique & Contrôles Officiels */}
            <Route path="/bouclier-meps" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <BouclierMeps />
              </ProtectedRoute>
            } />
            <Route path="/titres-cedeao" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Manager']}>
                <TitresCedeao />
              </ProtectedRoute>
            } />

            {/* Packs 1, 2, 3 & 5 : Opérations Terrain, Mobilité Abidjan, Compétences & Bien-être */}
            <Route path="/caravane-marketing" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <CaravaneStreetMarketing />
              </ProtectedRoute>
            } />
            <Route path="/job-dating-qr" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <JobDatingQr />
              </ProtectedRoute>
            } />
            <Route path="/eco-score-moto" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <EcoScoreMoto />
              </ProtectedRoute>
            } />
            <Route path="/pass-lagunaire" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <PassLagunaire />
              </ProtectedRoute>
            } />
            <Route path="/podcasts-dialectes" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <PodcastsDialectes />
              </ProtectedRoute>
            } />
            <Route path="/choc-des-guichets" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <ChocDesGuichets />
              </ProtectedRoute>
            } />
            <Route path="/conciergerie-papiers" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <ConciergeriePapiers />
              </ProtectedRoute>
            } />
            <Route path="/ecoute-serenite" element={
              <ProtectedRoute allowedRoles={['Administrator', 'HR', 'Employee', 'Manager']}>
                <EcouteSerenite />
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
