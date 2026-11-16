import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, CheckCircle2, Plus, Phone, Lock, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function ObjetsTrouves() {
    const [donnees, setDonnees] = useState({ objets: [], securiteProcedure: '' });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formObjet, setFormObjet] = useState({
        descriptionObjet: '',
        proprietairePresume: '',
        telephoneContact: '',
        lieuDecouverte: 'Guichet Caisse N°1',
        agenceNom: 'Agence Orange Cocody Deux Plateaux',
        agentDecouvreur: ''
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/objets-trouves/liste');
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

    const soumettreObjet = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/objets-trouves/enregistrer', formObjet);
            setModalOuverte(false);
            setFormObjet({
                descriptionObjet: '',
                proprietairePresume: '',
                telephoneContact: '',
                lieuDecouverte: 'Guichet Caisse N°1',
                agenceNom: 'Agence Orange Cocody Deux Plateaux',
                agentDecouvreur: ''
            });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="w-7 h-7 text-amber-600" />
                        Registre Sécurisé des Objets & CNI Oubliés en Boutique
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Sécurisation sous double clé au coffre-fort d'agence des pièces d'identité, portefeuilles et téléphones égarés par les clients
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Consigner un Objet au Coffre
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donnees.objets.map((obj) => (
                    <motion.div key={obj.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="shadow-sm border-l-4 border-l-amber-500">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        {obj.proprietairePresume}
                                    </CardTitle>
                                    <Badge className={obj.statutRestitution === 'RESTITUE_AVEC_DECHARGE' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800'}>
                                        {obj.statutRestitution === 'RESTITUE_AVEC_DECHARGE' ? 'Restitué avec Décharge' : 'Sous Clé au Coffre'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-500">Boutique : <strong>{obj.agenceNom}</strong></p>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="p-2.5 bg-slate-50 rounded-lg space-y-1 text-xs text-slate-700">
                                    <p>📦 <strong>Description :</strong> {obj.descriptionObjet}</p>
                                    <p>📍 <strong>Lieu trouvé :</strong> {obj.lieuDecouverte} (Trouvé par: {obj.agentDecouvreur})</p>
                                    <p>🔒 <strong>Sécurité :</strong> {obj.lieuStockageSecurise}</p>
                                    <p className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> SMS automatique de notification client envoyé
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
                                    <span>Contact : {obj.telephoneContact}</span>
                                    <span>Déposé le {obj.dateDepot}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-600" />
                            Consignation d'un Objet Oublié
                        </h3>
                        <form onSubmit={soumettreObjet} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Description précise de l'objet</label>
                                <Input required value={formObjet.descriptionObjet} onChange={(e) => setFormObjet({ ...formObjet, descriptionObjet: e.target.value })} placeholder="Ex: Portefeuille marron avec CNI..." />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Nom présumé du client / Propriétaire</label>
                                <Input required value={formObjet.proprietairePresume} onChange={(e) => setFormObjet({ ...formObjet, proprietairePresume: e.target.value })} placeholder="Ex: Bakary Koné" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Téléphone de contact</label>
                                <Input required value={formObjet.telephoneContact} onChange={(e) => setFormObjet({ ...formObjet, telephoneContact: e.target.value })} placeholder="+225 07 XX XX XX XX" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Lieu précis dans l'agence</label>
                                <Input required value={formObjet.lieuDecouverte} onChange={(e) => setFormObjet({ ...formObjet, lieuDecouverte: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-700">Agent ayant découvert l'objet</label>
                                <Input required value={formObjet.agentDecouvreur} onChange={(e) => setFormObjet({ ...formObjet, agentDecouvreur: e.target.value })} placeholder="Votre nom" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">Consigner au Coffre</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
