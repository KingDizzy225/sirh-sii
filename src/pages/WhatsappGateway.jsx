import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
    MessageSquare, Send, CheckCheck, Smartphone, ShieldCheck, 
    Sparkles, FileText, Calendar, Clock, RefreshCw, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

const QUICK_COMMANDS = [
    { cmd: '!solde', label: '📊 Solde de congés', desc: 'Consulter vos jours disponibles' },
    { cmd: '!paie', label: '📄 Dernier bulletin', desc: 'Recevoir le PDF de paie' },
    { cmd: '!attestation', label: '📑 Attestation de travail', desc: 'Générer une attestation' },
    { cmd: '!conge 15/09 20/09', label: '🌴 Poser un congé', desc: 'Soumettre une demande' }
];

export function WhatsappGateway() {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: '🤖 Bonjour ! Je suis l\'assistant WhatsApp RH de SII Côte d\'Ivoire.\n\nTapez une commande comme !solde, !paie ou !attestation pour obtenir une réponse instantanée.', time: '10:00' }
    ]);
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/whatsapp/logs').catch(() => ({ data: null }));
            if (res?.data && Array.isArray(res.data)) {
                setLogs(res.data);
            }
        } catch (e) {}
    };

    const handleSend = async (customText = null) => {
        const textToSend = (customText || input).trim();
        if (!textToSend || loading) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: textToSend,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/whatsapp/command', {
                phoneNumber: '+225 07 08 09 10 11',
                message: textToSend
            }).catch(() => ({ data: null }));

            const replyText = res?.data?.reply || `🤖 [Assistant RH] Commande "${textToSend}" enregistrée. Votre demande est en cours de traitement.`;

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: replyText,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
                fetchLogs();
                setLoading(false);
            }, 600);

        } catch (err) {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <MessageSquare className="text-emerald-600" /> Portail Self-Service WhatsApp & SMS RH
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Accès RH 24/7 sans ordinateur pour tous les collaborateurs de SII Côte d'Ivoire.
                    </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 font-bold">
                    🟢 Serveur WhatsApp Connecté
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Quick Commands & HR Logs */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles size={18} className="text-amber-500" /> Raccourcis de Commandes Instantanées
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {QUICK_COMMANDS.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(item.cmd)}
                                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group shadow-sm bg-white"
                                >
                                    <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">{item.label}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                                    <code className="inline-block mt-2 text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                                        {item.cmd}
                                    </code>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Command Audit Log */}
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Journal d'Activité des Commandes WhatsApp</span>
                                <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-1 text-xs">
                                    <RefreshCw size={12} /> Actualiser
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                {logs.length > 0 ? logs.map(log => (
                                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <div>
                                            <p className="font-bold text-xs text-slate-800">{log.phoneNumber}</p>
                                            <p className="text-xs font-mono text-emerald-700 mt-0.5">{log.command}</p>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Traitée</Badge>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-slate-400 text-xs">Aucune commande récente enregistrée</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Phone Simulator (WhatsApp UI) */}
                <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-sm rounded-[36px] bg-slate-900 p-4 shadow-2xl border-4 border-slate-800 relative">
                        {/* Speaker cutout */}
                        <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>

                        {/* WhatsApp App Screen */}
                        <div className="bg-[#0b141a] rounded-[24px] overflow-hidden h-[540px] flex flex-col font-sans">
                            {/* App Header */}
                            <div className="bg-[#202c33] p-3 text-white flex items-center gap-3 border-b border-slate-800">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                                    SII
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-100 truncate">Assistant RH SII</p>
                                    <p className="text-[10px] text-emerald-400 font-medium">● En ligne 24/7</p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0b141a]">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-[#005c4b] text-white rounded-tr-none'
                                                : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/50'
                                        }`}>
                                            <p className="whitespace-pre-line">{msg.text}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                                                <span>{msg.time}</span>
                                                {msg.sender === 'user' && <CheckCheck size={12} className="text-sky-400" />}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Footer */}
                            <div className="p-2 bg-[#202c33] flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Tapez !solde, !paie..."
                                    className="flex-1 bg-[#2a3942] text-white text-xs rounded-full px-3.5 py-2 focus:outline-none placeholder:text-slate-400"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 shrink-0"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
