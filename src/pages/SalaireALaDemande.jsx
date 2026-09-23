import React, { useState } from 'react';
import {
  Banknote, Zap, ArrowDownCircle, CheckCircle2, ShieldCheck,
  CreditCard, Clock, Calendar, Smartphone, Plus, Search,
  Filter, AlertCircle, X, ChevronRight, TrendingUp, DollarSign
} from 'lucide-react';

export function SalaireALaDemande() {
  const [selectedCanal, setSelectedCanal] = useState('ORANGE_MONEY'); // ORANGE_MONEY, WAVE, VIREMENT
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50000);
  const [toastMessage, setToastMessage] = useState(null);

  // Données du collaborateur connecté (simulation réaliste pour la démo)
  const [collaborateur, setCollaborateur] = useState({
    nom: "Julie Konan",
    matricule: "EMP-0018",
    poste: "Chargée de Clientèle Entreprises Senior",
    salaireNetMensuel: 650000,
    joursTravaillesMois: 23,
    joursTotalMois: 30,
    salaireAcquisBrut: 498333, // 23/30ème
    plafondAutorisePct: 35, // 35% maximum pour sécurité financière
    plafondDisponibleFCFA: 174400,
    dejaDebloqueCeMois: 50000,
    resteDeblocableFCFA: 124400
  });

  // Historique des demandes de déblocage instantané
  const [historique, setHistorique] = useState([
    {
      id: "EWA-2026-042",
      dateDemande: "12/09/2026 à 11:20",
      montant: 50000,
      motif: "Urgence Médicale (Pharmacie & Consultations)",
      canal: "Orange Money CI (+225 07 48 92 10 33)",
      statut: "VIRE_INSTANTANE", // VIRE_INSTANTANE, EN_ATTENTE
      imputationPaie: "Retenue sur bulletin de paie fin Septembre 2026",
      referenceTransaction: "TX-OM-98240192"
    },
    {
      id: "EWA-2026-031",
      dateDemande: "14/08/2026 à 16:45",
      montant: 80000,
      motif: "Avance Fournitures Scolaires & Rentrée",
      canal: "Wave Côte d'Ivoire (+225 07 48 92 10 33)",
      statut: "VIRE_INSTANTANE",
      imputationPaie: "Imputé & Soldé sur paie Août 2026",
      referenceTransaction: "TX-WAVE-8849102"
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmWithdraw = (e) => {
    e.preventDefault();
    const montant = parseInt(withdrawAmount);
    if (montant > collaborateur.resteDeblocableFCFA) {
      alert("Le montant demandé dépasse votre plafond déblocable de sécurité.");
      return;
    }

    const nouvelleDemande = {
      id: `EWA-2026-0${historique.length + 43}`,
      dateDemande: "Aujourd'hui à " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      montant: montant,
      motif: "Besoin de trésorerie ponctuel",
      canal: selectedCanal === 'ORANGE_MONEY' ? 'Orange Money (+225 07 48 92 10 33)' : selectedCanal === 'WAVE' ? 'Wave (+225 07 48 92 10 33)' : 'Virement Bancaire Immédiat (SGBCI)',
      statut: "VIRE_INSTANTANE",
      imputationPaie: "Retenue automatique sur bulletin de paie Septembre 2026",
      referenceTransaction: `TX-${selectedCanal}-${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    setHistorique([nouvelleDemande, ...historique]);
    setCollaborateur(prev => ({
      ...prev,
      dejaDebloqueCeMois: prev.dejaDebloqueCeMois + montant,
      resteDeblocableFCFA: prev.resteDeblocableFCFA - montant
    }));

    setShowWithdrawModal(false);
    showToast(`Déblocage de ${montant.toLocaleString('fr-FR')} FCFA validé. Fonds transférés instantanément sur votre compte mobile.`);
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
            <div className="p-2.5 bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Salaire à la Demande & Acomptes Instantanés (EWA)
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Earned Wage Access
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Accédez à votre salaire déjà travaillé en temps réel, sans taux d'usure ni délai bancaire (Wave, Orange Money, Virement)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl shadow-sm transition-all"
        >
          <ArrowDownCircle className="w-4 h-4" />
          <span>Débloquer mon Salaire Acquis</span>
        </button>
      </div>

      {/* Compteur Visuel du Salaire Déjà Acquis */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider block">
              Période en cours : Septembre 2026 ({collaborateur.joursTravaillesMois} / {collaborateur.joursTotalMois} jours travaillés)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1">
              {collaborateur.resteDeblocableFCFA.toLocaleString('fr-FR')} FCFA
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              Montant disponible immédiatement au déblocage (Plafond de sécurité : {collaborateur.plafondAutorisePct}%)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[150px]">
              <span className="text-xs text-emerald-200 block">Salaire Travaillé</span>
              <span className="text-lg font-bold">{collaborateur.salaireAcquisBrut.toLocaleString('fr-FR')} F</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[150px]">
              <span className="text-xs text-emerald-200 block">Déjà Débloqué</span>
              <span className="text-lg font-bold">{collaborateur.dejaDebloqueCeMois.toLocaleString('fr-FR')} F</span>
            </div>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-emerald-800" />
              <span>Retrait Express</span>
            </button>
          </div>
        </div>

        {/* Barre de progression du mois */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="flex justify-between text-xs text-emerald-100 mb-1">
            <span>Progression du mois : {Math.round((collaborateur.joursTravaillesMois / collaborateur.joursTotalMois) * 100)}%</span>
            <span>Virement du solde habituel le 30 Septembre</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-full rounded-full" style={{ width: `${(collaborateur.joursTravaillesMois / collaborateur.joursTotalMois) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Avantages & Garanties d'Intégrité Financière */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Zéro Dette & Zéro Crédit</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ce n'est pas un emprunt : vous accédez uniquement à l'argent que vous avez déjà légalement gagné par vos heures travaillées.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
            <Smartphone className="w-5 h-5" />
            <span>Virement Mobile Money en 10s</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intégration directe avec vos comptes Orange Money, Wave ou votre compte bancaire habituel en Côte d'Ivoire.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
            <CreditCard className="w-5 h-5" />
            <span>Imputation Paie 100% Automatique</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Le montant est automatiquement porté en acompte sur le bulletin du mois sans formalités papier ni visa préalable.
          </p>
        </div>
      </div>

      {/* Tableau d'Historique des Déblocages */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Historique de vos Déblocages EWA
          </h3>
          <span className="text-xs text-slate-400">Imputations certifiées par la comptabilité SII</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Réf & Date</th>
                <th className="py-3.5 px-4">Montant Débloqué</th>
                <th className="py-3.5 px-4">Canal de Réception</th>
                <th className="py-3.5 px-4">Motif Déclaré</th>
                <th className="py-3.5 px-4">Statut & Paie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {historique.map((demande) => (
                <tr key={demande.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {demande.id}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {demande.dateDemande}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900 dark:text-white text-base">
                      {demande.montant.toLocaleString('fr-FR')} FCFA
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {demande.canal}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Réf: {demande.referenceTransaction}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                    {demande.motif}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Viré instantanément
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {demande.imputationPaie}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE : Déblocage Instantané */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Déblocage Express de Salaire Acquis
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Virement immédiat sans frais bancaires
                  </p>
                </div>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmWithdraw} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Montant à Débloquer (FCFA)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    max={collaborateur.resteDeblocableFCFA}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-xl font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                    FCFA
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Maximum déblocable aujourd'hui : <strong>{collaborateur.resteDeblocableFCFA.toLocaleString('fr-FR')} FCFA</strong>
                </span>
              </div>

              {/* Boutons montants rapides */}
              <div className="flex gap-2">
                {[25000, 50000, 75000, 100000].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWithdrawAmount(m)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      withdrawAmount === m
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {(m / 1000)}k F
                  </button>
                ))}
              </div>

              {/* Choix du canal Mobile Money */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transférer les fonds vers :
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCanal === 'ORANGE_MONEY' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="canal"
                        checked={selectedCanal === 'ORANGE_MONEY'}
                        onChange={() => setSelectedCanal('ORANGE_MONEY')}
                        className="text-emerald-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">Orange Money Côte d'Ivoire</div>
                        <div className="text-[11px] text-slate-500">+225 07 48 92 10 33</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">Instantané</span>
                  </label>

                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCanal === 'WAVE' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="canal"
                        checked={selectedCanal === 'WAVE'}
                        onChange={() => setSelectedCanal('WAVE')}
                        className="text-emerald-600"
                      />
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">Wave Côte d'Ivoire</div>
                        <div className="text-[11px] text-slate-500">+225 07 48 92 10 33</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">Instantané</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div>• Le montant débloqué sera déduit de votre salaire net versé le 30 septembre.</div>
                <div>• Zéro intérêt d'emprunt (Service gratuit financé par SII CI).</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" />
                  <span>Confirmer le Virement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default SalaireALaDemande;
