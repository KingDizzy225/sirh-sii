import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import { Sparkles, FileText, CheckCircle2, Loader2, X } from 'lucide-react';

export function AIDocumentModal({ isOpen, onClose, onGenerate, isGenerating }) {
    const [type, setType] = useState('Attestation de travail');
    const [formData, setFormData] = useState({});

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderFormFields = () => {
        if (type === 'Attestation de travail') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Motif de la demande</label>
                        <Input placeholder="Ex: Recherche de logement, Demande de prêt..." 
                            onChange={(e) => handleInputChange('motif', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Destinataire (optionnel)</label>
                        <Input placeholder="Ex: À l'attention de M. le Directeur de l'agence ABC" 
                            onChange={(e) => handleInputChange('destinataire', e.target.value)} />
                    </div>
                </div>
            );
        } else if (type === 'Attestation de congés') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Date de début</label>
                            <Input type="date" onChange={(e) => handleInputChange('dateDebut', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Date de fin</label>
                            <Input type="date" onChange={(e) => handleInputChange('dateFin', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Solde de congés restants (en jours)</label>
                        <Input type="number" placeholder="Ex: 12" onChange={(e) => handleInputChange('soldeRestant', e.target.value)} />
                    </div>
                </div>
            );
        } else if (type === 'Contrat de travail') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Type de Contrat</label>
                        <select className="w-full border-slate-200 rounded-lg bg-white text-sm p-2 outline-none border focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange('typeContrat', e.target.value)} defaultValue="">
                            <option value="" disabled>Sélectionner...</option>
                            <option value="CDI">CDI (À durée indéterminée)</option>
                            <option value="CDD">CDD (À durée déterminée)</option>
                            <option value="Stage">Convention de Stage</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Salaire Mensuel Brut (FCFA)</label>
                            <Input type="number" placeholder="Ex: 500000" onChange={(e) => handleInputChange('salaire', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Durée de travail</label>
                            <Input placeholder="Ex: 35h / semaine" onChange={(e) => handleInputChange('dureeTravail', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Période d'essai</label>
                        <Input placeholder="Ex: 3 mois renouvelable une fois" onChange={(e) => handleInputChange('periodeEssai', e.target.value)} />
                    </div>
                </div>
            );
        } else if (type === 'Promesse d\'embauche') {
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Poste proposé</label>
                            <Input placeholder="Ex: Chef de Projet Digital" onChange={(e) => handleInputChange('poste', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Date prévue d'intégration</label>
                            <Input type="date" onChange={(e) => handleInputChange('dateIntegration', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Rémunération Mensuelle Nette (FCFA)</label>
                        <Input type="number" placeholder="Ex: 600000" onChange={(e) => handleInputChange('remuneration', e.target.value)} />
                    </div>
                </div>
            );
        } else if (type === 'Avertissement disciplinaire') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Motif de l'avertissement</label>
                        <Input placeholder="Ex: Retards répétés, Non-respect des consignes..." onChange={(e) => handleInputChange('motif', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Date des faits</label>
                            <Input type="date" onChange={(e) => handleInputChange('dateFaits', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Niveau / Sanction</label>
                            <select className="w-full border-slate-200 rounded-lg bg-white text-sm p-2 outline-none border focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => handleInputChange('niveau', e.target.value)} defaultValue="1er Avertissement">
                                <option value="Mise en garde">Mise en garde (Rappel à l'ordre)</option>
                                <option value="1er Avertissement">1er Avertissement</option>
                                <option value="Blâme avec inscription au dossier">Blâme avec inscription au dossier</option>
                            </select>
                        </div>
                    </div>
                </div>
            );
        } else if (type === 'Lettre de licenciement') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Motif du licenciement</label>
                        <select className="w-full border-slate-200 rounded-lg bg-white text-sm p-2 outline-none border focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => handleInputChange('motifLicenciement', e.target.value)} defaultValue="">
                            <option value="" disabled>Sélectionner...</option>
                            <option value="Faute grave">Pour faute grave (sans préavis)</option>
                            <option value="Faute lourde">Pour faute lourde (intention de nuire)</option>
                            <option value="Motif économique">Pour motif économique (restructuration)</option>
                            <option value="Insuffisance professionnelle">Pour insuffisance professionnelle</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Date effective de fin de contrat</label>
                        <Input type="date" onChange={(e) => handleInputChange('dateFinContrat', e.target.value)} />
                    </div>
                </div>
            );
        } else if (type === 'Ordre de mission') {
            return (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Lieu de la mission / Destination</label>
                        <Input placeholder="Ex: Yamoussoukro, Côte d'Ivoire" onChange={(e) => handleInputChange('destination', e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Objet de la mission</label>
                        <Input placeholder="Ex: Audit de la nouvelle agence, Réunion client..." onChange={(e) => handleInputChange('objetMission', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Date de départ</label>
                            <Input type="date" onChange={(e) => handleInputChange('dateDepart', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Date de retour</label>
                            <Input type="date" onChange={(e) => handleInputChange('dateRetour', e.target.value)} />
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-full"
            >
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        Génération IA de Document
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto min-h-0">
                    <p className="text-sm text-slate-500 mb-6">
                        Remplissez ce formulaire et laissez l'Intelligence Artificielle rédiger un document formel et juridique sur mesure pour vous.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-medium text-slate-900 block mb-2">Type de Document</label>
                            <select
                                value={type}
                                onChange={(e) => { setType(e.target.value); setFormData({}); }}
                                className="w-full border-slate-200 rounded-lg bg-slate-50 text-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none border transition-all"
                            >
                                <option value="Attestation de travail">Attestation de travail</option>
                                <option value="Attestation de congés">Attestation de congés</option>
                                <option value="Contrat de travail">Contrat de travail</option>
                                <option value="Promesse d'embauche">Promesse d'embauche</option>
                                <option value="Avertissement disciplinaire">Avertissement disciplinaire</option>
                                <option value="Lettre de licenciement">Lettre de licenciement</option>
                                <option value="Ordre de mission">Ordre de mission</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            {renderFormFields()}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <label className="text-sm font-medium text-slate-700 block mb-1">Informations complémentaires (Optionnel)</label>
                            <textarea 
                                placeholder="Saisissez ici toute information spécifique, clause, ou mention à rajouter dans le document..." 
                                rows={3}
                                className="w-full border-slate-200 rounded-lg bg-white text-sm p-3 focus:ring-2 focus:ring-blue-500 outline-none border transition-all resize-none"
                                onChange={(e) => handleInputChange('informationsAdditionnelles', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                        Annuler
                    </Button>
                    <Button 
                        onClick={() => onGenerate(type, formData)} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] shadow-md hover:shadow-lg transition-all"
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <><Loader2 size={16} className="animate-spin mr-2" /> Rédaction...</>
                        ) : (
                            <><Sparkles size={16} className="mr-2 relative -top-[1px]" />Générer le Document</>
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
