import React, { useState, useEffect } from 'react';
import { 
    Sparkles, CheckCircle2, XCircle, Trophy, Send, 
    RefreshCw, Zap, BookOpen, Star, Award, MessageSquare 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

export function QuizVenteMatin() {
    const [donnees, setDonnees] = useState({ quiz: null, totalParticipants: 0, tauxReussite: 0, participations: [] });
    const [chargement, setChargement] = useState(true);
    const [reponseChoisie, setReponseChoisie] = useState(null);
    const [resultat, setResultat] = useState(null);
    const [diffusionStatut, setDiffusionStatut] = useState(null);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/quiz-vente/actuel');
            if (res.data) setDonnees(res.data);
        } catch (e) {
            console.error('Erreur quiz vente:', e);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const soumettre = async () => {
        if (!reponseChoisie || !donnees.quiz) return;
        try {
            const res = await api.post('/quiz-vente/repondre', {
                quizId: donnees.quiz.id,
                reponseNumero: reponseChoisie
            });
            setResultat(res.data);
            await charger();
        } catch (e) {
            console.error('Erreur soumission quiz:', e);
        }
    };

    const diffuserSurWhatsApp = async () => {
        try {
            const res = await api.post('/quiz-vente/diffuser-whatsapp');
            setDiffusionStatut("Message de défi prêt et envoyé au canal WhatsApp des conseillers de boutique !");
            setTimeout(() => setDiffusionStatut(null), 5000);
        } catch (e) {
            console.error('Erreur diffusion quiz:', e);
        }
    };

    const quiz = donnees.quiz;

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white p-8 rounded-3xl shadow-xl">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Zap className="w-8 h-8 text-amber-200 animate-pulse" />
                        </span>
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-amber-200">Micro-Learning Opérationnel 60s</span>
                            <h1 className="text-3xl font-black tracking-tight">Défi Éclair : Quiz Vente du Matin</h1>
                            <p className="text-amber-100 text-sm mt-1">
                                Ancrage mémoriel quotidien des offres Fibre, SIM & Orange Money auprès des équipes commerciales
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={diffuserSurWhatsApp} className="bg-white text-orange-700 hover:bg-orange-50 font-bold shadow-lg">
                        <MessageSquare className="w-4 h-4 mr-2" /> Diffuser à 08h15 sur WhatsApp
                    </Button>
                </div>
            </div>

            {diffusionStatut && (
                <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {diffusionStatut}
                </div>
            )}

            {/* Statistiques d'assimilation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Participants ce matin</p>
                            <p className="text-3xl font-black text-slate-900 mt-1">{donnees.totalParticipants} conseillers</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <Star className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Taux de maîtrise des offres</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{donnees.tauxReussite}%</p>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Trophy className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Gain par bonne réponse</p>
                            <p className="text-3xl font-black text-orange-600 mt-1">+10 pts Rewards</p>
                        </div>
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                            <Award className="w-7 h-7" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Le Quiz du Jour */}
            {quiz && (
                <Card className="border-slate-200 bg-white shadow-md">
                    <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
                        <div>
                            <Badge className="bg-amber-500 text-white mb-2">Thème : {quiz.theme}</Badge>
                            <h2 className="text-2xl font-bold text-slate-900 leading-snug">{quiz.question}</h2>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-3">
                            {quiz.options.map((opt) => (
                                <button
                                    key={opt.numero}
                                    onClick={() => setReponseChoisie(opt.numero)}
                                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                                        reponseChoisie === opt.numero 
                                            ? 'border-orange-500 bg-orange-50/60 font-bold text-slate-900 shadow-xs' 
                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                                            reponseChoisie === opt.numero ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            {opt.numero}
                                        </span>
                                        <span className="text-lg">{opt.texte}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {!resultat ? (
                            <div className="pt-4 flex justify-end">
                                <Button 
                                    onClick={soumettre} 
                                    disabled={!reponseChoisie}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl shadow-md"
                                >
                                    Valider ma réponse
                                </Button>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl border mt-4 ${
                                resultat.estCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                            }`}>
                                <div className="flex items-start gap-3">
                                    {resultat.estCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}
                                    <div>
                                        <p className="font-bold text-lg">{resultat.message}</p>
                                        <p className="text-sm mt-1 opacity-90">{resultat.explication}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Dernières participations en direct */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Participations en direct des agences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donnees.participations.map((p) => (
                        <Card key={p.id} className="border-slate-200 bg-white">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{p.employeNom}</p>
                                    <p className="text-xs text-slate-500">{p.siteNom}</p>
                                </div>
                                <Badge variant={p.estCorrect ? 'success' : 'destructive'} className="text-xs px-2.5 py-1">
                                    {p.estCorrect ? '+10 pts 🎯' : '0 pt'}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
