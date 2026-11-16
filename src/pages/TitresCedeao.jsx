import React, { useState, useEffect } from 'react';
import { Globe2, FileText, AlertTriangle, ShieldCheck, Plus, CheckCircle2, Calendar, MapPin, User, Building, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function TitresCedeao() {
    const [donnees, setDonnees] = useState({ salaries: [], indicateurs: {}, alertesRenouvellement: 0 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formTitre, setFormTitre] = useState({
        employeNom: '',
        matricule: '',
        nationalite: 'Sénégalaise (Sénégal)',
        poste: 'Conseiller Commercial Fibre',
        agence: 'Agence Orange Plateau',
        typeTitre: 'CARTE_RESIDENT_BIOMETRIQUE_ONECI',
        numeroPiece: '',
        dateExpiration: '31/12/2028'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/titres-cedeao/statut');
            if (res.data && res.data.succes) {
                setDonnees(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettreTitre = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/titres-cedeao/enregistrer-titre', formTitre);
            setModalOuverte(false);
            setFormTitre({ employeNom: '', matricule: '', nationalite: 'Sénégalaise (Sénégal)', poste: 'Conseiller Commercial Fibre', agence: 'Agence Orange Plateau', typeTitre: 'CARTE_RESIDENT_BIOMETRIQUE_ONECI', numeroPiece: '', dateExpiration: '31/12/2028' });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Globe2 className="w-7 h-7 text-emerald-600" />
                        Passeport Séjour, Titres CEDEAO & Quota Ivoirisation
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Suivi des cartes consulaires et de résident biométrique ONECI des salariés de la sous-région et veille légale MEPS / AGEPE
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Enregistrer un Titre de Séjour
                </Button>
            </div>

            {/* Statistiques Métriques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Taux d'Ivoirisation Emplois</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.indicateurs.tauxIvoirisationEmplois || '94.0%'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Globe2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Salariés CEDEAO & Région</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.indicateurs.salariesRessortissantsCEDEAO || 21} talents</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Alertes Renouvellement J-60</p>
                            <p className="text-2xl font-bold text-amber-700">{donnees.alertesRenouvellement}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Régularité AGEPE / MEPS</p>
                            <p className="text-sm font-bold text-purple-700">100% Homologué</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Registre des Travailleurs Étrangers & CEDEAO */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Registre Spécial des Collaborateurs Non-Nationaux</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {donnees.salaries.map((s) => {
                        const estAlerte = s.statutRegul.includes('ALERTE');
                        return (
                            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className={`border shadow-sm ${estAlerte ? 'border-amber-300 bg-amber-50/15' : 'border-slate-200 bg-white'}`}>
                                    <CardContent className="p-5 space-y-3">
                                        <div className="flex items-start justify-between border-b pb-3 border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                    {s.employeNom.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-900 text-sm">{s.employeNom}</h3>
                                                        <Badge variant="outline">{s.matricule}</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                        Nationalité : <span className="font-semibold text-slate-800">{s.nationalite}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={estAlerte ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'}>
                                                {s.statutRegul.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                            <div className="bg-slate-50 p-2 rounded">
                                                <span className="text-slate-400 block font-medium">Type Titre :</span>
                                                <span className="font-semibold text-slate-800">{s.typeTitre.replace(/_/g, ' ')}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded">
                                                <span className="text-slate-400 block font-medium">N° Titre / Pièce :</span>
                                                <span className="font-mono font-semibold text-slate-800">{s.numeroPiece}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded">
                                                <span className="text-slate-400 block font-medium">Date d'Expiration :</span>
                                                <span className={`font-bold ${estAlerte ? 'text-amber-700' : 'text-slate-800'}`}>
                                                    {s.dateExpiration} ({s.joursRestantsAvantExpiration}j restants)
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded">
                                                <span className="text-slate-400 block font-medium">Visa Emploi AGEPE :</span>
                                                <span className="font-semibold text-emerald-700">{s.visaTravailMEPS}</span>
                                            </div>
                                        </div>

                                        <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs">
                                            <p className="text-slate-500 font-medium">Statut des démarches RH :</p>
                                            <p className="text-slate-800 italic mt-0.5">{s.actionsRH}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Modal d'enregistrement */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Globe2 className="w-5 h-5 text-emerald-600" />
                                Enregistrer Titre de Séjour / CEDEAO
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreTitre} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Nom & Prénoms</label>
                                    <Input 
                                        value={formTitre.employeNom} 
                                        onChange={(e) => setFormTitre({ ...formTitre, employeNom: e.target.value })}
                                        placeholder="Ex: Mamadou Diallo"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Matricule</label>
                                    <Input 
                                        value={formTitre.matricule} 
                                        onChange={(e) => setFormTitre({ ...formTitre, matricule: e.target.value })}
                                        placeholder="EMP-3100"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Nationalité</label>
                                    <Input 
                                        value={formTitre.nationalite} 
                                        onChange={(e) => setFormTitre({ ...formTitre, nationalite: e.target.value })}
                                        placeholder="Ex: Sénégalaise / Burkinabè"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Poste Occupé</label>
                                    <Input 
                                        value={formTitre.poste} 
                                        onChange={(e) => setFormTitre({ ...formTitre, poste: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Type de Document</label>
                                    <select 
                                        value={formTitre.typeTitre} 
                                        onChange={(e) => setFormTitre({ ...formTitre, typeTitre: e.target.value })}
                                        className="w-full text-sm p-2 border rounded-md"
                                    >
                                        <option value="CARTE_RESIDENT_BIOMETRIQUE_ONECI">Carte Résident ONECI (Biométrique)</option>
                                        <option value="CARTE_CONSULAIRE_BIOMETRIQUE">Carte Consulaire CEDEAO</option>
                                        <option value="PASSEPORT_ECOWAS_ET_VISA_TRAVAIL">Passeport ECOWAS + Visa Travail</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-700">Date d'Expiration</label>
                                    <Input 
                                        type="date"
                                        value={formTitre.dateExpiration} 
                                        onChange={(e) => setFormTitre({ ...formTitre, dateExpiration: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Numéro Officiel de Pièce</label>
                                <Input 
                                    value={formTitre.numeroPiece} 
                                    onChange={(e) => setFormTitre({ ...formTitre, numeroPiece: e.target.value })}
                                    placeholder="Ex: CR-ONECI-2025-00918"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">Consigner au Registre</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default TitresCedeao;
