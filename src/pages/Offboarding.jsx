import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
    PowerOff, 
    CheckCircle2, 
    Clock, 
    UserMinus, 
    ShieldAlert, 
    Laptop, 
    Key, 
    FileCheck, 
    ArrowRight,
    Trash2,
    Search,
    FileSignature,
    Download,
    Lock,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext';

export function Offboarding() {
    const { token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Projet de solde de tout compte
    const [employesSortants, setEmployesSortants] = useState([]);
    const [salarieSolde, setSalarieSolde] = useState('');
    const [solde, setSolde] = useState(null);
    const [soldeEnCours, setSoldeEnCours] = useState(false);
    const [observations, setObservations] = useState('');
    const [messageSolde, setMessageSolde] = useState(null);
    const [pieceEnCours, setPieceEnCours] = useState(null);

    useEffect(() => {
        api.get('/employees')
            .then(res => {
                if (Array.isArray(res?.data)) setEmployesSortants(res.data);
            })
            .catch(() => {});
    }, []);

    const calculerSolde = async () => {
        if (!salarieSolde) return;
        setSoldeEnCours(true);
        setMessageSolde(null);
        try {
            const res = await api.get(`/offboarding/settlement/${salarieSolde}`);
            setSolde(res?.data || null);
            setObservations(res?.data?.arrete?.observations || '');
        } catch (err) {
            setSolde(null);
            setMessageSolde({ ton: 'alerte', texte: err.message || 'Décompte indisponible.' });
        } finally {
            setSoldeEnCours(false);
        }
    };

    /**
     * Arrêter le décompte le fige : c'est cette version, et non un calcul
     * refait à l'impression, que portera le reçu remis au salarié.
     */
    const arreterSolde = async () => {
        if (!salarieSolde) return;
        setSoldeEnCours(true);
        try {
            const res = await api.post(`/offboarding/${salarieSolde}/solde/arreter`, { observations });
            setMessageSolde({ ton: 'succes', texte: res?.data?.message || 'Décompte arrêté.' });
            await calculerSolde();
        } catch (err) {
            setMessageSolde({ ton: 'alerte', texte: err.message || "L'arrêté a été refusé." });
        } finally {
            setSoldeEnCours(false);
        }
    };

    /**
     * Les trois pièces promises par les lettres de rupture. Le serveur refuse
     * de les produire sur une donnée manquante, et le refus dit laquelle : ce
     * message-là vaut mieux qu'un PDF à jeter.
     */
    const telechargerPiece = async (chemin, nomFichier) => {
        if (!salarieSolde) return;
        setPieceEnCours(chemin);
        setMessageSolde(null);
        try {
            const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const racine = base.endsWith('/api') ? base.slice(0, -4) : base;

            const res = await fetch(`${racine}/api/offboarding/${salarieSolde}/${chemin}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                setMessageSolde({ ton: 'alerte', texte: detail.error || 'Document indisponible.' });
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nomFichier;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setMessageSolde({ ton: 'alerte', texte: err.message || 'Téléchargement impossible.' });
        } finally {
            setPieceEnCours(null);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/offboarding/tasks');
            setTasks(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
        try {
            await api.put(`/offboarding/tasks/${id}`, { status: newStatus });
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('matériel') || lower.includes('ordinateur')) return <Laptop size={18} />;
        if (lower.includes('accès') || lower.includes('badge')) return <Key size={18} />;
        return <FileCheck size={18} />;
    };

    const stats = [
        { label: 'Départs en cours', value: tasks.filter(t => t.status === 'Pending').length, icon: Clock, color: 'amber' },
        { label: 'Sorties clôturées', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'emerald' },
        // Ce compteur affichait « 12 », chiffre qui ne venait d'aucune donnée.
        { label: 'Collaborateurs concernés',
          value: new Set(tasks.map(t => t.employeeId)).size,
          icon: PowerOff, color: 'indigo' }
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <PowerOff className="text-rose-600" size={32} />
                        Départs & Offboarding
                    </h2>
                    <p className="text-slate-500 font-medium">Gestion sécurisée des sorties de collaborateurs et restitution d'actifs.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un départ..." 
                            className="bg-white border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-rose-500 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <Card key={i} className="border-none shadow-sm overflow-hidden relative group">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 text-${s.color}-600 group-hover:scale-110 transition-transform`}>
                            <s.icon size={64} />
                        </div>
                        <CardContent className="p-6">
                            <div className={`p-2 w-fit rounded-lg bg-${s.color}-50 text-${s.color}-600 mb-4`}>
                                <s.icon size={20} />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task List */}
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black">Checklist de sortie</CardTitle>
                            <CardDescription>Tâches administratives et logistiques.</CardDescription>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Tous
                            </button>
                            <button 
                                onClick={() => setFilter('pending')}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                En attente
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100">
                            {loading ? (
                                <div className="p-12 text-center text-slate-400">Chargement des tâches...</div>
                            ) : tasks.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 italic">Aucun processus d'offboarding en cours.</div>
                            ) : (
                                tasks.filter(t => filter === 'all' || t.status === 'Pending').map((task, idx) => (
                                    <motion.div 
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <button 
                                                onClick={() => toggleStatus(task.id, task.status)}
                                                className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent group-hover:border-rose-400'}`}
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl ${task.status === 'Completed' ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-600'}`}>
                                                    {getIcon(task.taskName)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                        {task.taskName}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                                                        <span className="p-1 bg-slate-100 rounded-md text-slate-400"><UserMinus size={10} /></span>
                                                        {task.employee?.firstName} {task.employee?.lastName}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Une échéance « J-2 » s'affichait sur chaque
                                                ligne sans venir d'aucune date. La tâche n'en
                                                porte pas : on montre celle qu'on a, sa date
                                                d'ouverture. */}
                                            <div className="text-right hidden sm:block">
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Ouverte le</p>
                                                <p className="text-xs font-bold text-slate-600">
                                                    {task.createdAt
                                                        ? new Date(task.createdAt).toLocaleDateString('fr-FR')
                                                        : '—'}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-rose-600 rounded-full h-8 w-8">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Reminders Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ShieldAlert size={20} className="text-rose-500" />
                                Rappels Sécurité
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Alerte Prioritaire</p>
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    N'oubliez pas de désactiver les accès VPN et Email à l'instant même du départ physique pour garantir la sécurité des données.
                                </p>
                            </div>
                            <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-11 rounded-xl">
                                Procédure de sécurité
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Décompte final : le calcul le plus délicat d'un départ,
                        jusqu'ici fait à la main hors de l'application. */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">
                                Projet de solde de tout compte
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Calculé à partir du solde de congés, du dernier salaire et des avances en cours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <select
                                value={salarieSolde}
                                onChange={(e) => { setSalarieSolde(e.target.value); setSolde(null); }}
                                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                            >
                                <option value="">Choisir un collaborateur…</option>
                                {employesSortants.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {e.firstName} {e.lastName}{e.positionTitle ? ` — ${e.positionTitle}` : ''}
                                    </option>
                                ))}
                            </select>

                            <Button
                                onClick={calculerSolde}
                                disabled={!salarieSolde || soldeEnCours}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm"
                            >
                                {soldeEnCours ? 'Calcul…' : 'Calculer le décompte'}
                            </Button>

                            {solde && (
                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-500">
                                        {solde.base.sourceReference} · {solde.salarie.ancienneteAnnees} an(s) d'ancienneté
                                    </p>

                                    {/* Nature de la rupture : c'est elle qui conditionne l'indemnité
                                        de licenciement, et elle vient de la procédure close, non d'une
                                        saisie refaite pour l'occasion. */}
                                    {solde.rupture ? (
                                        <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                                            <p className="font-semibold text-slate-800">
                                                Rupture : {solde.rupture.nature.toLowerCase().replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-slate-600 mt-0.5">{solde.rupture.motif}</p>
                                            {solde.indemniteLicenciement?.eligible && (
                                                <div className="mt-2 pt-2 border-t border-slate-200">
                                                    <p className="text-slate-700">
                                                        Indemnité calculée sur un salaire moyen de{' '}
                                                        <span className="font-mono">
                                                            {solde.indemniteLicenciement.salaireMoyenReference.toLocaleString('fr-FR')} F
                                                        </span>{' '}
                                                        ({solde.indemniteLicenciement.moisRetenus} mois retenus) :
                                                    </p>
                                                    <ul className="mt-1 space-y-0.5 text-slate-600">
                                                        {solde.indemniteLicenciement.tranches.map((t, i) => (
                                                            <li key={i}>
                                                                {t.de} à {t.a} ans — {t.annees} an(s) × {Math.round(t.taux * 100)}% ={' '}
                                                                <span className="font-mono">{t.montant.toLocaleString('fr-FR')} F</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                            Aucune procédure close pour ce salarié : la nature de la rupture est
                                            inconnue, et l'indemnité de licenciement n'est donc pas calculée.
                                        </p>
                                    )}

                                    {solde.lignes.map((l, i) => (
                                        <div key={i} className="flex justify-between items-start gap-3 text-sm">
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800">{l.libelle}</p>
                                                <p className="text-xs text-slate-500">{l.detail}</p>
                                            </div>
                                            <span className={`font-mono font-bold shrink-0 ${l.sens === 'debit' ? 'text-rose-600' : 'text-emerald-700'}`}>
                                                {l.sens === 'debit' ? '−' : '+'}{l.montant.toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                        <span className="font-bold text-slate-900">Net estimé</span>
                                        <span className="font-mono font-black text-lg text-slate-900">
                                            {solde.netEstime.toLocaleString('fr-FR')} FCFA
                                        </span>
                                    </div>

                                    <ul className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-1 list-disc list-inside">
                                        {solde.avertissements.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>

                                    {/* Arrêté du décompte.

                                        Le reçu que le salarié signe vaut décharge : il ne peut pas
                                        porter un calcul qui suivrait la base au jour le jour. Deux
                                        impressions à un mois d'écart auraient montré des montants
                                        différents, sans que rien ne le signale. L'arrêté fige. */}
                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                        {solde.arrete ? (
                                            <div className="text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                                                    <Lock size={12} /> Décompte arrêté à{' '}
                                                    {solde.arrete.netArrete.toLocaleString('fr-FR')} FCFA
                                                </p>
                                                <p className="text-emerald-800 mt-0.5">
                                                    Le {new Date(solde.arrete.arreteLe).toLocaleDateString('fr-FR')}
                                                    {solde.arrete.arretePar ? ` par ${solde.arrete.arretePar}` : ''}.
                                                </p>
                                                {solde.arrete.netArrete !== solde.netEstime && (
                                                    <p className="text-amber-800 mt-1.5 flex items-start gap-1.5">
                                                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                                        Le projet a évolué depuis l'arrêté
                                                        ({solde.netEstime.toLocaleString('fr-FR')} FCFA).
                                                        Le reçu porte le montant arrêté ; reprendre l'arrêté
                                                        révoquera les reçus déjà remis.
                                                    </p>
                                                )}
                                            </div>
                                        ) : solde.empechements?.length > 0 ? (
                                            <ul className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-1 list-disc list-inside">
                                                {solde.empechements.map((e, i) => <li key={i}>{e}</li>)}
                                            </ul>
                                        ) : null}

                                        <textarea
                                            value={observations}
                                            onChange={(e) => setObservations(e.target.value)}
                                            rows={2}
                                            placeholder="Observations portées sur le reçu (facultatif)…"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                                        />

                                        <Button
                                            onClick={arreterSolde}
                                            disabled={soldeEnCours || (solde.empechements?.length > 0)}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm disabled:opacity-40"
                                        >
                                            <Lock size={14} className="mr-2" />
                                            {solde.arrete ? "Reprendre l'arrêté" : 'Arrêter le décompte'}
                                        </Button>
                                    </div>

                                    {messageSolde && (
                                        <p className={`text-xs rounded-lg p-2.5 ${
                                            messageSolde.ton === 'succes'
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                                        }`}>
                                            {messageSolde.texte}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents de fin de contrat.

                        Les lettres de rupture produites par l'application annonçaient au
                        salarié son solde de tout compte, son certificat de travail et son
                        attestation. Aucun des trois n'était produit : on s'en apercevait le
                        dernier jour, devant la personne. */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <FileSignature size={14} />
                                Documents de fin de contrat
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Signés et scellés à l'émission, vérifiables par QR code.
                                Choisir le collaborateur ci-dessus.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {[
                                {
                                    chemin: 'certificat-travail',
                                    fichier: 'certificat_de_travail.pdf',
                                    titre: 'Certificat de travail',
                                    aide: "Dû à toute sortie. Ne porte ni motif ni appréciation."
                                },
                                {
                                    chemin: 'attestation-cessation',
                                    fichier: 'attestation_de_cessation.pdf',
                                    titre: "Attestation de cessation d'emploi",
                                    aide: 'Matricule, numéro CNPS et cause de la cessation.'
                                },
                                {
                                    chemin: 'solde/recu',
                                    fichier: 'recu_solde_de_tout_compte.pdf',
                                    titre: 'Reçu pour solde de tout compte',
                                    aide: "Édité depuis le décompte arrêté, avec la décharge à signer."
                                }
                            ].map((piece) => (
                                <button
                                    key={piece.chemin}
                                    onClick={() => telechargerPiece(piece.chemin, piece.fichier)}
                                    disabled={!salarieSolde || pieceEnCours === piece.chemin}
                                    className="w-full text-left rounded-lg border border-slate-200 bg-white p-3 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:border-slate-200"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900">{piece.titre}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{piece.aide}</p>
                                        </div>
                                        <Download size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    </div>
                                </button>
                            ))}
                            {!salarieSolde && (
                                <p className="text-xs text-slate-400 italic pt-1">
                                    Aucun collaborateur sélectionné.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
