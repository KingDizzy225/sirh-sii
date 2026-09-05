import React, { createContext, useState, useContext, useEffect } from 'react';
import { DEMO_TOKEN } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// L'écran de connexion est toujours affiché : aucune session n'est ouverte
// automatiquement. Tant que VITE_DEMO_MODE ne vaut pas "false", un bouton
// « accès démonstration » reste proposé sur cet écran, pour ne jamais se
// retrouver bloqué si les comptes de test ne sont pas encore en base.
// En production réelle : VITE_DEMO_MODE="false" fait disparaître ce bouton.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

const DEMO_USER = {
    id: 'demo-admin-id',
    name: 'Ibrahim Diop',
    firstName: 'Ibrahim',
    lastName: 'Diop',
    email: 'admin@entreprise.com',
    role: 'Administrator',
    department: 'Ressources Humaines',
    positionTitle: 'Directeur RH'
};
// Compte réel utilisé par l'accès démonstration. Le bouton ouvrait auparavant
// une session au jeton fictif : le serveur le rejetait, et toutes les requêtes
// répondaient 401. Les pages passant par `lib/api.js` retombaient sur les jeux
// de démonstration et paraissaient fonctionner ; celles qui appellent `fetch`
// directement recevaient l'objet `{ error }` et le plaçaient dans un état de
// liste, d'où « x.filter is not a function » sur une grande partie des modules.
//
// En se connectant pour de bon, la démonstration emprunte exactement le même
// chemin qu'un utilisateur réel — ce qui la rend aussi plus fidèle en clientèle.
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'admin@sirh.com';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'SIIRH';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Au chargement, restaurer la session existante
        try {
            const savedToken = localStorage.getItem('sirh_token');
            const savedUser = localStorage.getItem('sirh_user');

            if (savedToken && savedUser && savedUser !== 'undefined') {
                // Le jeton fictif n'est jamais restauré. Le serveur le refuse,
                // et une session ouverte avec lui laissait l'application dans un
                // état où chaque requête répondait 401 sans que rien ne le
                // signale : l'utilisateur restait « connecté » devant des
                // modules en erreur. L'accès démonstration ouvre désormais une
                // vraie session ; il suffit de recliquer dessus.
                if (savedToken === DEMO_TOKEN) {
                    localStorage.removeItem('sirh_token');
                    localStorage.removeItem('sirh_user');
                } else {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                }
            }
            // Sans session enregistrée : l'utilisateur est dirigé vers /login
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
            localStorage.removeItem('sirh_token');
            localStorage.removeItem('sirh_user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('sirh_token', data.token);
                localStorage.setItem('sirh_user', JSON.stringify(data.user));
                setUser(data.user);
                setToken(data.token);
                return { success: true };
            }

            // Identifiants rejetés par le serveur : l'échec doit rester un échec
            const data = await res.json().catch(() => ({}));
            return {
                success: false,
                error: data.error || "Identifiants incorrects."
            };
        } catch (error) {
            // Serveur injoignable : ne jamais transformer une panne en connexion réussie
            console.warn('Connexion impossible, serveur injoignable:', error);
            return {
                success: false,
                error: DEMO_MODE
                    ? "Serveur injoignable. Utilisez l'accès démonstration ci-dessous."
                    : "Serveur injoignable. Vérifiez votre connexion et réessayez."
            };
        }
    };

    // Accès démonstration explicite : ouvert seulement depuis le bouton dédié
    // de l'écran de connexion, jamais automatiquement.
    const loginAsDemo = async () => {
        if (!DEMO_MODE) return { success: false, error: 'Mode démonstration désactivé.' };

        // On tente d'abord une vraie connexion : la démonstration dispose alors
        // d'un jeton que le serveur accepte, et tous les modules fonctionnent.
        const reel = await login(DEMO_EMAIL, DEMO_PASSWORD);
        if (reel.success) return { success: true, session: 'reelle' };

        // Repli hors ligne : le serveur dort, ou les comptes de test ont été
        // retirés. La session fictive existe pour ne jamais rester bloqué à
        // l'écran de connexion pendant une démonstration ; les pages branchées
        // sur `lib/api.js` affichent alors les jeux de démonstration, les autres
        // resteront vides — sans casser, cf. `listeSure` dans lib/api.js.
        console.warn(
            "[DÉMO] Connexion au compte de démonstration impossible (" + (reel.error || 'motif inconnu') + ").\n" +
            "→ Session locale ouverte : les modules interrogeant directement l'API resteront vides."
        );
        localStorage.setItem('sirh_token', DEMO_TOKEN);
        localStorage.setItem('sirh_user', JSON.stringify(DEMO_USER));
        setUser(DEMO_USER);
        setToken(DEMO_TOKEN);
        return { success: true, session: 'locale', avertissement: reel.error };
    };

    const logout = () => {
        localStorage.removeItem('sirh_token');
        localStorage.removeItem('sirh_user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            loginAsDemo,
            logout,
            demoMode: DEMO_MODE,
            // Vrai uniquement si la session courante est une session de démonstration
            isDemoSession: token === DEMO_TOKEN
        }}>
            {children}
        </AuthContext.Provider>
    );
};
