import React, { useState } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  User,
  DollarSign,
  Clock,
  Briefcase,
  BarChart3,
  Filter,
  Search,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sliders,
  ChevronRight,
  Zap,
  Activity
} from 'lucide-react';

export default function PeopleAnalyticsFlightRisk() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Collaborateurs analysés par l'algorithme d'attrition prédictive
  const [talentsRiskList, setTalentsRiskList] = useState([
    {
      id: 'EMP-0089',
      nom: 'Aya Touré Cissé',
      poste: 'Chargée de Clientèle Entreprises Senior',
      agence: 'Agence Cocody Deux-Plateaux',
      departement: 'Développement Commercial B2B',
      anciennetePoste: '3 ans 8 mois',
      compaRatioMarche: 0.82, // 18% sous le benchmark marché télécoms CI
      heuresSupMois: 28, // Surcharge opérationnelle
      absenteismeCourt: '0 jour',
      pulseEngagementScore: 3.2, // Sur 5
      flightRiskScore: 84, // %
      impactBusiness: 'Critique (Portefeuille 420M FCFA)',
      causesPrincipales: [
        'Compa-Ratio inférieur à 0.85 par rapport au marché télécom/banque',
        'Stagnation de coefficient hiérarchique depuis plus de 36 mois',
        'Surcharge d’heures de closing en soirée sur les comptes B2B'
      ],
      actionsRetentionProposees: [
        { label: 'Revalorisation salariale ciblée (+12% pour rattrapage médiane)', statut: 'En cours de validation DRH' },
        { label: 'Proposition d’évolution vers poste Chef de Ventes Régional', statut: 'Prévu entretien 1-on-1' },
        { label: 'Attribution d’un véhicule de service ou dotation carburant majorée', statut: 'Validé DG' }
      ]
    },
    {
      id: 'EMP-0215',
      nom: 'Yao N’Goran Bertin',
      poste: 'Technicien Support Réseau & Monétique',
      agence: 'Agence San Pedro Port',
      departement: 'Support & Systèmes',
      anciennetePoste: '3 ans 1 mois',
      compaRatioMarche: 0.88,
      heuresSupMois: 34,
      absenteismeCourt: '2 jours récents',
      pulseEngagementScore: 3.4,
      flightRiskScore: 76,
      impactBusiness: 'Élevé (Seul technicien certifié San Pedro)',
      causesPrincipales: [
        'Isolement géographique sur le hub de San Pedro sans binôme de relève',
        'Astreintes nocturnes fréquentes lors des escales de cargos portuaires',
        'Demande de rapprochement familial sur Abidjan non traitée'
      ],
      actionsRetentionProposees: [
        { label: 'Mutation souhaitée vers agence Yopougon ou Plateau', statut: 'Dossier mobilité ouvert' },
        { label: 'Recrutement d’un binôme technicien local à San Pedro', statut: 'Offre publiée' },
        { label: 'Prime exceptionnelle de sujétion portuaire', statut: 'En paiement' }
      ]
    },
    {
      id: 'EMP-0311',
      nom: 'Gnagne Sarah Patricia',
      poste: 'Analyste Risques & Conformité',
      agence: 'Agence Abidjan Plateau',
      departement: 'Contrôle & Conformité',
      anciennetePoste: '2 ans 4 mois',
      compaRatioMarche: 0.94,
      heuresSupMois: 12,
      absenteismeCourt: '0 jour',
      pulseEngagementScore: 3.8,
      flightRiskScore: 48,
      impactBusiness: 'Moyen (Compétences partagées)',
      causesPrincipales: [
        'Sollicitations externes fréquentes par les cabinets d’audit du Plateau',
        'Souhait de formation certifiante CAMS (Lutte anti-blanchiment)'
      ],
      actionsRetentionProposees: [
        { label: 'Financement de la certification CAMS via le budget FDFP 2026', statut: 'Validé' }
      ]
    },
    {
      id: 'EMP-0142',
      nom: 'Kouassi Konan Marc',
      poste: 'Chef de Caisse Senior',
      agence: 'Agence Abidjan Plateau',
      departement: 'Opérations & Guichets',
      anciennetePoste: '4 ans 2 mois',
      compaRatioMarche: 1.05,
      heuresSupMois: 8,
      absenteismeCourt: '0 jour',
      pulseEngagementScore: 4.8,
      flightRiskScore: 18,
      impactBusiness: 'Très Élevé',
      causesPrincipales: [
        'Excellente fidélisation, très forte intégration dans la culture SII',
        'Bénéficie du plan de suppléance pour la direction de l’agence Plateau'
      ],
      actionsRetentionProposees: [
        { label: 'Parcours d’intégration au Comité de Direction Réseau', statut: 'En cours' }
      ]
    }
  ]);

  const filteredTalents = talentsRiskList.filter((t) => {
    const matchSearch =
      t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.agence.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high' && t.flightRiskScore >= 70) ||
      (riskFilter === 'medium' && t.flightRiskScore >= 40 && t.flightRiskScore < 70) ||
      (riskFilter === 'low' && t.flightRiskScore < 40);
    return matchSearch && matchRisk;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              People Analytics & Machine Learning • Standard Visier / Workday
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Score Prédictif de Risque d'Attrition (Flight Risk)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#002B7F]" />
            People Analytics Prédictif : Radar Flight Risk & Rétention des Talents
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Identifiez proactivement les signaux faibles de démission (retard de compa-ratio, stagnation, surcharge d'heures)
            pour déclencher des contre-mesures de rétention avant toute perte de compétences stratégiques.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>2 Talents Clés en Risque Élevé (&gt;70%)</span>
          </div>
        </div>
      </div>

      {/* Cartes KPI Synthétiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Taux d'Attrition Prévisionnel</span>
            <TrendingDown className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">5.4%</div>
          <div className="text-xs text-slate-500 mt-1">
            Benchmark marché Côte d'Ivoire : 9.8%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Talents Sous Surveillance</span>
            <Eye className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">14 profils</div>
          <div className="text-xs text-slate-500 mt-1">
            Score Flight Risk moyen : <strong>42%</strong>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Impact Portefeuille à Risque</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">420 M FCFA</div>
          <div className="text-xs text-slate-500 mt-1">
            Chiffre d'affaires B2B géré par les profils en alerte
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Efficacité Contre-Mesures</span>
            <ShieldCheck className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">88%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            De rétention réussie après action RH
          </div>
        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par nom, poste, agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Filtrer par niveau de risque :</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
          >
            <option value="all">Tous les profils</option>
            <option value="high">Risque Élevé (&gt;= 70%)</option>
            <option value="medium">Risque Modéré (40-69%)</option>
            <option value="low">Risque Faible (&lt; 40%)</option>
          </select>
        </div>
      </div>

      {/* Tableau des Talents et Signaux Prémonitoires */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
            <tr>
              <th className="py-3 px-4">Collaborateur Clé</th>
              <th className="py-3 px-4">Poste & Agence</th>
              <th className="py-3 px-4 text-center">Score Flight Risk</th>
              <th className="py-3 px-4 text-center">Compa-Ratio</th>
              <th className="py-3 px-4 text-center">Ancienneté Poste</th>
              <th className="py-3 px-4 text-center">Surcharge Heures</th>
              <th className="py-3 px-4">Impact Business</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTalents.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{t.nom}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{t.id}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800">{t.poste}</div>
                  <div className="text-[11px] text-slate-500">{t.agence}</div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold font-mono text-xs shadow-sm border">
                    {t.flightRiskScore >= 70 ? (
                      <span className="bg-red-100 text-red-800 border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {t.flightRiskScore}% (Élevé)
                      </span>
                    ) : t.flightRiskScore >= 40 ? (
                      <span className="bg-amber-100 text-amber-800 border-amber-200 px-2.5 py-0.5 rounded-full">
                        {t.flightRiskScore}% (Modéré)
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-[#008000] border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.flightRiskScore}% (Fidélisé)
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center font-mono">
                  <span className={`font-bold ${t.compaRatioMarche < 0.85 ? 'text-red-600' : 'text-slate-800'}`}>
                    {(t.compaRatioMarche * 100).toFixed(0)}%
                  </span>
                  <div className="text-[10px] text-slate-400">vs marché CI</div>
                </td>
                <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                  {t.anciennetePoste}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={`font-semibold ${t.heuresSupMois > 20 ? 'text-amber-700' : 'text-slate-600'}`}>
                    +{t.heuresSupMois}h / mois
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-slate-800 text-xs">{t.impactBusiness}</span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => setSelectedProfile(t)}
                    className="px-3 py-1.5 bg-[#002B7F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900 transition-colors inline-flex items-center gap-1"
                  >
                    <Sliders className="w-3.5 h-3.5" /> Plan Rétention
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Détail du Plan de Rétention Proactif */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Dossier d'Intervention Prédictive</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Plan de Rétention — {selectedProfile.nom}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Poste & Entité :</span>
                <p className="font-semibold text-slate-800">{selectedProfile.poste}</p>
                <p className="text-slate-500">{selectedProfile.agence}</p>
              </div>
              <div>
                <span className="text-slate-400">Score de Départ Prédictif :</span>
                <p className="text-base font-bold text-red-600 font-mono">
                  {selectedProfile.flightRiskScore}% de probabilité
                </p>
                <p className="text-[11px] text-slate-500">Compa-Ratio : {(selectedProfile.compaRatioMarche * 100).toFixed(0)}% du marché</p>
              </div>
            </div>

            {/* Facteurs Déclencheurs / Causes Principales */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Signaux Faibles Identifiés par l'Algorithme :
              </span>
              <ul className="space-y-1.5 text-xs">
                {selectedProfile.causesPrincipales.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-red-50/70 text-red-900 p-2.5 rounded-lg border border-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions de Rétention Recommandées */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#002B7F]">
                Actions de Sécurisation RH Programmées :
              </span>
              <div className="space-y-2">
                {selectedProfile.actionsRetentionProposees.map((act, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#008000] shrink-0" />
                      <span className="font-medium text-slate-800">{act.label}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-emerald-200 rounded font-semibold text-[#008000] text-[11px]">
                      {act.statut}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedProfile(null)}
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
