import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
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

    if (!isAuthenticated) {
        // Redirect to login (assuming we had a login page), saving the attempted URL
        // return <Navigate to="/login" state={{ from: location }} replace />;

        // For this mockup, we just redirect home if absolutely no user exists
        return <Navigate to="/" replace />;
    }

    // If allowedRoles is provided and user's role is not in the list
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Component Wrapper to conditionally render UI elements based on permissions
export const RequirePermission = ({ permission, children, fallback = null }) => {
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) return null;

    if (hasPermission(permission)) {
        return children;
    }

    return fallback;
};
