import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    CheckCircle2, Circle, Clock, UserCircle,
    ArrowRight, Filter, Search, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { api, listeSure } from '../lib/api';

const COLUMNS = [
    { id: 'PENDING', label: 'À Faire', icon: Circle, color: 'text-slate-400' },
    { id: 'IN_PROGRESS', label: 'En Cours', icon: Clock, color: 'text-amber-500' },
    { id: 'DONE', label: 'Terminé', icon: CheckCircle2, color: 'text-emerald-500' }
];

// Palette stable par équipe responsable. Le hachage évite d'avoir à tenir une
// liste : les équipes viennent des modèles de tâches et peuvent changer.
const COULEURS_EQUIPE = [
    'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800',
    'bg-amber-100 text-amber-800', 'bg-emerald-100 text-emerald-800',
    'bg-rose-100 text-rose-800', 'bg-cyan-100 text-cyan-800'
];
const couleurEquipe = (equipe) => {
    let somme = 0;
    for (let i = 0; i < equipe.length; i++) somme = (somme + equipe.charCodeAt(i)) % 997;
    return COULEURS_EQUIPE[somme % COULEURS_EQUIPE.length];
};

const formaterEcheance = (valeur) => {
    if (!valeur) return null;
    const d = new Date(valeur);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('fr-FR');
};

const estEnRetard = (tache) => {
    if (!tache.echeance || tache.statut === 'DONE') return false;
    return new Date(tache.echeance) < new Date();
};

export function TaskBoard() {
    const [taches, setTaches] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [equipeFiltre, setEquipeFiltre] = useState('Toutes');
    const [recherche, setRecherche] = useState('');

    const charger = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const reponse = await api.get('/tasks');
            setTaches(listeSure(reponse.data?.taches, 'tâches'));
        } catch (e) {
            // Une erreur de chargement doit se voir : un tableau vide et un
            // tableau inaccessible se ressemblent trop pour être confondus.
            setErreur(e.message || 'Chargement impossible.');
            setTaches([]);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => { charger(); }, []);

    const deplacer = async (tache, nouveauStatut) => {
        const precedent = tache.statut;
        // Déplacement optimiste : la carte bouge tout de suite, et revient à sa
        // place si le serveur refuse. L'ancienne version ne faisait que le
        // premier temps, sans jamais rien enregistrer.
        setTaches(ts => ts.map(t => (t.id === tache.id && t.source === tache.source)
            ? { ...t, statut: nouveauStatut } : t));
        try {
            await api.patch(`/tasks/${tache.source}/${tache.id}`, { statut: nouveauStatut });
        } catch (e) {
            setTaches(ts => ts.map(t => (t.id === tache.id && t.source === tache.source)
                ? { ...t, statut: precedent } : t));
            setErreur(`Déplacement non enregistré : ${e.message}`);
        }
    };

    const equipes = useMemo(
        () => ['Toutes', ...Array.from(new Set(taches.map(t => t.equipe))).sort()],
        [taches]
    );

    const filtrees = useMemo(() => {
        const q = recherche.trim().toLowerCase();
        return taches.filter(t => {
            const parEquipe = equipeFiltre === 'Toutes' || t.equipe === equipeFiltre;
            const parTexte = !q
                || (t.salarie || '').toLowerCase().includes(q)
                || (t.titre || '').toLowerCase().includes(q);
            return parEquipe && parTexte;
        });
    }, [taches, equipeFiltre, recherche]);

    const retards = filtrees.filter(estEnRetard).length;

    const carte = (tache) => {
        const echeance = formaterEcheance(tache.echeance);
        const retard = estEnRetard(tache);
        return (
            <Card key={`${tache.source}-${tache.id}`}
                className={`hover:shadow-md transition-shadow group ${retard ? 'border-rose-300' : 'border-slate-200'}`}>
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                        <Badge variant="secondary"
                            className={`text-[10px] uppercase tracking-wide font-bold ${couleurEquipe(tache.equipe)}`}>
                            {tache.equipe}
                        </Badge>
                        <Badge variant="outline"
                            className={`text-[10px] shrink-0 ${tache.source === 'ONBOARDING'
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                            {tache.source === 'ONBOARDING' ? 'INTÉGRATION' : 'DÉPART'}
                        </Badge>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{tache.titre}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <UserCircle size={14} /> {tache.salarie}
                            {tache.serviceSalarie && <span className="text-slate-400">· {tache.serviceSalarie}</span>}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                        <span className={`text-xs font-medium flex items-center gap-1 ${retard ? 'text-rose-600' : 'text-slate-500'}`}>
                            {retard && <AlertTriangle size={12} />}
                            {echeance ? `Échéance : ${echeance}` : 'Sans échéance'}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {tache.statut !== 'PENDING' && (
                                <Button size="icon" variant="ghost" className="h-6 w-6"
                                    title="Reculer d'une étape"
                                    onClick={() => deplacer(tache, tache.statut === 'DONE' ? 'IN_PROGRESS' : 'PENDING')}>
                                    <ArrowRight size={14} className="rotate-180" />
                                </Button>
                            )}
                            {tache.statut !== 'DONE' && (
                                <Button size="icon" variant="ghost" className="h-6 w-6"
                                    title="Avancer d'une étape"
                                    onClick={() => deplacer(tache, tache.statut === 'PENDING' ? 'IN_PROGRESS' : 'DONE')}>
                                    <ArrowRight size={14} />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="text-blue-600 h-8 w-8" />
                        Tableau des Tâches
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Tâches d'intégration et de départ, par équipe responsable.
                        {retards > 0 && (
                            <span className="text-rose-600 font-semibold"> · {retards} en retard</span>
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un salarié ou une tâche..."
                            className="bg-white pl-9 w-64"
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-white border rounded-md p-1 shadow-sm">
                        <Filter className="h-4 w-4 text-slate-400 ml-2 mr-1" />
                        <select
                            className="bg-transparent border-0 text-sm font-medium focus:ring-0 text-slate-700 cursor-pointer pr-2 max-w-[15rem]"
                            value={equipeFiltre}
                            onChange={(e) => setEquipeFiltre(e.target.value)}
                        >
                            {equipes.map(eq => (
                                <option key={eq} value={eq}>{eq === 'Toutes' ? 'Toutes les équipes' : eq}</option>
                            ))}
                        </select>
                    </div>
                    <Button variant="outline" size="icon" onClick={charger} title="Actualiser">
                        <RefreshCw size={16} className={chargement ? 'animate-spin' : ''} />
                    </Button>
                </div>
            </div>

            {erreur && (
                <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-800">{erreur}</p>
                </div>
            )}

            {!chargement && !erreur && taches.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
                    <p className="text-sm text-slate-500">
                        Aucune tâche pour le moment. Les tâches d'intégration sont créées automatiquement
                        à l'embauche d'un salarié ; celles de départ le sont depuis le module Offboarding.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {COLUMNS.map(col => {
                    const colonne = filtrees.filter(t => t.statut === col.id);
                    return (
                        <div key={col.id} className="flex flex-col">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <col.icon className={`h-5 w-5 ${col.color}`} />
                                <h3 className="font-semibold text-slate-800">{col.label}</h3>
                                <Badge variant="secondary" className="ml-auto bg-white border shadow-sm">
                                    {colonne.length}
                                </Badge>
                            </div>
                            <div className="bg-slate-100/50 rounded-2xl p-2 border border-slate-200/60">
                                <div className="space-y-4 min-h-[500px] p-2">
                                    {chargement ? (
                                        <div className="text-center py-8 text-sm text-slate-400">Chargement…</div>
                                    ) : colonne.length === 0 ? (
                                        <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                            Aucune tâche dans cette étape
                                        </div>
                                    ) : (
                                        colonne.map(carte)
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
