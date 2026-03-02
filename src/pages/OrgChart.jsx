import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ZoomIn, ZoomOut, UserPlus, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

import seedData from '../../seed_output.json';

const buildHierarchy = (employees) => {
    try {
        if (!employees || employees.length === 0) return null;

        // Group employees by department to create a pseudo-structure
        // In a true Position Management system we'd use reports_to_position_id (or managerId),
        // but here we only have department and role, and the DB is fresh.

        // 1. Find CEO or top Admin
        const ceoIndex = employees.findIndex(e => e.role === 'Administrator' || (e.positionTitle || '').toLowerCase().includes('ceo') || (e.positionTitle || '').toLowerCase().includes('chief') || e.systemRole === 'Administrator');
        const ceo = ceoIndex !== -1 ? employees[ceoIndex] : employees[0];

        // Remove CEO from pool
        const pool = employees.filter(e => e.id !== ceo.id);

        // Group by department
        const depts = {};
        pool.forEach(emp => {
            if (!depts[emp.department]) depts[emp.department] = [];
            depts[emp.department].push(emp);
        });

        // Build Department Heads (Managers/HR)
        const children = Object.keys(depts).map(deptName => {
            const deptEmps = depts[deptName];

            // Find a manager for this dept
            const managerIndex = deptEmps.findIndex(e => e.role === 'Manager' || e.role === 'HR');
            const manager = managerIndex !== -1 ? deptEmps[managerIndex] : deptEmps[0];

            const deptPool = deptEmps.filter(e => e.id !== manager.id);

            // Limit children to max 4 per manager for visual sanity in a demo
            const directReports = deptPool.slice(0, 4).map(emp => ({
                id: emp.id,
                title: emp.positionTitle || emp.role,
                department: deptName,
                incumbent: {
                    name: `${emp.firstName} ${emp.lastName}`,
                    role: emp.role,
                    avatar: emp.firstName ? emp.firstName[0] : '!'
                },
                children: []
            }));

            // Add a vacant position to each department to demonstrate Position Management
            directReports.push({
                id: `vacant-${deptName}`,
                title: `Spécialiste Senior ${deptName}`,
                department: deptName,
                incumbent: null,
                isVacant: true,
                children: []
            });

            return {
                id: manager.id,
                title: manager.positionTitle || manager.role,
                department: deptName,
                incumbent: {
                    name: `${manager.firstName} ${manager.lastName}`,
                    role: manager.role,
                    avatar: manager.firstName ? manager.firstName[0] : '!'
                },
                children: directReports
            };
        });

        return {
            id: ceo.id,
            title: ceo.positionTitle || "Directeur Général",
            department: "Direction",
            incumbent: {
                name: `${ceo.firstName} ${ceo.lastName}`,
                role: "CEO",
                avatar: ceo.firstName ? ceo.firstName[0] : '!'
            },
            children: children
        };

    } catch (e) {
        console.error("Erreur de construction hiérarchie:", e);
        return null;
    }
};

// Remove static orgData definition

// Recursive Component for drawing the tree nodes
const OrgNode = ({ node }) => {
    return (
        <div className="flex flex-col items-center">
            {/* The Node Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative w-64 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${node.isVacant ? 'bg-slate-50 border-dashed border-slate-300' : 'bg-white border-slate-200'}`}
            >
                {/* Node Line Top */}
                <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-300 -translate-x-1/2" />

                <div className="flex flex-col items-center text-center space-y-3">
                    {/* Avatar or Vacant Placeholder */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ring-4 ring-white shadow-sm ${node.isVacant ? 'bg-slate-200 text-slate-400' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'}`}>
                        {node.isVacant ? <UserPlus size={20} /> : node.incumbent.avatar}
                    </div>

                    {/* Content */}
                    <div>
                        <h4 className={`font-bold text-sm ${node.isVacant ? 'text-slate-400' : 'text-slate-900'}`}>{node.isVacant ? 'VACANT' : node.incumbent.name}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1">{node.title}</p>
                    </div>

                    <Badge variant="outline" className={`text-[10px] ${node.isVacant ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-700'}`}>
                        {node.department}
                    </Badge>
                </div>

                {node.children && node.children.length > 0 && (
                    <div className="absolute -bottom-6 left-1/2 w-px h-6 bg-slate-300 -translate-x-1/2" />
                )}
            </motion.div>

            {/* Render Children Recursively */}
            {node.children && node.children.length > 0 && (
                <div className="relative flex justify-center pt-6 mt-6">
                    {/* Horizontal Connection Line */}
                    {node.children.length > 1 && (
                        <div className="absolute top-0 left-1/2 w-[calc(100%-16rem)] h-px bg-slate-300 -translate-x-1/2" />
                    )}

                    <div className="flex gap-8">
                        {node.children.map((child) => (
                            <div key={child.id} className="relative">
                                {/* Vertical connection to horizontal line */}
                                <div className="absolute top-0 left-1/2 w-px h-6 -translate-y-full bg-slate-300 -translate-x-1/2" />
                                <OrgNode node={child} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export function OrgChart() {
    const [zoom, setZoom] = useState(1);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('sirh_token');
        fetch(`${API_URL}/api/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(apiEmployees => {
                if (apiEmployees && apiEmployees.length > 0) {
                    setData(buildHierarchy(apiEmployees));
                } else {
                    // Fallback visually if no data in db
                    setData({
                        id: "error",
                        title: "Base de données vide",
                        department: "Système",
                        incumbent: { name: "Aucun employé", role: "N/A", avatar: "!" },
                        children: []
                    });
                }
            })
            .catch(err => {
                console.error("Erreur de récupération employés:", err);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => setZoom(1);

    return (
        <div className="flex-1 flex flex-col bg-slate-50 h-[calc(100vh-4rem)] overflow-hidden">
            {/* Header / Controls */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-200 bg-white z-10 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Organigramme</h2>
                    <p className="text-slate-500 text-sm mt-1">Naviguez dans la structure de l'entreprise basée sur la gestion des postes.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input placeholder="Rechercher un employé ou un poste..." className="pl-9 w-64 bg-slate-50" />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8 text-slate-600 hover:bg-white"><ZoomOut size={16} /></Button>
                        <Button variant="ghost" onClick={handleZoomReset} className="h-8 px-2 text-xs font-medium text-slate-600 hover:bg-white">{Math.round(zoom * 100)}%</Button>
                        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 text-slate-600 hover:bg-white"><ZoomIn size={16} /></Button>
                    </div>
                </div>
            </div>

            {/* Zoomable / Pannable Canvas Area */}
            <div className="flex-1 overflow-auto bg-slate-50/50 p-8 cursor-grab active:cursor-grabbing relative">
                <div
                    className="flex justify-center transition-transform origin-top duration-200 ease-out min-w-max min-h-max"
                    style={{ transform: `scale(${zoom})`, paddingBottom: '100px' }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <span className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></span>
                            <p>Chargement de l'organigramme depuis la Base de Données...</p>
                        </div>
                    ) : (data && <OrgNode node={data} />)}
                </div>
            </div>
        </div>
    );
}
