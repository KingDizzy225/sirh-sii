import React, { useState } from 'react';
import {
  Compass, Sparkles, Target, ArrowRight, BookOpen, Award,
  CheckCircle2, Clock, Users, Building, TrendingUp, Star,
  HelpCircle, ChevronRight, X, Send, BrainCircuit, Lightbulb
} from 'lucide-react';

export function SimulateurCarriereIA() {
  const [currentRole, setCurrentRole] = useState("Developpeur_Fullstack");
  const [targetRole, setTargetRole] = useState("Lead_Architecte_Cloud");
  const [toastMessage, setToastMessage] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Définition des profils de postes et compétences
  const rolesData = {
    "Developpeur_Fullstack": {
      titre: "Développeur Fullstack React / Node",
      departement: "Infrastructure & Systèmes",
      categorieCCNI: "Agent de Maîtrise (Catégorie M1)",
      salaireMoyen: 550000,
      competences: ["React & Frontend UI", "Node.js & APIs REST", "Git & CI/CD", "Bases de données SQL"]
    },
    "Lead_Architecte_Cloud": {
      titre: "Lead Architecte Cloud & DevOps",
      departement: "Infrastructure & Systèmes",
      categorieCCNI: "Cadre Supérieur (Catégorie C3)",
      salaireMoyen: 1100000,
      competencesRequises: [
        { nom: "React & Frontend UI", niveauRequis: "Avancé", acquis: true },
        { nom: "Node.js & APIs REST", niveauRequis: "Expert", acquis: true },
        { nom: "Architecture Cloud AWS / Azure", niveauRequis: "Expert", acquis: false, priorite: "CRITIQUE" },
        { nom: "Orchestration Kubernetes & Docker", niveauRequis: "Avancé", acquis: false, priorite: "HAUTE" },
        { nom: "Leadership & Encadrement Technique", niveauRequis: "Maîtrise", acquis: false, priorite: "MOYENNE" }
      ],
      formationsConseillees: [
        "Certification AWS Certified Solutions Architect (FDFP)",
        "Bootcamp Kubernetes CKA & Infrastructure As Code Terraform",
        "Atelier SII : Leadership & Posture de Mentor Technique"
      ],
      horizonMois: 14,
      gainSalarialEstime: "+550 000 FCFA / mois"
    },
    "Charge_Clientele": {
      titre: "Chargée de Clientèle Entreprises Senior",
      departement: "Banque d'Affaires & PME",
      categorieCCNI: "Agent de Maîtrise (Catégorie M2)",
      salaireMoyen: 600000,
      competences: ["Prospection Commerciale", "Analyse Financière PME", "Gestion Relation Client"]
    },
    "Directeur_Agence": {
      titre: "Directrice / Directeur d'Agence Principale",
      departement: "Direction Commerciale & Agences",
      categorieCCNI: "Cadre Supérieur (Catégorie C3)",
      salaireMoyen: 1250000,
      competencesRequises: [
        { nom: "Prospection & Négociation PME", niveauRequis: "Expert", acquis: true },
        { nom: "Analyse des Risques Crédit", niveauRequis: "Avancé", acquis: true },
        { nom: "Management d'Équipe & Recrutement", niveauRequis: "Avancé", acquis: false, priorite: "CRITIQUE" },
        { nom: "Pilotage Compte d'Exploitation Agence", niveauRequis: "Avancé", acquis: false, priorite: "HAUTE" },
        { nom: "Conformité Réglementaire BCEAO & Blanchiment", niveauRequis: "Maîtrise", acquis: false, priorite: "HAUTE" }
      ],
      formationsConseillees: [
        "Programme Management Stratégique d'Agence Bancaire (MDE Business School)",
        "Formation Réglementation Prudentielle & Risque BCEAO (FDFP)",
        "Coaching de Transition Managériale SII"
      ],
      horizonMois: 18,
      gainSalarialEstime: "+650 000 FCFA / mois"
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sélection active
  const targetData = targetRole === "Lead_Architecte_Cloud" ? rolesData.Lead_Architecte_Cloud : rolesData.Directeur_Agence;
  const currentData = currentRole === "Developpeur_Fullstack" ? rolesData.Developpeur_Fullstack : rolesData.Charge_Clientele;

  // Calcul du taux d'adéquation (Matching Score)
  const totalComp = targetData.competencesRequises.length;
  const compAcquises = targetData.competencesRequises.filter(c => c.acquis).length;
  const matchScore = Math.round((compAcquises / totalComp) * 100);

  const handleSubmitWish = (e) => {
    e.preventDefault();
    setShowSubmitModal(false);
    showToast(`Votre projet de parcours vers "${targetData.titre}" a été transmis à la DRH pour intégration au plan FDFP.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Simulateur d'Évolution de Carrière IA ("Where Next?")
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
                  GPS Carrière
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Projetez votre avenir dans l'entreprise : diagnostic du Skill Gap, formations ciblées et perspectives CCNI
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Soumettre ce Projet à la DRH</span>
        </button>
      </div>

      {/* Sélecteur de Parcours */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Définissez votre trajectoire d'évolution :
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Poste Actuel */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              1. Votre Poste Actuel
            </span>
            <select
              value={currentRole}
              onChange={(e) => {
                setCurrentRole(e.target.value);
                if (e.target.value === "Developpeur_Fullstack") setTargetRole("Lead_Architecte_Cloud");
                else setTargetRole("Directeur_Agence");
              }}
              className="w-full text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 text-slate-900 dark:text-white"
            >
              <option value="Developpeur_Fullstack">Développeur Fullstack React / Node</option>
              <option value="Charge_Clientele">Chargée de Clientèle Entreprises Senior</option>
            </select>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Classification CCNI : <strong>{currentData.categorieCCNI}</strong>
            </div>
          </div>

          {/* Poste Cible Rêvé */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border-2 border-indigo-400 dark:border-indigo-800 space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
              2. Le Poste Cible Visé
            </span>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full text-sm font-bold bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
            >
              {currentRole === "Developpeur_Fullstack" ? (
                <option value="Lead_Architecte_Cloud">Lead Architecte Cloud & DevOps</option>
              ) : (
                <option value="Directeur_Agence">Directrice / Directeur d'Agence Principale</option>
              )}
            </select>
            <div className="text-xs text-indigo-700 dark:text-indigo-300">
              Classification CCNI cible : <strong>{targetData.categorieCCNI}</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Résultat du Matching IA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Adéquation Actuelle */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Taux d'Adéquation IA
            </span>
            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{matchScore}%</span>
            <span className="text-xs text-emerald-600 font-bold">Base solide</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {compAcquises} compétences validées sur {totalComp} requises
          </div>
        </div>

        {/* Horizon Temporel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Horizon de Réalisation
            </span>
            <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{targetData.horizonMois}</span>
            <span className="text-xs text-slate-400">mois</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Avec le parcours d'accompagnement FDFP
          </div>
        </div>

        {/* Gain Salarial Indicatif */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Gain Salarial CCNI Indicatif
            </span>
            <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {targetData.gainSalarialEstime}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Passage au statut Cadre Supérieur C3
          </div>
        </div>

      </div>

      {/* Détail du Skill Gap (Compétences à combler) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Radar des Compétences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            Analyse Détaillée du Skill Gap
          </h3>

          <div className="space-y-3 pt-2">
            {targetData.competencesRequises.map((comp, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 dark:text-white">{comp.nom}</div>
                  <div className="text-slate-400">Attendu : {comp.niveauRequis}</div>
                </div>

                {comp.acquis ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Déjà Acquis
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    comp.priorite === 'CRITIQUE'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    À Acquérir ({comp.priorite})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Plan d'Action Recommandé par l'IA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Parcours Recommandé par l'IA (Formations & Binômes)
          </h3>

          <div className="space-y-3 pt-2">
            {targetData.formationsConseillees.map((f, idx) => (
              <div key={idx} className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{f}</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">Éligible prise en charge FDFP / E-learning interne</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
            <strong>Recommandation Mentorat :</strong> Positionnez-vous en binôme sur les projets d'architecture avec {targetRole === "Lead_Architecte_Cloud" ? "Moussa Soro" : "Jean-Marc Koffi"} pour valider la pratique de terrain.
          </div>
        </div>

      </div>

      {/* MODALE : Soumission à la DRH */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/40">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Transmettre mon Projet d'Évolution
                </h3>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWish} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Vous vous apprêtez à notifier votre manager et la Direction des Ressources Humaines de votre souhait d'évoluer vers le poste de :
              </p>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                {targetData.titre}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message d'accompagnement / Motivations :
                </label>
                <textarea
                  rows={3}
                  required
                  defaultValue="Je souhaite m'inscrire dans ce parcours d'évolution pour acquérir les compétences requises et franchir ce palier au sein de SII CI."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Envoyer à la DRH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default SimulateurCarriereIA;
