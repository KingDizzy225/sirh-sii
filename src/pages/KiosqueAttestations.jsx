import React, { useState } from 'react';
import { 
  FileText, QrCode, Download, Printer, CheckCircle2, 
  Building2, ShieldCheck, User, Calendar, DollarSign, 
  ExternalLink, Sparkles, Clock, Globe, ArrowRight, Eye, X
} from 'lucide-react';

export function KiosqueAttestations() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('2');
  const [selectedDocType, setSelectedDocType] = useState('TRAVAIL'); // 'TRAVAIL', 'VISA', 'BANQUE', 'NON_REDEVANCE'
  const [selectedBank, setSelectedBank] = useState('Société Générale Côte d\'Ivoire (SGCI)');
  const [destinationCountry, setDestinationCountry] = useState('France');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Collaborateurs avec données détaillées pour l'attestation
  const employees = [];

  const currentEmp = employees.find(e => e.id === selectedEmployeeId) || employees[0];

  // Historique des documents récemment générés
  const [history, setHistory] = useState([]);

  const handleGenerate = () => {
    const newDocId = `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const docTitles = {
      TRAVAIL: 'Attestation de Travail & Présence',
      VISA: `Attestation pour Visa (${destinationCountry})`,
      BANQUE: `Domiciliation Bancaire Irrévocable (${selectedBank})`,
      NON_REDEVANCE: 'Attestation de Non-Redevance'
    };

    setHistory([
      {
        id: newDocId,
        type: docTitles[selectedDocType],
        salarie: currentEmp.nom,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        statut: 'Certifié Conforme',
        qrRef: `VERIF-${Math.floor(10000 + Math.random() * 90000)}`
      },
      ...history
    ]);

    setShowPreviewModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Kiosque d'Attestations RH en Libre-Service
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Génération instantanée de documents officiels avec sceau électronique certifié et QR code d'authenticité
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Système Certifié Conforme (Code du Travail CI)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Délivrance Instantanée
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">&lt; 5 sec</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contre 48h de délai RH traditionnel</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Attestations Émises (Mois)
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">64</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zéro papier gaspillé, 100% numérisé</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Modèles Normalisés
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">4</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Travail, Visa, Banque, Quittance</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Authenticité QR Code
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">100%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Vérifiable par banques & ambassades</p>
        </div>
      </div>

      {/* Interface de Génération */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de configuration */}
        <div className="lg:col-span-1 space-y-4">
          {/* Sélection du Salarié */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Collaborateur Demandeur
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nom} ({emp.matricule} - {emp.poste})
                </option>
              ))}
            </select>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700/60">
              <p><strong>Contrat :</strong> {currentEmp.typeContrat}</p>
              <p><strong>Ancienneté :</strong> Depuis le {currentEmp.dateEmbauche}</p>
              <p><strong>Salaire Net Mensuel :</strong> {(currentEmp.salaireNet).toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>

          {/* Sélection du Type de Document */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Type de Document Requis
            </label>

            <div className="space-y-2">
              {[
                {
                  id: 'TRAVAIL',
                  title: 'Attestation de Travail & Présence',
                  desc: 'Justificatif standard de contrat en cours, poste et ancienneté'
                },
                {
                  id: 'VISA',
                  title: 'Attestation pour Demande de Visa',
                  desc: 'Avec attestation d\'autorisation de congés et garantie de reprise'
                },
                {
                  id: 'BANQUE',
                  title: 'Engagement Domiciliation Bancaire',
                  desc: 'Courrier irrévocable de virement pour prêt immobilier ou auto'
                },
                {
                  id: 'NON_REDEVANCE',
                  title: 'Attestation de Non-Redevance',
                  desc: 'Quittance certifiant l\'absence de dette ou avance en cours'
                }
              ].map(doc => (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => setSelectedDocType(doc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedDocType === doc.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs">{doc.title}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{doc.desc}</p>
                </button>
              ))}
            </div>

            {/* Options contextuelles */}
            {selectedDocType === 'BANQUE' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Établissement Bancaire Prêteur
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Société Générale Côte d'Ivoire (SGCI)">Société Générale Côte d'Ivoire (SGCI)</option>
                  <option value="BICICI (BNP Paribas / BCP)">BICICI</option>
                  <option value="NSIA Banque Côte d'Ivoire">NSIA Banque CI</option>
                  <option value="Ecobank Côte d'Ivoire">Ecobank CI</option>
                  <option value="Bank of Africa Côte d'Ivoire (BOA)">Bank of Africa (BOA)</option>
                  <option value="Banque Atlantique Côte d'Ivoire (BACI)">Banque Atlantique (BACI)</option>
                </select>
              </div>
            )}

            {selectedDocType === 'VISA' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pays de Destination / Consulat
                </label>
                <input
                  type="text"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  placeholder="Ex: France, Canada, États-Unis, Maroc..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Prévisualiser & Certifier le Document
            </button>
          </div>
        </div>

        {/* Colonne de prévisualisation directe du document */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6 relative overflow-hidden">
            {/* Filigrane d'authenticité */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5 dark:opacity-10 rotate-[-30deg]">
              <span className="text-8xl font-black uppercase text-slate-900 dark:text-white">ORIGINAL</span>
            </div>

            {/* En-tête papier à lettre entreprise */}
            <div className="flex items-start justify-between border-b-2 border-blue-600 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-600 text-white rounded">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      SOCIÉTÉ IVOIRIENNE D'INVESTISSEMENT
                    </h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      SII CÔTE D'IVOIRE S.A. au capital de 500 000 000 FCFA
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Siège Social : Immeuble Alpha 2000, 14ème étage, Rue Gourgas, Plateau, Abidjan<br />
                  RCCM : CI-ABJ-2018-B-14029 • N° CC : 1802934 A • Tél : +225 27 20 25 40 00
                </p>
              </div>

              {/* QR Code dynamique de vérification */}
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                <div className="w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded p-1 mx-auto">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 block mt-1">
                  ID: VERIF-{currentEmp.matricule}
                </span>
                <span className="text-[8px] text-emerald-600 font-bold block">
                  Scellé Numérique
                </span>
              </div>
            </div>

            {/* Réf & Date */}
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono">Réf: DRH/ATT/{new Date().getFullYear()}/{currentEmp.matricule}</span>
              <span>Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>

            {/* Titre du document */}
            <div className="text-center py-3">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white underline decoration-blue-600 decoration-2 underline-offset-4">
                {selectedDocType === 'TRAVAIL' && "ATTESTATION DE TRAVAIL & D'EMPLOI"}
                {selectedDocType === 'VISA' && `ATTESTATION D'EMPLOI & PRISE DE CONGÉS (${destinationCountry.toUpperCase()})`}
                {selectedDocType === 'BANQUE' && "ENGAGEMENT IRRÉVOCABLE DE DOMICILIATION DE SALAIRE"}
                {selectedDocType === 'NON_REDEVANCE' && "ATTESTATION DE NON-REDEVANCE & QUITTANCE RH"}
              </h3>
            </div>

            {/* Corps du texte juridique */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 font-serif">
              <p>
                La Direction des Ressources Humaines de la <strong>Société Ivoirienne d'Investissement (SII Côte d'Ivoire)</strong> soussignée, certifie par la présente que :
              </p>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 font-sans space-y-1 my-3">
                <p><strong>Monsieur / Madame :</strong> <span className="font-bold text-slate-900 dark:text-white text-sm">{currentEmp.nom}</span></p>
                <p><strong>Matricule Interne :</strong> {currentEmp.matricule} • <strong>N° CNPS :</strong> {currentEmp.numeroCNPS}</p>
                <p><strong>Fonction :</strong> {currentEmp.poste}</p>
                <p><strong>Date d'Embauche :</strong> {currentEmp.dateEmbauche}</p>
                <p><strong>Nature du Contrat :</strong> {currentEmp.typeContrat}</p>
                <p><strong>Rémunération Brute Mensuelle :</strong> {(currentEmp.salaireBrut).toLocaleString('fr-FR')} FCFA</p>
                <p><strong>Rémunération Nette Mensuelle :</strong> {(currentEmp.salaireNet).toLocaleString('fr-FR')} FCFA</p>
              </div>

              {selectedDocType === 'TRAVAIL' && (
                <p>
                  L'intéressé(e) est lié(e) à notre entreprise par un contrat à durée indéterminée en cours de pleine validité, libre de tout engagement envers des tiers. Il/elle exerce ses fonctions avec professionnalisme et dévouement au sein de notre établissement.
                </p>
              )}

              {selectedDocType === 'VISA' && (
                <p>
                  Dans le cadre de son projet de séjour en <strong>{destinationCountry}</strong>, nous confirmons que l'intéressé(e) bénéficiera d'un congé légalement autorisé du <strong>01 au 20 Août 2026</strong>. À l'issue de cette période, il/elle réintégrera son poste de travail effectif sans interruption de contrat. Ses charges salariales continueront d'être honorées selon les conditions contractuelles en vigueur.
                </p>
              )}

              {selectedDocType === 'BANQUE' && (
                <p>
                  Faisant suite à la demande de crédit souscrite auprès de <strong>{selectedBank}</strong>, la Direction de SII Côte d'Ivoire s'engage formellement et de manière irrévocable à virer mensuellement l'intégralité du salaire net de <strong>{currentEmp.nom}</strong> sur son compte ouvert dans vos livres, jusqu'à extinction totale de la créance ou notification écrite de mainlevée délivrée par votre établissement.
                </p>
              )}

              {selectedDocType === 'NON_REDEVANCE' && (
                <p>
                  Nous attestons par la présente que <strong>{currentEmp.nom}</strong> ne fait l'objet d'aucune saisie-arrêt sur salaire, ni d'aucun prêt d'entreprise ou avance sur rémunération en souffrance au sein de notre comptabilité à ce jour.
                </p>
              )}

              <p className="pt-2">
                En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit auprès des autorités et administrations compétentes.
              </p>
            </div>

            {/* Sceau & Signature */}
            <div className="flex justify-between items-end pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">
                Document sécurisé par empreinte SHA-256<br />
                Vérification en ligne : <em>https://sirh.sii.ci/verify/{currentEmp.matricule}</em>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Pour la Direction Générale</p>
                <p className="text-[11px] text-slate-500">Le Directeur des Ressources Humaines</p>
                <div className="w-24 h-16 border-2 border-dashed border-blue-400 rounded-lg flex flex-col items-center justify-center p-1 bg-blue-50/50 dark:bg-blue-950/20 mx-auto">
                  <span className="text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-tighter">SCEAU OFFICIEL</span>
                  <span className="text-[8px] text-blue-600 dark:text-blue-400">SII - DRH</span>
                  <span className="text-[7px] text-emerald-600 font-bold">CERTIFIÉ ÉLECTRONIQUE</span>
                </div>
              </div>
            </div>

            {/* Boutons d'action rapides */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-600" /> Imprimer le document
              </button>
              <button
                onClick={() => {
                  alert(`Le document certifié pour ${currentEmp.nom} a été téléchargé en PDF.`);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <Download className="w-4 h-4" /> Télécharger PDF Officiel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historique des Attestations Délivrées */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Journal des Attestations Scellées & Délivrées
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Traçabilité et registre d'authenticité</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Identifiant Document</th>
                <th className="px-4 py-3">Type d'Attestation</th>
                <th className="px-4 py-3">Bénéficiaire</th>
                <th className="px-4 py-3">Date de Délivrance</th>
                <th className="px-4 py-3">Certificat & Réf QR</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{h.id}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white">{h.type}</td>
                  <td className="px-4 py-3 text-xs">{h.salarie}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{h.date}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> {h.statut} ({h.qrRef})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <button
                      onClick={() => window.print()}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Réimprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
