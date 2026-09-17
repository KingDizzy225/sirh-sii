import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GraduationCap, Users, Lock } from 'lucide-react';
import { useIdentite, logoUrl, degradeMarque } from '../lib/identite.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Écran projeté dans la salle de formation : le QR d'émargement, qui change
 * toutes les trente secondes, et le nombre de présents.
 */
export function EcranEmargement() {
    const { token } = useParams();
    const [etat, setEtat] = useState(null);
    const [erreur, setErreur] = useState(null);
    const identite = useIdentite();

    useEffect(() => {
        let actif = true;
        const charger = async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/emargements/${token}/code`, { cache: 'no-store' });
                const corps = await res.json().catch(() => null);
                if (!actif) return;
                if (res.ok && corps && corps.titre) { setEtat(corps); setErreur(null); }
                else if (res.status === 404) setErreur('Émargement inconnu.');
            } catch { /* coupure : on garde le dernier QR */ }
        };
        charger();
        const minuterie = setInterval(charger, 8000);
        return () => { actif = false; clearInterval(minuterie); };
    }, [token]);

    if (erreur) return <div className="h-screen flex items-center justify-center text-3xl text-slate-500">{erreur}</div>;
    if (!etat) return <div className="h-screen flex items-center justify-center"><span className="animate-spin h-14 w-14 border-4 border-sky-500 border-t-transparent rounded-full" /></div>;

    return (
        <div className="h-screen w-screen text-white flex flex-col items-center justify-center p-10 gap-8 cursor-none" style={{ background: degradeMarque(identite) }}>
            <div className="flex items-center gap-4">
                {logoUrl(identite) && <img src={logoUrl(identite)} alt="" className="h-16 w-16 object-contain bg-white rounded-2xl p-1" />}
                <p className="text-2xl uppercase tracking-[0.3em] opacity-90">{etat.organisation}</p>
            </div>
            <h1 className="text-6xl font-black text-center flex items-center gap-4"><GraduationCap className="w-16 h-16" /> {etat.titre}</h1>
            <p className="text-2xl opacity-90">Formateur : {etat.formateur}</p>
            {etat.ouverte ? (
                <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center gap-4 shadow-2xl">
                    <img src={etat.qr} alt="" className="w-[28rem] h-[28rem]" />
                    <p className="text-slate-900 text-3xl font-bold">Scannez à l'arrivée et au départ</p>
                </div>
            ) : (
                <p className="text-4xl flex items-center gap-3 bg-white/15 rounded-3xl px-10 py-8"><Lock className="w-10 h-10" /> Émargement fermé</p>
            )}
            <p className="text-3xl flex items-center gap-3"><Users className="w-9 h-9" /> {etat.presents} présent{etat.presents > 1 ? 's' : ''}</p>
        </div>
    );
}
