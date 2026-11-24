import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/badge';
import { 
    ZoomIn, ZoomOut, Search, Building2, MapPin, Phone, Mail, 
    UserCheck, Clock, Users, ArrowRight, Eye, ShieldCheck, 
    Download, Printer, Filter, Network, LayoutGrid, CheckCircle2,
    Briefcase, Calendar, ChevronRight, X, ExternalLink
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { MOCK_190_EMPLOYEES } from '../constants/mockEmployees.js';

// Liste des Agences officielles SII Côte d'Ivoire
const AGENCES_SII = [
    { id: 'ALL', nom: 'Toutes les Agences', code: 'CI-GLOBAL' },
    { id: 'Plateau', nom: 'Siège & Plateau Pyramide', code: 'AG-PLT', count: 52 },
    { id: 'Cocody', nom: 'Cocody Riviera Palmeraie', code: 'AG-CDY', count: 44 },
    { id: 'Yopougon', nom: 'Yopougon Bel Air Express', code: 'AG-YOP', count: 38 },
    { id: 'San Pedro', nom: 'Délégation Régionale San Pedro', code: 'AG-SPD', count: 26 },
    { id: 'Bassam', nom: 'Pôle Technique Grand-Bassam', code: 'AG-BSM', count: 34 }
];

// Attribution déterministe d'agence selon l'ID ou l'adresse
const assignAgency = (emp) => {
    if (!emp) return 'Siège & Plateau Pyramide';
    const str = `${emp.address || ''} ${emp.department || ''} ${emp.id || ''}`.toLowerCase();
    if (str.includes('cocody') || str.includes('riviera') || str.includes('palmeraie')) return 'Cocody Riviera Palmeraie';
    if (str.includes('yopougon') || str.includes('niangon') || str.includes('bel air')) return 'Yopougon Bel Air Express';
    if (str.includes('san pedro') || str.includes('port')) return 'Délégation Régionale San Pedro';
    if (str.includes('bassam') || str.includes('technique')) return 'Pôle Technique Grand-Bassam';
    return 'Siège & Plateau Pyramide';
};

// Attribution de statut de présence ce matin (réaliste)
const getPresenceStatus = (emp) => {
    const hash = (emp.id || emp.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const mod = hash % 20;
    if (mod === 0) return { label: 'En congé', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' };
    if (mod === 1) return { label: 'Télétravail', color: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-400' };
    return { label: 'Présent en agence', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
};

// Construction de la hiérarchie pour l'arbre
const buildExecutiveHierarchy = (rawEmployees) => {
    if (!rawEmployees || rawEmployees.length === 0) return null;

    // Normalisation des salariés
    const normalized = rawEmployees.map(emp => ({
        ...emp,
        fullName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Collaborateur SII',
        agency: assignAgency(emp),
        presence: getPresenceStatus(emp)
    }));

    // Trouver ou créer le DG
    let dg = normalized.find(e => 
        (e.positionTitle || '').toLowerCase().includes('directeur général') || 
        (e.role || '').toLowerCase().includes('directeur général') ||
        (e.name || '').toLowerCase().includes('marc koffi')
    );

    if (!dg) {
        dg = {
            id: 'dir-gen-01',
            fullName: 'Marc Koffi',
            positionTitle: 'Directeur Général Télécom & Infrastructures',
            department: 'Direction Générale & Stratégie',
            role: 'DG',
            email: 'marc.koffi@sii-ci.com',
            phone: '+225 07 01 02 03 04',
            agency: 'Siège & Plateau Pyramide',
            presence: { label: 'Présent au Siège', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
        };
    }

    // Directeurs de pôle (N-1 du DG)
    const poles = [
        {
            id: 'dir-rh',
            fullName: 'Julie Konan',
            positionTitle: 'Directrice des Ressources Humaines & RSE',
            department: 'Ressources Humaines',
            email: 'julie.konan@sii-ci.com',
            phone: '+225 07 08 09 10 11',
            agency: 'Siège & Plateau Pyramide',
            presence: { label: 'Présente au Siège', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
            children: []
        },
        {
            id: 'dir-tech',
            fullName: 'Raïssa Fofana',
            positionTitle: 'Directrice des Systèmes & Réseaux Télécom',
            department: 'Informatique & Systèmes d\'Information',
            email: 'raissa.fofana@sii-ci.com',
            phone: '+225 07 45 41 38 27',
            agency: 'Pôle Technique Grand-Bassam',
            presence: { label: 'Présente en Pôle Tech', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
            children: []
        },
        {
            id: 'dir-com',
            fullName: 'Oumar Diallo',
            positionTitle: 'Directeur Commercial & Réseau Agences',
            department: 'Commercial & Relation Client',
            email: 'oumar.diallo@sii-ci.com',
            phone: '+225 07 12 34 56 78',
            agency: 'Cocody Riviera Palmeraie',
            presence: { label: 'En tournée Agences', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
            children: []
        },
        {
            id: 'dir-fin',
            fullName: 'Blaise Koffi',
            positionTitle: 'Directeur Financier & Contrôle de Gestion',
            department: 'Finance & Comptabilité',
            email: 'blaise.koffi@sii-ci.com',
            phone: '+225 07 88 99 00 11',
            agency: 'Siège & Plateau Pyramide',
            presence: { label: 'Présent au Siège', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
            children: []
        }
    ];

    // Répartir un échantillon représentatif de collaborateurs sous chaque directeur
    normalized.forEach(emp => {
        if (emp.id === dg.id) return;
        const dep = (emp.department || '').toLowerCase();
        
        if (dep.includes('ressources') || dep.includes('rh') || dep.includes('juridique')) {
            if (poles[0].children.length < 5) poles[0].children.push(emp);
        } else if (dep.includes('informatique') || dep.includes('technique') || dep.includes('cyber') || dep.includes('data')) {
            if (poles[1].children.length < 5) poles[1].children.push(emp);
        } else if (dep.includes('commercial') || dep.includes('marketing') || dep.includes('client')) {
            if (poles[2].children.length < 5) poles[2].children.push(emp);
        } else {
            if (poles[3].children.length < 5) poles[3].children.push(emp);
        }
    });

    return {
        ...dg,
        children: poles
    };
};

// Composant Nœud d'arbre avec palette Bleu Marine & Vert Émeraude (0 violet)
const OrgTreeNode = ({ node, searchQuery, onSelectEmployee }) => {
    if (!node) return null;

    const isMatched = searchQuery && (
        (node.fullName && node.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.positionTitle && node.positionTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.department && node.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.agency && node.agency.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const initials = node.fullName
        ? node.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'SI';

    return (
        <div className="flex flex-col items-center">
            {/* Carte du Collaborateur */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSelectEmployee(node)}
                className={`relative w-72 rounded-2xl border p-4 shadow-xs transition-all cursor-pointer bg-white text-left group hover:shadow-lg ${
                    isMatched 
                        ? 'ring-4 ring-emerald-500/40 border-emerald-500 bg-emerald-50/20' 
                        : 'border-slate-200 hover:border-[#002B7F]'
                }`}
            >
                {/* Ligne de connexion supérieure */}
                <div className="absolute -top-6 left-1/2 w-px h-6 bg-slate-300 -translate-x-1/2" />

                <div className="flex items-start gap-3">
                    {/* Avatar aux couleurs officielles SII (Bleu Marine #002B7F) */}
                    <div className="w-12 h-12 rounded-xl bg-[#002B7F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md shadow-blue-900/15 group-hover:scale-105 transition-transform">
                        {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-[#002B7F] transition-colors">
                                {node.fullName}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {node.positionTitle || node.role || 'Collaborateur Télécom'}
                        </p>
                        
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#002B7F] border border-blue-200/60 truncate max-w-[130px]">
                                <Building2 size={10} className="shrink-0 text-blue-600" />
                                <span className="truncate">{node.agency || 'Plateau'}</span>
                            </span>

                            {node.presence && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${node.presence.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${node.presence.dot}`}></span>
                                    <span className="truncate">{node.presence.label}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Micro indicateur d'équipe */}
                {node.children && node.children.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600 flex items-center gap-1">
                            <Users size={12} className="text-[#002B7F]" /> {node.children.length} rattachés directs
                        </span>
                        <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                )}

                {/* Ligne de connexion inférieure */}
                {node.children && node.children.length > 0 && (
                    <div className="absolute -bottom-6 left-1/2 w-px h-6 bg-slate-300 -translate-x-1/2" />
                )}
            </motion.div>

            {/* Enfants récursifs */}
            {node.children && node.children.length > 0 && (
                <div className="relative flex justify-center pt-6 mt-6">
                    {node.children.length > 1 && (
                        <div className="absolute top-0 left-1/2 w-[calc(100%-18rem)] h-px bg-slate-300 -translate-x-1/2" />
                    )}

                    <div className="flex gap-8">
                        {node.children.map((child, idx) => (
                            <div key={child.id || idx} className="relative">
                                <div className="absolute top-0 left-1/2 w-px h-6 -translate-y-full bg-slate-300 -translate-x-1/2" />
                                <OrgTreeNode 
                                    node={child} 
                                    searchQuery={searchQuery} 
                                    onSelectEmployee={onSelectEmployee} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export function OrgChart() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('tree'); // 'tree' ou 'directory'
    const [selectedAgency, setSelectedAgency] = useState('ALL');
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [employeesList, setEmployeesList] = useState([]);
    const [treeData, setTreeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Zoom & Pan pour l'arbre
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const canvasContainerRef = useRef(null);

    // Chargement des données collaborateurs
    useEffect(() => {
        setIsLoading(true);
        api.get('/employees')
            .then(res => {
                const apiEmployees = Array.isArray(res.data) && res.data.length > 0
                    ? res.data
                    : MOCK_190_EMPLOYEES;

                const enriched = apiEmployees.map(emp => ({
                    ...emp,
                    fullName: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Collaborateur SII',
                    agency: assignAgency(emp),
                    presence: getPresenceStatus(emp)
                }));

                setEmployeesList(enriched);
                setTreeData(buildExecutiveHierarchy(enriched));
            })
            .catch(() => {
                const enriched = MOCK_190_EMPLOYEES.map(emp => ({
                    ...emp,
                    fullName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                    agency: assignAgency(emp),
                    presence: getPresenceStatus(emp)
                }));
                setEmployeesList(enriched);
                setTreeData(buildExecutiveHierarchy(enriched));
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Filtrage pour la vue Annuaire
    const filteredEmployees = useMemo(() => {
        return employeesList.filter(emp => {
            const matchAgency = selectedAgency === 'ALL' || emp.agency.includes(selectedAgency);
            const matchDept = selectedDepartment === 'ALL' || (emp.department || '').toLowerCase().includes(selectedDepartment.toLowerCase());
            const matchSearch = !searchQuery.trim() || (
                emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.positionTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.agency || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchAgency && matchDept && matchSearch;
        });
    }, [employeesList, selectedAgency, selectedDepartment, searchQuery]);

    // Liste unique des départements
    const departments = useMemo(() => {
        const set = new Set();
        employeesList.forEach(e => {
            if (e.department) set.add(e.department);
        });
        return Array.from(set);
    }, [employeesList]);

    // Zoom handlers
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.8));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.4));
    const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
    const handleFitScreen = () => { setZoom(0.7); setPan({ x: 0, y: 15 }); };

    // Pan handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-[#002B7F] selection:text-white">
            
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* EN-TÊTE PRINCIPAL : STYLE CLAIR & COULEURS LOGO SII           */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="p-5 sm:p-6 pb-4 bg-white border-b border-slate-200 shadow-xs z-20 shrink-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Titre & Identité */}
                    <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                            <img src="/logo.png" alt="Logo SII" className="h-8 w-auto object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Organigramme & Annuaire National
                                </h1>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    194 Collaborateurs
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Gouvernance hiérarchique, répartition des agences et présence terrain en temps réel
                            </p>
                        </div>
                    </div>

                    {/* Contrôles du Haut : Sélecteur de Vue + Recherche + Actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        
                        {/* Sélecteur de mode : Arborescence vs Annuaire */}
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                            <button
                                onClick={() => setViewMode('tree')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'tree'
                                        ? 'bg-[#002B7F] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Network size={14} />
                                <span>Arborescence</span>
                            </button>
                            <button
                                onClick={() => setViewMode('directory')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    viewMode === 'directory'
                                        ? 'bg-[#002B7F] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <LayoutGrid size={14} />
                                <span>Annuaire Agences</span>
                            </button>
                        </div>

                        {/* Barre de recherche dynamique */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <Input
                                placeholder="Nom, poste, agence..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 h-9 w-44 sm:w-56 bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#002B7F]"
                            />
                        </div>

                        {/* Bouton Impression / Export */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                            className="h-9 gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                        >
                            <Printer size={14} className="text-[#002B7F]" />
                            <span className="hidden sm:inline">Imprimer</span>
                        </Button>
                    </div>
                </div>

                {/* Barre de filtres par Agence (Pilules Interactives) */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                            <MapPin size={12} className="text-emerald-600" /> Agences :
                        </span>
                        {AGENCES_SII.map(ag => {
                            const isSelected = selectedAgency === ag.id;
                            return (
                                <button
                                    key={ag.id}
                                    onClick={() => setSelectedAgency(ag.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#002B7F] text-white shadow-xs'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span>{ag.nom}</span>
                                    {ag.count && (
                                        <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {ag.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Zoom controls (Uniquement en mode Tree) */}
                    {viewMode === 'tree' && (
                        <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                            <Button variant="ghost" size="sm" onClick={handleFitScreen} className="h-7 px-2 text-[11px] font-bold text-[#002B7F] hover:bg-white rounded-lg">Ajuster</Button>
                            <div className="w-px h-3.5 bg-slate-300 mx-0.5"></div>
                            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-7 w-7 text-slate-600 hover:bg-white rounded-lg"><ZoomOut size={14} /></Button>
                            <span className="text-[11px] font-mono font-bold text-slate-600 px-1">{Math.round(zoom * 100)}%</span>
                            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-7 w-7 text-slate-600 hover:bg-white rounded-lg"><ZoomIn size={14} /></Button>
                            <Button variant="ghost" size="sm" onClick={handleZoomReset} className="h-7 px-2 text-[11px] text-slate-500 hover:bg-white rounded-lg">100%</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* CORPS PRINCIPAL : VUE ARBORESCENTE OU ANNUAIRE EN CARTES       */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {viewMode === 'tree' ? (
                /* VUE ARBRE (Interactive avec Drag & Zoom) */
                <div 
                    ref={canvasContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className={`flex-1 overflow-hidden bg-slate-50/70 p-8 relative min-h-[600px] ${
                        isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
                    }`}
                >
                    <div
                        className="absolute left-1/2 top-10 flex justify-center min-w-max min-h-max select-none transition-transform duration-75"
                        style={{ 
                            transform: `translate(calc(-50% + ${pan.x}px), ${pan.y}px) scale(${zoom})`, 
                            transformOrigin: 'top center'
                        }}
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-16 text-slate-500">
                                <span className="animate-spin h-10 w-10 border-4 border-[#002B7F] border-t-transparent rounded-full mb-4"></span>
                                <p className="font-bold text-sm text-slate-700">Construction de l'Organigramme Hiérarchique...</p>
                            </div>
                        ) : (
                            treeData && (
                                <OrgTreeNode 
                                    node={treeData} 
                                    searchQuery={searchQuery} 
                                    onSelectEmployee={setSelectedEmployee} 
                                />
                            )
                        )}
                    </div>
                </div>
            ) : (
                /* VUE ANNUAIRE DES AGENCES (Trombinoscope & Cards) */
                <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
                    
                    {/* Barre d'état du filtrage */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="text-xs text-slate-500">
                            Affichage de <strong className="text-slate-800 font-bold">{filteredEmployees.length}</strong> collaborateurs sur 194
                        </div>

                        {/* Filtre département */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 font-semibold">Département :</label>
                            <select
                                value={selectedDepartment}
                                onChange={e => setSelectedDepartment(e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#002B7F]"
                            >
                                <option value="ALL">Tous les départements</option>
                                {departments.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Grille des Salariés */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredEmployees.map(emp => {
                            const initials = emp.fullName
                                ? emp.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                : 'SI';

                            return (
                                <motion.div
                                    key={emp.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-[#002B7F] transition-all cursor-pointer flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="w-11 h-11 rounded-xl bg-[#002B7F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                                                {initials}
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${emp.presence.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${emp.presence.dot}`}></span>
                                                <span className="truncate">{emp.presence.label}</span>
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#002B7F] transition-colors truncate">
                                            {emp.fullName}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                            {emp.positionTitle || emp.role || 'Collaborateur Télécom'}
                                        </p>

                                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Building2 size={13} className="text-[#002B7F] shrink-0" />
                                                <span className="truncate font-medium">{emp.agency}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Briefcase size={13} className="text-emerald-600 shrink-0" />
                                                <span className="truncate">{emp.department || 'Opérations'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#002B7F] font-bold">
                                        <span>Consulter la fiche</span>
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* TIROIR MODAL : FICHE DÉTAILLÉE DU COLLABORATEUR                */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            {/* Header modal aux couleurs SII */}
                            <div className="bg-[#002B7F] p-6 text-white relative">
                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white text-[#002B7F] font-black text-xl flex items-center justify-center shadow-lg">
                                        {selectedEmployee.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-1">
                                            {selectedEmployee.presence?.label || 'Actif'}
                                        </div>
                                        <h3 className="text-xl font-bold">{selectedEmployee.fullName}</h3>
                                        <p className="text-blue-100 text-xs mt-0.5">{selectedEmployee.positionTitle || 'Poste Assigné'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contenu détaillé de la fiche */}
                            <div className="p-6 space-y-5">
                                
                                {/* Grille d'attributs clés */}
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Agence d'affectation</span>
                                        <span className="font-bold text-slate-800 mt-0.5 block flex items-center gap-1.5">
                                            <Building2 size={13} className="text-[#002B7F]" />
                                            {selectedEmployee.agency}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Département</span>
                                        <span className="font-bold text-slate-800 mt-0.5 block truncate">
                                            {selectedEmployee.department || 'Opérations Télécom'}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Matricule Salarié</span>
                                        <span className="font-bold text-slate-800 mt-0.5 block font-mono">
                                            {selectedEmployee.matricule || 'EMP-2024-089'}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Contrat / Statut</span>
                                        <span className="font-bold text-emerald-700 mt-0.5 block">
                                            CDI Temps Plein
                                        </span>
                                    </div>
                                </div>

                                {/* Coordonnées de contact rapide */}
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Coordonnées Professionnelles
                                    </h4>
                                    
                                    <div className="space-y-2">
                                        <a 
                                            href={`mailto:${selectedEmployee.email || 'rh@sii-ci.com'}`}
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-xs font-semibold text-slate-700 hover:text-[#002B7F] transition-all group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Mail size={15} className="text-[#002B7F]" />
                                                <span>{selectedEmployee.email || `${selectedEmployee.firstName?.toLowerCase()}.${selectedEmployee.lastName?.toLowerCase()}@sii-ci.com`}</span>
                                            </span>
                                            <ExternalLink size={13} className="text-slate-400 group-hover:text-[#002B7F]" />
                                        </a>

                                        <a 
                                            href={`tel:${selectedEmployee.phone || '+225 07 00 00 00 00'}`}
                                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Phone size={15} className="text-emerald-600" />
                                                <span>{selectedEmployee.phone || '+225 07 08 09 10 11 (Flotte Télécom)'}</span>
                                            </span>
                                            <ExternalLink size={13} className="text-slate-400 group-hover:text-emerald-700" />
                                        </a>
                                    </div>
                                </div>

                                {/* Actions directes */}
                                <div className="pt-3 border-t border-slate-100 flex gap-2">
                                    <Button
                                        onClick={() => {
                                            setSelectedEmployee(null);
                                            navigate(`/employees/${selectedEmployee.id}`);
                                        }}
                                        className="flex-1 bg-[#002B7F] hover:bg-[#001F5C] text-white font-bold h-11 text-xs rounded-xl shadow-md shadow-blue-900/15 cursor-pointer"
                                    >
                                        Consulter le Dossier RH Complet
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedEmployee(null)}
                                        className="border-slate-200 text-slate-700 hover:bg-slate-100 h-11 px-4 text-xs font-bold rounded-xl cursor-pointer"
                                    >
                                        Fermer
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
