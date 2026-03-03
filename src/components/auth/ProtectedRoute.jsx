import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

    // Role mapping since DB uses ADMIN/HR/MANAGER and frontend expects Administrator/HR
    const roleMapping = {
        'ADMIN': 'Administrator',
        'HR': 'HR',
        'MANAGER': 'Manager',
        'EMPLOYEE': 'Employee'
    };

    const userFrontendRole = roleMapping[user.role] || user.role;

    // If allowedRoles is provided and user's role is not in the list
    if (allowedRoles.length > 0 && !allowedRoles.includes(userFrontendRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Component Wrapper to conditionally render UI elements based on permissions
export const RequirePermission = ({ permission, children, fallbackPath = "/dashboard", fallback = null }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    // Simplified auth check for UI elements based on User Role.  To enhance later.
    const hasPerm = user && (user.role === 'ADMIN' || user.role === 'HR');

    if (hasPerm || permission === 'view:own') {
        return children;
    }

    if (fallbackPath) {
        return <Navigate to={fallbackPath} replace />;
    }

    return fallback;
};
