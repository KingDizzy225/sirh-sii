import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the permissions mapping for our four RBAC roles
const rolePermissions = {
    Administrator: [
        'dashboard:view',
        'employees:view', 'employees:create', 'employees:edit', 'employees:delete',
        'leaves:view', 'leaves:approve', 'leaves:reject',
        'payroll:view', 'payroll:run', 'payroll:export',
        'recruitment:view', 'recruitment:manage',
        'performance:view', 'performance:manage',
        'onboarding:view', 'onboarding:manage',
        'learning:view', 'learning:manage',
        'documents:view_company', 'documents:view_personal', 'documents:manage',
        'workflows:view', 'workflows:manage',
        'skills:view', 'skills:manage',
        'settings:view', 'settings:manage'
    ],
    HR: [
        'dashboard:view',
        'employees:view', 'employees:create', 'employees:edit',
        'leaves:view', 'leaves:approve', 'leaves:reject',
        'recruitment:view', 'recruitment:manage',
        'performance:view', 'performance:manage',
        'onboarding:view', 'onboarding:manage',
        'learning:view', 'learning:manage',
        'documents:view_company', 'documents:view_personal', 'documents:manage',
        'workflows:view', 'workflows:manage',
        'skills:view', 'skills:manage'
    ],
    Employee: [
        'dashboard:view',
        'employees:view_self',
        'leaves:view_self', 'leaves:request',
        'performance:view_self',
        'learning:view_self',
        'documents:view_company', 'documents:view_personal'
    ],
    'Social Worker': [
        'dashboard:view',
        'employees:view',
        'leaves:view',
        'performance:view_wellness',
        'documents:view_company'
    ]
};

// Mock User Object (We'll start locked in as an Administrator)
const MOCK_USER = {
    id: 'EMP-001',
    name: 'Sarah Jenkins',
    role: 'Administrator', // Could be 'HR', 'Employee', 'Social Worker'
    email: 'sarah.jenkins@company.com'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching user session from token
        setTimeout(() => {
            setUser(MOCK_USER);
            setPermissions(rolePermissions[MOCK_USER.role] || []);
            setIsLoading(false);
        }, 500); // 500ms fake loading delay
    }, []);

    // Utility to switch roles easily for demonstration purposes
    const switchRole = (newRole) => {
        setUser({ ...user, role: newRole });
        setPermissions(rolePermissions[newRole] || []);
    };

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const value = {
        user,
        permissions,
        isLoading,
        hasPermission,
        switchRole,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
