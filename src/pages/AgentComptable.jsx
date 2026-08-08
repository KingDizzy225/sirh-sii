import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
    Bot, Inbox, Mail, Upload, Sparkles, FileText, BookOpen,
    CalendarClock, CheckCircle2, XCircle, AlertTriangle, Trash2, Eye,
    Loader2, Plus, Banknote, CircleDollarSign
} from 'lucide-react';
import { api } from '../lib/api';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const FILES_URL = RAW_API_URL.replace(/\/api$/, '');

const fmtMoney = (n) => (n === null || n === undefined) ? '—' : `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} FCFA`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const DOC_STATUS = {
    RECU: { label: 'Reçue', variant: 'blue' },
    ANALYSE: { label: 'Analysée par IA', variant: 'purple' },
    VALIDE: { label: 'Validée', variant: 'success' },
    REJETE: { label: 'Rejetée', variant: 'destructive' },
    ERREUR: { label: 'Erreur IA', variant: 'warning' },
};

const INSTALLMENT_STATUS = {
    A_PAYER: { label: 'À payer', variant: 'blue' },
    PAYE: { label: 'Payée', variant: 'success' },
    EN_RETARD: { label: 'En retard', variant: 'destructive' },
};

export const AgentComptable = () => {
    const [activeTab, setActiveTab] = useState('pieces');
    const [dashboard, setDashboard] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [entries, setEntries] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [checkingInbox, setCheckingInbox] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        documentId: '', title: '', counterparty: '', totalAmount: '',
        numInstallments: 3, firstDueDate: '', frequency: 'MENSUEL', notes: ''
    });
    const fileInputRef = useRef(null);

    const notify = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 6000);
    };

    const loadAll = useCallback(async () => {
        try {
            const [dash, docs, journal, scheds] = await Promise.all([
                api.get('/accounting/dashboard'),
                api.get('/accounting/documents'),
                api.get('/accounting/journal'),
                api.get('/accounting/schedules'),
            ]);
            setDashboard(dash.data);
            setDocuments(Array.isArray(docs.data) ? docs.data : []);
            setEntries(Array.isArray(journal.data) ? journal.data : []);
            setSchedules(Array.isArray(scheds.data) ? scheds.data : []);
        } catch (e) {
            console.error('Erreur chargement comptabilité:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const handleCheckInbox = async () => {
        setCheckingInbox(true);
        try {
            const { data } = await api.post('/accounting/inbox/check', {});
            notify('success', `Boîte mail relevée : ${data.imported} pièce(s) importée(s).`);
            await loadAll();
        } catch (e) {
            notify('error', e.message);
        } finally {
            setCheckingInbox(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('piece', file);
            await api.post('/accounting/documents', formData);
            notify('success', `Pièce "${file.name}" déposée. L'Agent Comptable IA l'analyse en arrière-plan...`);
            await loadAll();
            // L'analyse IA tourne en tâche de fond : on rafraîchit après quelques secondes
            setTimeout(loadAll, 8000);
        } catch (err) {
            notify('error', err.message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAnalyze = async (doc) => {
        setBusyId(doc.id);
        try {
            await api.post(`/accounting/documents/${doc.id}/analyze`, {});
            notify('success', 'Pièce analysée : écriture comptable proposée au journal.');
            await loadAll();
        } catch (e) {
            notify('error', e.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDocStatus = async (doc, status) => {
        setBusyId(doc.id);
        try {
            await api.put(`/accounting/documents/${doc.id}/status`, { status });
            await loadAll();
        } catch (e) {
            notify('error', e.message);
        } finally {
            setBusyId(null);
        }
    };

    const handleDeleteDoc = async (doc) => {
        if (!window.confirm(`Supprimer la pièce "${doc.fileName}" et ses écritures liées ?`)) return;
        try {
            await api.delete(`/accounting/documents/${doc.id}`);
            if (selectedDoc?.id === doc.id) setSelectedDoc(null);
            await loadAll();
        } catch (e) {
            notify('error', e.message);
        }
    };

    const handleEntryStatus = async (entry, status) => {
        setBusyId(entry.id);
        try {
            await api.put(`/accounting/journal/${entry.id}/status`, { status });
            await loadAll();
        } catch (e) {
            notify('error', e.message);
        } finally {
            setBusyId(null);
        }
    };

    const handlePayInstallment = async (installment) => {
        const paymentMethod = window.prompt('Mode de paiement (Virement, Chèque, Espèces, Mobile Money) :', 'Virement');
        if (paymentMethod === null) return;
        setBusyId(installment.id);
        try {
            await api.put(`/accounting/schedules/installments/${installment.id}/pay`, { paymentMethod });
            notify('success', 'Échéance marquée comme payée.');
            await loadAll();
        } catch (e) {
            notify('error', e.message);
        } finally {
            setBusyId(null);
        }
    };

    const openScheduleForm = (doc = null) => {
        setScheduleForm({
            documentId: doc?.id || '',
            title: doc ? `Échéancier ${doc.vendor || doc.fileName}` : '',
            counterparty: doc?.vendor || '',
            totalAmount: doc?.amountTTC || '',
            numInstallments: 3,
            firstDueDate: doc?.dueDate ? doc.dueDate.substring(0, 10) : '',
            frequency: 'MENSUEL',
            notes: ''
        });
        setShowScheduleForm(true);
        setActiveTab('echeanciers');
    };

    const handleCreateSchedule = async (e) => {
        e.preventDefault();
        try {
            await api.post('/accounting/schedules', scheduleForm);
            notify('success', 'Échéancier de paiement créé.');
            setShowScheduleForm(false);
            await loadAll();
        } catch (err) {
            notify('error', err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    const inbox = dashboard?.inbox;

    return (
        <div className="space-y-6 pb-12">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Bot className="text-blue-600" /> Agent Comptable IA
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Comptabilité de la Fédération de Football Américain (Côte d'Ivoire) — pièces reçues par email, écritures SYSCOHADA et échéanciers de paiement en FCFA.
                    </p>
                </div>
                <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={handleUpload} />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Upload className="mr-2" size={16} />}
                        Déposer une pièce
                    </Button>
                    <Button onClick={handleCheckInbox} disabled={checkingInbox} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {checkingInbox ? <Loader2 className="animate-spin mr-2" size={16} /> : <Mail className="mr-2" size={16} />}
                        Relever la boîte mail
                    </Button>
                </div>
            </div>

            {/* Feedback */}
            {feedback && (
                <div className={`p-3 rounded-lg text-sm border ${feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    {feedback.message}
                </div>
            )}

            {/* État de la boîte email */}
            <div className={`p-3 rounded-lg border text-sm flex items-center gap-2 ${inbox?.configured ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <Inbox size={16} />
                {inbox?.configured ? (
                    <span>
                        Boîte de réception <strong>{inbox.address}</strong> relevée automatiquement toutes les {inbox.pollMinutes} min.
                        {inbox.lastCheckAt && <> Dernière relève : {new Date(inbox.lastCheckAt).toLocaleString('fr-FR')}.</>}
                        {' '}{inbox.totalImported} pièce(s) importée(s) depuis le démarrage.
                    </span>
                ) : (
                    <span>
                        Boîte email non configurée. Renseignez <code className="font-mono text-xs">ACCOUNTING_IMAP_HOST / USER / PASS</code> dans le .env du backend pour recevoir automatiquement les factures par email.
                    </span>
                )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg"><FileText className="text-blue-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Pièces à traiter</p>
                            <p className="text-xl font-bold">{dashboard?.documents?.aTraiter ?? 0} <span className="text-xs font-normal text-slate-400">/ {dashboard?.documents?.total ?? 0}</span></p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg"><BookOpen className="text-purple-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Écritures en brouillon</p>
                            <p className="text-xl font-bold">{dashboard?.journal?.brouillons ?? 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg"><CircleDollarSign className="text-emerald-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">À payer (30 jours + retards)</p>
                            <p className="text-xl font-bold">{fmtMoney(dashboard?.echeances?.totalAPayer ?? 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-rose-100 rounded-lg"><AlertTriangle className="text-rose-600" size={20} /></div>
                        <div>
                            <p className="text-xs text-slate-500">Échéances en retard</p>
                            <p className="text-xl font-bold">{dashboard?.echeances?.enRetard?.length ?? 0}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Onglets */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                {[
                    { id: 'pieces', label: 'Boîte de réception', icon: Inbox },
                    { id: 'journal', label: 'Journal comptable', icon: BookOpen },
                    { id: 'echeanciers', label: 'Échéanciers', icon: CalendarClock },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ONGLET PIÈCES */}
            {activeTab === 'pieces' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Pièces comptables reçues</CardTitle>
                            <CardDescription>Factures et justificatifs reçus par email ou déposés manuellement, analysés par l'IA.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {documents.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">Aucune pièce pour le moment. Relevez la boîte mail ou déposez une facture.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-xs text-slate-500 border-b">
                                                <th className="py-2 pr-2">Pièce</th>
                                                <th className="py-2 pr-2">Fournisseur</th>
                                                <th className="py-2 pr-2">Montant TTC</th>
                                                <th className="py-2 pr-2">Échéance</th>
                                                <th className="py-2 pr-2">Statut</th>
                                                <th className="py-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {documents.map(doc => (
                                                <tr key={doc.id} className={`border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${selectedDoc?.id === doc.id ? 'bg-blue-50 dark:bg-slate-800' : ''}`} onClick={() => setSelectedDoc(doc)}>
                                                    <td className="py-2 pr-2">
                                                        <div className="flex items-center gap-2">
                                                            {doc.source === 'EMAIL' ? <Mail size={14} className="text-blue-500 shrink-0" /> : <Upload size={14} className="text-slate-400 shrink-0" />}
                                                            <div>
                                                                <p className="font-medium truncate max-w-[180px]" title={doc.fileName}>{doc.fileName}</p>
                                                                <p className="text-xs text-slate-400">{fmtDate(doc.createdAt)}{doc.emailFrom ? ` · ${doc.emailFrom}` : ''}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 pr-2">{doc.vendor || '—'}</td>
                                                    <td className="py-2 pr-2 font-medium">{fmtMoney(doc.amountTTC)}</td>
                                                    <td className="py-2 pr-2">{fmtDate(doc.dueDate)}</td>
                                                    <td className="py-2 pr-2">
                                                        <Badge variant={DOC_STATUS[doc.status]?.variant || 'secondary'}>{DOC_STATUS[doc.status]?.label || doc.status}</Badge>
                                                    </td>
                                                    <td className="py-2" onClick={e => e.stopPropagation()}>
                                                        <div className="flex gap-1">
                                                            {(doc.status === 'RECU' || doc.status === 'ERREUR') && (
                                                                <Button size="sm" variant="outline" title="Analyser avec l'IA" disabled={busyId === doc.id} onClick={() => handleAnalyze(doc)}>
                                                                    {busyId === doc.id ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                                                                </Button>
                                                            )}
                                                            {doc.status === 'ANALYSE' && (
                                                                <>
                                                                    <Button size="sm" variant="outline" className="text-emerald-600" title="Valider" disabled={busyId === doc.id} onClick={() => handleDocStatus(doc, 'VALIDE')}>
                                                                        <CheckCircle2 size={14} />
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="text-rose-600" title="Rejeter" disabled={busyId === doc.id} onClick={() => handleDocStatus(doc, 'REJETE')}>
                                                                        <XCircle size={14} />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {doc.amountTTC > 0 && (
                                                                <Button size="sm" variant="outline" title="Créer un échéancier" onClick={() => openScheduleForm(doc)}>
                                                                    <CalendarClock size={14} />
                                                                </Button>
                                                            )}
                                                            <a href={`${FILES_URL}${doc.filePath}`} target="_blank" rel="noreferrer">
                                                                <Button size="sm" variant="outline" title="Voir le fichier"><Eye size={14} /></Button>
                                                            </a>
                                                            <Button size="sm" variant="outline" className="text-rose-600" title="Supprimer" onClick={() => handleDeleteDoc(doc)}>
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Panneau de détail */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2"><Sparkles size={16} className="text-purple-600" /> Analyse de l'Agent IA</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            {!selectedDoc ? (
                                <p className="text-slate-500 text-center py-8">Sélectionnez une pièce pour voir l'analyse détaillée.</p>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <p><span className="text-slate-500">Type :</span> {selectedDoc.docType?.replace(/_/g, ' ') || '—'}</p>
                                        <p><span className="text-slate-500">Fournisseur :</span> {selectedDoc.vendor || '—'}</p>
                                        <p><span className="text-slate-500">N° pièce :</span> {selectedDoc.invoiceNumber || '—'}</p>
                                        <p><span className="text-slate-500">Date pièce :</span> {fmtDate(selectedDoc.invoiceDate)}</p>
                                        <p><span className="text-slate-500">Catégorie :</span> {selectedDoc.category || '—'}</p>
                                        <p><span className="text-slate-500">Montant HT :</span> {fmtMoney(selectedDoc.amountHT)}</p>
                                        <p><span className="text-slate-500">TVA :</span> {fmtMoney(selectedDoc.amountTVA)}</p>
                                        <p className="font-semibold"><span className="text-slate-500 font-normal">Montant TTC :</span> {fmtMoney(selectedDoc.amountTTC)}</p>
                                        {selectedDoc.aiConfidence != null && (
                                            <p><span className="text-slate-500">Confiance IA :</span> {Math.round(selectedDoc.aiConfidence * 100)}%</p>
                                        )}
                                    </div>
                                    {selectedDoc.aiSummary && (
                                        <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-lg border border-purple-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                            {selectedDoc.aiSummary}
                                        </div>
                                    )}
                                    {selectedDoc.journalEntries?.length > 0 && (
                                        <div>
                                            <p className="font-semibold mb-1">Écriture(s) proposée(s) :</p>
                                            {selectedDoc.journalEntries.map(entry => (
                                                <div key={entry.id} className="border rounded-lg p-2 mb-2">
                                                    <p className="text-xs text-slate-500 mb-1">[{entry.journal}] {entry.label}</p>
                                                    <table className="w-full text-xs">
                                                        <tbody>
                                                            {entry.lines.map(line => (
                                                                <tr key={line.id}>
                                                                    <td className="py-0.5 font-mono">{line.accountCode}</td>
                                                                    <td className="py-0.5">{line.accountLabel}</td>
                                                                    <td className="py-0.5 text-right">{line.debit > 0 ? fmtMoney(line.debit) : ''}</td>
                                                                    <td className="py-0.5 text-right text-slate-500">{line.credit > 0 ? fmtMoney(line.credit) : ''}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ONGLET JOURNAL */}
            {activeTab === 'journal' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Journal comptable (SYSCOHADA révisé)</CardTitle>
                        <CardDescription>Écritures en partie double générées par l'Agent IA à partir des pièces. Validez-les après vérification.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {entries.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-8">Aucune écriture. Analysez des pièces pour générer les écritures automatiquement.</p>
                        ) : (
                            <div className="space-y-4">
                                {entries.map(entry => {
                                    const totalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
                                    const totalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);
                                    const balanced = Math.abs(totalDebit - totalCredit) < 1;
                                    return (
                                        <div key={entry.id} className="border rounded-xl p-4">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{entry.journal}</Badge>
                                                    <span className="font-medium">{entry.label}</span>
                                                    <span className="text-xs text-slate-400">{fmtDate(entry.entryDate)}{entry.reference ? ` · Réf. ${entry.reference}` : ''}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!balanced && <Badge variant="warning">Déséquilibrée</Badge>}
                                                    <Badge variant={entry.status === 'VALIDEE' ? 'success' : 'secondary'}>{entry.status === 'VALIDEE' ? 'Validée' : 'Brouillon'}</Badge>
                                                    {entry.status === 'BROUILLON' && (
                                                        <Button size="sm" variant="outline" className="text-emerald-600" disabled={busyId === entry.id} onClick={() => handleEntryStatus(entry, 'VALIDEE')}>
                                                            <CheckCircle2 size={14} className="mr-1" /> Valider
                                                        </Button>
                                                    )}
                                                    <Button size="sm" variant="outline" className="text-rose-600" title="Supprimer" onClick={async () => { if (window.confirm('Supprimer cette écriture ?')) { await api.delete(`/accounting/journal/${entry.id}`); loadAll(); } }}>
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-xs text-slate-500 border-b">
                                                            <th className="py-1 pr-2 w-24">Compte</th>
                                                            <th className="py-1 pr-2">Intitulé</th>
                                                            <th className="py-1 pr-2 text-right w-36">Débit</th>
                                                            <th className="py-1 text-right w-36">Crédit</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.lines.map(line => (
                                                            <tr key={line.id} className="border-b last:border-0">
                                                                <td className="py-1 pr-2 font-mono">{line.accountCode}</td>
                                                                <td className="py-1 pr-2">{line.accountLabel}</td>
                                                                <td className="py-1 pr-2 text-right">{line.debit > 0 ? fmtMoney(line.debit) : ''}</td>
                                                                <td className="py-1 text-right">{line.credit > 0 ? fmtMoney(line.credit) : ''}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="font-semibold text-xs">
                                                            <td className="py-1 pr-2" colSpan={2}>Totaux</td>
                                                            <td className="py-1 pr-2 text-right">{fmtMoney(totalDebit)}</td>
                                                            <td className="py-1 text-right">{fmtMoney(totalCredit)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            {entry.document && <p className="text-xs text-slate-400 mt-2">Pièce justificative : {entry.document.fileName}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* ONGLET ÉCHÉANCIERS */}
            {activeTab === 'echeanciers' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => openScheduleForm(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus size={16} className="mr-2" /> Nouvel échéancier
                        </Button>
                    </div>

                    {showScheduleForm && (
                        <Card className="border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-base">Émettre un échéancier de paiement</CardTitle>
                                <CardDescription>Les montants sont répartis automatiquement entre les échéances (le reliquat d'arrondi va sur la dernière).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-slate-500">Titre *</label>
                                        <Input required value={scheduleForm.title} onChange={e => setScheduleForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Échéancier équipements saison 2026" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Bénéficiaire / Créancier *</label>
                                        <Input required value={scheduleForm.counterparty} onChange={e => setScheduleForm(f => ({ ...f, counterparty: e.target.value }))} placeholder="Ex: Sport Équipement CI" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Montant total (FCFA) *</label>
                                        <Input required type="number" min="1" step="any" value={scheduleForm.totalAmount} onChange={e => setScheduleForm(f => ({ ...f, totalAmount: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Nombre d'échéances *</label>
                                        <Input required type="number" min="1" max="36" value={scheduleForm.numInstallments} onChange={e => setScheduleForm(f => ({ ...f, numInstallments: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Première échéance *</label>
                                        <Input required type="date" value={scheduleForm.firstDueDate} onChange={e => setScheduleForm(f => ({ ...f, firstDueDate: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Fréquence</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 text-sm"
                                            value={scheduleForm.frequency}
                                            onChange={e => setScheduleForm(f => ({ ...f, frequency: e.target.value }))}
                                        >
                                            <option value="HEBDOMADAIRE">Hebdomadaire</option>
                                            <option value="MENSUEL">Mensuelle</option>
                                            <option value="TRIMESTRIEL">Trimestrielle</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-slate-500">Notes</label>
                                        <Input value={scheduleForm.notes} onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))} placeholder="Conditions particulières, référence de convention..." />
                                    </div>
                                    <div className="md:col-span-2 flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)}>Annuler</Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Créer l'échéancier</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {schedules.length === 0 ? (
                        <Card><CardContent className="py-10 text-center text-sm text-slate-500">Aucun échéancier. Créez-en un manuellement ou depuis une pièce analysée.</CardContent></Card>
                    ) : (
                        schedules.map(schedule => {
                            const paid = schedule.installments.filter(i => i.status === 'PAYE').reduce((s, i) => s + i.amount, 0);
                            const progress = schedule.totalAmount > 0 ? Math.min(100, Math.round((paid / schedule.totalAmount) * 100)) : 0;
                            return (
                                <Card key={schedule.id} className={schedule.status === 'ANNULE' ? 'opacity-60' : ''}>
                                    <CardHeader className="pb-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Banknote size={18} className="text-emerald-600" /> {schedule.title}
                                                </CardTitle>
                                                <CardDescription>
                                                    {schedule.counterparty} · {fmtMoney(schedule.totalAmount)}
                                                    {schedule.document ? ` · Pièce : ${schedule.document.fileName}` : ''}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={schedule.status === 'SOLDE' ? 'success' : schedule.status === 'ANNULE' ? 'destructive' : 'blue'}>
                                                    {schedule.status === 'SOLDE' ? 'Soldé' : schedule.status === 'ANNULE' ? 'Annulé' : 'Actif'}
                                                </Badge>
                                                {schedule.status === 'ACTIF' && (
                                                    <Button size="sm" variant="outline" className="text-rose-600" onClick={async () => { if (window.confirm('Annuler cet échéancier ?')) { await api.put(`/accounting/schedules/${schedule.id}/cancel`, {}); loadAll(); } }}>
                                                        Annuler
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
                                            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{fmtMoney(paid)} payés ({progress}%)</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-left text-xs text-slate-500 border-b">
                                                        <th className="py-1 pr-2 w-10">#</th>
                                                        <th className="py-1 pr-2">Échéance</th>
                                                        <th className="py-1 pr-2 text-right">Montant</th>
                                                        <th className="py-1 pr-2">Statut</th>
                                                        <th className="py-1 pr-2">Paiement</th>
                                                        <th className="py-1"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schedule.installments.map(inst => (
                                                        <tr key={inst.id} className="border-b last:border-0">
                                                            <td className="py-1.5 pr-2 text-slate-400">{inst.position}</td>
                                                            <td className="py-1.5 pr-2">{fmtDate(inst.dueDate)}</td>
                                                            <td className="py-1.5 pr-2 text-right font-medium">{fmtMoney(inst.amount)}</td>
                                                            <td className="py-1.5 pr-2">
                                                                <Badge variant={INSTALLMENT_STATUS[inst.status]?.variant || 'secondary'}>{INSTALLMENT_STATUS[inst.status]?.label || inst.status}</Badge>
                                                            </td>
                                                            <td className="py-1.5 pr-2 text-xs text-slate-500">
                                                                {inst.status === 'PAYE' ? `${inst.paymentMethod || ''} le ${fmtDate(inst.paidAt)}` : '—'}
                                                            </td>
                                                            <td className="py-1.5 text-right">
                                                                {inst.status !== 'PAYE' && schedule.status === 'ACTIF' && (
                                                                    <Button size="sm" variant="outline" className="text-emerald-600" disabled={busyId === inst.id} onClick={() => handlePayInstallment(inst)}>
                                                                        {busyId === inst.id ? <Loader2 className="animate-spin" size={14} /> : <><CheckCircle2 size={14} className="mr-1" /> Payer</>}
                                                                    </Button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};
