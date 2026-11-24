import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
    Home, Users, User, Network, Calendar, DollarSign, Settings, LogOut, FileText, Bell, 
    Target, BookOpen, Heart, Shield, CheckSquare, Award, Clock, Receipt, HeartPulse, 
    Laptop, BarChart, PiggyBank, GraduationCap, Grid, Megaphone, Banknote, Stethoscope, 
    Trophy, PowerOff, Building, ShieldAlert, AlertTriangle, BrainCircuit, Calculator, 
    Rocket, Zap, MessageSquare, Scale, Sparkles, Inbox, UserPlus, Workflow, ShieldCheck, 
    Wallet, PenTool, UserCheck, ClipboardList, History, IdCard, Activity, CalendarDays, 
    Landmark, Tv, MapPin, Repeat, DoorOpen, BookHeart, QrCode, CalendarRange, FileSearch, 
    Vote, Bus, PhoneCall, Gift, FileBarChart, HeartHandshake, Smile, BookCheck, Leaf, 
    Compass, Thermometer, Utensils, Star, PartyPopper, Lock, Smartphone, BellOff, 
    CloudRain, ArrowLeftRight, Bike, HardHat, Wifi, Fuel, Shirt, PlayCircle, Eye, 
    Navigation, RefreshCw, Package, Coffee, FileCheck, Recycle, BatteryCharging, Power, 
    Mic, ScanFace, WifiOff, TrendingDown, Globe2, Truck, Anchor, Swords, AlertOctagon, 
    Handshake, Search, ChevronDown, ChevronRight, Folder, FolderOpen, Layers, X, Coins, Briefcase,
    FileSignature, TrendingUp
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageSwitcher } from '../LanguageSwitcher';

/**
 * Navigation mutualisée & hiérarchique par Pôles d'Activités.
 * 
 * Les 138 modules sont désormais regroupés en Pôles Thématiques logiques
 * (Dossiers pliables/dépliables) avec recherche instantanée, badges de comptage
 * et ouverture automatique du dossier correspondant à la page consultée.
 */
const getAllNavItems = (t) => [
    // ══════════════════════════════════════════════════════════════════
    // ── ACCUEIL ──
    // ══════════════════════════════════════════════════════════════════
    { name: t('sidebar.dashboard', 'Vue d\'ensemble'), path: '/', icon: Home, domain: 'Accueil', category: 'Tableaux de Bord', permission: 'dashboard:view' },
    { name: 'Command Center & Tâches', path: '/task-board', icon: CheckSquare, domain: 'Accueil', category: 'Tableaux de Bord', permission: 'dashboard:view' },
    { name: 'Annonces & Communication', path: '/announcements', icon: Megaphone, domain: 'Accueil', category: 'Communication', permission: 'dashboard:view' },
    { name: 'Notes de Service & Accusés Lecture', path: '/notes-service-accuses-lecture', icon: FileCheck, domain: 'Accueil', category: 'Communication', permission: 'dashboard:view' },

    // ══════════════════════════════════════════════════════════════════
    // ── EMPLOYÉS : Mutualisé en 6 Pôles Majeurs ──
    // ══════════════════════════════════════════════════════════════════

    // 1. Administration & Vie du Salarié
    { name: t('sidebar.employees', 'Répertoire des salariés'), path: '/employees', icon: Users, domain: 'Employés', category: 'Administration & Contrats', permission: 'employees:view' },
    { name: 'Registre Unique du Personnel', path: '/registre-personnel', icon: BookCheck, domain: 'Employés', category: 'Administration & Contrats', permission: 'employees:edit' },
    { name: 'Dossiers, Pièces & Conformité', path: '/conformite', icon: ShieldCheck, domain: 'Employés', category: 'Administration & Contrats', permission: 'employees:edit' },
    { name: 'Contrats de Travail & Fiches', path: '/contracts', icon: FileText, domain: 'Employés', category: 'Administration & Contrats', permission: 'employees:edit' },
    { name: 'Badges, Accès & Visiteurs', path: '/registre-visiteurs', icon: DoorOpen, domain: 'Employés', category: 'Administration & Contrats', permission: 'dashboard:view' },
    { name: 'Kiosque Attestations Express', path: '/kiosque-attestations', icon: QrCode, domain: 'Employés', category: 'Administration & Contrats', permission: 'dashboard:view' },
    { name: 'Attestations Sécurisées (Hash QR)', path: '/attestations-securisees', icon: FileCheck, domain: 'Employés', category: 'Administration & Contrats', permission: 'dashboard:view', manager: true },
    { name: 'Passeport Séjour & Titres CEDEAO', path: '/titres-cedeao', icon: Globe2, domain: 'Employés', category: 'Administration & Contrats', permission: 'employees:edit', manager: true },
    { name: 'Coffre-Fort Numérique (e-Vault)', path: '/coffre-fort-numerique', icon: Lock, domain: 'Employés', category: 'Administration & Contrats', permission: 'dashboard:view' },
    { name: 'Conciergerie Papiers (CNI/Permis)', path: '/conciergerie-papiers', icon: FileText, domain: 'Employés', category: 'Administration & Contrats', permission: 'dashboard:view', manager: true },

    // 2. Carrière, Évaluations & Mobilité
    { name: 'Organigramme Entreprise', path: '/org-chart', icon: Network, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:view' },
    { name: 'Campagne Entretiens EAP 2026', path: '/campagne-eap', icon: Award, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Check-ins 1-on-1 & Kudos Pairs', path: '/continuous-feedback-checkins', icon: Sparkles, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'dashboard:view' },
    { name: 'Planification Effectifs (SWP 3-5 ans)', path: '/strategic-workforce-planning', icon: TrendingUp, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Bourse Interne & Mobilité', path: '/bourse-mobilite-interne', icon: Briefcase, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'dashboard:view' },
    { name: 'Périodes d\'Essai & Titularisation', path: '/periodes-essai', icon: Clock, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Baromètre Période d\'Essai & Étonnement', path: '/barometre-periode-essai', icon: UserCheck, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Entretiens, Évaluations & OKR', path: '/performance', icon: Trophy, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Bilans de Carrière (2 & 6 ans)', path: '/bilans-carriere', icon: BookOpen, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Simulateur Carrière & Évolution IA', path: '/simulateur-carriere-ia', icon: Compass, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'dashboard:view', manager: true },
    { name: 'Plan de Succession & Postes Clés', path: '/plan-succession', icon: Award, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Matrice Polyvalence & Suppléance', path: '/matrice-polyvalence-suppleance', icon: Award, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Revue Talents 9-Box (Comité)', path: '/talent-review-9box', icon: Grid, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Classification Postes CCNI & Échelons', path: '/classification-ccni-echelons', icon: Layers, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Plan Amélioration Performance (PIP)', path: '/plan-amelioration-performance-pip', icon: Target, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Passation de Poste & Handover', path: '/passation-poste-handover', icon: BookOpen, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Baromètre Managérial (Upward)', path: '/barometre-managerial-upward', icon: Award, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'dashboard:view' },
    { name: 'Mutations & Installation Province', path: '/mutations-geographiques-province', icon: MapPin, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Bourse Permutation Agences', path: '/bourse-permutation-agences', icon: ArrowLeftRight, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'dashboard:view' },
    { name: 'Intégration (Onboarding)', path: '/onboarding', icon: Rocket, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'onboarding:view' },
    { name: 'Onboarding / Offboarding SLA', path: '/orchestration-onboarding-offboarding', icon: Workflow, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Départs & Entretiens de Sortie', path: '/offboarding', icon: PowerOff, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Titularisation CDI (Honneur)', path: '/titularisation-honneur', icon: PartyPopper, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'employees:edit', manager: true },
    { name: 'Permutation Quartier (Bourse)', path: '/permutation-quartier', icon: ArrowLeftRight, domain: 'Employés', category: 'Carrière & Évaluations', permission: 'dashboard:view', manager: true },

    // 3. Dialogue Social, NAO & Sanctions
    { name: 'Délégués & Doléances Salariés', path: '/doleances-delegues', icon: Vote, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit' },
    { name: 'Accords d\'Entreprise & NAO', path: '/accords-dentreprise-nao', icon: Handshake, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },
    { name: 'Compliance & Conflits d\'Intérêts', path: '/compliance-conflits-interets', icon: ShieldCheck, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'dashboard:view' },
    { name: 'Procédures & Sanctions', path: '/procedures', icon: Scale, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit' },
    { name: 'Registre Disciplinaire & Sanctions CCNI', path: '/registre-disciplinaire-sanctions', icon: Scale, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },
    { name: 'Crédit Heures Délégués Protégés', path: '/credit-heures-delegues-proteges', icon: ShieldCheck, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },
    { name: 'Ruptures Conventionnelles & Amiables', path: '/rupture-conventionnelle-amiable', icon: FileSignature, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },
    { name: 'BDESE Triennale & Dialogue Social', path: '/espace-dialogue-social-bdese', icon: Scale, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },
    { name: 'Rapport Social Annuel (MEPS)', path: '/rapport-social-inspection-meps', icon: Building, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },
    { name: 'Licenciement Économique & Ordre Légal', path: '/licenciement-economique-ordre', icon: Scale, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit' },
    { name: 'Astreintes & Gardes', path: '/astreintes', icon: PhoneCall, domain: 'Employés', category: 'Dialogue Social & Éthique', permission: 'employees:edit', manager: true },

    // 4. Avantages Sociaux, Solidarité & Famille
    { name: 'Berceau SII (Parentalité)', path: '/berceau-sii', icon: Gift, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Maternité & Heures Allaitement', path: '/maternite-allaitement-protection', icon: Heart, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Tontine d\'Entreprise RH', path: '/tontine-rh', icon: PiggyBank, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Dons de Congés Solidaires', path: '/solidarite-conges', icon: HeartHandshake, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'SOS Micro-Avance Express (OM)', path: '/sos-micro-avance', icon: Zap, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Pack Rentrée Scolaire SII', path: '/rentree-scolaire', icon: GraduationCap, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Bons Festifs (Tabaski/Paquinou)', path: '/bons-festifs', icon: Gift, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Cagnotte Solidarité (100% Match)', path: '/cagnotte-solidarite', icon: Heart, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Pass Urgence Village (Province)', path: '/urgence-province', icon: Bus, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Planificateur Fêtes & Retour Village', path: '/retour-village', icon: Compass, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Bourse Scolaire & Prix Excellence', path: '/bourse-scolaire', icon: GraduationCap, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Bourse Privilège Staff (Smartphones)', path: '/vente-privee-staff', icon: Smartphone, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Ambassadeur Fibre (-50% & Bonus)', path: '/ambassadeur-fibre', icon: Wifi, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },
    { name: 'Pass Lagunaire (Bateaux-Bus)', path: '/pass-lagunaire', icon: Anchor, domain: 'Employés', category: 'Avantages Sociaux & Solidarité', permission: 'dashboard:view', manager: true },

    // 5. Santé, Prévention & Sécurité CSST
    { name: 'Santé, Médecine & Mutuelle', path: '/mutuelle-sante', icon: Heart, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'employees:edit' },
    { name: 'Pass Santé & Tiers-Payant Digital', path: '/pass-sante', icon: HeartPulse, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'dashboard:view', manager: true },
    { name: 'Bilan Santé Visuelle & Lunettes', path: '/bilan-sante-boutique', icon: Stethoscope, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'dashboard:view', manager: true },
    { name: 'Fiche Réflexe Secouriste', path: '/secourisme-boutique', icon: Stethoscope, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'dashboard:view', manager: true },
    { name: 'Sécurité, CSST & Accidents CNPS', path: '/enquetes-accidents', icon: ShieldAlert, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'employees:edit' },
    { name: 'Cellule Incivilités & Pause 15m', path: '/allo-incivilites', icon: PhoneCall, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'dashboard:view', manager: true },
    { name: 'Ligue Maracana & Fitness Samedi', path: '/maracana-ligue', icon: Trophy, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'dashboard:view', manager: true },
    { name: 'Pause Collation Sprint Fin de Mois', path: '/sprint-fin-mois', icon: Coffee, domain: 'Employés', category: 'Santé & Sécurité CSST', permission: 'dashboard:view', manager: true },

    // 6. Recrutement, Talents & Campus
    { name: t('sidebar.recruitment', 'Recrutement & Campus'), path: '/recruitment', icon: Target, domain: 'Employés', category: 'Recrutement & Talents', permission: 'recruitment:view' },
    { name: 'Promesses d\'Embauche & Offres', path: '/promesses-embauche-offres', icon: FileSignature, domain: 'Employés', category: 'Recrutement & Talents', permission: 'recruitment:view', manager: true },
    { name: 'Analytique Recrutement (ROI / CPH)', path: '/analytique-recrutement-roi', icon: BarChart, domain: 'Employés', category: 'Recrutement & Talents', permission: 'recruitment:view', manager: true },
    { name: 'Fast-Track Stagiaires & Alternants', path: '/parrainage-stagiaires', icon: GraduationCap, domain: 'Employés', category: 'Recrutement & Talents', permission: 'dashboard:view', manager: true },
    { name: 'Job Dating Flash (QR Code)', path: '/job-dating-qr', icon: QrCode, domain: 'Employés', category: 'Recrutement & Talents', permission: 'recruitment:view', manager: true },
    { name: 'Mentorat Leadership Féminin Télécom', path: '/leadership-feminin', icon: Sparkles, domain: 'Employés', category: 'Recrutement & Talents', permission: 'dashboard:view', manager: true },
    { name: 'Prestataires & Intérim', path: '/subcontractors', icon: Building, domain: 'Employés', category: 'Recrutement & Talents', permission: 'employees:edit' },
    { name: 'Étoile de l\'Ombre (Reconnaissance)', path: '/etoile-ombre', icon: Star, domain: 'Employés', category: 'Recrutement & Talents', permission: 'dashboard:view', manager: true },
    { name: 'Mur des Alumni & Parcours Élite', path: '/alumni-elite', icon: Star, domain: 'Employés', category: 'Recrutement & Talents', permission: 'dashboard:view', manager: true },
    { name: 'Télétransmission Directe CNPS', path: '/fast-cnps', icon: FileCheck, domain: 'Employés', category: 'Recrutement & Talents', permission: 'dashboard:view', manager: true },
    { name: 'Kiosque Uniformes & Pressing', path: '/kiosque-uniformes', icon: Shirt, domain: 'Employés', category: 'Recrutement & Talents', permission: 'dashboard:view', manager: true },


    // ══════════════════════════════════════════════════════════════════
    // ── PILOTAGE RH : Mutualisé en 6 Pôles Opérationnels ──
    // ══════════════════════════════════════════════════════════════════

    // 1. Temps, Présence & Plannings
    { name: 'Congés & Absences', path: '/leaves', icon: Calendar, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'dashboard:view', manager: true },
    { name: 'Facteur Bradford & Absentéisme Réseau', path: '/facteur-bradford-absenteisme', icon: AlertTriangle, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'dashboard:view', manager: true },
    { name: 'Congés Événements Familiaux', path: '/conges-evenements-familiaux', icon: Heart, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'dashboard:view' },
    { name: 'Pointages & Planning Shifts', path: '/shifts', icon: CalendarRange, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'dashboard:view', manager: true },
    { name: 'Jours Fériés & Calendrier', path: '/jours-feries', icon: CalendarDays, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'employees:edit' },
    { name: 'Heures Sup Légales (Code CI)', path: '/heures-sup-legales', icon: Clock, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'payroll:view', manager: true },
    { name: "Passations d'Équipe", path: '/passations', icon: ClipboardList, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'employees:edit' },
    { name: 'Pointage Biométrique & Anti-Fraude', path: '/biometrie-presence', icon: ScanFace, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'dashboard:view', manager: true },
    { name: 'Badgeuse Nomade & Caravanes', path: '/badgeuse-nomade', icon: Navigation, domain: 'Pilotage RH', category: 'Temps, Absences & Shifts', permission: 'dashboard:view', manager: true },

    // 2. Réseau Boutiques, Capacité & Sécurité (WFM)
    { name: 'Carte des Agences & Sites', path: '/carte-agences', icon: MapPin, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'employees:edit' },
    { name: 'Capacité & Charge Agences (WFM)', path: '/capacite-charge-agences', icon: Activity, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Store Opening & Prise Poste', path: '/ouverture-agence', icon: CheckSquare, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Clôture & Sécurité Caisse', path: '/caisse-securite', icon: ShieldCheck, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Registre Clés & Coffre', path: '/cles-coffres', icon: Lock, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Bourse Dépannage Stock', path: '/bourse-stock', icon: Repeat, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Audit & Client Mystère Orange', path: '/audit-client-mystere', icon: Eye, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Audit Caisse & Réconciliation SIM', path: '/audit-caisses-sim', icon: Scale, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Météo Confort & Alerte Frigoriste', path: '/meteo-confort', icon: Thermometer, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Code Silence (Assistance)', path: '/assistance-silence', icon: BellOff, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Continuité & Délestage Élec', path: '/continuite-agences', icon: PowerOff, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'employees:edit', manager: true },
    { name: 'Énergie & Gasoil Groupe Électrogène', path: '/gasoil-groupe', icon: Power, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },
    { name: 'Maintenance QHSE Clims & Groupes', path: '/maintenance-qhse', icon: ShieldCheck, domain: 'Pilotage RH', category: 'Boutiques & Réseau Agences', permission: 'dashboard:view', manager: true },

    // 3. Vente, Animation Commerciale & Challenges
    { name: 'Commissions SPM & Plans Vente', path: '/moteur-commissions-spm', icon: Target, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'payroll:view', manager: true },
    { name: 'Simulateur Commissions Live', path: '/commissions-live', icon: Banknote, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Battle Inter-Agences Live', path: '/battle-agences', icon: Trophy, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Choc des Guichets (Battle Live)', path: '/choc-des-guichets', icon: Swords, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Challenge Top Vendeurs Régions', path: '/top-vendeur-regions', icon: Trophy, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Caravanes & Vente Nomade', path: '/caravane-marketing', icon: Truck, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Quiz Vente Matin (Flash 60s)', path: '/quiz-vente', icon: Sparkles, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Podcasts Vente en Dialectes', path: '/podcasts-dialectes', icon: Mic, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Académie Minute Néo-Manager', path: '/academie-manager', icon: PlayCircle, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },
    { name: 'Passeport Événements & Salons VIP', path: '/passeport-evenements', icon: Sparkles, domain: 'Pilotage RH', category: 'Vente & Performance Commerciale', permission: 'dashboard:view', manager: true },

    // 4. Paie, Rémunération & Retraite
    { name: t('sidebar.payroll', 'Paie & Déclarations'), path: '/payroll', icon: DollarSign, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view' },
    { name: 'Revue Salariale & Mérite 2026', path: '/revue-salariale-merite', icon: Coins, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view', manager: true },
    { name: 'Indemnités Retraite IDR (IAS 19)', path: '/indemnites-fin-carriere-idr', icon: Landmark, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view', manager: true },
    { name: 'Simulateur Brut/Net & Grille CCNI', path: '/simulateur-embauche', icon: Calculator, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view' },
    { name: 'Prêts, Avantages & Primes', path: '/prets', icon: Landmark, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view' },
    { name: 'Salaire à la Demande (Acomptes)', path: '/salaire-a-la-demande', icon: Zap, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view' },
    { name: 'Budget & Masse Salariale', path: '/budget', icon: Wallet, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view' },
    { name: 'Simulateur Masse Salariale & Arbitrage', path: '/payroll-simulation', icon: Calculator, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view' },
    { name: 'Simulateur Noria & Dérive GVT', path: '/simulateur-noria-gvt', icon: TrendingUp, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view', manager: true },
    { name: 'Bilan Social Individuel (BSI)', path: '/bilan-social-individuel', icon: Award, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'dashboard:view' },
    { name: 'Délégations de Signature', path: '/delegations', icon: UserCheck, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'dashboard:view' },
    { name: 'Solde de Tout Compte (STC)', path: '/solde-de-tout-compte', icon: Calculator, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view', manager: true },
    { name: 'Saisies-Arrêts & Quotité Cessible', path: '/saisies-arrets-quotite-cessible', icon: Scale, domain: 'Pilotage RH', category: 'Paie, Finance & Retraite', permission: 'payroll:view', manager: true },

    // 5. Matériel, Flotte & Équipements Terrain
    { name: 'Frais Carburant & Tournées GPS', path: '/frais-carburant', icon: Fuel, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Constat Urgence Flotte Moto', path: '/constat-moto', icon: Bike, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Éco-Score Moto & Flotte', path: '/eco-score-moto', icon: Bike, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Traçabilité Démo & TPE', path: '/equipements-demo', icon: QrCode, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Jocker Smartphone Prêt', path: '/smartphone-secours', icon: Smartphone, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Kit Énergie Nomade (Powerbanks TPE)', path: '/kit-energie-nomade', icon: BatteryCharging, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Entraide Matériel Caisse & TPE Moto', path: '/entraide-materiel', icon: Bike, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'SAV & Échange SIM Défectueuses', path: '/sav-cartes-sim', icon: RefreshCw, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Objets & CNI Oubliés (Coffre)', path: '/objets-trouves', icon: Package, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Recyclage DEEE & Boutique Verte', path: '/recyclage-boutique', icon: Recycle, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Passeport Hauteur & Sécurité Poteaux', path: '/passeport-hauteur', icon: HardHat, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Pass VTC Déluge Abidjan', path: '/pass-deluge', icon: CloudRain, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Retour Serein (Covoiturage)', path: '/retour-serein', icon: Bus, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },
    { name: 'Popote Agence (Midi Orange Money)', path: '/popote-agence', icon: Utensils, domain: 'Pilotage RH', category: 'Flotte, Matériel & Équipements', permission: 'dashboard:view', manager: true },

    // 6. Développement, Workflows & Outils
    { name: 'Plan de Formation & FDFP', path: '/fdfp-gestion', icon: PiggyBank, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'learning:view' },
    { name: 'Efficacité Formations FDFP (ROI J+90)', path: '/evaluation-formations-fdfp', icon: Award, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'learning:view', manager: true },
    { name: 'Compétences, 9-Box & Talents', path: '/skills', icon: Award, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'skills:view' },
    { name: 'Marketplace Interne & Missions', path: '/marketplace-talents', icon: Sparkles, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'skills:view' },
    { name: 'Boîte à Idées & Innovation', path: '/innovation-participative', icon: Sparkles, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'dashboard:view' },
    { name: 'Documents, Règles & Politiques', path: '/documents', icon: FileText, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'documents:view_company' },
    { name: 'Processus & Workflows', path: '/workflows', icon: Zap, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'dashboard:view' },
    { name: 'Voice-to-HR (Mémos Vocaux WhatsApp)', path: '/voice-to-hr', icon: Mic, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'dashboard:view', manager: true },
    { name: 'Registre SIM Swap (ARTCI)', path: '/sim-swap-artci', icon: Lock, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'dashboard:view', manager: true },
    { name: 'Réquisitions Judiciaires (ARTCI)', path: '/requisitions-artci', icon: Scale, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'dashboard:view', manager: true },
    { name: 'Supervision Hors-Ligne & PWA Sync', path: '/offline-sync', icon: WifiOff, domain: 'Pilotage RH', category: 'Workflows & Outils RH', permission: 'dashboard:view', manager: true },


    // ══════════════════════════════════════════════════════════════════
    // ── INTELLIGENCE RH : Mutualisé en 3 Pôles Stratégiques ──
    // ══════════════════════════════════════════════════════════════════

    // 1. Tableaux de Bord & Reporting Social
    { name: t('sidebar.analytics', 'Tableaux de Bord RH'), path: '/analytics', icon: BarChart, domain: 'Intelligence RH', category: 'Tableaux de Bord & Reporting', permission: 'dashboard:view', manager: true },
    { name: 'Bilan Social Légal', path: '/bilan-social', icon: FileBarChart, domain: 'Intelligence RH', category: 'Tableaux de Bord & Reporting', permission: 'payroll:view' },
    { name: 'Générateur de Listes & Requêtes', path: '/requeteur', icon: Grid, domain: 'Intelligence RH', category: 'Tableaux de Bord & Reporting', permission: 'dashboard:view' },
    { name: 'Audit & Historique Daté', path: '/historique', icon: History, domain: 'Intelligence RH', category: 'Tableaux de Bord & Reporting', permission: 'dashboard:view' },

    // 2. Audit, Conformité, SoD & Contrôles
    { name: 'Ségrégation des Devoirs (SoD)', path: '/segregation-des-devoirs-sod', icon: Lock, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'employees:edit', manager: true },
    { name: 'Bouclier Contrôle Inspection MEPS', path: '/bouclier-meps', icon: Scale, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'employees:edit', manager: true },
    { name: 'Bouclier Pré-Audit CNPS & MEPS', path: '/bouclier-preaudit-cnps', icon: ShieldCheck, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'employees:edit', manager: true },
    { name: 'Conseiller Juridique & Code CI', path: '/conseiller-juridique', icon: Scale, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'employees:edit' },
    { name: 'Pesée des Postes (Hay/Mercer)', path: '/pesee-postes-hay', icon: Scale, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'employees:edit', manager: true },
    { name: 'Équité Salariale, Diversité & Inclusion', path: '/pay-equity', icon: Scale, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'dashboard:view' },
    { name: 'Sécurité Crise RH & Safety Check', path: '/securite-crise-rh', icon: AlertOctagon, domain: 'Intelligence RH', category: 'Audit, Risques & Contrôles', permission: 'dashboard:view', manager: true },

    // 3. Climat Social, QVT & Éthique
    { name: 'Baromètre QVT & Climat Social', path: '/barometre-qvt', icon: Smile, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Sentinelle IA Anti-Burnout', path: '/sentinelle-burnout', icon: HeartPulse, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Radar Churn Vendeur & Rétention IA', path: '/churn-predictor', icon: TrendingDown, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Radar Risque Attrition (Flight Risk)', path: '/people-analytics-flight-risk', icon: Activity, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Observatoire GPEC & Skill Gap', path: '/observatoire-gpec', icon: BrainCircuit, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Écoute Sérénité & Sas Décompression', path: '/ecoute-serenite', icon: HeartHandshake, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Automatisations & Déclencheurs RH', path: '/smart-automations', icon: Zap, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view', manager: true },
    { name: 'Canal d\'Alerte & Éthique', path: '/ethics', icon: ShieldAlert, domain: 'Intelligence RH', category: 'Climat Social, QVT & Éthique', permission: 'dashboard:view' }
];

export function Sidebar({ className, setIsMobileMenuOpen, currentDomain = 'Accueil' }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const userRole = user ? user.role : 'EMPLOYEE';
    const { t } = useTranslation();

    const [recherche, setRecherche] = useState('');
    const [openCategories, setOpenCategories] = useState({});

    const allItems = useMemo(() => getAllNavItems(t), [t]);

    // Filtrage des éléments selon le rôle et le domaine actif
    const navItems = useMemo(() => {
        return allItems.filter(item => {
            if (item.domain !== currentDomain) return false;

            if (userRole === 'EMPLOYEE') {
                return item.domain === 'Mon Espace' || item.domain === 'Accueil';
            } else if (userRole === 'MANAGER') {
                return item.manager === true;
            } else {
                // HR / ADMIN
                if (item.permission === 'settings:view' && userRole !== 'ADMIN') return false;
                if (item.permission === 'payroll:view' && userRole !== 'ADMIN' && userRole !== 'HR') return false;
                return true;
            }
        });
    }, [allItems, currentDomain, userRole]);

    // Filtrage dynamique avec la recherche
    const itemsFiltres = useMemo(() => {
        if (!recherche.trim()) return navItems;
        const q = recherche.toLowerCase();
        return navItems.filter(item => 
            item.name.toLowerCase().includes(q) || 
            (item.category && item.category.toLowerCase().includes(q))
        );
    }, [navItems, recherche]);

    // Regroupement par Catégorie (Pôle thématique)
    const groupedItems = useMemo(() => {
        const groups = {};
        itemsFiltres.forEach(item => {
            const cat = item.category || 'Autres Modules';
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(item);
        });
        return groups;
    }, [itemsFiltres]);

    // Identifier la catégorie du module actif
    const activeCategory = useMemo(() => {
        const active = navItems.find(i => i.path === location.pathname);
        return active ? active.category : null;
    }, [navItems, location.pathname]);

    // Initialisation et maintien de la catégorie active ouverte
    useEffect(() => {
        if (activeCategory) {
            setOpenCategories(prev => ({ ...prev, [activeCategory]: true }));
        }
    }, [activeCategory, currentDomain]);

    // Si l'utilisateur fait une recherche, ouvrir automatiquement toutes les catégories contenant des résultats
    useEffect(() => {
        if (recherche.trim()) {
            const newOpen = {};
            Object.keys(groupedItems).forEach(cat => {
                newOpen[cat] = true;
            });
            setOpenCategories(newOpen);
        }
    }, [recherche, groupedItems]);

    const toggleCategory = (cat) => {
        setOpenCategories(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };

    const toutDeplier = () => {
        const newOpen = {};
        Object.keys(groupedItems).forEach(cat => { newOpen[cat] = true; });
        setOpenCategories(newOpen);
    };

    const toutReplier = () => {
        setOpenCategories({});
    };

    const categoriesList = Object.keys(groupedItems);

    return (
        <div className={cn('flex h-full w-72 flex-col border-r bg-white shadow-[2px_0_12px_-3px_rgba(0,0,0,0.08)] transition-all shrink-0', className)}>
            {/* Entête du Domaine Actuel */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-2.5 text-slate-900">
                    <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-xs">
                        <Grid size={16} />
                    </span>
                    <div>
                        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                            {currentDomain}
                        </h2>
                        <span className="text-[10px] text-slate-500 font-medium">
                            {navItems.length} modules disponibles
                        </span>
                    </div>
                </div>
                <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                    V5.0
                </span>
            </div>

            {/* Barre de Recherche Rapide & Contrôles */}
            {currentDomain !== 'Accueil' && (
                <div className="p-3 border-b border-slate-100 bg-white space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un module..."
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                        {recherche && (
                            <button 
                                onClick={() => setRecherche('')} 
                                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>{categoriesList.length} pôles thématiques</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={toutDeplier}
                                className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
                            >
                                Déplier
                            </button>
                            <span>·</span>
                            <button 
                                onClick={toutReplier}
                                className="hover:text-blue-600 font-medium transition-colors cursor-pointer"
                            >
                                Replier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Arborescence de Navigation Mutualisée (Pôles Thématiques) */}
            <nav className="flex-1 px-2.5 py-3 overflow-y-auto custom-scrollbar space-y-2">
                {itemsFiltres.length === 0 ? (
                    <div className="text-center text-slate-400 text-xs py-8 space-y-1">
                        <Search className="h-5 w-5 mx-auto text-slate-300" />
                        <p>Aucun module correspondant.</p>
                        {recherche && (
                            <button 
                                onClick={() => setRecherche('')}
                                className="text-blue-600 font-semibold underline text-[11px]"
                            >
                                Réinitialiser le filtre
                            </button>
                        )}
                    </div>
                ) : null}

                {/* Si Accueil : Affichage direct sans accordéon */}
                {currentDomain === 'Accueil' ? (
                    <div className="space-y-1">
                        {itemsFiltres.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group',
                                        isActive
                                            ? 'bg-blue-600 text-white font-bold shadow-sm'
                                            : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                                    )}
                                >
                                    <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600')} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    // Pour Employés, Pilotage RH, Intelligence RH : Pôles Accordéons
                    categoriesList.map((category) => {
                        const itemsInCat = groupedItems[category] || [];
                        const isOpen = openCategories[category] ?? false;
                        const hasActiveChild = itemsInCat.some(i => i.path === location.pathname);

                        return (
                            <div 
                                key={category} 
                                className={cn(
                                    'rounded-xl border transition-all overflow-hidden',
                                    hasActiveChild 
                                        ? 'border-blue-200 bg-blue-50/20 shadow-xs' 
                                        : 'border-slate-200/70 bg-white hover:border-slate-300'
                                )}
                            >
                                {/* Bouton Accordéon de Catégorie */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center justify-between p-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        {isOpen ? (
                                            <FolderOpen className={cn("h-4 w-4 shrink-0", hasActiveChild ? "text-blue-600" : "text-slate-400")} />
                                        ) : (
                                            <Folder className={cn("h-4 w-4 shrink-0", hasActiveChild ? "text-blue-600" : "text-slate-400")} />
                                        )}
                                        <span className={cn("truncate", hasActiveChild ? "text-blue-950 font-extrabold" : "text-slate-800")}>
                                            {category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.2 rounded-md",
                                            hasActiveChild ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {itemsInCat.length}
                                        </span>
                                        {isOpen ? (
                                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Liste des Sous-Modules du Pôle */}
                                {isOpen && (
                                    <div className="px-2 pb-2 pt-1 space-y-0.5 border-t border-slate-100/80 bg-slate-50/40">
                                        {itemsInCat.map((item) => {
                                            const isActive = location.pathname === item.path;

                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all group',
                                                        isActive
                                                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                                                            : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-xs'
                                                    )}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            'h-3.5 w-3.5 shrink-0 transition-colors',
                                                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                                                        )}
                                                    />
                                                    <span className="truncate">{item.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </nav>

            {/* Pied de la barre latérale */}
            <div className="border-t border-slate-100 p-3 bg-slate-50/80 shrink-0 space-y-1">
                <ThemeToggle />
                <LanguageSwitcher />

                {['ADMIN', 'Administrator', 'HR'].includes(userRole) && (
                    <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
                    >
                        <Settings className="h-4 w-4 text-slate-400" />
                        Paramètres
                    </Link>
                )}
                {['ADMIN', 'Administrator'].includes(userRole) && (
                    <Link
                        to="/audit-logs"
                        onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
                    >
                        <ShieldAlert className="h-4 w-4 text-blue-500" />
                        Piste d'Audit
                    </Link>
                )}
                
                <button 
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                    <LogOut className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    Déconnexion
                </button>
            </div>
            
            {/* Style de scrollbar personnalisée */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
            `}} />
        </div>
    );
}

export default Sidebar;
