import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    ClipboardList, Sparkles, FileDown, Save, RefreshCw, Plus, AlertTriangle
} from 'lucide-react';
import { api, listeSure } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Fiches de poste, à la trame en usage dans l'entreprise.
 *
 * L'application produisait un bloc de texte libre : ni structure, ni PDF, ni
 * rattachement au salarié. Les fiches continuaient donc d'être rédigées dans un
 * traitement de texte, imprimées, signées à la main, puis classées.
 *
 * L'ordre des rubriques est celui des fiches existantes. Ce n'est pas
 * cosmétique : c'est l'ordre que les salariés et les managers ont l'habitude de
 * parcourir.
 */

const LISTES = [
    { cle: 'taches', libelle: 'Tâches et attributions' },
    { cle: 'moyensTechniques', libelle: 'Moyens techniques mis à disposition' },
    { cle: 'savoir', libelle: 'Savoir' },
    { cle: 'savoirFaire', libelle: 'Savoir-faire' },
    { cle: 'savoirEtre', libelle: 'Savoir-être' },
    { cle: 'risquesPoste', libelle: "À quoi s'expose-t-on lorsque le poste est mal tenu" },
    { cle: 'risquesMateriel', libelle: "À quoi s'expose-t-on lorsque le matériel est mal tenu" }
];

const VIDE = {
    title: '', department: '', employeeId: '', direction: '', lieu: '', categorie: '',
    superieurHierarchique: '', dateDebut: '', mission: '',
    relationsInterne: '', relationsExterne: '',
    rapportsDestinataires: '', rapportsFrequences: '', formation: '',
    taches: '', moyensTechniques: '', savoir: '', savoirFaire: '', savoirEtre: '',
    risquesPoste: '', risquesMateriel: ''
};

const enTexte = (v) => (Array.isArray(v) ? v.join('\n') : (v || ''));

export function FichesPoste() {
    const [fiches, setFiches] = useState([]);
    const [salaries, setSalaries] = useState([]);
    const [signataires, setSignataires] = useState([]);
    const [form, setForm] = useState(VIDE);
    const [ficheId, setFicheId] = useState(null);
    const [message, setMessage] = useState(null);
    const [enCours, setEnCours] = useState(false);
    const [visas, setVisas] = useState({ DE: '', DRH: '', AG: '' });
    const { token } = useAuth();

    const charger = useCallback(async () => {
        const [f, e, s] = await Promise.all([
            api.get('/job-descriptions').catch(() => ({ data: null })),
            api.get('/employees').catch(() => ({ data: null })),
            api.get('/signataires').catch(() => ({ data: null }))
        ]);
        setFiches(listeSure(f?.data, 'fiches de poste').filter((x) => x.mission));
        setSalaries(listeSure(e?.data, 'effectif').filter((x) => x.status !== 'TERMINATED'));
        setSignataires(listeSure(s?.data?.signataires, 'signataires').filter((x) => x.actif));
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 10000);
    };

    const maj = (cle, valeur) => setForm((f) => ({ ...f, [cle]: valeur }));

    const ouvrir = (fiche) => {
        setFicheId(fiche.id);
        setForm({
            ...VIDE,
            ...Object.fromEntries(Object.keys(VIDE).map((k) => [k, enTexte(fiche[k])])),
            dateDebut: fiche.dateDebut ? String(fiche.dateDebut).slice(0, 10) : '',
            employeeId: fiche.employeeId || ''
        });
    };

    const proposer = async () => {
        if (!form.title) { annoncer("Indiquez d'abord l'intitulé du poste."); return; }
        setEnCours(true);
        try {
            const res = await api.post('/job-descriptions/proposer', {
                title: form.title, department: form.department || form.direction,
                superieurHierarchique: form.superieurHierarchique,
                lieu: form.lieu, categorie: form.categorie
            });
            const p = res.data?.proposition || {};
            setForm((f) => ({
                ...f,
                ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, enTexte(v)]))
            }));
            annoncer(res.data?.avertissement || 'Proposition reçue.', 'alerte');
        } catch (err) {
            annoncer(err.message || 'Proposition impossible.', 'alerte');
        } finally {
            setEnCours(false);
        }
    };

    const enregistrer = async (e) => {
        e.preventDefault();
        try {
            const charge = { ...form };
            if (!charge.employeeId) delete charge.employeeId;
            const res = ficheId
                ? await api.put(`/job-descriptions/${ficheId}/fiche`, charge)
                : await api.post('/job-descriptions/fiche', charge);
            setFicheId(res.data?.id || ficheId);
            annoncer('Fiche enregistrée.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || 'Enregistrement refusé.', 'alerte');
        }
    };

    const telecharger = async () => {
        if (!ficheId) { annoncer("Enregistrez la fiche avant de la produire."); return; }
        const demandes = Object.entries(visas)
            .filter(([, id]) => id)
            .map(([code, id]) => `${code}=${id}`).join(',');
        try {
            const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const racine = base.endsWith('/api') ? base.slice(0, -4) : base;
            const res = await fetch(
                `${racine}/api/job-descriptions/${ficheId}/pdf${demandes ? `?visas=${encodeURIComponent(demandes)}` : ''}`,
                { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                annoncer(detail.error || 'Production impossible.', 'alerte');
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fiche_de_poste_${form.title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            annoncer('Erreur : ' + (err.message || ''), 'alerte');
        }
    };

    const champ = (cle, libelle, options = {}) => (
        <div className={options.large ? 'sm:col-span-2' : ''}>
            <label className="text-xs font-medium text-slate-700 block mb-1">{libelle}</label>
            {options.lignes ? (
                <textarea rows={options.lignes} value={form[cle]}
                    onChange={(e) => maj(cle, e.target.value)}
                    placeholder={options.placeholder}
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm" />
            ) : (
                <Input value={form[cle]} onChange={(e) => maj(cle, e.target.value)}
                    placeholder={options.placeholder} />
            )}
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardList className="text-blue-600" /> Fiches de poste
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        À la trame de l'entreprise, signées à l'émission — sans passer par le traitement de texte.
                    </p>
                </div>
                <Button variant="outline" onClick={() => { setForm(VIDE); setFicheId(null); }} className="gap-2">
                    <Plus size={16} /> Nouvelle fiche
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border text-sm ${
                    message.ton === 'alerte' ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : message.ton === 'succes' ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                    {message.texte}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Fiches existantes</span>
                                <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                                    <RefreshCw size={12} /> Actualiser
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto">
                                {fiches.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-400 text-center">Aucune fiche enregistrée.</p>
                                ) : fiches.map((f) => (
                                    <button key={f.id} onClick={() => ouvrir(f)}
                                        className={`w-full text-left p-4 hover:bg-slate-50 border-0 bg-transparent cursor-pointer ${
                                            ficheId === f.id ? 'bg-blue-50/60' : ''}`}>
                                        <p className="text-sm font-bold text-slate-900">{f.title}</p>
                                        <p className="text-xs text-slate-500">{f.direction || f.department}</p>
                                        {f.salarieNom && (
                                            <Badge className="bg-slate-100 text-slate-700 text-[10px] mt-1">{f.salarieNom}</Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <form onSubmit={enregistrer} className="space-y-6">
                        <Card className="border border-slate-200 shadow-sm bg-white">
                            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                    <span>En-tête</span>
                                    <Button type="button" variant="outline" size="sm" disabled={enCours}
                                        onClick={proposer} className="gap-1 text-xs">
                                        <Sparkles size={12} /> {enCours ? 'Rédaction…' : 'Proposer le contenu'}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-medium text-slate-700 block mb-1">
                                        Collaborateur <span className="text-slate-400 font-normal">(facultatif — une fiche peut être générique)</span>
                                    </label>
                                    <select value={form.employeeId} onChange={(e) => maj('employeeId', e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                                        <option value="">Aucun — fiche de poste générique</option>
                                        {salaries.map((s) => (
                                            <option key={s.id} value={s.id}>{s.lastName} {s.firstName} — {s.positionTitle}</option>
                                        ))}
                                    </select>
                                </div>
                                {champ('title', 'Intitulé du poste')}
                                {champ('direction', 'Direction')}
                                {champ('lieu', 'Lieu')}
                                {champ('categorie', 'Catégorie')}
                                {champ('superieurHierarchique', 'Supérieur hiérarchique direct')}
                                <div>
                                    <label className="text-xs font-medium text-slate-700 block mb-1">Date de début</label>
                                    <Input type="date" value={form.dateDebut} onChange={(e) => maj('dateDebut', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm bg-white">
                            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold text-slate-900">Contenu</CardTitle>
                                <p className="text-xs text-slate-500 mt-1">
                                    Dans les listes, une ligne par élément.
                                </p>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {champ('mission', 'Description et mission(s) principale(s)', { lignes: 3, large: true })}
                                {LISTES.slice(0, 2).map((l) => (
                                    <React.Fragment key={l.cle}>{champ(l.cle, l.libelle, { lignes: 5, large: true })}</React.Fragment>
                                ))}
                                {champ('relationsInterne', 'Relations — interne', { lignes: 2 })}
                                {champ('relationsExterne', 'Relations — externe', { lignes: 2 })}
                                {champ('rapportsDestinataires', "Rapports d'activités — destinataires", { lignes: 2 })}
                                {champ('rapportsFrequences', "Rapports d'activités — fréquences", { lignes: 2 })}
                                {LISTES.slice(2, 5).map((l) => (
                                    <React.Fragment key={l.cle}>{champ(l.cle, l.libelle, { lignes: 4 })}</React.Fragment>
                                ))}
                                {champ('formation', 'Formation / Diplôme / Expérience', { lignes: 2, large: true })}
                                {LISTES.slice(5).map((l) => (
                                    <React.Fragment key={l.cle}>{champ(l.cle, l.libelle, { lignes: 4 })}</React.Fragment>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm bg-white">
                            <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold text-slate-900">Visas</CardTitle>
                                <p className="text-xs text-slate-500 mt-1">
                                    Un visa laissé vide reste vierge sur la fiche, pour une signature manuscrite.
                                    Les trois ne sont pas toujours apposés le même jour.
                                </p>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['DE', 'DRH', 'AG'].map((code) => (
                                    <div key={code}>
                                        <label className="text-xs font-medium text-slate-700 block mb-1">{code}</label>
                                        <select value={visas[code]}
                                            onChange={(e) => setVisas({ ...visas, [code]: e.target.value })}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                                            <option value="">Laisser vierge</option>
                                            {signataires.map((s) => (
                                                <option key={s.id} value={s.id}>{s.nom} — {s.fonction}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                                {signataires.length === 0 && (
                                    <p className="sm:col-span-3 flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                        Aucun signataire enregistré : les trois visas sortiront vierges.
                                        Ils s'enregistrent dans « Signature des documents ».
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex flex-wrap gap-3 justify-end">
                            <Button type="submit" className="gap-2"><Save size={16} /> Enregistrer</Button>
                            <Button type="button" variant="outline" onClick={telecharger} disabled={!ficheId} className="gap-2">
                                <FileDown size={16} /> Télécharger la fiche
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
