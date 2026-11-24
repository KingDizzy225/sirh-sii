import React, { useState } from 'react';
import {
  Grid,
  Award,
  Users,
  Star,
  TrendingUp,
  Filter,
  Search,
  CheckCircle2,
  ChevronRight,
  Sliders,
  User,
  Building2,
  Download,
  Printer,
  Sparkles,
  HelpCircle,
  Eye,
  X
} from 'lucide-react';

export default function TalentReview9Box() {
  const [selectedAgence, setSelectedAgence] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedTalent, setSelectedTalent] = useState(null);

  // Définition des 9 quadrants de la Matrice 9-Box (Standard McKinsey / GE)
  // Axe Y : Potentiel (Élevé, Moyen, Limité)
  // Axe X : Performance (Élevée, Conforme, À Développer)
  const quadrantsConfig = [
    { id: 'q9', y: 'Élevé', x: 'Élevée', label: '1. Étoiles (Top Talents)', desc: 'Successeurs immédiats aux postes de direction', badgeColor: 'bg-emerald-100 text-[#008000] border-emerald-300', boxBg: 'bg-emerald-50/70' },
    { id: 'q8', y: 'Élevé', x: 'Conforme', label: '2. Hauts Potentiels', desc: 'Futurs leaders en phase de montée en compétences', badgeColor: 'bg-blue-100 text-[#002B7F] border-blue-300', boxBg: 'bg-blue-50/60' },
    { id: 'q7', y: 'Élevé', x: 'À Développer', label: '3. Énigmes / Diamants Bruts', desc: 'Fort potentiel avec performance à canaliser', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', boxBg: 'bg-amber-50/60' },

    { id: 'q6', y: 'Moyen', x: 'Élevée', label: '4. Piliers d’Excellence', desc: 'Performeurs confirmés, experts de leur métier', badgeColor: 'bg-blue-100 text-[#002B7F] border-blue-300', boxBg: 'bg-blue-50/40' },
    { id: 'q5', y: 'Moyen', x: 'Conforme', label: '5. Cœur de Compétences', desc: 'Collaborateurs réguliers, conformes aux attentes', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', boxBg: 'bg-slate-50' },
    { id: 'q4', y: 'Moyen', x: 'À Développer', label: '6. Dilemmes', desc: 'Stagnation temporaire, accompagnement requis', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', boxBg: 'bg-amber-50/40' },

    { id: 'q3', y: 'Limité', x: 'Élevée', label: '7. Experts Spécialistes', desc: 'Maîtrise totale du poste actuel, sans souhait managérial', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', boxBg: 'bg-slate-50' },
    { id: 'q2', y: 'Limité', x: 'Conforme', label: '8. Collaborateurs Stables', desc: 'Tenue de poste adéquate, besoin de routine claire', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300', boxBg: 'bg-slate-50' },
    { id: 'q1', y: 'Limité', x: 'À Développer', label: '9. Sous-Performance / Risque', desc: 'Plan d’amélioration impératif ou réorientation', badgeColor: 'bg-red-100 text-red-800 border-red-300', boxBg: 'bg-red-50/50' }
  ];

  // Données des collaborateurs étalonnés en Comité de Carrière
  const [talents, setTalents] = useState([
    {
      id: 'EMP-0142',
      nom: 'Kouassi Konan Marc',
      poste: 'Chef de Caisse Senior',
      agence: 'Agence Abidjan Plateau',
      departement: 'Opérations & Guichets',
      quadrantId: 'q9',
      scorePerformance: '4.8 / 5',
      scorePotentiel: 'Élevé',
      anciennete: '8 ans',
      planDeveloppement: 'Successeur désigné pour la Direction de l’Agence Plateau (Horizon 6 mois). Formation Executive Leadership FDFP programmée.'
    },
    {
      id: 'EMP-0089',
      nom: 'Aya Touré Cissé',
      poste: 'Chargée de Clientèle Entreprises',
      agence: 'Agence Cocody Deux-Plateaux',
      departement: 'Développement Commercial',
      quadrantId: 'q9',
      scorePerformance: '4.9 / 5',
      scorePotentiel: 'Élevé',
      anciennete: '5 ans',
      planDeveloppement: 'Promotion proposée : Responsable Grands Comptes B2B Réseau avec rattrapage salarial immédiat.'
    },
    {
      id: 'EMP-0311',
      nom: 'Gnagne Sarah Patricia',
      poste: 'Analyste Risques & Conformité',
      agence: 'Agence Abidjan Plateau',
      departement: 'Direction, Audit & RH',
      quadrantId: 'q8',
      scorePerformance: '4.2 / 5',
      scorePotentiel: 'Élevé',
      anciennete: '2 ans',
      planDeveloppement: 'Mentorat direct avec le Directeur de la Conformité. Financement certification CAMS anti-blanchiment.'
    },
    {
      id: 'EMP-0034',
      nom: 'Bamba Souleymane',
      poste: 'Responsable Logistique & Approvisionnements',
      agence: 'Agence Yopougon Siporex',
      departement: 'Moyens Généraux & Sécurité',
      quadrantId: 'q6',
      scorePerformance: '4.6 / 5',
      scorePotentiel: 'Moyen',
      anciennete: '12 ans',
      planDeveloppement: 'Pilier logistique confirmé. Référent formateur interne pour les nouveaux superviseurs de stock.'
    },
    {
      id: 'EMP-0215',
      nom: 'Yao N’Goran Bertin',
      poste: 'Technicien Support Réseau & Monétique',
      agence: 'Agence San Pedro Port',
      departement: 'Support, IT & Monétique',
      quadrantId: 'q7',
      scorePerformance: '3.6 / 5',
      scorePotentiel: 'Élevé',
      anciennete: '3 ans',
      planDeveloppement: 'Rapprochement géographique Abidjan et intégration dans l’équipe architecture réseau central.'
    },
    {
      id: 'EMP-0056',
      nom: 'Coulibaly Salimata',
      poste: 'Guichetière Réseau Polyvalente',
      agence: 'Agence Grand-Bassam',
      departement: 'Opérations & Guichets',
      quadrantId: 'q5',
      scorePerformance: '3.9 / 5',
      scorePotentiel: 'Moyen',
      anciennete: '4 ans',
      planDeveloppement: 'Maintien dans le rôle avec objectif de polyvalence caisse niveau 3.'
    },
    {
      id: 'EMP-0078',
      nom: 'Diallo Oumar',
      poste: 'Conseiller Commercial Boutique',
      agence: 'Agence Yopougon Siporex',
      departement: 'Développement Commercial',
      quadrantId: 'q4',
      scorePerformance: '3.1 / 5',
      scorePotentiel: 'Moyen',
      anciennete: '1 an',
      planDeveloppement: 'Coaching vente hebdomadaire avec le Chef de Boutique. Révision des objectifs de prospection terrain.'
    },
    {
      id: 'EMP-0092',
      nom: 'Koffi Akissi Jeanne',
      poste: 'Agent d’Accueil & Orientation',
      agence: 'Agence Cocody Deux-Plateaux',
      departement: 'Opérations & Guichets',
      quadrantId: 'q2',
      scorePerformance: '3.7 / 5',
      scorePotentiel: 'Limité',
      anciennete: '7 ans',
      planDeveloppement: 'Excellente tenue de l’accueil client. Pas de souhait de mobilité hiérarchique.'
    },
    {
      id: 'EMP-0105',
      nom: 'Traoré Idrissa',
      poste: 'Chauffeur Flotte & Liaisons Agences',
      agence: 'Agence Abidjan Plateau',
      departement: 'Moyens Généraux & Sécurité',
      quadrantId: 'q3',
      scorePerformance: '4.5 / 5',
      scorePotentiel: 'Limité',
      anciennete: '9 ans',
      planDeveloppement: 'Expert de la flotte. Formation éco-conduite et premier secours CSST.'
    }
  ]);

  const filteredTalents = talents.filter((t) => {
    const matchAgence = selectedAgence === 'all' || t.agence === selectedAgence;
    const matchDept = selectedDept === 'all' || t.departement === selectedDept;
    return matchAgence && matchDept;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Talent Management & Comité de Carrière • Standard GE / McKinsey
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Étalonnage Performance vs Potentiel 2026
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Grid className="w-7 h-7 text-[#002B7F]" />
            Revue des Talents 9-Box & Calibration Comité de Carrière
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Cartographiez et calibrez vos viviers de talents : identification des étoiles montantes (*Stars*),
            sécurisation des piliers d'excellence et orientation des plans d'accélération managériaux.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#002B7F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer PV Comité Carrière
          </button>
        </div>
      </div>

      {/* Filtres de Revue */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filtrer l'Étalonnage :</span>
          
          <select
            value={selectedAgence}
            onChange={(e) => setSelectedAgence(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
          >
            <option value="all">Toutes les Agences (5 agences)</option>
            <option value="Agence Abidjan Plateau">Agence Abidjan Plateau</option>
            <option value="Agence Cocody Deux-Plateaux">Agence Cocody Deux-Plateaux</option>
            <option value="Agence Yopougon Siporex">Agence Yopougon Siporex</option>
            <option value="Agence San Pedro Port">Agence San Pedro Port</option>
            <option value="Agence Grand-Bassam">Agence Grand-Bassam</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
          >
            <option value="all">Tous les Départements</option>
            <option value="Opérations & Guichets">Opérations & Guichets</option>
            <option value="Développement Commercial">Développement Commercial</option>
            <option value="Support, IT & Monétique">Support, IT & Monétique</option>
            <option value="Moyens Généraux & Sécurité">Moyens Généraux & Sécurité</option>
            <option value="Direction, Audit & RH">Direction, Audit & RH</option>
          </select>
        </div>

        <div className="text-slate-500 font-medium">
          Affichage : <strong className="text-slate-800">{filteredTalents.length} talents étalonnés</strong>
        </div>
      </div>

      {/* Matrice 9-Box Visuelle (Grille 3 x 3) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        {/* Titres d'Axes */}
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
          <span>Axe Y : Potentiel d'Évolution ➔</span>
          <span>Axe X : Niveau de Performance Démontrée ➔</span>
        </div>

        {/* Grille 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quadrantsConfig.map((q) => {
            const talentsInBox = filteredTalents.filter((t) => t.quadrantId === q.id);

            return (
              <div
                key={q.id}
                className={`border rounded-xl p-4 flex flex-col justify-between min-h-[220px] transition-all ${q.boxBg} border-slate-200 hover:border-[#002B7F] shadow-sm`}
              >
                {/* En-tête du quadrant */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${q.badgeColor}`}>
                      {q.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {talentsInBox.length} talent(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-1 leading-tight">{q.desc}</p>
                </div>

                {/* Liste des collaborateurs dans ce quadrant */}
                <div className="my-3 space-y-1.5">
                  {talentsInBox.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400 italic">
                      Aucun profil dans ce quadrant
                    </div>
                  ) : (
                    talentsInBox.map((talent) => (
                      <div
                        key={talent.id}
                        onClick={() => setSelectedTalent(talent)}
                        className="bg-white p-2.5 rounded-lg border border-slate-200 hover:border-[#002B7F] cursor-pointer shadow-xs flex items-center justify-between text-xs transition-colors group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#002B7F]">
                            {talent.nom}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {talent.poste} • {talent.agence.replace('Agence ', '')}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-[#008000] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {talent.scorePerformance}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Pied de quadrant */}
                <div className="text-[10px] text-slate-400 border-t border-slate-200/60 pt-1.5 flex justify-between">
                  <span>Potentiel : {q.y}</span>
                  <span>Perf : {q.x}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Fiche Individuelle de Calibration */}
      {selectedTalent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-[#002B7F]">{selectedTalent.id}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedTalent.nom}</h3>
              </div>
              <button
                onClick={() => setSelectedTalent(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Poste & Entité :</span>
                <p className="font-semibold text-slate-800">{selectedTalent.poste}</p>
                <p className="text-slate-500">{selectedTalent.agence}</p>
              </div>
              <div>
                <span className="text-slate-400">Évaluation Globale :</span>
                <p className="font-bold text-[#008000]">Performance : {selectedTalent.scorePerformance}</p>
                <p className="text-slate-600">Potentiel : {selectedTalent.scorePotentiel}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#002B7F]">
                Décision & Plan d'Accompagnement du Comité de Carrière :
              </span>
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                {selectedTalent.planDeveloppement}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedTalent(null)}
                className="px-4 py-2 bg-[#002B7F] text-white font-semibold rounded-lg text-xs hover:bg-blue-900"
              >
                Valider & Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
