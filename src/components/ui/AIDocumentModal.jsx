import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './button';
import { Input } from './input';
import { SignaturePad } from './SignaturePad';
import { Sparkles, FileText, CheckCircle2, Loader2, X, PenLine, SkipForward } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AIDocumentModal({ isOpen, onClose, onGenerate, isGenerating, token }) {
    const [type, setType] = useState('Attestation de travail');
    const [formData, setFormData] = useState({});
    // Step 1 = form, Step 2 = signature
    const [step, setStep] = useState(1);
    const [generatedDoc, setGeneratedDoc] = useState(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState(null);
    const [isSigning, setIsSigning] = useState(false);
    const [signDone, setSignDone] = useState(false);

    if (!isOpen) return null;

    const handleOpen = () => {
        setStep(1);
        setGeneratedDoc(null);
        setSignatureDataUrl(null);
        setSignDone(false);
        setFormData({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerate = async () => {
        const doc = await onGenerate(type, formData);
        if (doc?.id) {
            setGeneratedDoc(doc);
            setStep(2);
        }
    };

    const handleSign = async () => {
        if (!signatureDataUrl || !generatedDoc) return;
        setIsSigning(true);
        try {
            const res = await fetch(`${API_URL}/api/documents/${generatedDoc.id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ signatureDataUrl })
            });
            if (res.ok) setSignDone(true);
        } catch (e) { console.error(e); }
        finally { setIsSigning(false); }
    };

    const handleClose = () => { handleOpen(); onClose(); };

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
        } else if (type === 'Document Personnalisé (IA Libre)') {
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Sparkles size={12} /> Mode Assistant Créatif
                        </p>
                        <p className="text-xs text-indigo-900 leading-relaxed">
                            Décrivez simplement le document que vous souhaitez créer. L'IA s'occupera de la mise en forme et du contenu juridique.
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Titre du document</label>
                        <Input placeholder="Ex: Lettre de félicitations, Note interne..." onChange={(e) => handleInputChange('titrePerso', e.target.value)} />
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
                    <button onClick={handleClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto min-h-0">
                    {step === 1 ? (
                    <>
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
                                <option value="Document Personnalisé (IA Libre)">✨ Document Personnalisé (IA Libre)</option>
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
                    </>
                    ) : (
                    <div className="flex flex-col items-center gap-6 py-2">
                        {signDone ? (
                            <div className="flex flex-col items-center gap-3 py-6">
                                <CheckCircle2 className="text-emerald-500" size={56} />
                                <h4 className="text-lg font-bold text-slate-900">Document Signé avec Succès !</h4>
                                <p className="text-sm text-slate-500 text-center">Un certificat de signature électronique a été généré et attaché au document.</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                    <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800">Document généré avec succès !</p>
                                        <p className="text-xs text-emerald-600 mt-0.5">{generatedDoc?.title}</p>
                                    </div>
                                </div>
                                <div className="w-full">
                                    <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                                        <PenLine size={16} className="text-blue-600" />
                                        Signez ce document (optionnel)
                                    </p>
                                    <SignaturePad onSign={setSignatureDataUrl} />
                                </div>
                            </>
                        )}
                    </div>
                    )}
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    {step === 1 ? (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={isGenerating}>Annuler</Button>
                            <Button
                                onClick={handleGenerate}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] shadow-md hover:shadow-lg transition-all"
                                disabled={isGenerating}
                            >
                                {isGenerating ? <><Loader2 size={16} className="animate-spin mr-2" /> Rédaction...</> : <><Sparkles size={16} className="mr-2 relative -top-[1px]" />Générer le Document</>}
                            </Button>
                        </>
                    ) : signDone ? (
                        <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <CheckCircle2 size={16} className="mr-2" /> Terminé !
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose}><SkipForward size={14} className="mr-1" /> Passer</Button>
                            <Button
                                onClick={handleSign}
                                disabled={!signatureDataUrl || isSigning}
                                className="bg-blue-700 hover:bg-blue-800 text-white min-w-[140px]"
                            >
                                {isSigning ? <><Loader2 size={14} className="animate-spin mr-2" />Signature...</> : <><PenLine size={14} className="mr-2" />Valider la Signature</>}
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
