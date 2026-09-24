import React, { useState, useMemo } from 'react';
import {
  Compass, Sparkles, Target, ArrowRight, BookOpen, Award,
  CheckCircle2, Clock, Users, Building, TrendingUp, Star,
  HelpCircle, ChevronRight, X, Send, BrainCircuit, Lightbulb,
  DollarSign, Check, Sliders, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useEffectif, nomDe } from '../lib/effectif.js';

const TARGET_ROLES = {
  "Directeur_Agence": {
    titre: "Directrice / Directeur d'Agence Principale",
    departement: "Direction Commerciale & Agences",
    categorieCCNI: "Cadre Supérieur (Catégorie C3)",
    salaireCible: 1350000,
    competencesRequises: [
      { nom: "Prospection & Négociation Grands Comptes PME", niveauRequis: "Expert", priorite: "CRITIQUE" },
      { nom: "Analyse des Risques Crédits & Engagements", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Management d'Équipe & Leadership d'Agence", niveauRequis: "Avancé", priorite: "CRITIQUE" },
      { nom: "Pilotage Compte d'Exploitation (P&L)", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Conformité Réglementaire BCEAO & Anti-Blanchiment", niveauRequis: "Maîtrise", priorite: "MOYENNE" }
    ],
    formationsConseillees: [
      "Programme Certifiant Management d'Agence Bancaire (MDE Business School)",
      "Formation Réglementation Prudentielle & Risque Crédit BCEAO (FDFP)",
      "Coaching Exécutif de Transition Managériale SII"
    ],
    horizonMois: 14,
    mentorRecommande: "Jean-Marc Koffi (Directeur d'Agence Plateau)"
  },
  "Lead_Architecte_Cloud": {
    titre: "Lead Architecte Cloud & DevOps",
    departement: "Infrastructure & Systèmes",
    categorieCCNI: "Cadre Supérieur (Catégorie C3)",
    salaireCible: 1250000,
    competencesRequises: [
      { nom: "Architecture Cloud Hybride AWS / Azure", niveauRequis: "Expert", priorite: "CRITIQUE" },
      { nom: "Orchestration Kubernetes & Conteneurs Docker", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Sécurité & Gouvernance des Données Bancaires", niveauRequis: "Expert", priorite: "CRITIQUE" },
      { nom: "Automatisation CI/CD & Terraform (IaC)", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Leadership & Encadrement Technique d'Équipe", niveauRequis: "Maîtrise", priorite: "MOYENNE" }
    ],
    formationsConseillees: [
      "Certification AWS Certified Solutions Architect Professional",
      "Bootcamp Avancé Kubernetes CKA & Sécurité Cloud",
      "Séminaire Gouvernance SI & Résilience Opérationnelle"
    ],
    horizonMois: 12,
    mentorRecommande: "Moussa Soro (Responsable IT & Systèmes)"
  },
  "Directeur_Financier_Adjoint": {
    titre: "Directeur Administratif & Financier Adjoint",
    departement: "Finance & Comptabilité",
    categorieCCNI: "Cadre Supérieur (Catégorie C3)",
    salaireCible: 1400000,
    competencesRequises: [
      { nom: "Consolidation des Comptes & Normes IFRS / SYSCOHADA", niveauRequis: "Expert", priorite: "CRITIQUE" },
      { nom: "Gestion de Trésorerie Multidevises & Arbitrage", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Contrôle de Gestion & Modélisation Budgétaire", niveauRequis: "Expert", priorite: "CRITIQUE" },
      { nom: "Relations avec Commissaires aux Comptes & Fisc", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Management d'Équipe Comptable & Financière", niveauRequis: "Maîtrise", priorite: "MOYENNE" }
    ],
    formationsConseillees: [
      "Certificat DAF & Normes SYSCOHADA Révisé (FDFP)",
      "Modélisation Financière Avancée & Power BI Finance",
      "Atelier Négociation Bancaire & Financement Corporate"
    ],
    horizonMois: 16,
    mentorRecommande: "Kouamé N'Dri (Chef Comptable Principal)"
  },
  "Chef_Projet_Fintech": {
    titre: "Chef de Projet Digital, Mobile & FinTech",
    departement: "Banque Digitale & Innovation",
    categorieCCNI: "Cadre Supérieur (Catégorie C2)",
    salaireCible: 1100000,
    competencesRequises: [
      { nom: "Gestion de Projet Agile Scrum & Kanban", niveauRequis: "Expert", priorite: "CRITIQUE" },
      { nom: "APIs Open Banking & Monétique (GIM-UEMOA)", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Expérience Utilisateur Mobile UX / Product", niveauRequis: "Avancé", priorite: "HAUTE" },
      { nom: "Gestion des Prestataires Techniques & SLAs", niveauRequis: "Maîtrise", priorite: "MOYENNE" },
      { nom: "Conduite du Changement & Adoption Digitale", niveauRequis: "Maîtrise", priorite: "MOYENNE" }
    ],
    formationsConseillees: [
      "Certification Scrum Master PSM II & Product Owner",
      "Fondamentaux de la Monétique et Sécurité PCI-DSS",
      "Masterclass Product Management & FinTech Africaine"
    ],
    horizonMois: 10,
    mentorRecommande: "Armand Kouassi (Expert Projets Digitaux)"
  }
};

export function SimulateurCarriereIA() {
  // L'effectif vient du serveur ; le premier salarié reçu ouvre la simulation.
  const { salaries: effectif } = useEffectif({ actifsSeulement: true });
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [targetRoleKey, setTargetRoleKey] = useState("Directeur_Agence");
  const [toastMessage, setToastMessage] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const selectedEmp = useMemo(() => {
    return effectif.find(e => e.id === selectedEmpId) || effectif[0] || null;
  }, [selectedEmpId, effectif]);

  const targetData = TARGET_ROLES[targetRoleKey];

  // Calcul dynamique du Matching Score en fonction du collaborateur sélectionné
  const matchResult = useMemo(() => {
    // Calcul de base basé sur la compatibilité de département et l'ancienneté
    const empRole = (selectedEmp.position || selectedEmp.role || '').toLowerCase();
    const targetDept = targetData.departement.toLowerCase();
    const empDept = (selectedEmp.department || '').toLowerCase();

    const isSameDept = empDept.includes('banque') || empDept.includes('commercial')
      ? targetDept.includes('commercial') || targetDept.includes('agence')
      : empDept.includes('syst') || empDept.includes('it')
      ? targetDept.includes('syst') || targetDept.includes('cloud')
      : true;

    // Compétences acquises simulées
    const comps = targetData.competencesRequises.map((c, idx) => {
      // 2 premières compétences acquises si même pôle, sinon 1
      const isAcquired = isSameDept ? idx < 3 : idx < 2;
      return {
        ...c,
        acquis: isAcquired
      };
    });

    const acquiredCount = comps.filter(c => c.acquis).length;
    const score = Math.round((acquiredCount / comps.length) * 100);

    const baseSalary = 650000;
    const salaryGain = targetData.salaireCible - baseSalary;

    return {
      score,
      comps,
      acquiredCount,
      salaryGain: salaryGain > 0 ? `+${salaryGain.toLocaleString('fr-FR')} FCFA / mois` : '+350 000 FCFA / mois'
    };
  }, [selectedEmp, targetData]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitWish = (e) => {
    e.preventDefault();
    setShowSubmitModal(false);
    showToast(`Projet de mobilité vers « ${targetData.titre} » transmis à la DRH pour ${selectedEmp.firstName} ${selectedEmp.lastName}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              IA Mobilité Interne & GPEC • "Where Next?"
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Simulateur d'Évolution de Carrière & Trajectoire
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Projetez l'avenir professionnel de vos 191 collaborateurs : diagnostic du Skill Gap, formations certifiées FDFP et passerelles managériales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowSubmitModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs gap-2 font-semibold text-xs"
          >
            <Send size={14} /> Soumettre ce Projet à la DRH
          </Button>
        </div>
      </div>

      {/* 4 Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Matching Score */}
        <div className="bg-indigo-50/70 border border-indigo-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Adéquation IA (Match)
            </span>
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{matchResult.score}%</span>
            <span className="text-xs text-indigo-600 font-bold">Base solide</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {matchResult.acquiredCount} compétences sur {matchResult.comps.length} validées
          </p>
        </div>

        {/* KPI 2 : Horizon Temporel */}
        <div className="bg-blue-50/70 border border-blue-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Horizon de Réalisation
            </span>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{targetData.horizonMois}</span>
            <span className="text-xs text-slate-500 font-medium">mois</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Parcours certifiant et mentorat inclus</p>
        </div>

        {/* KPI 3 : Gain Salarial Estimé */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Progression Salariale CCNI
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {matchResult.salaryGain}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Passage au statut {targetData.categorieCCNI}</p>
        </div>

        {/* KPI 4 : Financement FDFP */}
        <div className="bg-purple-50/70 border border-purple-100/80 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Financement FDFP
            </span>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">100%</span>
            <span className="text-xs text-emerald-600 font-bold">Pris en charge</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">3 certifications éligibles au plan 2026</p>
        </div>

      </div>

      {/* Trajectory Selectors: Collaborator + Target Role */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Définissez la trajectoire d'évolution :
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Collaborator Selector */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              1. Collaborateur concerné (191 collaborateurs)
            </span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="w-full text-sm font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
            >
              {effectif.slice(0, 60).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {nomDe(emp)} — {emp.department} ({emp.positionTitle || emp.role || 'Salarié'})
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-500">
              Poste actuel : <strong className="text-slate-800">{selectedEmp.position || selectedEmp.role || 'Cadre'}</strong> • {selectedEmp.department}
            </div>
          </div>

          {/* Target Role Selector */}
          <div className="p-4 bg-indigo-50/60 rounded-xl border-2 border-indigo-300 space-y-2">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
              2. Poste Cible Visé dans l'Entreprise
            </span>
            <select
              value={targetRoleKey}
              onChange={(e) => setTargetRoleKey(e.target.value)}
              className="w-full text-sm font-bold bg-white border border-indigo-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(TARGET_ROLES).map((key) => (
                <option key={key} value={key}>
                  {TARGET_ROLES[key].titre} ({TARGET_ROLES[key].departement})
                </option>
              ))}
            </select>
            <div className="text-xs text-indigo-700 font-medium">
              Classification CCNI cible : <strong>{targetData.categorieCCNI}</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Skill Gap Analysis & Recommended Training Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Radar / Detailed Skill Gap */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Diagnostic Détaillé du Skill Gap</h3>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-[11px] font-bold">
              IA Diagnostic
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {matchResult.comps.map((comp, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{comp.nom}</div>
                  <div className="text-slate-400">Niveau requis : {comp.niveauRequis}</div>
                </div>

                {comp.acquis ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Validé
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    comp.priorite === 'CRITIQUE'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    À Acquérir ({comp.priorite})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Certified FDFP Action Plan */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">Parcours de Formation FDFP & Accompagnement</h3>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px] font-bold">
              100% Pris en Charge
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {targetData.formationsConseillees.map((f, idx) => (
              <div key={idx} className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{f}</div>
                  <div className="text-slate-500 mt-0.5">Financement FDFP Côte d'Ivoire certifié • Validation N+1</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
            <strong>Binôme & Mentorat Recommandé :</strong>
            <p>
              L'IA préconise un compagnonnage terrain hebdomadaire avec <strong>{targetData.mentorRecommande}</strong> pour sécuriser l'acquisition des réflexes de gouvernance.
            </p>
          </div>
        </div>

      </div>

      {/* Submission Modal to HR */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Transmettre ce Projet d'Évolution
                </h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWish} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Vous allez formaliser la trajectoire de carrière de <strong>{selectedEmp.firstName} {selectedEmp.lastName}</strong> vers le poste cible de :
              </p>

              <div className="p-3 bg-indigo-50 rounded-xl font-bold text-indigo-700 text-sm">
                {targetData.titre}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Recommandation / Note de Motivation :
                </label>
                <textarea
                  rows={3}
                  required
                  defaultValue={`Validation du projet de montée en compétences pour ${selectedEmp.firstName} ${selectedEmp.lastName}. Pré-inscription aux modules FDFP validée.`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmitModal(false)}
                  className="rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-bold"
                >
                  <Send size={14} /> Transmettre à la DRH
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default SimulateurCarriereIA;
