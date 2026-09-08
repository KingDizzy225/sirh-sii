import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { SignaturePad } from '../components/ui/SignaturePad';
import {
    PenTool, ShieldCheck, Trash2, RefreshCw, Star, Upload, X, KeyRound, Eye
} from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Signataires habilités.
 *
 * Les documents produits par l'application sortaient sans signature : il
 * fallait les imprimer, les signer à la main puis les rescanner avant de les
 * remettre. La signature est enregistrée une fois ici, et apposée à l'émission.
 *
 * Ce qui remplace l'autorité du trait manuscrit n'est pas son image — elle se
 * copie — mais le sceau cryptographique apposé au même moment, qu'un tiers peut
 * vérifier sans rien demander à l'entreprise.
 */

const VIDE = { nom: '', fonction: '', signatureImage: null, cachetImage: null, parDefaut: false };

export function Signataires() {
    const [signataires, setSignataires] = useState([]);
    const [scellement, setScellement] = useState(null);
    const [form, setForm] = useState(VIDE);
    const [message, setMessage] = useState(null);
    const [apercu, setApercu] = useState(null);
    const [verif, setVerif] = useState({ manifeste: '', sceau: '', resultat: null });

    const charger = useCallback(async () => {
        const res = await api.get('/signataires').catch(() => ({ data: null }));
        setSignataires(listeSure(res?.data?.signataires, 'signataires'));
        setScellement(res?.data?.scellement || null);
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const annoncer = (texte, ton = 'info') => {
        setMessage({ texte, ton });
        setTimeout(() => setMessage(null), 9000);
    };

    const lireFichier = (fichier, champ) => {
        if (!fichier) return;
        const lecteur = new FileReader();
        lecteur.onload = () => setForm((f) => ({ ...f, [champ]: lecteur.result }));
        lecteur.readAsDataURL(fichier);
    };

    const enregistrer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/signataires', form);
            setForm(VIDE);
            annoncer('Signataire enregistré. Les prochains documents porteront sa signature.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || "Enregistrement refusé.", 'alerte');
        }
    };

    const basculer = async (s, champ) => {
        try {
            await api.put(`/signataires/${s.id}`, { [champ]: !s[champ] });
            charger();
        } catch (err) {
            annoncer(err.message || 'Modification refusée.', 'alerte');
        }
    };

    const supprimer = async (s) => {
        if (!confirm(`Retirer ${s.nom} de la liste des signataires ?`)) return;
        try {
            await api.delete(`/signataires/${s.id}`);
            annoncer('Signataire retiré.', 'succes');
            charger();
        } catch (err) {
            annoncer(err.message || 'Suppression refusée.', 'alerte');
        }
    };

    const voir = async (s) => {
        const res = await api.get(`/signataires/${s.id}/image`).catch(() => ({ data: null }));
        if (res?.data) setApercu({ ...res.data, nom: s.nom });
    };

    const verifier = async () => {
        try {
            const res = await api.post('/signataires/verification', {
                manifeste: verif.manifeste, sceau: verif.sceau
            });
            setVerif((v) => ({ ...v, resultat: res.data }));
        } catch (err) {
            setVerif((v) => ({ ...v, resultat: { valide: false, motif: err.message } }));
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="border-b border-slate-200 pb-5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <PenTool className="text-indigo-600" /> Signature des documents
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Enregistrez votre signature une fois : les attestations et les courriers sortent signés,
                    sans passer par l'imprimante et le scanner.
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

            {scellement && (
                <div className="flex items-start gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <KeyRound size={17} className="text-slate-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700">
                        <p>
                            Chaque document émis est scellé avec la clé{' '}
                            <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{scellement.keyId}</code>{' '}
                            ({scellement.algorithme}). C'est ce sceau, et non l'image de la signature, qui permet
                            à un tiers de vérifier l'origine du document.
                        </p>
                        {scellement.origineCle === 'base de données' && (
                            <p className="text-amber-800 mt-1">
                                Cette clé est conservée en base de données. Pour une protection supérieure,
                                la déclarer dans <code className="font-mono">SIGNATURE_SEAL_PRIVATE_KEY</code> sur le serveur.
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Enregistrement */}
                <div className="lg:col-span-6">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-base font-bold text-slate-900">Enregistrer un signataire</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5">
                            <form onSubmit={enregistrer} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1">Nom et prénoms</label>
                                        <Input required value={form.nom}
                                            onChange={(e) => setForm({ ...form, nom: e.target.value })}
                                            placeholder="ex. Aya Traoré" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1">Fonction</label>
                                        <Input required value={form.fonction}
                                            onChange={(e) => setForm({ ...form, fonction: e.target.value })}
                                            placeholder="ex. Directrice des ressources humaines" />
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            Elle figure sur le document : sans elle, le destinataire ignore qui engage l'entreprise.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-2">Signature</label>
                                    {form.signatureImage ? (
                                        <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
                                            <img src={form.signatureImage} alt="Signature" className="h-16 bg-white rounded" />
                                            <Button type="button" variant="outline" size="sm"
                                                onClick={() => setForm({ ...form, signatureImage: null })}>
                                                Recommencer
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <SignaturePad onSign={(img) => setForm({ ...form, signatureImage: img })} />
                                            <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                                <Upload size={13} /> ou téléverser une signature numérisée
                                                <input type="file" accept="image/png,image/jpeg" className="hidden"
                                                    onChange={(e) => lireFichier(e.target.files?.[0], 'signatureImage')} />
                                            </label>
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">
                                        Cachet de l'entreprise <span className="text-slate-400 font-normal">(facultatif)</span>
                                    </label>
                                    {form.cachetImage ? (
                                        <div className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50">
                                            <img src={form.cachetImage} alt="Cachet" className="h-16 bg-white rounded" />
                                            <Button type="button" variant="outline" size="sm"
                                                onClick={() => setForm({ ...form, cachetImage: null })}>Retirer</Button>
                                        </div>
                                    ) : (
                                        <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer border border-slate-200 rounded-lg px-3 py-2">
                                            <Upload size={13} /> Téléverser le cachet
                                            <input type="file" accept="image/png,image/jpeg" className="hidden"
                                                onChange={(e) => lireFichier(e.target.files?.[0], 'cachetImage')} />
                                        </label>
                                    )}
                                </div>

                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="checkbox" checked={form.parDefaut}
                                        onChange={(e) => setForm({ ...form, parDefaut: e.target.checked })} />
                                    Signataire proposé par défaut
                                </label>

                                <Button type="submit" disabled={!form.signatureImage}>Enregistrer</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste */}
                <div className="lg:col-span-6 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Signataires habilités</span>
                                <Button variant="outline" size="sm" onClick={charger} className="gap-1 text-xs">
                                    <RefreshCw size={12} /> Actualiser
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100">
                                {signataires.length === 0 ? (
                                    <p className="p-6 text-sm text-slate-400 text-center">
                                        Aucun signataire. Les documents sortiront non signés, et le diront.
                                    </p>
                                ) : signataires.map((s) => (
                                    <div key={s.id} className="p-4 flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                {s.nom}
                                                {s.parDefaut && <Badge className="bg-indigo-100 text-indigo-800 text-[10px]">Par défaut</Badge>}
                                                {!s.actif && <Badge className="bg-slate-200 text-slate-600 text-[10px]">Inactif</Badge>}
                                            </p>
                                            <p className="text-xs text-slate-500">{s.fonction}</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                {s.aCachet ? 'Avec cachet' : 'Sans cachet'}
                                                {s.creePar ? ` · enregistré par ${s.creePar}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button onClick={() => voir(s)} title="Voir la signature"
                                                className="text-slate-400 hover:text-slate-800 bg-transparent border-0 cursor-pointer p-1">
                                                <Eye size={15} />
                                            </button>
                                            <button onClick={() => basculer(s, 'parDefaut')} title="Signataire par défaut"
                                                className={`bg-transparent border-0 cursor-pointer p-1 ${s.parDefaut ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-600'}`}>
                                                <Star size={15} />
                                            </button>
                                            <button onClick={() => basculer(s, 'actif')} title={s.actif ? 'Désactiver' : 'Réactiver'}
                                                className={`bg-transparent border-0 cursor-pointer p-1 ${s.actif ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                <ShieldCheck size={15} />
                                            </button>
                                            <button onClick={() => supprimer(s)} title="Retirer"
                                                className="text-slate-300 hover:text-red-600 bg-transparent border-0 cursor-pointer p-1">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900">Vérifier un sceau</CardTitle>
                            <p className="text-xs text-slate-500 mt-1">
                                Coller le manifeste et le sceau lus sur un document reçu. Rien n'est interrogé
                                en base : la vérification porte sur ce que vous fournissez.
                            </p>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <textarea rows={3} placeholder="Manifeste"
                                value={verif.manifeste}
                                onChange={(e) => setVerif({ ...verif, manifeste: e.target.value, resultat: null })}
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono" />
                            <textarea rows={2} placeholder="Sceau"
                                value={verif.sceau}
                                onChange={(e) => setVerif({ ...verif, sceau: e.target.value, resultat: null })}
                                className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono" />
                            <Button size="sm" onClick={verifier} disabled={!verif.manifeste || !verif.sceau}>
                                Vérifier
                            </Button>
                            {verif.resultat && (
                                <div className={`p-3 rounded-lg border text-xs ${
                                    verif.resultat.valide ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                          : 'bg-red-50 border-red-200 text-red-900'}`}>
                                    <p className="font-semibold">
                                        {verif.resultat.valide ? 'Sceau valide' : 'Sceau invalide'}
                                    </p>
                                    {verif.resultat.motif && <p className="mt-1">{verif.resultat.motif}</p>}
                                    {verif.resultat.document && (
                                        <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px]">
                                            {JSON.stringify(verif.resultat.document, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {apercu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
                    onClick={() => setApercu(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <p className="font-bold text-slate-900">{apercu.nom}</p>
                            <button onClick={() => setApercu(null)}
                                className="text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer">
                                <X size={18} />
                            </button>
                        </div>
                        <img src={apercu.signatureImage} alt="Signature" className="w-full bg-slate-50 rounded-lg p-3" />
                        {apercu.cachetImage && (
                            <img src={apercu.cachetImage} alt="Cachet" className="mt-3 h-28 bg-slate-50 rounded-lg p-3" />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
