import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Building, Factory, Plus, ShieldCheck, ShieldAlert, AlertTriangle,
    RefreshCw, X, Trash2, FileCheck
} from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Personnel externe et conformité des prestataires.
 *
 * Le registre décrivait un prestataire — nom, société, type, dates — et aucune
 * pièce. C'est une exposition invisible : le donneur d'ordre répond
 * financièrement des salariés qu'un sous-traitant n'a pas déclarés, et cela ne
 * se découvre qu'au contrôle, une fois la créance constituée.
 *
 * Une attestation périmée est mise sur le même plan qu'une attestation absente
 * — elles ont la même valeur devant un contrôle — mais nommée différemment,
 * parce qu'elles n'appellent pas la même démarche.
 */

const ETATS = {
    VALIDE: { libelle: 'À jour', ton: 'bg-emerald-100 text-emerald-700' },
    BIENTOT_EXPIREE: { libelle: 'À renouveler', ton: 'bg-amber-100 text-amber-800' },
    EXPIREE: { libelle: 'Périmée', ton: 'bg-red-100 text-red-700' },
    ABSENTE: { libelle: 'Absente', ton: 'bg-slate-200 text-slate-700' },
    SANS_ECHEANCE: { libelle: 'Sans échéance', ton: 'bg-slate-100 text-slate-600' }
};

const dateFr = (v) => (v ? new Date(v).toLocaleDateString('fr-FR') : '—');

export function Subcontractors() {
    const [bilan, setBilan] = useState(null);
    const [pieces, setPieces] = useState([]);
    const [ouvert, setOuvert] = useState(null);
    const [message, setMessage] = useState(null);
    const [form, setForm] = useState({ type: 'CNPS', reference: '', issuedAt: '', expiresAt: '' });

    const charger = useCallback(async () => {
        const [c, p] = await Promise.all([
            api.get('/subcontractors/conformite').catch(() => ({ data: null })),
            api.get('/subcontractors/pieces').catch(() => ({ data: null }))
        ]);
        setBilan(c?.data && Array.isArray(c.data.prestataires) ? c.data : null);
        setPieces(listeSure(p?.data?.pieces, 'pièces attendues'));
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 9000);
    };

    const ouvrirDossier = async (id) => {
        const res = await api.get(`/subcontractors/${id}/documents`).catch(() => ({ data: null }));
        if (res?.data?.id) setOuvert(res.data);
    };

    const creer = async () => {
        const companyName = window.prompt("Société / cabinet ?");
        if (!companyName) return;
        const lastName = window.prompt("Nom du contact ?") || '';
        const firstName = window.prompt("Prénom du contact ?") || '';
        try {
            await api.post('/subcontractors', {
                firstName, lastName, companyName,
                startDate: new Date(), type: 'Freelance'
            });
            annoncer('Prestataire enregistré. Versez ses attestations au dossier.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || 'Création impossible.', 'alerte');
        }
    };

    const verser = async (e) => {
        e.preventDefault();
        if (!ouvert) return;
        try {
            const res = await api.post(`/subcontractors/${ouvert.id}/documents`, {
                type: form.type,
                reference: form.reference || undefined,
                issuedAt: form.issuedAt || undefined,
                expiresAt: form.expiresAt || undefined
            });
            annoncer(res.data?.avertissement || 'Pièce versée au dossier.',
                res.data?.avertissement ? 'alerte' : 'succes');
            setForm({ type: 'CNPS', reference: '', issuedAt: '', expiresAt: '' });
            ouvrirDossier(ouvert.id);
            charger();
        } catch (err) {
            annoncer(err.message || 'Enregistrement refusé.', 'alerte');
        }
    };

    const retirer = async (documentId) => {
        if (!confirm('Retirer cette pièce du dossier ?')) return;
        try {
            await api.delete(`/subcontractors/documents/${documentId}`);
            ouvrirDossier(ouvert.id);
            charger();
        } catch (err) {
            annoncer(err.message || 'Suppression impossible.', 'alerte');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Personnel externe</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Sous-traitants, intérimaires et prestataires — et les pièces qui vous couvrent.
                    </p>
                </div>
                <Button onClick={creer} className="gap-2"><Plus size={16} /> Nouveau prestataire</Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border text-sm ${
                    message.ton === 'alerte' ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : message.ton === 'succes' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {message.texte}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { titre: 'Prestataires couverts', valeur: bilan?.couverts, icone: ShieldCheck, ton: 'text-emerald-600' },
                    { titre: 'Non couverts', valeur: bilan?.decouverts, icone: ShieldAlert, ton: 'text-red-600' },
                    { titre: 'Pièces à renouveler', valeur: bilan?.aRenouveler, icone: AlertTriangle, ton: 'text-amber-600' }
                ].map((c) => (
                    <Card key={c.titre} className="border border-slate-200 shadow-sm bg-white">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{c.titre}</p>
                                <c.icone size={18} className={c.ton} />
                            </div>
                            <p className="text-3xl font-extrabold text-slate-900 mt-2">
                                {c.valeur ?? '—'}
                                {bilan?.total != null && <span className="text-base font-medium text-slate-400"> / {bilan.total}</span>}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-base font-bold flex items-center justify-between text-slate-900">
                        <span className="flex items-center gap-2"><Building size={18} className="text-sky-700" /> Registre du personnel externe</span>
                        <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                            <RefreshCw size={12} /> Actualiser
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                <tr>
                                    <th className="px-6 py-4">Société</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Couverture</th>
                                    <th className="px-6 py-4 text-right">Dossier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!bilan ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Lecture du registre…</td></tr>
                                ) : bilan.prestataires.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Aucun prestataire enregistré.</td></tr>
                                ) : bilan.prestataires.map((p) => (
                                    <tr key={p.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            <span className="flex items-center gap-2"><Factory size={14} className="text-slate-400" /> {p.societe}</span>
                                        </td>
                                        <td className="px-6 py-4">{p.nom || '—'}</td>
                                        <td className="px-6 py-4">{p.type}</td>
                                        <td className="px-6 py-4">
                                            {p.couvert ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Couvert</Badge>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {p.bloquantes.map((b) => (
                                                        <Badge key={b.code} className="bg-red-100 text-red-700 text-[10px]">
                                                            {b.libelle} {b.etat === 'EXPIREE' ? '(périmée)' : '(absente)'}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {p.aRenouveler.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {p.aRenouveler.map((r) => (
                                                        <Badge key={r.code} className="bg-amber-100 text-amber-800 text-[10px]">
                                                            {r.libelle} — {dateFr(r.expireLe)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="outline" size="sm" className="text-xs gap-1"
                                                onClick={() => ouvrirDossier(p.id)}>
                                                <FileCheck size={12} /> Pièces
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {ouvert && (
                <Card className="shadow-sm border-sky-200">
                    <CardHeader className="bg-sky-50/50 border-b border-slate-100">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                            <span>Dossier — {ouvert.societe}</span>
                            <button onClick={() => setOuvert(null)} className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer">
                                <X size={18} />
                            </button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                            {ouvert.pieces.map((p) => (
                                <div key={p.code} className="p-3 flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {p.libelle}
                                            {!p.exigee && <span className="text-[10px] font-normal text-slate-400 ml-2">(facultative)</span>}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{p.pourquoi}</p>
                                        {p.expireLe && (
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {p.reference ? `${p.reference} · ` : ''}délivrée le {dateFr(p.delivreeLe)} · expire le {dateFr(p.expireLe)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Badge className={`text-[10px] ${ETATS[p.etat]?.ton || ''}`}>
                                            {ETATS[p.etat]?.libelle || p.etat}
                                        </Badge>
                                        {p.documentId && (
                                            <button onClick={() => retirer(p.documentId)}
                                                className="text-slate-300 hover:text-red-600 bg-transparent border-0 cursor-pointer">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={verser} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                            <div className="sm:col-span-2">
                                <label className="text-xs font-medium text-slate-700 block mb-1">Pièce</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                                    {pieces.map((p) => <option key={p.code} value={p.code}>{p.libelle}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">Référence</label>
                                <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} className="text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">Délivrée le</label>
                                <Input type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} className="text-sm" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700 block mb-1">Expire le</label>
                                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="text-sm" />
                            </div>
                            <div className="sm:col-span-5">
                                <Button type="submit" size="sm">Verser au dossier</Button>
                                <span className="text-[11px] text-slate-500 ml-3">
                                    Sans date d'expiration, elle est déduite de la durée de validité usuelle — et signalée comme telle.
                                </span>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
