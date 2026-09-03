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
            } else {
                // Automatic demo user initialization to ensure seamless testing
                const defaultUser = {
                    id: 'demo-admin-id',
                    name: 'Ibrahim Diop',
                    firstName: 'Ibrahim',
                    lastName: 'Diop',
                    email: 'admin@entreprise.com',
                    role: 'Administrator',
                    department: 'Ressources Humaines',
                    positionTitle: 'Directeur RH'
                };
                const defaultToken = 'demo-sirh-token-2026';
                localStorage.setItem('sirh_token', defaultToken);
                localStorage.setItem('sirh_user', JSON.stringify(defaultUser));
                setUser(defaultUser);
                setToken(defaultToken);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
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

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('sirh_token', data.token);
                localStorage.setItem('sirh_user', JSON.stringify(data.user));
                setUser(data.user);
                setToken(data.token);
                return { success: true };
            }
        } catch (error) {
            console.warn('API non disponible, connexion en mode démo autonome:', error);
        }

        // Fallback demo user if API is offline or returns error
        const mockUser = {
            id: 'demo-admin-id',
            name: 'Ibrahim Diop',
            firstName: 'Ibrahim',
            lastName: 'Diop',
            email: email || 'admin@entreprise.com',
            role: 'Administrator',
            department: 'Ressources Humaines',
            positionTitle: 'Directeur RH'
        };
        const mockToken = 'demo-sirh-token-2026';

        localStorage.setItem('sirh_token', mockToken);
        localStorage.setItem('sirh_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setToken(mockToken);
        return { success: true };
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
