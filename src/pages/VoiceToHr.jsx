import React, { useState, useEffect } from 'react';
import { Mic, MessageSquare, Bot, AlertCircle, CheckCircle2, Volume2, Plus, Sparkles, Clock, MapPin, User, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function VoiceToHr() {
    const [donnees, setDonnees] = useState({ messages: [], totalTraites: 0, tauxPrecisionIA: '98.4%', tempsMoyenTraitementSec: 4.2 });
    const [chargement, setChargement] = useState(true);
    const [modalOuverte, setModalOuverte] = useState(false);
    const [formAudio, setFormAudio] = useState({
        employeNom: '',
        agence: 'Agence Orange Plateau République',
        audioText: '',
        canal: 'WhatsApp Bot RH'
    });

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/voice-to-hr/messages');
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

    const soumettreAudio = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/voice-to-hr/traiter-vocal', formAudio);
            setModalOuverte(false);
            setFormAudio({ employeNom: '', agence: 'Agence Orange Plateau République', audioText: '', canal: 'WhatsApp Bot RH' });
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
                        <Mic className="w-7 h-7 text-orange-500" />
                        Voice-to-HR (Notes Vocales WhatsApp & Nouchi)
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Traitement intelligent des mémos vocaux des agents de terrain (retard intempérie, panne moto, litige) par compréhension IA
                    </p>
                </div>
                <Button onClick={() => setModalOuverte(true)} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Simuler une Note Vocale Entrante
                </Button>
            </div>

            {/* Statistiques KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Notes Vocales Traitées</p>
                            <p className="text-2xl font-bold text-slate-900">{donnees.totalTraites}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Précision IA / Nouchi</p>
                            <p className="text-2xl font-bold text-emerald-600">{donnees.tauxPrecisionIA}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Vitesse de Traitement</p>
                            <p className="text-2xl font-bold text-blue-600">{donnees.tempsMoyenTraitementSec}s</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Canal WhatsApp Dédié</p>
                            <p className="text-sm font-bold text-purple-700">+225 07 00 20 26 (Bot RH)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des messages vocaux analysés */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-orange-500" />
                    Flux Récent des Messages Vocaux et Décisions RH Instantanées
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {donnees.messages.map((msg) => (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card className="border-slate-200 shadow-sm hover:border-orange-300 transition-colors">
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-3 border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                                                {msg.employeNom.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900">{msg.employeNom}</h3>
                                                    <Badge variant="outline" className="text-xs">{msg.matricule}</Badge>
                                                    <Badge className="bg-orange-500/10 text-orange-700 text-xs">{msg.canal}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                    <MapPin className="w-3.5 h-3.5" /> {msg.agence} • {msg.poste}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold text-slate-400">{msg.dateEnvoi}</span>
                                            <p className="text-xs text-slate-500">Audio: {msg.dureeAudioSec}s ({msg.langueDetectee})</p>
                                        </div>
                                    </div>

                                    {/* Transcription et analyse */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
                                                <Volume2 className="w-3.5 h-3.5 text-slate-600" />
                                                Transcription Audio Fidèle
                                            </p>
                                            <p className="text-sm text-slate-800 italic">"{msg.transcriptionBrute}"</p>
                                        </div>

                                        <div className="bg-orange-50/60 p-3.5 rounded-lg border border-orange-200">
                                            <p className="text-xs font-bold text-orange-700 uppercase flex items-center gap-1.5 mb-2">
                                                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                                                Analyse & Structuration IA
                                            </p>
                                            <div className="text-xs space-y-1 text-slate-700">
                                                <p><span className="font-semibold">Catégorie :</span> <Badge variant="secondary" className="text-[10px] ml-1">{msg.analyseIA.categorie}</Badge></p>
                                                <p><span className="font-semibold">Motif extrait :</span> {msg.analyseIA.motifExtrait}</p>
                                                <p><span className="font-semibold">Action RH :</span> <span className="text-emerald-700 font-medium">{msg.actionExecutee}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Modal de simulation */}
            {modalOuverte && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <Mic className="w-5 h-5 text-orange-500" />
                                Déposer un Message Vocal (Test IA)
                            </h3>
                            <button onClick={() => setModalOuverte(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={soumettreAudio} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-700">Nom du Conseiller / Agent</label>
                                <Input 
                                    value={formAudio.employeNom} 
                                    onChange={(e) => setFormAudio({ ...formAudio, employeNom: e.target.value })}
                                    placeholder="Ex: Kouamé N'Guessan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Agence de Rattachement</label>
                                <Input 
                                    value={formAudio.agence} 
                                    onChange={(e) => setFormAudio({ ...formAudio, agence: e.target.value })}
                                    placeholder="Ex: Agence Orange Treichville Arras"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-700">Message Vocal (Transcription texte simulée)</label>
                                <textarea 
                                    value={formAudio.audioText} 
                                    onChange={(e) => setFormAudio({ ...formAudio, audioText: e.target.value })}
                                    rows={3}
                                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    placeholder="Ex: Allô patron, je suis coincé au carrefour Akwaba, contrôle de police et bouchon monstre. Je serai là vers 08h30."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" onClick={() => setModalOuverte(false)}>Annuler</Button>
                                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Analyser & Traiter par IA</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default VoiceToHr;
