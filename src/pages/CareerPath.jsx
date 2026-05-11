import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Star, ChevronRight, Info, Award, BrainCircuit, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function CareerPath() {
    const { user } = useAuth();
    const [careerData, setCareerData] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCareerData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const token = localStorage.getItem('sirh_token');
                const res = await fetch(`${API_URL}/api/career/path/${user.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setCareerData(data);
                    // Find current role and select it by default
                    const current = data.nodes.find(n => n.isCurrent);
                    setSelectedRole(current);
                }
            } catch (err) {
                console.error("Failed to fetch career data", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.id) fetchCareerData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // Helper to calculate coordinates for nodes in a "constellation" layout
    const getCoords = (index, total, isCurrent) => {
        if (isCurrent) return { x: 50, y: 50 }; // Center
        const angle = (index / (total - 1)) * Math.PI * 1.5 - Math.PI * 0.75;
        const radius = 35 + Math.random() * 5;
        return {
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle)
        };
    };

    const nodesWithCoords = careerData?.nodes.map((node, i) => {
        const coords = getCoords(i, careerData.nodes.length, node.isCurrent);
        return { ...node, ...coords };
    }) || [];

    return (
        <div className="flex-1 h-screen flex flex-col bg-[#0f172a] text-white overflow-hidden">
            {/* Header Area */}
            <div className="p-8 pb-0 z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Rocket className="text-blue-400" />
                        Explorateur de Carrière
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm font-medium">
                        Visualisez votre trajectoire chez SII et projetez-vous vers l'avenir.
                    </p>
                </motion.div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row relative">
                
                {/* Main Constellation View */}
                <div className="flex-[2] relative overflow-hidden flex items-center justify-center p-8">
                    {/* Background SVG Stars */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                        <defs>
                            <radialGradient id="starGradient">
                                <stop offset="0%" stopColor="white" />
                                <stop offset="100%" stopColor="transparent" />
                            </radialGradient>
                        </defs>
                        {[...Array(50)].map((_, i) => (
                            <circle
                                key={i}
                                cx={`${Math.random() * 100}%`}
                                cy={`${Math.random() * 100}%`}
                                r={Math.random() * 1.5}
                                fill="url(#starGradient)"
                                className="animate-pulse"
                                style={{ animationDelay: `${Math.random() * 5}s` }}
                            />
                        ))}
                    </svg>

                    {/* The Interactive Constellation */}
                    <div className="relative w-full max-w-[800px] aspect-square">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                            {/* Connection Lines */}
                            <g>
                                {careerData?.links.map((link, i) => {
                                    const start = nodesWithCoords.find(n => n.title === link.source);
                                    const end = nodesWithCoords.find(n => n.title === link.target);
                                    if (!start || !end) return null;
                                    return (
                                        <motion.line
                                            key={i}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.2 }}
                                            transition={{ duration: 2, delay: i * 0.1 }}
                                            x1={start.x} y1={start.y}
                                            x2={end.x} y2={end.y}
                                            stroke="white"
                                            strokeWidth="0.2"
                                            strokeDasharray="1,1"
                                        />
                                    );
                                })}
                            </g>

                            {/* Nodes */}
                            {nodesWithCoords.map((node, i) => (
                                <g 
                                    key={i} 
                                    onClick={() => setSelectedRole(node)}
                                    className="cursor-pointer group"
                                >
                                    {/* Outer Glow */}
                                    {node.isCurrent && (
                                        <motion.circle
                                            animate={{ r: [1.5, 2.5, 1.5], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            cx={node.x} cy={node.y} r="2.5"
                                            fill="#3b82f6"
                                            filter="blur(1px)"
                                        />
                                    )}

                                    {/* Main Node */}
                                    <motion.circle
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 10, delay: i * 0.1 }}
                                        cx={node.x} cy={node.y} 
                                        r={node.isCurrent ? 1.8 : 1.2}
                                        fill={node.isCurrent ? "#3b82f6" : node.isPossible ? "#64748b" : "#334155"}
                                        className={`transition-all duration-300 ${selectedRole?.id === node.id ? 'stroke-white stroke-[0.3]' : 'stroke-transparent'}`}
                                    />

                                    {/* Label */}
                                    <text
                                        x={node.x}
                                        y={node.y + (node.isCurrent ? 4 : 3)}
                                        textAnchor="middle"
                                        fill={node.isCurrent ? "white" : "rgb(148, 163, 184)"}
                                        style={{ fontSize: node.isCurrent ? '1.8px' : '1.4px', fontWeight: 'bold' }}
                                        className="pointer-events-none uppercase tracking-tighter"
                                    >
                                        {node.title}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Info Sidebar (Glassmorphism) */}
                <AnimatePresence mode="wait">
                    {selectedRole && (
                        <motion.div
                            key={selectedRole.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            className="flex-1 bg-slate-900/50 backdrop-blur-2xl border-l border-white/10 p-10 overflow-y-auto"
                        >
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <Badge className={`${selectedRole.isCurrent ? 'bg-blue-600' : 'bg-slate-700'} text-white border-none px-3 py-1`}>
                                        {selectedRole.isCurrent ? 'Poste Actuel' : 'Poste Cible'}
                                    </Badge>
                                    <div className="flex gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        <div className="h-2 w-2 rounded-full bg-slate-700"></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black leading-tight tracking-tighter uppercase">{selectedRole.title}</h3>
                                    <p className="text-blue-400 font-bold tracking-widest text-xs uppercase">{selectedRole.department}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Niveau</p>
                                        <p className="text-xl font-black">L{selectedRole.level}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Potentiel</p>
                                        <p className="text-xl font-black text-emerald-400">Haut</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <BrainCircuit size={14} className="text-blue-400" />
                                        Compétences Requises
                                    </h4>
                                    <div className="space-y-3">
                                        {['Leadership Équipe', 'Architecture Cloud', 'Vision Stratégique'].map((skill, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                                <span className="text-sm font-medium">{skill}</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <div key={s} className={`h-1 w-3 rounded-full ${s <= (4-idx) ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!selectedRole.isCurrent && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                                    >
                                        Se préparer à ce rôle
                                        <ArrowRight size={18} />
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

const Badge = ({ children, className }) => (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${className}`}>
        {children}
    </span>
);
