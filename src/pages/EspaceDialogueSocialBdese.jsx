import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Users,
  ShieldCheck,
  Calendar,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  BarChart3,
  Building2,
  Lock,
  Search,
  Plus,
  Send,
  HelpCircle
} from 'lucide-react';

export default function EspaceDialogueSocialBdese() {
  const [activeTab, setActiveTab] = useState('bdese'); // 'bdese' | 'reclamations' | 'pv_reunions'

  // Indicateurs triennaux de la BDESE (2024 - 2025 - 2026)
  const bdeseRubriques = [
    {
      domaine: '1. Effectifs, Recrutement & Formes d’Emploi',
      indicateurs: [
        { label: 'Effectif total au 31 décembre (Collaborateurs)', annee2024: '215', annee2025: '232', annee2026: '248' },
        { label: 'Part des contrats à durée indéterminée (CDI)', annee2024: '92.5%', annee2025: '94.0%', annee2026: '95.2%' },
        { label: 'Taux de féminisation global', annee2024: '36.8%', annee2025: '38.4%', annee2026: '40.3%' },
        { label: 'Part des femmes parmi les cadres & chefs d’agence', annee2024: '28.0%', annee2025: '31.5%', annee2026: '35.0%' },
        { label: 'Taux de rotation annuel (Turn-over)', annee2024: '7.2%', annee2025: '6.8%', annee2026: '5.4%' }
      ]
    },
    {
      domaine: '2. Masse Salariale, Rémunérations & Égalité Professionnelle',
      indicateurs: [
        { label: 'Masse salariale brute globale (Millions FCFA)', annee2024: '1 820 M', annee2025: '1 980 M', annee2026: '2 150 M' },
        { label: 'Augmentation générale moyenne (NAO conventionnelle)', annee2024: '+2.0%', annee2025: '+2.2%', annee2026: '+2.5%' },
        { label: 'Écart de rémunération femmes / hommes (à poste équivalent)', annee2024: '4.8%', annee2025: '3.1%', annee2026: '1.8%' },
        { label: 'Montant total des primes de performance versées', annee2024: '145 M FCFA', annee2025: '168 M FCFA', annee2026: '194 M FCFA' }
      ]
    },
    {
      domaine: '3. Santé, Sécurité au Travail & Accidents CNPS (CSST)',
      indicateurs: [
        { label: 'Nombre d’accidents du travail déclarés à la CNPS', annee2024: '2', annee2025: '1', annee2026: '0' },
        { label: 'Taux de fréquence des accidents (TF)', annee2024: '4.2', annee2025: '2.1', annee2026: '0.0' },
        { label: 'Visites médicales obligatoires réalisées (Taux)', annee2024: '88%', annee2025: '95%', annee2026: '98%' },
        { label: 'Agences certifiées aux normes d’évacuation incendie', annee2024: '3 / 5', annee2025: '5 / 5', annee2026: '5 / 5' }
      ]
    },
    {
      domaine: '4. Formation Continue & Compétences (FDFP)',
      indicateurs: [
        { label: 'Budget annuel formation engagé (Millions FCFA)', annee2024: '38 M', annee2025: '44 M', annee2026: '52 M' },
        { label: 'Nombre total d’heures de formation dispensées', annee2024: '2 400 h', annee2025: '3 100 h', annee2026: '3 850 h' },
        { label: 'Taux d’accès des collaborateurs à la formation', annee2024: '54%', annee2025: '68%', annee2026: '79%' },
        { label: 'Taux de validation des dossiers de remboursement FDFP', annee2024: '92%', annee2025: '96%', annee2026: '100%' }
      ]
    }
  ];

  // Registre officiel des Réclamations Collectives des Délégués du Personnel (Art. 61 Code du Travail CI)
  const [reclamations, setReclamations] = useState([
    {
      id: 'REC-2026-11',
      dateDepot: '04/11/2026',
      delegueEmetteur: 'Kouassi Marc (Collège Employés Plateau)',
      objet: 'Demande de renfort de la climatisation centrale agence Plateau et révision de la pause midi',
      delaiReponseMax: '19/11/2026 (15 jours légaux)',
      statut: 'repondu',
      reponseDirection: 'Intervention frigoriste effectuée le 08/11/2026. Pause échelonnée de 12h30 à 14h00 validée en réunion CSST.'
    },
    {
      id: 'REC-2026-12',
      dateDepot: '12/11/2026',
      delegueEmetteur: 'Aya Cissé (Collège Cadres Cocody)',
      objet: 'Revalorisation de l’indemnité kilométrique de tournée commerciale B2B en raison de la hausse du carburant',
      delaiReponseMax: '27/11/2026 (15 jours légaux)',
      statut: 'en_cours',
      reponseDirection: 'En arbitrage budgétaire auprès de la Direction Financière pour application au 01/01/2027.'
    }
  ]);

  // PV des Réunions Mensuelles Direction - Délégués du Personnel
  const pvList = [
    {
      titre: 'Procès-Verbal de la Réunion Mensuelle Ordinaire — Octobre 2026',
      date: '28/10/2026',
      presents: 'Directeur Général, DRH, 6 Délégués du Personnel titulaires',
      visaInspection: 'Dossier déposé Inspection du Travail Abidjan 1 le 02/11/2026',
      fichier: 'PV_Reunion_Délégués_Octobre_2026.pdf'
    },
    {
      titre: 'Procès-Verbal de la Négociation Annuelle Obligatoire (NAO 2026)',
      date: '15/09/2026',
      presents: 'Comité de Direction, Représentants Syndicaux SII CI',
      visaInspection: 'Accord d’entreprise enregistré sous n° 2026/04/MEPS',
      fichier: 'Accord_NAO_2026_Signe_Paritaire.pdf'
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6">
      {/* En-tête officiel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-[#002B7F] border border-blue-200">
              Code du Travail CI (Art. 61 & s.) • BDESE Standard Cegid / Lucca
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-[#008000] border border-emerald-200">
              Transparence & Concertation Paritaire
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-7 h-7 text-[#002B7F]" />
            Espace Dialogue Social & BDESE Triennale
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Portail légal et chiffré dédié aux Délégués du Personnel et Représentants Syndicaux :
            indicateurs sociaux triennaux (BDESE), registre des réclamations collectives et procès-verbaux paritaires.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#008000]" />
            <span>Horodatage Certifié Conforme MEPS</span>
          </div>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Index Égalité Salariale</span>
            <Scale className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-[#008000]">94 / 100</div>
          <div className="text-xs text-slate-500 mt-1">
            Écart H/F réduit à <strong>1.8%</strong> en 2026
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Réunions Mensuelles Tenues</span>
            <Calendar className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">11 / 12</div>
          <div className="text-xs text-slate-500 mt-1">
            100% PV paritaires signés & archivés
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Réclamations Traitées</span>
            <CheckCircle2 className="w-5 h-5 text-[#008000]" />
          </div>
          <div className="text-2xl font-bold text-slate-900">100%</div>
          <div className="text-xs text-slate-500 mt-1">
            Délai moyen de réponse : <strong>6 jours</strong> (légal : 15j)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Climat Social & Accords</span>
            <Users className="w-5 h-5 text-[#002B7F]" />
          </div>
          <div className="text-2xl font-bold text-[#002B7F]">0 jour de grève</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            Paix sociale & accords paritaires respectés
          </div>
        </div>
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl">
        <button
          onClick={() => setActiveTab('bdese')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'bdese'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Indicateurs BDESE Triennaux (2024 - 2026)
        </button>
        <button
          onClick={() => setActiveTab('reclamations')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'reclamations'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Registre des Réclamations Collectives ({reclamations.length})
        </button>
        <button
          onClick={() => setActiveTab('pv_reunions')}
          className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'pv_reunions'
              ? 'border-[#002B7F] text-[#002B7F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Procès-Verbaux & Accords d'Entreprise
        </button>
      </div>

      {/* Onglet 1 : Données Triennales BDESE */}
      {activeTab === 'bdese' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-b-xl border border-t-0 border-slate-200 shadow-sm text-xs">
            <span className="text-slate-500">
              Données auditées et transmises annuellement à l'Inspection du Travail de Côte d'Ivoire.
            </span>
            <button
              onClick={() => alert('Téléchargement de l’Extrait Intégral BDESE Triennal au format certifié.')}
              className="px-3.5 py-1.5 bg-[#002B7F] text-white font-semibold rounded-lg hover:bg-blue-900 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Exporter BDESE Complète
            </button>
          </div>

          <div className="space-y-6">
            {bdeseRubriques.map((rub, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 text-sm">{rub.domaine}</h3>
                </div>

                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200 uppercase">
                    <tr>
                      <th className="py-2.5 px-4 w-1/2">Indicateur Social / Économique</th>
                      <th className="py-2.5 px-4 text-center">Exercice 2024</th>
                      <th className="py-2.5 px-4 text-center">Exercice 2025</th>
                      <th className="py-2.5 px-4 text-center bg-blue-50/70 text-[#002B7F] font-bold">
                        Exercice 2026 (En cours)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rub.indicateurs.map((ind, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{ind.label}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{ind.annee2024}</td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600">{ind.annee2025}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#002B7F] bg-blue-50/30">
                          {ind.annee2026}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 2 : Registre des Réclamations */}
      {activeTab === 'reclamations' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#002B7F]" />
              <strong>Délai Légal de Réponse :</strong> L'employeur dispose de 15 jours calendaires maximum
              pour répondre par écrit aux réclamations collectives déposées par les Délégués du Personnel.
            </span>
          </div>

          <div className="space-y-4">
            {reclamations.map((rec) => (
              <div key={rec.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#002B7F]">{rec.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm mt-0.5">{rec.objet}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Déposé le <strong>{rec.dateDepot}</strong> par {rec.delegueEmetteur}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    rec.statut === 'repondu'
                      ? 'bg-emerald-100 text-[#008000] border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {rec.statut === 'repondu' ? 'Réponse Notifiée' : 'En instruction (Échéance 15j)'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">
                    Réponse Formelle de la Direction Générale :
                  </span>
                  <p className="text-slate-700 leading-relaxed">{rec.reponseDirection}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 3 : PV & Accords d'Entreprise */}
      {activeTab === 'pv_reunions' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">
                Recueil Paritaire des Accords Collectifs & Procès-Verbaux de Réunions
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {pvList.map((pv, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-[#002B7F] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{pv.titre}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Séance tenue le <strong>{pv.date}</strong> • {pv.presents}
                      </p>
                      <div className="text-[11px] text-emerald-700 font-medium mt-1">
                        {pv.visaInspection}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Téléchargement du document certifié : ${pv.fichier}`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#002B7F] font-semibold text-xs rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Télécharger PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
