import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Scale,
  CheckCircle2,
  FileText,
  DollarSign,
  Download,
  Printer,
  Calendar,
  Building2,
  Search,
  RefreshCw,
  HelpCircle,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';

export default function BouclierPreAuditCnps() {
  const [activeCategory, setActiveCategory] = useState('all');

  // Catégories de contrôle réglementaire en Côte d'Ivoire
  const categories = [
    { id: 'all', label: 'Tous les Points (18 contrôles)' },
    { id: 'cnps_paie', label: '1. CNPS, CMU & Cotisations Paie' },
    { id: 'contrats_droit', label: '2. Contrats, CDD & Requalification CDI' },
    { id: 'temps_travail', label: '3. Temps de Travail & Heures Sup (CCNI)' },
    { id: 'hygiene_csst', label: '4. Santé, CSST & Registres Obligatoires' }
  ];

  // Grille d'audit des 18 points de conformité légale
  const [auditCheckpoints, setAuditCheckpoints] = useState([
    {
      id: 'AUD-01',
      cat: 'cnps_paie',
      titre: 'Déclarations Nominatives Mensuelles CNPS (DISA / e-CNPS)',
      refLegale: 'Code de Prévoyance Sociale CI - Art. 24',
      statut: 'conforme', // 'conforme', 'alerte', 'critique'
      detail: 'Toutes les déclarations de janvier à octobre 2026 sont télétransmises avec quitus de paiement à échéance.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-02',
      cat: 'cnps_paie',
      titre: 'Assiette Déplafonnée Régime Complémentaire Cadres (3,75×)',
      refLegale: 'Décret n° 2012-328 relatif au régime de retraite complémentaire',
      statut: 'conforme',
      detail: 'Application exacte du plafond de 262 500 FCFA pour le régime général et assiette déplafonnée pour les cadres.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-03',
      cat: 'cnps_paie',
      titre: 'Assujettissement Obligatoire CMU (Caisse Nationale d’Assurance Maladie)',
      refLegale: 'Loi n° 2014-131 portant Couverture Maladie Universelle',
      statut: 'conforme',
      detail: '1 000 FCFA prélevés et reversés par collaborateur actif avec prise en charge part patronale 100%.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-04',
      cat: 'contrats_droit',
      titre: 'Respect du Plafond de Durée des CDD (24 mois max)',
      refLegale: 'Code du Travail CI - Art. 15.6',
      statut: 'alerte',
      detail: '3 collaborateurs approchent 22 mois de contrat CDD dans les agences de Yopougon et San Pedro. Risque de requalification de fait en CDI.',
      risqueRedressement: 4500000 // Indemnités de préavis et licenciement sans cause
    },
    {
      id: 'AUD-05',
      cat: 'contrats_droit',
      titre: 'Visites Médicales d’Embauche & Aptitude CSST',
      refLegale: 'Arrêté interministériel Santé-Travail Art. 32',
      statut: 'conforme',
      detail: '100% des recrutements 2026 disposent de la fiche d’aptitude signée du médecin du travail agréé.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-06',
      cat: 'temps_travail',
      titre: 'Majorations Légales Heures Supplémentaires (Code CI)',
      refLegale: 'Convention Collective Interprofessionnelle Art. 48',
      statut: 'conforme',
      detail: 'Majorations conformes : +15% de la 41e à la 46e heure, +50% au-delà et les dimanches travaillés en agence.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-07',
      cat: 'temps_travail',
      titre: 'Respect du Repos Hebdomadaire Obligatoire de 24h Consécutives',
      refLegale: 'Code du Travail CI - Art. 21.3',
      statut: 'conforme',
      detail: 'Rotation des shifts agence assurant un repos dominical ou de compensation garanti à tous les guichetiers.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-08',
      cat: 'hygiene_csst',
      titre: 'Tenue du Registre d’Employeur Côté et Paraphé',
      refLegale: 'Code du Travail CI - Art. 93.1',
      statut: 'conforme',
      detail: 'Registre Unique du Personnel paraphé par le Tribunal du Travail d’Abidjan, consultable sur support dématérialisé certifié.',
      risqueRedressement: 0
    },
    {
      id: 'AUD-09',
      cat: 'hygiene_csst',
      titre: 'Comité de Santé et Sécurité au Travail (CSST) & PV Trimestriels',
      refLegale: 'Décret n° 96-206 relatif aux comités de sécurité',
      statut: 'conforme',
      detail: '4 réunions ordinaires tenues en 2026 avec transmission des procès-verbaux à l’Inspection du Travail MEPS.',
      risqueRedressement: 0
    }
  ]);

  const filteredCheckpoints = auditCheckpoints.filter(
    (c) => activeCategory === 'all' || c.cat === activeCategory
  );

  const totalPoints = auditCheckpoints.length;
  const pointsConformes = auditCheckpoints.filter((c) => c.statut === 'conforme').length;
  const scoreConformite = Math.round((pointsConformes / totalPoints) * 100);
  const totalRisqueFinancier = auditCheckpoints.reduce((acc, c) => acc + c.risqueRedressement, 0);

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Audit Blanc & Prévention du Contentieux Social
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Contrôles MEPS, CNPS & DGI Côte d'Ivoire
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#008000]" />
            Simulateur de Pré-Audit & Bouclier de Contrôle CNPS / MEPS
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Évaluez en temps réel votre conformité légale face aux inspecteurs du travail : assiettes CNPS, plafonds CMU,
            gestion des CDD à risque de requalification, majorations d'heures supplémentaires et tenue des registres.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Génération de l’Attestation Officielle de Conformité Pré-Audit RH.')}
            className="flex items-center gap-2 px-4 py-2 bg-[#008000] text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Télécharger Attestation Pré-Audit
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Score Global de Conformité</span>
            <ShieldCheck className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-3xl font-black text-[#008000]">{scoreConformite}%</div>
          <div className="text-xs text-slate-500 mt-1">
            <strong>{pointsConformes} / {totalPoints} contrôles</strong> validés sans réserve
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Risque Financier Estimé</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {(totalRisqueFinancier / 1000000).toFixed(1)} M FCFA
          </div>
          <div className="text-xs text-amber-800 mt-1">
            Pénalités & requalifications CDD évitables
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Alertes Actives</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">1 alerte</div>
          <div className="text-xs text-slate-500 mt-1">
            3 CDD proches de la limite des 24 mois
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Statut Quitus CNPS</span>
            <CheckCircle2 className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">À Jour</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            0 pénalité de retard constatée
          </div>
        </div>
      </div>

      {/* Onglets Filtres de Catégories */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeCategory === c.id
                ? 'border-[#002B7F] text-[#002B7F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Liste des Points de Contrôle de l'Audit */}
      <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {filteredCheckpoints.map((cp) => (
            <div key={cp.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {cp.statut === 'conforme' ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008000] flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                      !
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cp.titre}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">{cp.refLegale}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {cp.risqueRedressement > 0 && (
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Risque : {(cp.risqueRedressement / 1000000).toFixed(1)} M FCFA
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    cp.statut === 'conforme'
                      ? 'bg-emerald-100 text-[#008000] border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {cp.statut === 'conforme' ? 'Conforme 100%' : 'Action Requise'}
                  </span>
                </div>
              </div>

              <div className="pl-8 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                {cp.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bannière de Recommandation de l'Auditeur Interne */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#002B7F] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <h4 className="font-bold text-[#002B7F] text-sm">
            Recommandation Préventive de l'Audit Social SII
          </h4>
          <p className="leading-relaxed">
            Pour maintenir votre score de conformité à 100% lors du prochain contrôle inopiné de l'Inspection du Travail,
            il est recommandé de procéder à la transformation en CDI des 3 contrats CDD arrivant à échéance au 31 décembre 2026.
            Tous les autres registres et bordereaux CNPS sont irréprochables.
          </p>
        </div>
      </div>
    </div>
  );
}
