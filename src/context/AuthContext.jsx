import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Au chargement, vérifier si un token existe
        const savedToken = localStorage.getItem('sirh_token');
        const savedUser = localStorage.getItem('sirh_user');
        if (savedToken && savedUser) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
        setIsLoading(false);
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
            console.error('Login error:', error);
            // Provide a generic error if the API fails
            return { success: false, error: error.message || 'Serveur indisponible ou identifiants incorrects.' };
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
