import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table2, Play, Download, Plus, X, ShieldAlert } from 'lucide-react';
import { api, listeSure } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Requêteur : listes et exports à la demande.
 *
 * Les tableaux de bord sont figés. Une RH a pourtant besoin, plusieurs fois par
 * mois, d'une liste qu'aucun écran ne propose — telles colonnes, tel filtre,
 * exportée dans un tableur. Sans cet outil, chaque demande passe par un
 * développeur, et la plupart n'aboutissent jamais.
 */

const valeurAffichee = (v) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        return new Date(v).toLocaleDateString('fr-FR');
    }
    if (typeof v === 'number') return new Intl.NumberFormat('fr-FR').format(v);
    return String(v);
};

export function Requeteur() {
    const [catalogue, setCatalogue] = useState({ sujets: [], operateurs: [] });
    const [sujet, setSujet] = useState('');
    const [colonnes, setColonnes] = useState([]);
    const [filtres, setFiltres] = useState([]);
    const [resultat, setResultat] = useState(null);
    const [message, setMessage] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const { token } = useAuth();

    const charger = useCallback(async () => {
        const res = await api.get('/requeteur/catalogue').catch(() => ({ data: null }));
        const sujets = listeSure(res?.data?.sujets, 'sujets');
        setCatalogue({ sujets, operateurs: listeSure(res?.data?.operateurs, 'opérateurs') });
        if (sujets.length > 0 && !sujet) {
            setSujet(sujets[0].code);
            setColonnes(sujets[0].parDefaut);
        }
    }, [sujet]);

    useEffect(() => { charger(); }, [charger]);

    const definition = catalogue.sujets.find((s) => s.code === sujet);

    const changerSujet = (code) => {
        const s = catalogue.sujets.find((x) => x.code === code);
        setSujet(code);
        setColonnes(s ? s.parDefaut : []);
        setFiltres([]);
        setResultat(null);
    };

    const basculerColonne = (cle) =>
        setColonnes((c) => (c.includes(cle) ? c.filter((x) => x !== cle) : [...c, cle]));

    const corps = () => ({ sujet, colonnes, filtres: filtres.filter((f) => f.colonne && f.operateur) });

    const executer = async () => {
        setEnCours(true);
        try {
            const res = await api.post('/requeteur/executer', corps());
            setResultat(res.data);
            setMessage(null);
        } catch (err) {
            setMessage(err.message || 'Requête refusée.');
            setResultat(null);
        } finally {
            setEnCours(false);
        }
    };

    const exporter = async () => {
        try {
            const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const racine = base.endsWith('/api') ? base.slice(0, -4) : base;
            const res = await fetch(`${racine}/api/requeteur/exporter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(corps())
            });
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                setMessage(detail.error || "Export impossible.");
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export_${sujet}.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setMessage('Erreur : ' + (err.message || ''));
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Table2 className="text-slate-700" /> Listes et exports
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Vos colonnes, vos filtres, votre tableur — sans passer par un développeur.
                </p>
            </div>

            {message && (
                <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 text-sm">{message}</div>
            )}

            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-900">Ce que vous cherchez</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                    <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1">Sujet</label>
                        <select value={sujet} onChange={(e) => changerSujet(e.target.value)}
                            className="w-full sm:w-80 border border-slate-200 rounded-lg p-2 text-sm">
                            {catalogue.sujets.map((s) => <option key={s.code} value={s.code}>{s.libelle}</option>)}
                        </select>
                    </div>

                    {definition && (
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-2">Colonnes</label>
                            <div className="flex flex-wrap gap-2">
                                {definition.colonnes.map((c) => (
                                    <button key={c.cle} type="button" onClick={() => basculerColonne(c.cle)}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                            colonnes.includes(c.cle)
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                                        {c.libelle}
                                        {c.sensible && <span className="ml-1 text-amber-400">•</span>}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-2">
                                Le point orange signale une donnée sensible — rémunération, coordonnées bancaires.
                            </p>
                        </div>
                    )}

                    {definition && (
                        <div>
                            <label className="text-xs font-medium text-slate-700 block mb-2">Filtres</label>
                            <div className="space-y-2">
                                {filtres.map((f, i) => (
                                    <div key={i} className="flex flex-wrap gap-2 items-center">
                                        <select value={f.colonne}
                                            onChange={(e) => setFiltres(filtres.map((x, j) => j === i ? { ...x, colonne: e.target.value } : x))}
                                            className="border border-slate-200 rounded-lg p-2 text-sm">
                                            <option value="">Colonne…</option>
                                            {definition.colonnes.map((c) => <option key={c.cle} value={c.cle}>{c.libelle}</option>)}
                                        </select>
                                        <select value={f.operateur}
                                            onChange={(e) => setFiltres(filtres.map((x, j) => j === i ? { ...x, operateur: e.target.value } : x))}
                                            className="border border-slate-200 rounded-lg p-2 text-sm">
                                            {catalogue.operateurs.map((o) => <option key={o.code} value={o.code}>{o.libelle}</option>)}
                                        </select>
                                        {!['vide', 'nonVide'].includes(f.operateur) && (
                                            <Input value={f.valeur || ''} placeholder="Valeur"
                                                onChange={(e) => setFiltres(filtres.map((x, j) => j === i ? { ...x, valeur: e.target.value } : x))}
                                                className="w-48 text-sm" />
                                        )}
                                        <button type="button" onClick={() => setFiltres(filtres.filter((_, j) => j !== i))}
                                            className="text-slate-300 hover:text-red-600 bg-transparent border-0 cursor-pointer">
                                            <X size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" className="mt-2 gap-1 text-xs"
                                onClick={() => setFiltres([...filtres, { colonne: '', operateur: 'egal', valeur: '' }])}>
                                <Plus size={12} /> Ajouter un filtre
                            </Button>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <Button onClick={executer} disabled={enCours || !sujet} className="gap-2">
                            <Play size={15} /> {enCours ? 'Recherche…' : 'Afficher'}
                        </Button>
                        <Button variant="outline" onClick={exporter} disabled={!resultat} className="gap-2">
                            <Download size={15} /> Exporter en CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {resultat && (
                <Card className="border border-slate-200 shadow-sm bg-white">
                    <CardHeader className="p-5 border-b border-slate-100">
                        <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between gap-3 flex-wrap">
                            <span>{resultat.sujet} — {resultat.total} ligne(s)</span>
                            {resultat.sensible && (
                                <Badge className="bg-amber-100 text-amber-800 text-[10px] gap-1">
                                    <ShieldAlert size={11} /> Données sensibles
                                </Badge>
                            )}
                        </CardTitle>
                        {resultat.tronque && (
                            <p className="text-xs text-amber-700 mt-1">
                                Affichage limité à {resultat.plafond} lignes sur {resultat.total}. Affinez les filtres
                                pour un export complet.
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                    <tr>
                                        {resultat.colonnes.map((c) => (
                                            <th key={c.cle} className="px-4 py-3 whitespace-nowrap">{c.libelle}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultat.lignes.length === 0 ? (
                                        <tr>
                                            <td colSpan={resultat.colonnes.length} className="px-4 py-8 text-center text-slate-400">
                                                Aucune ligne ne correspond.
                                            </td>
                                        </tr>
                                    ) : resultat.lignes.map((l, i) => (
                                        <tr key={i} className="bg-white border-b hover:bg-slate-50">
                                            {resultat.colonnes.map((c) => (
                                                <td key={c.cle} className="px-4 py-2 whitespace-nowrap">
                                                    {valeurAffichee(l[c.cle])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
