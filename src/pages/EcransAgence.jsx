import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tv, Copy, ExternalLink, Ban, Store, Coffee } from 'lucide-react';
import { api, listeSure } from '../lib/api.js';

/**
 * Écrans d'agence : un lien par TV, à ouvrir en plein écran dans son navigateur.
 *
 * Le choix « salle du personnel » ou « visible de la clientèle » est exigé à la
 * création : c'est lui qui décide si des prénoms s'affichent en vitrine.
 */

const dateHeure = (d) => (d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

/** Une TV qui n'a rien demandé depuis dix minutes est sans doute éteinte. */
const allumee = (d) => d && Date.now() - new Date(d).getTime() < 10 * 60 * 1000;

export function EcransAgence() {
    const [ecrans, setEcrans] = useState([]);
    const [sites, setSites] = useState([]);
    const [saisie, setSaisie] = useState({ nom: '', workSiteId: '', visibleClientele: null });
    const [message, setMessage] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    const charger = useCallback(async () => {
        try {
            const [resEcrans, resSites] = await Promise.all([api.get('/ecrans'), api.get('/worksites')]);
            setEcrans(listeSure(resEcrans?.data, 'écrans'));
            setSites(listeSure(resSites?.data, 'sites'));
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Lecture des écrans impossible.' });
        }
    }, []);

    useEffect(() => { charger(); }, [charger]);

    const creer = async (evenement) => {
        evenement.preventDefault();
        setEnvoi(true);
        try {
            await api.post('/ecrans', { ...saisie, workSiteId: saisie.workSiteId || null });
            setMessage({ ton: 'ok', texte: "Écran créé. Ouvrez son lien sur la TV, puis passez le navigateur en plein écran (F11)." });
            setSaisie({ nom: '', workSiteId: '', visibleClientele: null });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Création impossible.' });
        } finally {
            setEnvoi(false);
        }
    };

    const revoquer = async (ecran) => {
        if (!window.confirm(`Désactiver « ${ecran.nom} » ? La TV affichera « écran désactivé » à son prochain rafraîchissement.`)) return;
        try {
            const res = await api.post(`/ecrans/${ecran.id}/revoquer`, {});
            setMessage({ ton: 'ok', texte: res?.data?.message || 'Écran désactivé.' });
            charger();
        } catch (err) {
            setMessage({ ton: 'alerte', texte: err.message || 'Désactivation impossible.' });
        }
    };

    const copier = async (lien) => {
        try {
            await navigator.clipboard.writeText(lien);
            setMessage({ ton: 'ok', texte: 'Lien copié.' });
        } catch {
            setMessage({ ton: 'alerte', texte: lien });
        }
    };

    const Choix = ({ valeur, icone: Icone, titre, detail }) => (
        <button type="button" onClick={() => setSaisie((s) => ({ ...s, visibleClientele: valeur }))}
            className={`flex-1 text-left rounded-xl border-2 p-4 transition ${saisie.visibleClientele === valeur ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}>
            <Icone className="w-5 h-5 text-orange-600 mb-2" />
            <p className="font-semibold text-slate-800">{titre}</p>
            <p className="text-xs text-slate-500 mt-1">{detail}</p>
        </button>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Tv className="w-6 h-6 text-orange-600" /> Écrans d'agence</h1>
                <p className="text-slate-500 mt-1">
                    Une TV ou une tablette en agence affiche en boucle les présents du jour, les anniversaires, les annonces et les remerciements.
                </p>
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.ton === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    {message.texte}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Nouvel écran</CardTitle>
                    <CardDescription>Sans site, l'écran montre toute l'entreprise.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={creer} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Nom de l'écran</span>
                                <input value={saisie.nom} onChange={(e) => setSaisie((s) => ({ ...s, nom: e.target.value }))}
                                    placeholder="TV salle de pause — Plateau" required minLength={3}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700">Site</span>
                                <select value={saisie.workSiteId} onChange={(e) => setSaisie((s) => ({ ...s, workSiteId: e.target.value }))}
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 bg-white">
                                    <option value="">Toute l'entreprise</option>
                                    {sites.filter((s) => s.isActive !== false).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </label>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <Choix valeur={false} icone={Coffee} titre="Salle du personnel"
                                detail="Prénoms des présents, anniversaires, remerciements, toutes les annonces, prochaine paie." />
                            <Choix valeur icone={Store} titre="Visible de la clientèle"
                                detail="Aucun nom : le nombre de présents et les annonces de catégorie « Événement » seulement." />
                        </div>
                        <Button type="submit" disabled={envoi || saisie.visibleClientele === null}>
                            {envoi ? 'Création…' : "Créer l'écran"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Écrans</CardTitle></CardHeader>
                <CardContent>
                    {ecrans.length === 0 ? (
                        <p className="text-slate-500 text-sm">Aucun écran pour l'instant.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b">
                                        <th className="py-2 pr-4">Écran</th><th className="py-2 pr-4">Site</th><th className="py-2 pr-4">Mode</th>
                                        <th className="py-2 pr-4">Dernier affichage</th><th className="py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {ecrans.map((e) => (
                                        <tr key={e.id} className={`border-b last:border-0 ${e.revoqueLe ? 'opacity-50' : ''}`}>
                                            <td className="py-3 pr-4 font-medium text-slate-800">{e.nom}</td>
                                            <td className="py-3 pr-4">{e.site?.nom || "Toute l'entreprise"}</td>
                                            <td className="py-3 pr-4">{e.visibleClientele ? 'Vitrine' : 'Personnel'}</td>
                                            <td className="py-3 pr-4">
                                                {e.revoqueLe ? `Désactivé le ${dateHeure(e.revoqueLe)}` : (
                                                    <span className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full ${allumee(e.derniereConsultation) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                        {e.derniereConsultation ? dateHeure(e.derniereConsultation) : 'Jamais ouvert'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-right whitespace-nowrap">
                                                {!e.revoqueLe && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => copier(e.lien)}><Copy className="w-4 h-4 mr-1" /> Lien</Button>
                                                        <Button variant="outline" size="sm" onClick={() => window.open(e.lien, '_blank', 'noopener')}><ExternalLink className="w-4 h-4" /></Button>
                                                        <Button variant="outline" size="sm" onClick={() => revoquer(e)}><Ban className="w-4 h-4 text-rose-600" /></Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
