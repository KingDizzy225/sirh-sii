import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
    Vote, AlertTriangle, CheckCircle2, Clock, Plus, X, Printer, 
    FileText, Send, Building2, MessageSquare, ShieldCheck, Scale, 
    Calendar, Users, HelpCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DOLEANCES_INITIALES = [
    {
        id: 'DOL-2026-001',
        depositedAt: '2026-09-20',
        delegateName: 'Kouassi Yao (Délégué Collège Ouvriers & Agents)',
        college: 'AGENTS / OUVRIERS',
        category: 'Conditions de Travail & Équipements',
        title: 'Climatisation défaillante dans les bureaux du Service Exploitation',
        description: 'Les températures élevées dans l\'aile Est pénalisent le confort des équipes techniques depuis 10 jours. Demande d\'intervention urgente d\'un frigoriste et mise à disposition de ventilateurs d\'appoint.',
        legalDeadlineDaysRemaining: 3,
        status: 'WAITING_REPLY', // WAITING_REPLY, REPLIED, CLOSED
        companyReply: '',
        repliedAt: null,
        repliedBy: ''
    },
    {
        id: 'DOL-2026-002',
        depositedAt: '2026-09-17',
        delegateName: 'Touré Mariam (Déléguée Collège Cadres)',
        college: 'CADRES',
        category: 'Rémunération & Avantages',
        title: 'Revalorisation de la prime de panier de nuit pour les équipes astreintes',
        description: 'La prime actuelle de 2 500 FCFA ne correspond plus au coût réel de la restauration nocturne. Les délégués sollicitent un passage à 4 000 FCFA conformément aux accords de branche.',
        legalDeadlineDaysRemaining: 0,
        status: 'REPLIED',
        companyReply: 'La Direction Générale a validé la revalorisation de la prime de panier de nuit à 3 500 FCFA avec effet rétroactif au 1er septembre 2026. L\'avenant d\'accord sera signé lors de la prochaine réunion mensuelle.',
        repliedAt: '2026-09-21',
        repliedBy: 'Direction des Ressources Humaines'
    },
    {
        id: 'DOL-2026-003',
        depositedAt: '2026-09-14',
        delegateName: 'Koné Bakary (Délégué Suppléant)',
        college: 'AGENTS / OUVRIERS',
        category: 'Santé & Sécurité (HSE)',
        title: 'Dotation en chaussures de sécurité renforcées pour le personnel de magasinage',
        description: 'Renouvellement annuel des EPI (Équipements de Protection Individuelle) en retard de deux mois pour 8 collaborateurs du service logistique.',
        legalDeadlineDaysRemaining: 0,
        status: 'CLOSED',
        companyReply: 'Le bon de commande N° BC-2026-44 a été émis auprès du fournisseur agréé. Les 8 paires de chaussures ont été livrées et distribuées le 18 septembre 2026 avec émargement de décharge.',
        repliedAt: '2026-09-18',
        repliedBy: 'Responsable HSE & Direction RH'
    }
];

export function DoleancesDelegues() {
    const [doleances, setDoleances] = useState(DOLEANCES_INITIALES);
    const [selectedDoleance, setSelectedDoleance] = useState(DOLEANCES_INITIALES[0]);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [replyText, setReplyText] = useState('');
    const [notification, setNotification] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPvModalOpen, setIsPvModalOpen] = useState(false);

    // Formulaire nouvelle doléance
    const [newTitle, setNewTitle] = useState('');
    const [newDelegate, setNewDelegate] = useState('Kouassi Yao (Délégué)');
    const [newCollege, setNewCollege] = useState('AGENTS / OUVRIERS');
    const [newCategory, setNewCategory] = useState('Conditions de Travail & Équipements');
    const [newDesc, setNewDesc] = useState('');

    const showNotice = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3500);
    };

    const handleSendReply = (doleanceId) => {
        if (!replyText.trim()) return;

        setDoleances(prev => prev.map(d => {
            if (d.id === doleanceId) {
                return {
                    ...d,
                    status: 'REPLIED',
                    companyReply: replyText,
                    repliedAt: new Date().toISOString().split('T')[0],
                    repliedBy: 'Direction des Ressources Humaines'
                };
            }
            return d;
        }));

        setSelectedDoleance(prev => ({
            ...prev,
            status: 'REPLIED',
            companyReply: replyText,
            repliedAt: new Date().toISOString().split('T')[0],
            repliedBy: 'Direction des Ressources Humaines'
        }));

        setReplyText('');
        showNotice("✅ Réponse officielle de la Direction consignée dans le registre légal !");
    };

    const handleCreateDoleance = (e) => {
        e.preventDefault();
        const created = {
            id: `DOL-2026-${String(doleances.length + 1).padStart(3, '0')}`,
            depositedAt: new Date().toISOString().split('T')[0],
            delegateName: newDelegate,
            college: newCollege,
            category: newCategory,
            title: newTitle,
            description: newDesc,
            legalDeadlineDaysRemaining: 6, // 6 jours ouvrables légaux
            status: 'WAITING_REPLY',
            companyReply: '',
            repliedAt: null,
            repliedBy: ''
        };

        setDoleances([created, ...doleances]);
        setSelectedDoleance(created);
        setIsCreateModalOpen(false);
        showNotice("📝 Nouvelle doléance inscrite au Cahier Légal des Délégués !");
        setNewTitle('');
        setNewDesc('');
    };

    const filteredDoleances = useMemo(() => {
        if (filterCategory === 'ALL') return doleances;
        return doleances.filter(d => d.category === filterCategory);
    }, [doleances, filterCategory]);

    const stats = useMemo(() => {
        const waiting = doleances.filter(d => d.status === 'WAITING_REPLY').length;
        const replied = doleances.filter(d => d.status === 'REPLIED').length;
        const closed = doleances.filter(d => d.status === 'CLOSED').length;
        return { total: doleances.length, waiting, replied, closed };
    }, [doleances]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
                    >
                        <ShieldCheck size={18} className="text-emerald-400" />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                        <Scale className="text-indigo-600 h-8 w-8" />
                        Cahier des Doléances &amp; Réponses Légal (Code du Travail CI)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Registre officiel des questions des délégués du personnel et des réponses écrites de la Direction (délai de 6 jours ouvrables).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={() => setIsPvModalOpen(true)}
                        variant="outline" 
                        className="bg-white border-slate-200 text-slate-700 gap-1.5 font-bold"
                    >
                        <FileText size={16} /> Générer PV Réunion Mensuelle
                    </Button>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold shadow-md shadow-indigo-100"
                    >
                        <Plus size={16} /> Consigner une Doléance
                    </Button>
                </div>
            </div>

            {/* Alerte Légale 6 Jours */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
                <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                    <span className="font-bold">Obligation Légale (Art. 62 du Code du Travail) : </span>
                    L'employeur est tenu de répondre par écrit aux réclamations consignées par les délégués du personnel dans un délai maximum de <strong>six (6) jours ouvrables</strong>. Le registre doit être tenu à la disposition permanente de l'Inspecteur du Travail.
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Doléances</span>
                    <div className="text-2xl font-black text-slate-800 mt-1">{stats.total}</div>
                    <span className="text-[10px] text-slate-500 font-medium">Consignées au registre 2026</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En Attente de Réponse</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">{stats.waiting}</div>
                    <span className="text-[10px] text-amber-700 font-bold">Chronomètre légal actif (&lt; 6 j)</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réponses Apportées</span>
                    <div className="text-2xl font-black text-indigo-600 mt-1">{stats.replied}</div>
                    <span className="text-[10px] text-indigo-600 font-bold">Transmises aux délégués</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doléances Closes</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">{stats.closed}</div>
                    <span className="text-[10px] text-emerald-600 font-bold">Actions exécutées &amp; validées</span>
                </div>
            </div>

            {/* Layout 2 Colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Colonne Gauche : Liste des Doléances */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="border-slate-200/80 shadow-sm bg-white">
                        <CardHeader className="p-4 border-b bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                                <span>Registre Chronologique</span>
                                <Badge className="bg-slate-200 text-slate-700 font-bold text-[10px]">
                                    {filteredDoleances.length} entrée(s)
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
                            {filteredDoleances.map(d => (
                                <div
                                    key={d.id}
                                    onClick={() => setSelectedDoleance(d)}
                                    className={`p-4 cursor-pointer transition-all border-l-4 ${
                                        selectedDoleance?.id === d.id 
                                            ? 'bg-indigo-50/50 border-l-indigo-600' 
                                            : 'border-l-transparent hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <span className="font-mono text-[10px] font-black text-slate-400">{d.id}</span>
                                        <Badge className={`text-[9px] font-bold ${
                                            d.status === 'WAITING_REPLY' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                            d.status === 'REPLIED' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                                        }`}>
                                            {d.status === 'WAITING_REPLY' ? `⏳ Délai : ${d.legalDeadlineDaysRemaining}j restants` :
                                             d.status === 'REPLIED' ? 'Répondu' : 'Clos'}
                                        </Badge>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{d.title}</h4>
                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                                        <span>{d.delegateName}</span>
                                        <span>•</span>
                                        <span>{d.depositedAt}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne Droite : Examen & Rédaction de la Réponse Direction */}
                <div className="lg:col-span-7 space-y-6">
                    {selectedDoleance && (
                        <Card className="border-slate-200/80 shadow-sm bg-white">
                            <CardHeader className="border-b pb-4">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <Badge className="bg-slate-100 text-slate-700 font-mono text-[10px]">
                                        {selectedDoleance.id} • Déposée le {selectedDoleance.depositedAt}
                                    </Badge>
                                    <Badge className="bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                                        Collège {selectedDoleance.college}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg font-black text-slate-900">
                                    {selectedDoleance.title}
                                </CardTitle>
                                <CardDescription className="text-xs font-semibold text-slate-500">
                                    Délégué référent : {selectedDoleance.delegateName} • Catégorie : {selectedDoleance.category}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6 space-y-5">
                                {/* Contenu de la doléance */}
                                <div>
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                        Exposé des Motifs &amp; Demande des Délégués
                                    </h5>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                                        {selectedDoleance.description}
                                    </div>
                                </div>

                                {/* Réponse de la Direction */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            Réponse Écrite de la Direction (Obligation Légale)
                                        </h5>
                                        {selectedDoleance.repliedAt && (
                                            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Répondu le {selectedDoleance.repliedAt}
                                            </span>
                                        )}
                                    </div>

                                    {selectedDoleance.status !== 'WAITING_REPLY' ? (
                                        <div className="bg-emerald-50/50 border border-emerald-200/80 p-4 rounded-xl text-xs text-emerald-950 font-medium leading-relaxed">
                                            <div className="font-bold text-[10px] text-emerald-800 uppercase tracking-wider mb-1">
                                                Par la {selectedDoleance.repliedBy} :
                                            </div>
                                            {selectedDoleance.companyReply}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <textarea
                                                rows={4}
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                placeholder="Rédigez ici la réponse motivée de la Direction (mesures prises, calendrier d'exécution ou motifs de refus)..."
                                                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() => handleSendReply(selectedDoleance.id)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
                                                >
                                                    <Send size={14} /> Consigner la Réponse Officielle
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal Consigner Doléance */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <Plus size={18} className="text-indigo-600" /> Inscription d'une Réclamation Délégués
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDoleance} className="space-y-3.5 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Objet de la Doléance</label>
                                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="ex: Revalorisation prime, climatisation, cantine..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Collège Électoral</label>
                                    <select value={newCollege} onChange={e => setNewCollege(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                                        <option value="AGENTS / OUVRIERS">AGENTS / OUVRIERS</option>
                                        <option value="CADRES">CADRES</option>
                                        <option value="COLLÈGE UNIQUE">COLLÈGE UNIQUE</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 block mb-1">Catégorie</label>
                                    <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                                        <option value="Conditions de Travail & Équipements">Conditions de Travail</option>
                                        <option value="Rémunération & Avantages">Rémunération & Avantages</option>
                                        <option value="Santé & Sécurité (HSE)">Santé & Sécurité (HSE)</option>
                                        <option value="Formation & Carrières">Formation & Carrières</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Délégué Porteur</label>
                                <Input value={newDelegate} onChange={e => setNewDelegate(e.target.value)} required />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Détail des Faits &amp; Demande Précise</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    rows={4}
                                    required
                                    placeholder="Décrivez précisément la réclamation formulée par les salariés..."
                                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-indigo-600 text-white font-bold">Consigner au Cahier</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal PV Officiel Réunion Mensuelle Délégués */}
            {isPvModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 space-y-6 my-8 border border-slate-200 text-xs">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 print:hidden">
                            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                                <FileText className="text-indigo-600" /> Procès-Verbal de la Réunion Mensuelle des Délégués
                            </h3>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => window.print()} className="bg-indigo-600 text-white gap-1.5 font-bold">
                                    <Printer size={14} /> Imprimer le PV Officiel
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsPvModalOpen(false)}>
                                    <X size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Document Imprimable */}
                        <div className="space-y-4 text-slate-800 font-sans">
                            <div className="text-center pb-3 border-b-2 border-slate-900">
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">RÉPUBLIQUE DE CÔTE D'IVOIRE • MINISTÈRE DE L'EMPLOI ET DE LA PROTECTION SOCIALE</div>
                                <h2 className="text-base font-black uppercase text-slate-900 mt-1">
                                    PROCÈS-VERBAL DE LA RÉUNION MENSUELLE ENTRE LA DIRECTION ET LES DÉLÉGUÉS DU PERSONNEL
                                </h2>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Session Ordinaire du Mois de Septembre 2026 — Siège Social SII Côte d'Ivoire
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div>
                                    <span className="font-bold text-slate-500">Employeur : </span>
                                    <span className="font-bold text-slate-900">SII CÔTE D'IVOIRE</span> (Réf. N° 01-44589-CI)
                                </div>
                                <div>
                                    <span className="font-bold text-slate-500">Date de la séance : </span>
                                    <span className="font-bold text-slate-900">23 Septembre 2026</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-black text-slate-900 uppercase text-[11px] border-b pb-1">
                                    EXTRAIT DES RÉCLAMATIONS ET RÉPONSES CONSIGNÉES :
                                </h4>
                                {doleances.map((d, i) => (
                                    <div key={d.id} className="p-3 rounded-lg border border-slate-200 space-y-1.5">
                                        <div className="flex justify-between font-bold text-slate-900">
                                            <span>Point {i+1} : {d.title}</span>
                                            <span className="text-indigo-600 font-mono text-[10px]">{d.id}</span>
                                        </div>
                                        <p className="text-slate-600 italic">"{d.description}"</p>
                                        <div className="pt-1 text-slate-800 font-medium">
                                            <strong>Réponse de la Direction : </strong>
                                            {d.companyReply || "En cours d'instruction dans le délai légal des 6 jours."}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-8 pt-6">
                                <div className="border border-slate-300 p-3 h-24 rounded-lg flex flex-col justify-between">
                                    <div className="text-[9px] font-black uppercase text-slate-500">Pour les Délégués du Personnel (Signatures) :</div>
                                    <div className="text-[8px] text-slate-400">Visa des représentants</div>
                                </div>
                                <div className="border border-slate-300 p-3 h-24 rounded-lg flex flex-col justify-between">
                                    <div className="text-[9px] font-black uppercase text-slate-500">Pour la Direction Générale (Cachet &amp; Signature) :</div>
                                    <div className="text-[8px] text-slate-400">Certifié conforme</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
