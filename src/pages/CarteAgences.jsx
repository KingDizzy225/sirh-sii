import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Users, AlertTriangle, RefreshCw, Store } from 'lucide-react';
import { api } from '../lib/api.js';

/**
 * Carte des agences : le réseau d'un coup d'œil.
 *
 * Les fonds de carte viennent d'OpenStreetMap. Ils ne se chargent qu'à
 * l'ouverture de l'écran et sont mis en cache par le navigateur ; la page se
 * rafraîchit toutes les deux minutes sans recharger la carte, seulement les
 * chiffres.
 */

const RAFRAICHISSEMENT_MS = 120000;
const COULEURS = { OUVERT: '#10b981', SANS_PRESENCE: '#f59e0b', INACTIF: '#94a3b8' };
const LIBELLES = { OUVERT: 'Ouvert', SANS_PRESENCE: 'Personne sur place', INACTIF: 'Aucun pointage récent' };
const heure = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

/** Pastille dont la taille suit le nombre de présents. */
function icone(site) {
    const taille = Math.min(56, 28 + site.nombrePresents * 3);
    const couleur = COULEURS[site.etat];
    return L.divIcon({
        className: '',
        iconSize: [taille, taille],
        iconAnchor: [taille / 2, taille / 2],
        html: `<div style="width:${taille}px;height:${taille}px;border-radius:50%;background:${couleur};border:3px solid white;
            box-shadow:0 2px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:white;
            font-weight:800;font-size:${taille > 40 ? 16 : 13}px;font-family:system-ui">${site.nombrePresents}</div>`
    });
}

export function CarteAgences() {
    const conteneur = useRef(null);
    const carte = useRef(null);
    const calque = useRef(null);
    const [etat, setEtat] = useState(null);
    const [selection, setSelection] = useState(null);
    const [erreur, setErreur] = useState(null);

    const charger = useCallback(async () => {
        try {
            const res = await api.get('/worksites/carte');
            if (res?.data && Array.isArray(res.data.sites)) {
                setEtat(res.data);
                setErreur(null);
            }
        } catch (err) {
            setErreur(err.message || 'État des sites indisponible.');
        }
    }, []);

    useEffect(() => {
        charger();
        const minuterie = setInterval(charger, RAFRAICHISSEMENT_MS);
        return () => clearInterval(minuterie);
    }, [charger]);

    // Création unique de la carte, centrée sur la Côte d'Ivoire.
    useEffect(() => {
        if (!conteneur.current || carte.current) return undefined;
        carte.current = L.map(conteneur.current, { zoomControl: true }).setView([7.54, -5.55], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; contributeurs OpenStreetMap'
        }).addTo(carte.current);
        calque.current = L.layerGroup().addTo(carte.current);
        return () => { carte.current?.remove(); carte.current = null; };
    }, []);

    // Marqueurs, redessinés à chaque rafraîchissement des chiffres.
    useEffect(() => {
        if (!carte.current || !calque.current || !etat) return;
        calque.current.clearLayers();
        const points = [];
        for (const site of etat.sites) {
            const marqueur = L.marker([site.latitude, site.longitude], { icon: icone(site), title: site.nom });
            marqueur.on('click', () => setSelection(site.id));
            marqueur.addTo(calque.current);
            L.circle([site.latitude, site.longitude], {
                radius: site.rayonMetres, color: COULEURS[site.etat], weight: 1, fillOpacity: 0.08
            }).addTo(calque.current);
            points.push([site.latitude, site.longitude]);
        }
        if (points.length > 0 && !carte.current._ajuste) {
            carte.current.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
            carte.current._ajuste = true;
        }
    }, [etat]);

    const site = etat?.sites.find((s) => s.id === selection) || null;

    const centrer = (s) => {
        setSelection(s.id);
        carte.current?.flyTo([s.latitude, s.longitude], 14, { duration: 0.8 });
    };

    return (
        <div className="space-y-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-6 h-6 text-orange-600" /> Carte des agences</h1>
                    <p className="text-slate-500 mt-1">Qui est sur place en ce moment, site par site, d'après les pointages du jour.</p>
                </div>
                <button onClick={charger} className="flex items-center gap-2 text-sm text-slate-600 bg-white border rounded-lg px-3 py-2 hover:bg-slate-50">
                    <RefreshCw className="w-4 h-4" /> {etat ? `Mis à jour à ${heure(etat.genereLe)}` : 'Actualiser'}
                </button>
            </div>

            {erreur && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{erreur}</div>}

            {etat && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        ['Présents maintenant', etat.totaux.presents, Users, 'text-emerald-600'],
                        ['Sites ouverts', `${etat.totaux.ouverts} / ${etat.totaux.sites}`, Store, 'text-orange-600'],
                        ['Hors périmètre aujourd\'hui', etat.totaux.horsPerimetre, AlertTriangle, 'text-amber-600'],
                        ['Présents sans site', etat.sansSite.presents, MapPin, 'text-slate-500']
                    ].map(([libelle, valeur, Icone, couleur]) => (
                        <Card key={libelle}><CardContent className="p-4">
                            <Icone className={`w-5 h-5 ${couleur}`} />
                            <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{valeur}</p>
                            <p className="text-xs text-slate-500">{libelle}</p>
                        </CardContent></Card>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-[1fr_340px] gap-4">
                <div className="relative rounded-2xl overflow-hidden border bg-slate-100 h-[520px] lg:h-[640px]">
                    <div ref={conteneur} className="absolute inset-0 z-0" />
                    <div className="absolute bottom-3 left-3 z-[400] bg-white/95 rounded-lg shadow px-3 py-2 text-xs space-y-1">
                        {Object.entries(LIBELLES).map(([cle, libelle]) => (
                            <p key={cle} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: COULEURS[cle] }} /> {libelle}</p>
                        ))}
                    </div>
                    {etat && etat.sites.length === 0 && (
                        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/80 text-slate-600 text-center p-6">
                            Aucun site actif. Déclarez vos agences et leurs coordonnées dans les paramètres de pointage.
                        </div>
                    )}
                </div>

                <Card className="h-[520px] lg:h-[640px] overflow-hidden flex flex-col">
                    {site ? (
                        <CardContent className="p-5 overflow-y-auto">
                            <button onClick={() => setSelection(null)} className="text-xs text-slate-500 hover:text-slate-800 mb-3">← Tous les sites</button>
                            <h2 className="text-xl font-bold text-slate-900">{site.nom}</h2>
                            <p className="text-sm mt-1" style={{ color: COULEURS[site.etat] }}>{LIBELLES[site.etat]}</p>
                            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                <div className="bg-slate-50 rounded-lg p-2"><p className="text-lg font-bold">{site.nombrePresents}</p><p className="text-[11px] text-slate-500">présents</p></div>
                                <div className="bg-slate-50 rounded-lg p-2"><p className="text-lg font-bold">{site.effectifHabituel}</p><p className="text-[11px] text-slate-500">habituels (30 j)</p></div>
                                <div className="bg-slate-50 rounded-lg p-2"><p className={`text-lg font-bold ${site.horsPerimetre ? 'text-amber-600' : ''}`}>{site.horsPerimetre}</p><p className="text-[11px] text-slate-500">hors périmètre</p></div>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-700 mt-5 mb-2">Sur place</h3>
                            {site.presents.length === 0 ? (
                                <p className="text-sm text-slate-500">Personne n'est pointé sur ce site en ce moment.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {site.presents.map((p) => (
                                        <li key={p.employeeId} className="flex items-center justify-between text-sm">
                                            <span><span className="font-medium text-slate-800">{p.nom}</span>{p.fonction && <span className="block text-xs text-slate-500">{p.fonction}</span>}</span>
                                            <span className="text-xs text-slate-500">depuis {heure(p.arrivee)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    ) : (
                        <CardContent className="p-0 overflow-y-auto">
                            {(etat?.sites || []).slice().sort((a, b) => b.nombrePresents - a.nombrePresents).map((s) => (
                                <button key={s.id} onClick={() => centrer(s)} className="w-full flex items-center justify-between px-5 py-3 border-b hover:bg-slate-50 text-left">
                                    <span className="flex items-center gap-3">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: COULEURS[s.etat] }} />
                                        <span>
                                            <span className="font-medium text-slate-800 block">{s.nom}</span>
                                            {s.horsPerimetre > 0 && <span className="text-xs text-amber-700">{s.horsPerimetre} pointage(s) hors périmètre</span>}
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold tabular-nums text-slate-700">{s.nombrePresents}<span className="text-slate-400 font-normal"> / {s.effectifHabituel}</span></span>
                                </button>
                            ))}
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
