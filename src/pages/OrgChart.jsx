import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/badge';
import { ZoomIn, ZoomOut, UserPlus, Search, Wand2, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { api } from '../lib/api.js';

const buildTrueHierarchy = (employees) => {
    try {
        if (!employees || employees.length === 0) return null;

        // Create a map for quick access
        const map = {};
        employees.forEach(emp => {
            map[emp.id] = {
                id: emp.id,
                title: emp.positionTitle || emp.role,
                department: emp.department,
                incumbent: {
                    name: `${emp.firstName} ${emp.lastName}`,
                    role: emp.role,
                    avatar: emp.firstName ? emp.firstName[0] : '!'
                },
                children: []
            };
        });

        let roots = [];
        
        employees.forEach(emp => {
            if (emp.managerId && map[emp.managerId]) {
                map[emp.managerId].children.push(map[emp.id]);
            } else {
                roots.push(map[emp.id]);
            }
        });

        // If there are multiple roots (e.g. no managerId assigned yet), wrap them in a virtual root
        if (roots.length === 1) {
            return roots[0];
        } else {
            return {
                id: 'virtual-root',
                title: 'Vue Globale',
                department: 'Entreprise',
                isVirtual: true,
                incumbent: {
                    name: 'Entreprise',
                    role: 'Structure Flat',
                    avatar: '🏢'
                },
                children: roots
            };
        }

    } catch (e) {
        console.error("Erreur de construction hiérarchie:", e);
        return null;
    }
};

const OrgNode = ({ node, searchQuery }) => {
    const isMatched = searchQuery && (
        (node.incumbent?.name && node.incumbent.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.title && node.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.department && node.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex flex-col items-center">
            {/* The Node Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative w-64 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                    isMatched 
                        ? 'ring-4 ring-indigo-500/50 border-indigo-500 bg-indigo-50/10' 
                        : (node.isVacant || node.isVirtual ? 'bg-slate-50 border-dashed border-slate-300' : 'bg-white border-slate-200')
                }`}
            >
                {/* Node Line Top */}
                <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-300 -translate-x-1/2" />

                <div className="flex flex-col items-center text-center space-y-3">
                    {/* Avatar or Vacant Placeholder */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ring-4 ring-white shadow-sm ${node.isVacant ? 'bg-slate-200 text-slate-400' : (node.isVirtual ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white')}`}>
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
                                <OrgNode node={child} searchQuery={searchQuery} />
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
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [isDragging, setIsDragging] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
    const canvasContainerRef = useRef(null);

    const fetchEmployeesData = () => {
        setIsLoading(true);
        api.get('/employees')
            .then(res => {
                const apiEmployees = res.data;
                if (apiEmployees && apiEmployees.length > 0) {
                    setData(buildTrueHierarchy(apiEmployees));
                } else {
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
                toast.error("Erreur lors du chargement des employés");
            })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchEmployeesData();
    }, []);

    const handleGenerateAI = async () => {
        if (!confirm("Voulez-vous générer la hiérarchie par IA (Gemini) ? Cela attribuera intelligemment des managers en fonction des rôles existants.")) return;
        
        setIsGenerating(true);
        toast.info("L'IA Gemini/Secours analyse les postes et génère l'organigramme...");

        try {
            const res = await api.post('/employees/generate-org-chart');
            if (res.data) {
                toast.success(res.data.message || `Succès: ${res.data.updated} relations hiérarchiques mises à jour !`);
                fetchEmployeesData(); // Refresh the chart
            }
        } catch (error) {
            console.error("Erreur IA:", error);
            toast.error(error.message || "Une erreur est survenue lors de l'appel à l'IA.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
    const handleZoomReset = () => setZoom(1);

    const handleFitToScreen = () => {
        setZoom(0.3); // Set to a very small zoom by default for "Fit"
    };

    // Drag-to-pan handlers
    const handleMouseDown = (e) => {
        if (!canvasContainerRef.current) return;
        setIsDragging(true);
        setPanStart({ x: e.clientX, y: e.clientY });
        setScrollStart({
            x: canvasContainerRef.current.scrollLeft,
            y: canvasContainerRef.current.scrollTop
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !canvasContainerRef.current) return;
        e.preventDefault();
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        canvasContainerRef.current.scrollLeft = scrollStart.x - dx;
        canvasContainerRef.current.scrollTop = scrollStart.y - dy;
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 h-[calc(100vh-4rem)] overflow-hidden">
            {/* Header / Controls */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-200 bg-white z-10 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Organigramme IA</h2>
                    <p className="text-slate-500 text-sm mt-1">Générez une hiérarchie structurée selon l'importance des postes.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        variant="default" 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-medium shadow-sm"
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                        {isGenerating ? "Génération en cours..." : "Générer par IA"}
                    </Button>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input 
                            placeholder="Rechercher..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-9 w-48 bg-slate-50" 
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <Button variant="ghost" size="sm" onClick={handleFitToScreen} className="h-8 px-2 text-xs font-bold text-indigo-600 hover:bg-white">Ajuster</Button>
                        <div className="w-px h-4 bg-slate-300 mx-1"></div>
                        <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8 text-slate-600 hover:bg-white"><ZoomOut size={16} /></Button>
                        <Button variant="ghost" onClick={handleZoomReset} className="h-8 px-2 text-xs font-medium text-slate-600 hover:bg-white">{Math.round(zoom * 100)}%</Button>
                        <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8 text-slate-600 hover:bg-white"><ZoomIn size={16} /></Button>
                    </div>
                </div>
            </div>

            {/* Zoomable / Pannable Canvas Area */}
            <div 
                ref={canvasContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className={`flex-1 overflow-auto bg-slate-50/50 p-8 relative ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            >
                <div
                    className="flex justify-center transition-transform origin-top duration-200 ease-out min-w-max min-h-max print:scale-[0.4] print:origin-center"
                    style={{ transform: `scale(${zoom})`, paddingBottom: '100px' }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <span className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></span>
                            <p>Chargement de l'organigramme depuis la Base de Données...</p>
                        </div>
                    ) : (data && <OrgNode node={data} searchQuery={searchQuery} />)}
                </div>
            </div>
        </div>
    );
}
