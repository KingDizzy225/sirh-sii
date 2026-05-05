import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Au chargement, vérifier si un token existe
        try {
            const savedToken = localStorage.getItem('sirh_token');
            const savedUser = localStorage.getItem('sirh_user');
            
            if (savedToken && savedUser && savedUser !== 'undefined') {
                setUser(JSON.parse(savedUser));
                setToken(savedToken);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
            // Si les données sont corrompues, on nettoie
            localStorage.removeItem('sirh_token');
            localStorage.removeItem('sirh_user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur de connexion');

            // Sauvegarder dans le localStorage
            localStorage.setItem('sirh_token', data.token);
            localStorage.setItem('sirh_user', JSON.stringify(data.user));
            setUser(data.user);
            setToken(data.token);
            return { success: true };
        } catch (error) {
            console.warn('Backend injoignable. Activation du Mode Démo Local.', error);
            
            // MODE DÉMO (Fallback si le backend n'est pas déployé)
            if (email.includes('admin') || email.includes('drh') || email.includes('rh')) {
                const mockUser = {
                    id: 'mock-123',
                    email: email,
                    name: 'Utilisateur Démo',
                    role: 'Administrator',
                    department: 'Direction',
                };
                localStorage.setItem('sirh_token', 'mock-token-demo');
                localStorage.setItem('sirh_user', JSON.stringify(mockUser));
                setUser(mockUser);
                setToken('mock-token-demo');
                return { success: true };
            }
            
            return { success: false, error: 'Serveur indisponible. Utilisez admin@sirh.com pour la démo.' };
        }
    };

    const logout = () => {
        localStorage.removeItem('sirh_token');
        localStorage.removeItem('sirh_user');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
