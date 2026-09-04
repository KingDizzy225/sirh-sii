import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Mode démo : session administrateur ouverte sans authentification réelle.
// Désactivé par défaut — il ne s'active que si VITE_DEMO_MODE vaut
// explicitement "true" au moment du build. Ne jamais l'activer en production :
// il contourne entièrement la vérification des identifiants.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

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
const DEMO_TOKEN = 'demo-sirh-token-2026';

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
                // Une session de démo ne doit jamais survivre à la désactivation du mode démo
                if (savedToken === DEMO_TOKEN && !DEMO_MODE) {
                    localStorage.removeItem('sirh_token');
                    localStorage.removeItem('sirh_user');
                } else {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                }
            } else if (DEMO_MODE) {
                localStorage.setItem('sirh_token', DEMO_TOKEN);
                localStorage.setItem('sirh_user', JSON.stringify(DEMO_USER));
                setUser(DEMO_USER);
                setToken(DEMO_TOKEN);
            }
            // Hors mode démo et sans session : l'utilisateur est dirigé vers /login
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
            // Serveur injoignable
            if (DEMO_MODE) {
                console.warn('API indisponible, ouverture d\'une session de démonstration:', error);
                localStorage.setItem('sirh_token', DEMO_TOKEN);
                localStorage.setItem('sirh_user', JSON.stringify(DEMO_USER));
                setUser(DEMO_USER);
                setToken(DEMO_TOKEN);
                return { success: true };
            }
            return {
                success: false,
                error: "Serveur injoignable. Vérifiez votre connexion et réessayez."
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('sirh_token');
        localStorage.removeItem('sirh_user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, demoMode: DEMO_MODE }}>
            {children}
        </AuthContext.Provider>
    );
};
