import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
    BookOpen, Plus, Trash2, Save, RefreshCw, AlertTriangle,
    Info, Sparkles, Power, X, CheckCheck
} from 'lucide-react';
import { api, listeSure } from '../lib/api';
import { cn } from '@/lib/utils';

const COULEUR_CATEGORIE = {
    'Congés': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Horaires': 'bg-sky-100 text-sky-800 border-sky-200',
    'Rémunération': 'bg-amber-100 text-amber-800 border-amber-200',
    'Discipline': 'bg-rose-100 text-rose-800 border-rose-200',
    'Santé': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    'Autre': 'bg-slate-100 text-slate-700 border-slate-200'
};

const REGLE_VIDE = { titre: '', categorie: 'Autre', contenu: '', source: '', active: true };

export function PolicyRules() {
    const [regles, setRegles] = useState([]);
    const [categories, setCategories] = useState(['Autre']);
    const [actives, setActives] = useState(0);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [message, setMessage] = useState(null);
    const [etatIA, setEtatIA] = useState(null);

    const [edition, setEdition] = useState(null);
    const [enregistrement, setEnregistrement] = useState(false);

    const [importOuvert, setImportOuvert] = useState(false);
    const [texteImport, setTexteImport] = useState('');
    const [analyse, setAnalyse] = useState(false);
    const [propositions, setPropositions] = useState(null);
    const [retenues, setRetenues] = useState({});

    const annoncer = (t) => { setMessage(t); setTimeout(() => setMessage(null), 4000); };

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const { data } = await api.get('/policies');
            setRegles(listeSure(data?.regles, 'règles internes'));
            setCategories(listeSure(data?.categories, 'catégories'));
            setActives(data?.actives ?? 0);
        } catch (e) {
            setErreur(e.message || 'Chargement impossible.');
        } finally {
            setChargement(false);
        }
        // L'état de l'IA se lit à part : des règles bien saisies ne servent à
        // rien si l'assistant ne peut pas appeler le modèle, et les deux
        // pannes se ressemblent vues du salarié.
        try {
            const { data } = await api.get('/jobs/ia');
            setEtatIA(data || null);
        } catch {
            setEtatIA(null);
        }
    };

    useEffect(() => { charger(); }, []);

    const enregistrer = async () => {
        setEnregistrement(true);
        setErreur(null);
        try {
            if (edition.id) {
                await api.put(`/policies/${edition.id}`, edition);
                annoncer('Règle mise à jour.');
            } else {
                await api.post('/policies', edition);
                annoncer('Règle ajoutée.');
            }
            setEdition(null);
            charger();
        } catch (e) {
            setErreur(e.message || "La règle n'a pas pu être enregistrée.");
        } finally {
            setEnregistrement(false);
        }
    };

    const basculer = async (r) => {
        try {
            await api.put(`/policies/${r.id}`, { active: !r.active });
            charger();
        } catch (e) {
            setErreur(e.message || 'Modification refusée.');
        }
    };

    const supprimer = async (r) => {
        if (!window.confirm(`Supprimer la règle « ${r.titre} » ?`)) return;
        try {
            await api.delete(`/policies/${r.id}`);
            annoncer('Règle supprimée.');
            charger();
        } catch (e) {
            setErreur(e.message || 'Suppression impossible.');
        }
    };

    const analyser = async () => {
        setAnalyse(true);
        setErreur(null);
        setPropositions(null);
        try {
            const { data } = await api.post('/policies/proposer', { texte: texteImport });
            const liste = listeSure(data?.propositions, 'propositions');
            setPropositions(liste);
            // Rien n'est coché d'office : valider une règle engage l'entreprise
            // vis-à-vis de ses salariés, cela demande une lecture.
            setRetenues({});
        } catch (e) {
            setErreur(e.message || "Le document n'a pas pu être analysé.");
        } finally {
            setAnalyse(false);
        }
    };

    const validerPropositions = async () => {
        const choisies = (propositions || []).filter((_, i) => retenues[i]);
        if (choisies.length === 0) return;
        setEnregistrement(true);
        try {
            for (const p of choisies) {
                await api.post('/policies', { ...p, active: true });
            }
            annoncer(`${choisies.length} règle(s) enregistrée(s).`);
            setImportOuvert(false);
            setPropositions(null);
            setTexteImport('');
            charger();
        } catch (e) {
            setErreur(e.message || "Certaines règles n'ont pas pu être enregistrées.");
        } finally {
            setEnregistrement(false);
        }
    };

    const parCategorie = useMemo(() => {
        const m = new Map();
        for (const r of regles) {
            if (!m.has(r.categorie)) m.set(r.categorie, []);
            m.get(r.categorie).push(r);
        }
        return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    }, [regles]);

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
            {message && (
                <div className="fixed top-20 right-8 z-50 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
                    {message}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-indigo-600" />
                        Règles internes
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Les textes sur lesquels l'assistant RH fonde ses réponses aux collaborateurs.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={charger} title="Actualiser">
                        <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="outline" onClick={() => setImportOuvert(true)}>
                        <Sparkles size={16} className="mr-1.5" /> Importer un règlement
                    </Button>
                    <Button onClick={() => setEdition({ ...REGLE_VIDE })}>
                        <Plus size={16} className="mr-1.5" /> Ajouter une règle
                    </Button>
                </div>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            {/* L'état de l'assistant se lit ici : sans règle active, il refuse de
                se prononcer plutôt que de servir des valeurs par défaut. */}
            <div className={cn('flex items-start gap-3 rounded-lg border p-3',
                actives > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}>
                <Info size={16} className={cn('mt-0.5 shrink-0', actives > 0 ? 'text-emerald-600' : 'text-amber-600')} />
                <p className={cn('text-xs', actives > 0 ? 'text-emerald-900' : 'text-amber-900')}>
                    {actives > 0 ? (
                        <>L'assistant RH répond à partir des <strong>{actives} règle(s) active(s)</strong> ci-dessous,
                            et cite celle qu'il utilise. Une question hors de ces règles reçoit une invitation à
                            contacter la RH, jamais une réponse inventée.</>
                    ) : (
                        <>Aucune règle active : l'assistant RH <strong>refuse de se prononcer</strong> sur les
                            congés, les horaires et la rémunération, et renvoie vers la RH. C'est volontaire —
                            servir des valeurs par défaut produirait des réponses fausses énoncées avec assurance.</>
                    )}
                </p>
            </div>

            {etatIA && !etatIA.disponible && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-900">
                        <strong>L'assistant RH ne peut pas répondre :</strong> {etatIA.motif}
                        {' '}Les règles ci-dessous sont bien enregistrées, mais resteront sans effet
                        tant que ce point n'est pas réglé.
                    </p>
                </div>
            )}

            {chargement ? (
                <p className="py-12 text-center text-sm text-slate-400">Chargement…</p>
            ) : regles.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                        Aucune règle enregistrée. Ajoutez-les une à une, ou collez votre règlement
                        intérieur pour en obtenir un découpage à relire.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {parCategorie.map(([categorie, liste]) => (
                        <Card key={categorie} className="shadow-sm border-slate-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Badge variant="outline" className={cn('text-[11px]', COULEUR_CATEGORIE[categorie])}>
                                        {categorie}
                                    </Badge>
                                    <span className="text-slate-400 font-normal">{liste.length} règle(s)</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {liste.map(r => (
                                    <div key={r.id} className={cn('rounded-lg border p-3',
                                        r.active ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-70')}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-sm text-slate-800">{r.titre}</span>
                                                    {!r.active && (
                                                        <Badge variant="outline" className="text-[10px] text-slate-500">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">{r.contenu}</p>
                                                {r.source && (
                                                    <p className="text-[11px] text-slate-400 mt-1.5">Source : {r.source}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <Button size="icon" variant="ghost" className="h-8 w-8"
                                                    onClick={() => basculer(r)}
                                                    title={r.active ? 'Désactiver' : 'Activer'}>
                                                    <Power size={14} className={r.active ? 'text-emerald-600' : 'text-slate-400'} />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8"
                                                    onClick={() => setEdition({ ...r })} title="Modifier">
                                                    <Save size={14} className="text-slate-500" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8"
                                                    onClick={() => supprimer(r)} title="Supprimer">
                                                    <Trash2 size={14} className="text-rose-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {edition && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b p-5">
                            <h3 className="font-bold text-slate-900">
                                {edition.id ? 'Modifier la règle' : 'Nouvelle règle'}
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setEdition(null)}>
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="space-y-4 p-5">
                            <label className="block text-xs font-semibold text-slate-700">
                                Intitulé
                                <Input value={edition.titre} className="mt-1"
                                    placeholder="Ex. : Droit à congés annuels"
                                    onChange={(e) => setEdition(v => ({ ...v, titre: e.target.value }))} />
                            </label>
                            <label className="block text-xs font-semibold text-slate-700">
                                Catégorie
                                <select value={edition.categorie}
                                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    onChange={(e) => setEdition(v => ({ ...v, categorie: e.target.value }))}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </label>
                            <label className="block text-xs font-semibold text-slate-700">
                                Énoncé de la règle
                                <textarea value={edition.contenu} rows={5}
                                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Reprenez le texte au plus près. L'assistant répondra à partir de cet énoncé."
                                    onChange={(e) => setEdition(v => ({ ...v, contenu: e.target.value }))} />
                            </label>
                            <label className="block text-xs font-semibold text-slate-700">
                                Source
                                <Input value={edition.source || ''} className="mt-1"
                                    placeholder="Règlement intérieur, art. 12"
                                    onChange={(e) => setEdition(v => ({ ...v, source: e.target.value }))} />
                            </label>
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <input type="checkbox" checked={edition.active !== false}
                                    className="rounded border-slate-300"
                                    onChange={(e) => setEdition(v => ({ ...v, active: e.target.checked }))} />
                                Active — l'assistant s'en sert pour répondre
                            </label>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setEdition(null)}>Annuler</Button>
                                <Button onClick={enregistrer} disabled={enregistrement}>
                                    {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {importOuvert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b p-5">
                            <h3 className="font-bold text-slate-900">Importer un règlement</h3>
                            <Button variant="ghost" size="icon" onClick={() => { setImportOuvert(false); setPropositions(null); }}>
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="space-y-4 p-5">
                            {!propositions ? (
                                <>
                                    <p className="text-xs text-slate-500">
                                        Collez votre règlement intérieur, une note de service ou un extrait de
                                        convention collective. Le texte sera découpé en règles distinctes que
                                        vous relirez avant enregistrement — rien n'est enregistré automatiquement.
                                    </p>
                                    <textarea value={texteImport} rows={12}
                                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono"
                                        placeholder="Collez le texte ici…"
                                        onChange={(e) => setTexteImport(e.target.value)} />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setImportOuvert(false)}>Annuler</Button>
                                        <Button onClick={analyser} disabled={analyse || !texteImport.trim()}>
                                            <Sparkles size={15} className="mr-1.5" />
                                            {analyse ? 'Lecture en cours…' : 'Proposer un découpage'}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-xs text-amber-900">
                                            {propositions.length} règle(s) proposée(s), <strong>aucune enregistrée</strong>.
                                            Relisez chacune : une règle validée engage l'entreprise vis-à-vis de ses
                                            salariés, et l'assistant s'en servira pour répondre.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {propositions.map((p, i) => (
                                            <label key={i} className={cn('flex items-start gap-3 rounded-lg border p-3 cursor-pointer',
                                                retenues[i] ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200')}>
                                                <input type="checkbox" checked={!!retenues[i]} className="mt-1 rounded border-slate-300"
                                                    onChange={(e) => setRetenues(r => ({ ...r, [i]: e.target.checked }))} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-sm text-slate-800">{p.titre}</span>
                                                        <Badge variant="outline" className={cn('text-[10px]', COULEUR_CATEGORIE[p.categorie])}>
                                                            {p.categorie}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1">{p.contenu}</p>
                                                    {p.source && <p className="text-[11px] text-slate-400 mt-1">Source : {p.source}</p>}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <Button variant="outline" onClick={() => setPropositions(null)}>Revenir au texte</Button>
                                        <Button onClick={validerPropositions}
                                            disabled={enregistrement || Object.values(retenues).every(v => !v)}>
                                            <CheckCheck size={15} className="mr-1.5" />
                                            Enregistrer les règles retenues
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
