import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
    Workflow, Plus, Trash2, Save, RefreshCw, AlertTriangle,
    Info, Download, Power, ArrowUp, ArrowDown
} from 'lucide-react';
import { api, listeSure } from '../lib/api';
import { cn } from '@/lib/utils';

const TYPES = [
    { id: 'ONBOARDING', libelle: 'Intégration' },
    { id: 'OFFBOARDING', libelle: 'Départ' }
];

const jourLisible = (n) => {
    if (n === 0) return 'le jour J';
    if (n < 0) return `J−${Math.abs(n)}`;
    return `J+${n}`;
};

export function WorkflowBuilder() {
    const [modeles, setModeles] = useState([]);
    const [reference, setReference] = useState(null);
    const [source, setSource] = useState(null);
    const [selection, setSelection] = useState(null);
    const [brouillon, setBrouillon] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [enregistrement, setEnregistrement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [message, setMessage] = useState(null);

    const annoncer = (t) => { setMessage(t); setTimeout(() => setMessage(null), 4000); };

    const charger = async (idASelectionner) => {
        setChargement(true);
        setErreur(null);
        try {
            const { data } = await api.get('/task-templates');
            const liste = listeSure(data?.modeles, 'modèles de parcours');
            setModeles(liste);
            setReference(data?.referenceCode || null);
            setSource(data?.sourceAppliquee || null);
            const cible = liste.find(m => m.id === (idASelectionner || selection?.id)) || liste[0] || null;
            setSelection(cible);
            setBrouillon(cible ? JSON.parse(JSON.stringify(cible)) : null);
        } catch (e) {
            setErreur(e.message || 'Chargement impossible.');
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const choisir = (m) => {
        setSelection(m);
        setBrouillon(JSON.parse(JSON.stringify(m)));
        setErreur(null);
    };

    const modifierTache = (i, champ, valeur) => {
        setBrouillon(b => {
            const t = [...b.taches];
            t[i] = { ...t[i], [champ]: champ === 'jours' ? (parseInt(valeur, 10) || 0) : valeur };
            return { ...b, taches: t };
        });
    };

    const deplacerTache = (i, sens) => {
        setBrouillon(b => {
            const t = [...b.taches];
            const j = i + sens;
            if (j < 0 || j >= t.length) return b;
            [t[i], t[j]] = [t[j], t[i]];
            return { ...b, taches: t };
        });
    };

    const ajouterTache = () => setBrouillon(b => ({
        ...b,
        taches: [...b.taches, { titre: '', equipe: 'Ressources Humaines', jours: 0, description: '' }]
    }));

    const retirerTache = (i) => setBrouillon(b => ({
        ...b, taches: b.taches.filter((_, k) => k !== i)
    }));

    const enregistrer = async () => {
        setEnregistrement(true);
        setErreur(null);
        try {
            const { data } = await api.put(`/task-templates/${brouillon.id}`, {
                nom: brouillon.nom,
                famille: brouillon.famille,
                description: brouillon.description,
                actif: brouillon.actif,
                taches: brouillon.taches
            });
            annoncer(`Modèle « ${data.nom} » enregistré.`);
            charger(data.id);
        } catch (e) {
            setErreur(e.message || "Le modèle n'a pas pu être enregistré.");
        } finally {
            setEnregistrement(false);
        }
    };

    const creer = async (type) => {
        try {
            const { data } = await api.post('/task-templates', {
                nom: type === 'ONBOARDING' ? 'Nouveau parcours d\'intégration' : 'Nouveau parcours de départ',
                type,
                taches: []
            });
            annoncer('Modèle créé.');
            charger(data.id);
        } catch (e) {
            setErreur(e.message || 'Création impossible.');
        }
    };

    const importerSocle = async () => {
        try {
            const { data } = await api.post('/task-templates/importer-socle', {});
            annoncer(`« ${data.nom} » importé, inactif : activez-le quand il vous convient.`);
            charger(data.id);
        } catch (e) {
            setErreur(e.message || 'Import impossible.');
        }
    };

    const supprimer = async () => {
        if (!window.confirm(`Supprimer le modèle « ${brouillon.nom} » ?`)) return;
        try {
            await api.delete(`/task-templates/${brouillon.id}`);
            annoncer('Modèle supprimé.');
            setSelection(null); setBrouillon(null);
            charger();
        } catch (e) {
            setErreur(e.message || 'Suppression impossible.');
        }
    };

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
                        <Workflow className="h-8 w-8 text-violet-600" />
                        Parcours d'intégration et de départ
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Les tâches créées automatiquement à chaque arrivée et à chaque départ.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => charger()} title="Actualiser">
                        <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                    </Button>
                    <Button variant="outline" onClick={importerSocle}>
                        <Download size={16} className="mr-1.5" /> Importer le socle livré
                    </Button>
                    {TYPES.map(t => (
                        <Button key={t.id} onClick={() => creer(t.id)} variant={t.id === 'ONBOARDING' ? 'default' : 'outline'}>
                            <Plus size={16} className="mr-1.5" /> {t.libelle}
                        </Button>
                    ))}
                </div>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            {/* Dire lequel des deux mondes s'applique évite la question que posait
                l'ancienne version : on y composait des parcours sans jamais savoir
                s'ils changeaient quoi que ce soit — ils ne changeaient rien. */}
            <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <Info size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600">
                    {source === 'MODELES_ENREGISTRES' ? (
                        <>Les prochaines arrivées suivront <strong>les modèles actifs ci-dessous</strong>.
                            Un modèle ciblant la famille de métier du salarié l'emporte sur le modèle général.</>
                    ) : (
                        <>Aucun modèle d'intégration actif : les arrivées suivent
                            <strong> le socle livré avec l'application</strong>
                            {reference ? ` (${reference.socle.length} formalités)` : ''}.
                            Importez-le pour le personnaliser, puis activez votre version.</>
                    )}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="shadow-sm border-slate-200 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold">Modèles enregistrés</CardTitle>
                        <CardDescription>{modeles.length} modèle(s)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {chargement ? (
                            <p className="py-6 text-center text-sm text-slate-400">Chargement…</p>
                        ) : modeles.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-500">
                                Aucun modèle. Importez le socle livré pour partir d'une base.
                            </p>
                        ) : modeles.map(m => (
                            <button key={m.id} onClick={() => choisir(m)}
                                className={cn('w-full text-left rounded-lg border p-3 transition-colors',
                                    selection?.id === m.id ? 'border-violet-400 bg-violet-50' : 'border-slate-200 hover:bg-slate-50')}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-sm text-slate-800 truncate">{m.nom}</span>
                                    <Badge variant="outline" className={cn('text-[10px] shrink-0',
                                        m.actif ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                            : 'border-slate-200 text-slate-500')}>
                                        {m.actif ? 'Actif' : 'Inactif'}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    {TYPES.find(t => t.id === m.type)?.libelle} · {m.taches.length} tâche(s)
                                    {m.famille && ` · ${m.famille}`}
                                </p>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {brouillon ? (
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="flex-1 space-y-2">
                                <Input value={brouillon.nom}
                                    onChange={(e) => setBrouillon(b => ({ ...b, nom: e.target.value }))}
                                    className="text-base font-bold" />
                                <Input value={brouillon.description || ''}
                                    placeholder="Description (facultative)"
                                    onChange={(e) => setBrouillon(b => ({ ...b, description: e.target.value }))}
                                    className="text-xs" />
                                <Input value={brouillon.famille || ''}
                                    placeholder="Famille de métier ciblée — vide : s'applique à tous"
                                    onChange={(e) => setBrouillon(b => ({ ...b, famille: e.target.value }))}
                                    className="text-xs" />
                            </div>
                            <div className="flex gap-2">
                                <Button variant={brouillon.actif ? 'default' : 'outline'}
                                    onClick={() => setBrouillon(b => ({ ...b, actif: !b.actif }))}
                                    className={brouillon.actif ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                                    <Power size={15} className="mr-1.5" /> {brouillon.actif ? 'Actif' : 'Inactif'}
                                </Button>
                                <Button variant="outline" onClick={supprimer} title="Supprimer">
                                    <Trash2 size={15} className="text-rose-600" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {brouillon.taches.length === 0 && (
                                <p className="py-6 text-center text-sm text-slate-400 border-2 border-dashed rounded-lg">
                                    Aucune tâche. Un modèle actif sans tâche est ignoré au profit du socle.
                                </p>
                            )}

                            {brouillon.taches.map((t, i) => (
                                <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 w-6">{i + 1}</span>
                                        <Input value={t.titre} placeholder="Libellé de la tâche"
                                            onChange={(e) => modifierTache(i, 'titre', e.target.value)}
                                            className="flex-1 text-sm" />
                                        <Button size="icon" variant="ghost" className="h-8 w-8"
                                            onClick={() => deplacerTache(i, -1)} disabled={i === 0} title="Monter">
                                            <ArrowUp size={14} />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8"
                                            onClick={() => deplacerTache(i, 1)}
                                            disabled={i === brouillon.taches.length - 1} title="Descendre">
                                            <ArrowDown size={14} />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8"
                                            onClick={() => retirerTache(i)} title="Retirer">
                                            <Trash2 size={14} className="text-rose-500" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-2 md:grid-cols-3 pl-8">
                                        <label className="text-[11px] font-semibold text-slate-600">
                                            Équipe responsable
                                            <Input value={t.equipe} className="mt-1 text-xs"
                                                onChange={(e) => modifierTache(i, 'equipe', e.target.value)} />
                                        </label>
                                        <label className="text-[11px] font-semibold text-slate-600">
                                            Échéance ({jourLisible(t.jours)})
                                            <Input type="number" value={t.jours} className="mt-1 text-xs"
                                                onChange={(e) => modifierTache(i, 'jours', e.target.value)} />
                                        </label>
                                        <label className="text-[11px] font-semibold text-slate-600">
                                            Précision
                                            <Input value={t.description || ''} className="mt-1 text-xs"
                                                onChange={(e) => modifierTache(i, 'description', e.target.value)} />
                                        </label>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between pt-2">
                                <Button variant="outline" onClick={ajouterTache}>
                                    <Plus size={15} className="mr-1.5" /> Ajouter une tâche
                                </Button>
                                <Button onClick={enregistrer} disabled={enregistrement}
                                    className="bg-violet-600 hover:bg-violet-700">
                                    <Save size={15} className="mr-1.5" />
                                    {enregistrement ? 'Enregistrement…' : 'Enregistrer le modèle'}
                                </Button>
                            </div>

                            <p className="text-[11px] text-slate-400 pt-1">
                                L'échéance se compte à partir de la date d'arrivée ou de départ :
                                −3 pour trois jours avant, +7 pour une semaine après.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-sm border-slate-200">
                        <CardContent className="p-12 text-center text-sm text-slate-500">
                            {chargement ? 'Chargement…' : 'Sélectionnez un modèle, ou importez le socle livré pour commencer.'}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
