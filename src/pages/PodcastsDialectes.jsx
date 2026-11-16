import React, { useState, useEffect } from 'react';
import { Mic, Headphones, Play, Pause, Award, CheckCircle2, Globe2, BookOpen, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';

export function PodcastsDialectes() {
    const [podcasts, setPodcasts] = useState([]);
    const [stats, setStats] = useState({});
    const [chargement, setChargement] = useState(true);
    const [lecteurActif, setLecteurActif] = useState(null);
    const [enLecture, setEnLecture] = useState(false);

    const charger = async () => {
        try {
            setChargement(true);
            const res = await api.get('/api/podcasts-dialectes/podcasts');
            if (res.data && res.data.success) {
                setPodcasts(res.data.podcasts);
                setStats(res.data.stats);
                if (res.data.podcasts.length > 0) {
                    setLecteurActif(res.data.podcasts[0]);
                }
            }
        } catch (err) {
            console.error('Erreur podcasts-dialectes:', err);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        charger();
    }, []);

    const toggleLecture = (podcast) => {
        if (lecteurActif?.id === podcast.id) {
            setEnLecture(!enLecture);
        } else {
            setLecteurActif(podcast);
            setEnLecture(true);
        }
    };

    const validerModuleAudio = async (podcastId) => {
        try {
            const res = await api.post('/api/podcasts-dialectes/progression', {
                matricule: 'EMP-0145',
                podcastId,
                scoreQuiz: 95
            });
            if (res.data && res.data.success) {
                alert(`🎉 Félicitations ! Module validé avec ${res.data.nouveauScore} points d'expertise linguistique locale !`);
            }
        } catch (err) {
            alert('Erreur validation module audio');
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Mic className="w-7 h-7 text-rose-600" />
                        Podcasts Micro-Learning en Dialectes Locaux
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Argumentaires de vente en Dioula, Baoulé, Bété, Sénoufo & Nouchi : convertissez vos clients dans leur langue de cœur
                    </p>
                </div>
                <Button onClick={charger} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualiser Bibliothèque
                </Button>
            </div>

            {/* Statistiques Micro-Learning */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Écoutes Complètes</p>
                            <p className="text-2xl font-bold text-rose-700">{stats.totalEcoutes || '1 240'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Badges Dialecte Certifiés</p>
                            <p className="text-2xl font-bold text-emerald-700">{stats.badgesCertifies || '185'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                            <Globe2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Langues Disponibles</p>
                            <p className="text-2xl font-bold text-amber-700">5 Langues Locales</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Impact Ventes Terrain</p>
                            <p className="text-2xl font-bold text-purple-700">+34% Conversion</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lecteur Audio Principal */}
            {lecteurActif && (
                <Card className="border-rose-200 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => toggleLecture(lecteurActif)}
                                    className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white shadow-xl transition-transform hover:scale-105"
                                >
                                    {enLecture ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                                </button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-rose-500/80 text-white border-none">{lecteurActif.langue}</Badge>
                                        <span className="text-xs text-rose-200">Durée : {lecteurActif.dureeMinutes} min</span>
                                    </div>
                                    <h3 className="text-xl font-bold mt-1">{lecteurActif.titre}</h3>
                                    <p className="text-xs text-rose-200 mt-1 max-w-xl">{lecteurActif.descriptionPédagogique}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <span className="text-xs text-rose-200">Exemple d'accroche :</span>
                                    <p className="text-sm italic font-medium text-amber-300">« {lecteurActif.exemplePhraseCle} »</p>
                                </div>
                                <Button 
                                    onClick={() => validerModuleAudio(lecteurActif.id)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-xs"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Valider le Quiz & Gagner le Badge
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Catalogue des Podcasts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map(p => (
                    <Card key={p.id} className="border-slate-200 hover:shadow-md transition-shadow">
                        <CardHeader className="bg-slate-50/70 border-b border-slate-100 pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="bg-rose-600 text-white mb-2">{p.langue}</Badge>
                                    <CardTitle className="text-base text-slate-900">{p.titre}</CardTitle>
                                </div>
                                <span className="text-xs font-mono text-slate-500">{p.dureeMinutes} min</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <p className="text-xs text-slate-600">{p.descriptionPédagogique}</p>
                            <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100 text-xs">
                                <span className="font-semibold text-rose-900 block">Phrase clé à retenir :</span>
                                <span className="italic text-rose-800">« {p.exemplePhraseCle} »</span>
                            </div>
                            <div className="pt-2 flex items-center justify-between">
                                <Button 
                                    size="sm" 
                                    onClick={() => toggleLecture(p)}
                                    variant="outline" 
                                    className="text-rose-700 border-rose-300 hover:bg-rose-50 flex items-center gap-1.5"
                                >
                                    <Volume2 className="w-4 h-4" />
                                    {lecteurActif?.id === p.id && enLecture ? 'En cours d\'écoute' : 'Écouter l\'audio'}
                                </Button>
                                <span className="text-xs text-slate-400">{p.tauxReussiteQuiz}% de réussite</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
