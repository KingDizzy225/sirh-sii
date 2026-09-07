import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
    MessageSquare, Send, CheckCheck, ShieldCheck, ShieldAlert,
    RefreshCw, Copy, AlertTriangle, Radio
} from 'lucide-react';
import { api, listeSure } from '../lib/api';

/**
 * Guichet RH par WhatsApp.
 *
 * Cette page annonçait « 🟢 Serveur WhatsApp Connecté » en dur, quel que soit
 * l'état réel du raccordement — et il n'y en avait aucun : la logique du
 * guichet n'était joignable que depuis cet écran, aucun salarié ne pouvait
 * l'atteindre. Elle proposait aussi une commande « !attestation » que le
 * serveur ne connaît pas.
 *
 * L'état affiché vient désormais du serveur, et distingue la réception de
 * l'envoi : un guichet qui reçoit sans pouvoir répondre laisse le salarié sans
 * nouvelle alors que sa demande de congé a bien été enregistrée.
 */

const COMMANDES = [
    { cmd: '!solde', label: 'Solde de congés', desc: 'Le compteur tenu par l\'application' },
    { cmd: '!paie', label: 'Dernier bulletin', desc: 'Période disponible et lien de téléchargement' },
    { cmd: '!conge 15/09/2026 20/09/2026', label: 'Poser un congé', desc: 'Demande réellement enregistrée, en attente de validation' },
    { cmd: '!aide', label: 'Aide', desc: 'Liste des commandes' }
];

export function WhatsappGateway() {
    const [config, setConfig] = useState(null);
    const [messages, setMessages] = useState([]);
    const [numero, setNumero] = useState('');
    const [input, setInput] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copie, setCopie] = useState(false);

    const chargerLogs = useCallback(async () => {
        const res = await api.get('/whatsapp/logs').catch(() => ({ data: null }));
        setLogs(listeSure(res?.data, 'journal WhatsApp'));
    }, []);

    const chargerConfig = useCallback(async () => {
        const res = await api.get('/whatsapp/configuration').catch(() => ({ data: null }));
        setConfig(res?.data || null);
    }, []);

    useEffect(() => {
        chargerConfig();
        chargerLogs();
    }, [chargerConfig, chargerLogs]);

    const envoyer = async (texteImpose = null) => {
        const texte = (texteImpose || input).trim();
        if (!texte || loading) return;

        if (!numero.trim()) {
            setMessages(prev => [...prev, {
                id: Date.now(), sender: 'system',
                text: "Renseignez d'abord le numéro d'un salarié : le guichet identifie l'appelant à son numéro, et c'est précisément ce que cet essai doit vérifier."
            }]);
            return;
        }

        const heure = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: texte, time: heure() }]);
        setInput('');
        setLoading(true);

        const res = await api.post('/whatsapp/command', { phoneNumber: numero, message: texte })
            .catch(() => ({ data: null }));

        // Pas de réponse inventée en cas d'échec : la page annonçait
        // auparavant « commande enregistrée, en cours de traitement » alors
        // que rien n'avait été traité.
        const reponse = res?.data?.reply
            || "Le serveur n'a pas répondu. La commande n'a pas été traitée.";

        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: reponse, time: heure() }]);
        setLoading(false);
        chargerLogs();
    };

    const copierUrl = () => {
        if (!config?.urlWebhook) return;
        navigator.clipboard?.writeText(config.urlWebhook);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    const raccorde = config?.receptionActive && config?.envoiActif;
    const partiel = config && (config.receptionActive !== config.envoiActif);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <MessageSquare className="text-emerald-600" /> Guichet RH par WhatsApp
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Solde de congés, bulletin et demande d'absence, pour les salariés qui n'ont ni poste ni adresse professionnelle.
                    </p>
                </div>
                {config && (
                    <Badge className={`text-xs px-3 py-1 font-bold ${
                        raccorde ? 'bg-emerald-100 text-emerald-800'
                                 : partiel ? 'bg-amber-100 text-amber-800'
                                           : 'bg-slate-200 text-slate-700'}`}>
                        {raccorde ? 'Raccordé' : partiel ? 'Raccordement incomplet' : 'Non raccordé'}
                    </Badge>
                )}
            </div>

            {/* État réel du raccordement */}
            <Card className="border border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Radio size={18} className="text-slate-500" /> Raccordement
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    {!config ? (
                        <p className="text-sm text-slate-400">Lecture de l'état du serveur…</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className={`p-4 rounded-xl border ${config.receptionActive ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        {config.receptionActive ? <ShieldCheck size={15} className="text-emerald-600" /> : <ShieldAlert size={15} className="text-slate-400" />}
                                        Réception des messages
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {config.receptionActive
                                            ? "Les messages des salariés sont reçus, et leur origine vérifiée par signature."
                                            : "Aucun message n'est reçu. L'adresse du guichet étant publique, elle reste fermée tant que la signature ne peut pas être vérifiée."}
                                    </p>
                                </div>
                                <div className={`p-4 rounded-xl border ${config.envoiActif ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        {config.envoiActif ? <ShieldCheck size={15} className="text-emerald-600" /> : <ShieldAlert size={15} className="text-slate-400" />}
                                        Envoi des réponses
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        {config.envoiActif
                                            ? "Les réponses partent chez l'opérateur."
                                            : "Aucune réponse ne part : le salarié écrirait sans jamais recevoir de retour."}
                                    </p>
                                </div>
                            </div>

                            {partiel && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                                    <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-900">
                                        Raccordement à moitié fait. C'est le cas le plus trompeur :
                                        {config.receptionActive
                                            ? " les demandes arrivent et sont enregistrées, mais personne ne reçoit de confirmation."
                                            : " les réponses pourraient partir, mais aucune demande n'arrive."}
                                    </p>
                                </div>
                            )}

                            {config.variablesManquantes?.length > 0 && (
                                <div className="text-xs text-slate-600">
                                    <span className="font-semibold">Variables à définir sur le serveur : </span>
                                    {config.variablesManquantes.map(v => (
                                        <code key={v} className="inline-block bg-slate-100 px-1.5 py-0.5 rounded font-mono mr-1">{v}</code>
                                    ))}
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs font-semibold text-slate-700 mb-1">Adresse du webhook à déclarer chez Meta</p>
                                {config.urlWebhook ? (
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 text-[11px] bg-slate-900 text-slate-100 px-3 py-2 rounded-lg font-mono overflow-x-auto">
                                            {config.urlWebhook}
                                        </code>
                                        <Button variant="outline" size="sm" onClick={copierUrl} className="gap-1 text-xs shrink-0">
                                            <Copy size={12} /> {copie ? 'Copiée' : 'Copier'}
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-amber-700">{config.urlWebhookMotif}</p>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-base font-bold text-slate-900">Commandes reconnues</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {COMMANDES.map((item) => (
                                <button
                                    key={item.cmd}
                                    onClick={() => envoyer(item.cmd)}
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

                    <Card className="border border-slate-200 shadow-sm bg-white">
                        <CardHeader className="p-5 border-b border-slate-100">
                            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                                <span>Journal des messages</span>
                                <Button variant="outline" size="sm" onClick={chargerLogs} className="gap-1 text-xs">
                                    <RefreshCw size={12} /> Actualiser
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                                {logs.length > 0 ? logs.map(log => (
                                    <div key={log.id} className="p-4 flex items-start justify-between gap-3 hover:bg-slate-50">
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs text-slate-800">{log.phoneNumber}</p>
                                            <p className="text-xs font-mono text-emerald-700 mt-0.5 truncate">{log.command}</p>
                                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{log.response}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            {/* Un essai depuis cet écran n'est pas un message reçu d'un
                                                salarié : les confondre fausserait la lecture du journal. */}
                                            <Badge className={`text-[10px] ${log.direction === 'SIMULATION' ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-800'}`}>
                                                {log.direction === 'SIMULATION' ? 'Essai' : 'Reçu'}
                                            </Badge>
                                            <Badge className={`text-[10px] ${
                                                log.status === 'ERROR' ? 'bg-red-100 text-red-700'
                                                    : log.delivered ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-amber-100 text-amber-800'}`}>
                                                {log.status === 'ERROR' ? 'Échec' : log.delivered ? 'Remis' : 'Non remis'}
                                            </Badge>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-6 text-center text-slate-400 text-xs">Aucun message enregistré</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Essai — rien n'est envoyé */}
                <div className="lg:col-span-5 flex flex-col items-center gap-3">
                    <div className="w-full max-w-sm">
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                            Numéro d'un salarié (essai)
                        </label>
                        <input
                            type="tel"
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                            placeholder="ex. +225 01 23 45 67 89"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                            Cet écran éprouve les réponses du guichet à partir des données réelles du
                            salarié. Aucun message n'est envoyé sur WhatsApp.
                        </p>
                    </div>

                    <div className="w-full max-w-sm rounded-[36px] bg-slate-900 p-4 shadow-2xl border-4 border-slate-800">
                        <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3"></div>
                        <div className="bg-[#0b141a] rounded-[24px] overflow-hidden h-[480px] flex flex-col font-sans">
                            <div className="bg-[#202c33] p-3 text-white flex items-center gap-3 border-b border-slate-800">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                                    RH
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-100 truncate">Guichet RH</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Essai — aucun envoi réel</p>
                                </div>
                            </div>

                            <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#0b141a]">
                                {messages.length === 0 && (
                                    <p className="text-[11px] text-slate-500 text-center mt-6 px-4">
                                        Saisissez un numéro de salarié, puis une commande, pour voir la réponse
                                        exacte que le guichet lui adresserait.
                                    </p>
                                )}
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                                            msg.sender === 'user'
                                                ? 'bg-[#005c4b] text-white rounded-tr-none'
                                                : msg.sender === 'system'
                                                    ? 'bg-amber-900/40 text-amber-100 border border-amber-700/50'
                                                    : 'bg-[#202c33] text-slate-200 rounded-tl-none border border-slate-700/50'
                                        }`}>
                                            <p className="whitespace-pre-line">{msg.text}</p>
                                            {msg.time && (
                                                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                                                    <span>{msg.time}</span>
                                                    {msg.sender === 'user' && <CheckCheck size={12} className="text-sky-400" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-2 bg-[#202c33] flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && envoyer()}
                                    placeholder="!solde, !paie, !conge…"
                                    className="flex-1 bg-[#2a3942] text-white text-xs rounded-full px-3.5 py-2 focus:outline-none placeholder:text-slate-400"
                                />
                                <button
                                    onClick={() => envoyer()}
                                    disabled={loading}
                                    className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 shrink-0 disabled:opacity-50"
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
