import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Lock, Key, CheckCircle2, AlertTriangle, MessageSquare, PlusCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function Support() {
    // Local state for the tickets stored in the browser
    const [savedTickets, setSavedTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [notification, setNotification] = useState(null);

    // Load tickets from local storage on component mount
    useEffect(() => {
        const loadSavedTickets = () => {
            const tickets = JSON.parse(localStorage.getItem('sirh_support_tickets') || '[]');
            setSavedTickets(tickets);
        };
        loadSavedTickets();
    }, []);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const generateId = () => `TKT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const generateToken = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const handleCreateTicket = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const newId = generateId();
        const newToken = generateToken();
        const now = new Date().toISOString();

        const newTicketRecord = {
            id: newId,
            token: newToken,
            status: 'Ouvert',
            created_at: now,
            messages: [
                {
                    id: Math.random().toString(36).substring(2, 9),
                    sender: 'Employé',
                    body: newMessage,
                    timestamp: now
                }
            ]
        };

        // In a real app, this would be an API call, and ONLY the ID and token would be stored locally.
        // The messages would be fetched using the token.
        // For this frontend mockup, we simulate the database by putting the whole object in local storage,
        // but we emphasize that the ID and Token is what grants access.
        const updatedTickets = [...savedTickets, newTicketRecord];
        localStorage.setItem('sirh_support_tickets', JSON.stringify(updatedTickets));
        setSavedTickets(updatedTickets);

        setNewMessage('');
        setActiveTicket(newTicketRecord);
        showNotification(`Ticket créé de manière sécurisée. Conservez votre clé d'accès.`);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTicket) return;

        const now = new Date().toISOString();
        const newMsgObj = {
            id: Math.random().toString(36).substring(2, 9),
            sender: 'Employé',
            body: newMessage,
            timestamp: now
        };

        // Mocking the backend update
        const updatedTicket = {
            ...activeTicket,
            messages: [...activeTicket.messages, newMsgObj]
        };

        const updatedTickets = savedTickets.map(t => t.id === activeTicket.id ? updatedTicket : t);
        localStorage.setItem('sirh_support_tickets', JSON.stringify(updatedTickets));

        setSavedTickets(updatedTickets);
        setActiveTicket(updatedTicket);
        setNewMessage('');
    };

    const handleOpenTicket = (ticket) => {
        setActiveTicket(ticket);
    };

    const handleCloseActive = () => {
        setActiveTicket(null);
        setNewMessage('');
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 min-h-[calc(100vh-4rem)] relative">
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3 font-medium"
                    >
                        <CheckCircle2 size={20} />
                        {notification}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Support Social</h2>
                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                        <Lock size={14} className="text-amber-500" /> Canal sécurisé et 100% anonyme pour contacter l'Assistante Sociale.
                    </p>
                </div>
                {!activeTicket && (
                    <Button onClick={() => setActiveTicket('new')} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusCircle size={16} /> Nouvelle Demande
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">

                {/* Left Column: Active Tickets List */}
                <div className={cn("md:col-span-1 space-y-4", activeTicket ? "hidden md:block" : "block")}>
                    <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden border-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Key size={18} className="text-slate-500" /> Mes Clés d'Accès
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Les tickets sont stockés localement. Effacer les données de votre navigateur supprime définitivement l'accès.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                            {savedTickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                                    <MessageSquare size={32} className="text-slate-300 mb-3" />
                                    <p className="text-sm">Aucun ticket actif trouvé.</p>
                                </div>
                            ) : (
                                savedTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => handleOpenTicket(ticket)}
                                        className={cn(
                                            "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                                            activeTicket?.id === ticket.id
                                                ? "bg-blue-50 border-blue-200 shadow-sm"
                                                : "bg-white border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-slate-800 text-sm tracking-wide">{ticket.id}</span>
                                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider", ticket.status === 'Ouvert' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-2">{ticket.messages[0]?.body}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Chat/Create View */}
                <div className={cn("md:col-span-2", !activeTicket ? "hidden md:block" : "block")}>
                    {!activeTicket ? (
                        <div className="h-[calc(100vh-12rem)] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                <Lock size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Support 100% Anonyme</h3>
                            <p className="text-slate-500 max-w-md text-sm mb-6">
                                Démarrez une conversation avec l'assistante sociale. Votre identité n'est jamais liée à la demande. Nous générons un jeton d'accès unique stocké uniquement sur votre appareil.
                            </p>
                            <Button onClick={() => setActiveTicket('new')} className="bg-slate-900 hover:bg-slate-800 text-white">
                                Démarrer une Demande Sécurisée
                            </Button>
                        </div>
                    ) : (
                        <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-900 text-white py-4 px-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Lock size={64} />
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <button onClick={handleCloseActive} className="md:hidden p-1 mr-2 rounded hover:bg-slate-800 text-slate-300">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {activeTicket === 'new' ? 'Nouvelle Demande Sécurisée' : `Conversation : ${activeTicket.id}`}
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 mt-1 flex items-center gap-1.5 text-xs">
                                            {activeTicket === 'new' ? (
                                                <><AlertTriangle size={12} className="text-amber-400" /> Un jeton unique sera généré sur votre appareil.</>
                                            ) : (
                                                <><Key size={12} className="text-emerald-400" /> Sécurisé par clé locale : <span className="font-mono text-[10px] text-slate-500 ml-1">{activeTicket.token.substring(0, 8)}...</span></>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 flex flex-col bg-slate-50">
                                {/* Chat History Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {activeTicket === 'new' ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex items-start gap-3">
                                            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                                            <div>
                                                <p className="font-semibold mb-1">Avis de Confidentialité</p>
                                                <p>Décrivez votre situation ci-dessous sans informations permettant de vous identifier pour rester anonyme. L'assistante sociale vous répondra ici.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        activeTicket.messages.map((msg) => (
                                            <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.sender === 'Employé' ? "ml-auto items-end" : "mr-auto items-start")}>
                                                <div className="text-[10px] font-medium text-slate-400 mb-1 px-1 uppercase tracking-wider">
                                                    {msg.sender === 'Employé' ? 'Vous' : 'Assistante Sociale'}
                                                </div>
                                                <div className={cn(
                                                    "px-4 py-3 rounded-2xl text-sm shadow-sm",
                                                    msg.sender === 'Employé'
                                                        ? "bg-slate-900 text-white rounded-tr-sm"
                                                        : "bg-white border text-slate-800 rounded-tl-sm"
                                                )}>
                                                    {msg.body}
                                                </div>
                                                <div className="text-[9px] text-slate-400 mt-1 px-1">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Message Input Area */}
                                <div className="p-4 bg-white border-t border-slate-100">
                                    <form onSubmit={activeTicket === 'new' ? handleCreateTicket : handleSendMessage} className="flex gap-2">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={activeTicket === 'new' ? "Décrivez votre situation..." : "Tapez votre réponse..."}
                                            className="bg-slate-50 focus-visible:ring-slate-900 border-slate-200"
                                        />
                                        <Button type="submit" className={cn("px-4", activeTicket === 'new' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-800")} disabled={!newMessage.trim()}>
                                            {activeTicket === 'new' ? 'Envoyer Sécurisé' : <Send size={16} />}
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
