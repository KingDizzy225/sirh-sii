import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    ShieldCheck, AlertTriangle, RotateCcw, Trash2, RefreshCw,
    FileWarning, Users, Undo2
} from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Dossiers administratifs et corbeille.
 *
 * Deux points aveugles réunis ici parce qu'ils se découvrent au même moment —
 * quand il est trop tard :
 *
 *  - Le registre unique du personnel s'imprimait sans matricule ni numéro CNPS,
 *    deux mentions que la base ne connaissait pas. Le document sortait, mais un
 *    contrôle ne pouvait rattacher aucune ligne à une déclaration.
 *  - Supprimer un salarié effaçait en cascade une trentaine de tables, sans
 *    retour possible. La suppression reste immédiate, mais le dossier complet
 *    est copié avant, et peut être rendu.
 */

const USAGES = {
    declaration: { libelle: 'Déclaration sociale', ton: 'bg-red-100 text-red-700' },
    registre: { libelle: 'Registre du personnel', ton: 'bg-amber-100 text-amber-800' },
    paiement: { libelle: 'Paiement des salaires', ton: 'bg-sky-100 text-sky-800' }
};

export function Conformite() {
    const [bilan, setBilan] = useState(null);
    const [corbeille, setCorbeille] = useState(null);
    const [message, setMessage] = useState(null);
    const [enCours, setEnCours] = useState(null);
    const [filtre, setFiltre] = useState('incomplets');

    const charger = useCallback(async () => {
        const [c, t] = await Promise.all([
            api.get('/employees/conformite').catch(() => ({ data: null })),
            api.get('/employees/corbeille').catch(() => ({ data: null }))
        ]);
        setBilan(c?.data && Array.isArray(c.data.salaries) ? c.data : null);
        setCorbeille(t?.data && Array.isArray(t.data.dossiers) ? t.data : null);
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 8000);
    };

    const restaurer = async (dossier) => {
        setEnCours(dossier.id);
        try {
            const res = await api.post(`/employees/corbeille/${dossier.id}/restaurer`);
            const d = res?.data || {};
            // Une restauration partielle doit se voir : la taire laisserait
            // croire le dossier complet alors qu'il manque des lignes.
            const echecs = listeSure(d.echecs, 'échecs de restauration');
            annoncer(
                `${d.message || 'Dossier restauré.'} ${d.lignesRestaurees ?? 0} ligne(s) rendue(s).` +
                (echecs.length > 0 ? ` ${echecs.length} ligne(s) n'ont pas pu être restaurées : ${echecs.map(e => e.table).join(', ')}.` : '') +
                (listeSure(d.avertissements, 'avertissements').join(' ') || ''),
                echecs.length > 0 ? 'alerte' : 'succes'
            );
            charger();
        } catch (e) {
            annoncer(e.message || 'Restauration impossible.', 'alerte');
        } finally {
            setEnCours(null);
        }
    };

    const purger = async (dossier) => {
        if (!confirm(
            `Supprimer définitivement le dossier de ${dossier.firstName} ${dossier.lastName} ?\n\n` +
            "Cette fois, rien ne pourra plus être restauré."
        )) return;
        setEnCours(dossier.id);
        try {
            await api.delete(`/employees/corbeille/${dossier.id}`);
            annoncer('Dossier définitivement supprimé.');
            charger();
        } catch (e) {
            annoncer(e.message || 'Suppression impossible.', 'alerte');
        } finally {
            setEnCours(null);
        }
    };

    const salaries = bilan
        ? bilan.salaries.filter(s => filtre === 'tous'
            || (filtre === 'incomplets' && s.manquants.length > 0)
            || (filtre === 'bloquants' && !s.declarable))
        : [];

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="text-blue-600" /> Dossiers administratifs
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Ce qui manque à chaque dossier, et ce que l'absence empêche. Et la corbeille,
                    pour rattraper une suppression.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border text-sm ${
                    message.ton === 'alerte' ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : message.ton === 'succes' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {message.texte}
                </div>
            )}

            {/* Synthèse */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { titre: 'Dossiers complets', valeur: bilan?.complets, total: bilan?.total, icone: ShieldCheck, ton: 'text-emerald-600' },
                    { titre: 'Dossiers incomplets', valeur: bilan?.incomplets, total: bilan?.total, icone: FileWarning, ton: 'text-amber-600' },
                    { titre: 'Non déclarables', valeur: bilan?.nonDeclarables, total: bilan?.total, icone: AlertTriangle, ton: 'text-red-600' }
                ].map(c => (
                    <Card key={c.titre} className="border border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.titre}</p>
                                <c.icone size={18} className={c.ton} />
                            </div>
                            <p className="text-3xl font-extrabold text-slate-900 mt-2">
                                {c.valeur ?? '—'}
                                {c.total != null && <span className="text-base font-medium text-slate-400"> / {c.total}</span>}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Mentions manquantes */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                        <span>Mentions manquantes</span>
                        <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                            <RefreshCw size={12} /> Actualiser
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!bilan ? (
                        <p className="p-6 text-sm text-slate-400">Lecture des dossiers…</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {bilan.parMention.map(m => (
                                <div key={m.champ} className="p-4 flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            {m.libelle}
                                            <Badge className={`text-[10px] ${USAGES[m.usage]?.ton || 'bg-slate-100 text-slate-700'}`}>
                                                {USAGES[m.usage]?.libelle || m.usage}
                                            </Badge>
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{m.pourquoi}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-2xl font-extrabold ${m.manquants > 0 ? (m.bloquant ? 'text-red-600' : 'text-amber-600') : 'text-emerald-600'}`}>
                                            {m.manquants}
                                        </p>
                                        <p className="text-[11px] text-slate-400">à compléter</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Salariés concernés */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2"><Users size={16} className="text-slate-500" /> Salariés concernés</span>
                        <div className="flex gap-1">
                            {[
                                { cle: 'bloquants', libelle: 'Non déclarables' },
                                { cle: 'incomplets', libelle: 'Incomplets' },
                                { cle: 'tous', libelle: 'Tous' }
                            ].map(f => (
                                <button
                                    key={f.cle}
                                    onClick={() => setFiltre(f.cle)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                        filtre === f.cle ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {f.libelle}
                                </button>
                            ))}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 max-h-[26rem] overflow-y-auto">
                        {salaries.length === 0 ? (
                            <p className="p-6 text-sm text-slate-400 text-center">
                                {bilan ? 'Aucun salarié dans cette sélection.' : 'Lecture des dossiers…'}
                            </p>
                        ) : salaries.map(s => (
                            <div key={s.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900">{s.nom}</p>
                                    <p className="text-xs text-slate-500">{s.departement || '—'}</p>
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                                    {s.manquants.length === 0 ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Complet</Badge>
                                    ) : s.manquants.map(m => (
                                        <Badge key={m.champ} className={`text-[10px] ${m.bloquant ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {m.libelle}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Corbeille */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Undo2 size={16} className="text-slate-500" /> Corbeille
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">
                        Supprimer un salarié efface aussi ses paies, ses congés, son dossier médical.
                        Le dossier complet est copié avant suppression et reste restaurable
                        {corbeille ? ` ${corbeille.retentionJours} jours` : ''}.
                    </p>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {!corbeille ? (
                            <p className="p-6 text-sm text-slate-400">Lecture de la corbeille…</p>
                        ) : corbeille.dossiers.length === 0 ? (
                            <p className="p-6 text-sm text-slate-400 text-center">Aucun dossier supprimé.</p>
                        ) : corbeille.dossiers.map(d => (
                            <div key={d.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900">{d.lastName} {d.firstName}</p>
                                    <p className="text-xs text-slate-500">
                                        {d.positionTitle} · {d.department} · {d.relatedCount} ligne(s) liée(s)
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Supprimé le {new Date(d.deletedAt).toLocaleDateString('fr-FR')}
                                        {d.deletedBy ? ` par ${d.deletedBy}` : ''} ·{' '}
                                        <span className={d.joursRestants <= 5 ? 'text-amber-700 font-semibold' : ''}>
                                            {d.joursRestants} jour(s) avant purge
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button size="sm" variant="outline" className="gap-1 text-xs"
                                        disabled={enCours === d.id} onClick={() => restaurer(d)}>
                                        <RotateCcw size={12} /> Restaurer
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                        disabled={enCours === d.id} onClick={() => purger(d)}>
                                        <Trash2 size={12} /> Purger
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
