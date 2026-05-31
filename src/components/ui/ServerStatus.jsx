import React, { useState, useEffect } from 'react';
import { Server, Activity, ServerOff } from 'lucide-react';
import { api } from '../../lib/api';

export function ServerStatus({ minimal = false }) {
    const [status, setStatus] = useState('checking'); // checking, online, offline
    
    useEffect(() => {
        let active = true;
        let timer;
        const checkHealth = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const healthUrl = API_URL.endsWith('/api') ? `${API_URL}/health` : `${API_URL}/api/health`;
                
                // Utilisation de fetch direct avec cache-busting
                const res = await fetch(`${healthUrl}?t=${Date.now()}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('Serveur injoignable');
                
                if (active) {
                    setStatus('online');
                    // Si connecté, revérifier dans 60 secondes
                    timer = setTimeout(checkHealth, 60000);
                }
            } catch (error) {
                if (active) {
                    setStatus('offline');
                    // Si hors ligne (ou en cours de réveil), vérifier toutes les 5 secondes
                    timer = setTimeout(checkHealth, 5000);
                }
            }
        };

        checkHealth();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, []);

    if (minimal) {
        return (
            <div className="flex items-center gap-2 text-xs font-medium" title={status === 'online' ? 'Serveur Connecté' : status === 'offline' ? 'Serveur Hors Ligne' : 'Réveil du Serveur...'}>
                {status === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                {status === 'offline' && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />}
                {status === 'checking' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
            </div>
        );
    }

    // Version complète (pour la page de login)
    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            status === 'online' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' :
            status === 'offline' ? 'bg-rose-50/50 border-rose-100 text-rose-700' :
            'bg-amber-50/50 border-amber-100 text-amber-700'
        }`}>
            <div className="p-2 bg-white rounded-lg shadow-sm">
                {status === 'online' && <Activity size={18} className="text-emerald-600" />}
                {status === 'offline' && <ServerOff size={18} className="text-rose-600" />}
                {status === 'checking' && <Server size={18} className="text-amber-600 animate-pulse" />}
            </div>
            
            <div className="flex flex-col">
                <span className="text-sm font-bold">
                    {status === 'online' ? 'Serveur Connecté' :
                     status === 'offline' ? 'Serveur Hors Ligne' :
                     'Démarrage du Serveur...'}
                </span>
                <span className="text-xs opacity-80">
                    {status === 'online' ? 'La connexion est stable et instantanée.' :
                     status === 'offline' ? 'Impossible de joindre la base de données.' :
                     'Render sort de veille (jusqu\'à 50s d\'attente).'}
                </span>
            </div>
        </div>
    );
}
