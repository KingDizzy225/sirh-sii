import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aLeRole, estRH } from '../../lib/roles.js';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Verifying credentials...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login, saving the attempted URL
        return <Navigate to="/login" replace />;
    }

    // La comparaison passe par la table unique de `lib/roles` : celle qui vivait
    // ici ignorait SOCIAL_WORKER, et renvoyait donc un assistant social vers la
    // page d'accès refusé sur ses propres écrans.
    if (!aLeRole(user.role, allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Component Wrapper to conditionally render UI elements based on permissions
export const RequirePermission = ({ permission, children, fallbackPath = "/dashboard", fallback = null }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    /**
     * La permission demandée était ignorée : tout compte RH passait, tout autre
     * était refusé, quelle que soit la permission. Le composant promettait un
     * contrôle fin qu'il n'exerçait pas.
     *
     * Il applique désormais ce qu'il annonce — `view:own` est ouvert à tous,
     * le reste est réservé aux rôles RH — et le dit franchement plutôt que de
     * laisser croire à une granularité qui n'existe pas encore.
     */
    const autorise = permission === 'view:own' || estRH(user && user.role);

    if (autorise) {
        return children;
    }

    if (fallbackPath) {
        return <Navigate to={fallbackPath} replace />;
    }

    return fallback;
};
