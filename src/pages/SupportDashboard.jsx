import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Send, Users, Activity, CheckCircle2, Clock, MessageSquare, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function SupportDashboard() {
    // Local state for tickets mimicking a database fetch
    const [allTickets, setAllTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [notification, setNotification] = useState(null);

    // Poll local storage to simulate live updates (since employee might submit a ticket in another tab)
    useEffect(() => {
        const fetchTickets = () => {
            const tickets = JSON.parse(localStorage.getItem('sirh_support_tickets') || '[]');
            // Sort by most recent first based on created_at or last message
            tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAllTickets(tickets);

            // If active ticket was updated elsewhere, sync it
            if (activeTicket) {
                const updatedActive = tickets.find(t => t.id === activeTicket.id);
                if (updatedActive) setActiveTicket(updatedActive);
            }
        };

        fetchTickets();
        const interval = setInterval(fetchTickets, 3000); // Check every 3 seconds
        return () => clearInterval(interval);
    }, [activeTicket]);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !activeTicket) return;

        const now = new Date().toISOString();
        const newMsgObj = {
            id: Math.random().toString(36).substring(2, 9),
            sender: 'Assistante Sociale',
            body: replyMessage,
            timestamp: now
        };

        // Mock database update
        const updatedTicket = {
            ...activeTicket,
            status: 'Répondu',
            updated_at: now,
            messages: [...activeTicket.messages, newMsgObj]
        };

        const currentTickets = JSON.parse(localStorage.getItem('sirh_support_tickets') || '[]');
        const updatedTickets = currentTickets.map(t => t.id === activeTicket.id ? updatedTicket : t);

        localStorage.setItem('sirh_support_tickets', JSON.stringify(updatedTickets));
        setAllTickets(updatedTickets);
        setActiveTicket(updatedTicket);
        setReplyMessage('');
        showNotification('Réponse envoyée avec succès.');
    };

    const handleCloseTicket = (e) => {
        e.stopPropagation();
        if (!activeTicket) return;

        const updatedTicket = { ...activeTicket, status: 'Fermé', updated_at: new Date().toISOString() };
        const currentTickets = JSON.parse(localStorage.getItem('sirh_support_tickets') || '[]');
        const updatedTickets = currentTickets.map(t => t.id === activeTicket.id ? updatedTicket : t);

        localStorage.setItem('sirh_support_tickets', JSON.stringify(updatedTickets));
        setAllTickets(updatedTickets);
        setActiveTicket(null);
        showNotification(`Ticket ${activeTicket.id} fermé.`);
    };

    const openCount = allTickets.filter(t => t.status === 'Ouvert').length;
    const repliedCount = allTickets.filter(t => t.status === 'Répondu').length;

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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de Bord Assistante Sociale</h2>
                    <p className="text-slate-500 mt-1">Gérez les demandes de support anonymes de manière sécurisée.</p>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Action Requise</CardTitle>
                        <Inbox className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{openCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Tickets en attente de réponse</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Réponses Envoyées</CardTitle>
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{repliedCount}</div>
                        <p className="text-xs text-slate-500 mt-1">En attente de suivi employé</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total des Cas</CardTitle>
                        <Activity className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{allTickets.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Historique de tous les tickets</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
                {/* Left Column: Inbox List */}
                <div className="md:col-span-1 space-y-4">
                    <Card className="h-[calc(100vh-20rem)] flex flex-col overflow-hidden border-slate-200">
                        <CardHeader className="bg-white border-b py-3 px-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Users size={16} className="text-slate-500" /> Boîte de Réception Anonyme
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0">
                            {allTickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                                    <CheckCircle2 size={32} className="text-slate-300 mb-3" />
                                    <p className="text-sm">La boîte de réception est vide.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {allTickets.map(ticket => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => setActiveTicket(ticket)}
                                            className={cn(
                                                "p-4 cursor-pointer transition-colors border-l-4",
                                                activeTicket?.id === ticket.id ? "bg-blue-50 border-l-blue-600" : "bg-white hover:bg-slate-50 border-l-transparent"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-semibold text-slate-800 text-sm">{ticket.id}</span>
                                                <Badge variant={ticket.status === 'Ouvert' ? 'warning' : ticket.status === 'Fermé' ? 'secondary' : 'success'} className="text-[10px] px-1.5 py-0 h-4">
                                                    {ticket.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2">
                                                {ticket.messages[ticket.messages.length - 1]?.body}
                                            </p>
                                            <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                                <Clock size={10} />
                                                {new Date(ticket.messages[ticket.messages.length - 1]?.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Chat/Action View */}
                <div className="md:col-span-2">
                    {!activeTicket ? (
                        <div className="h-[calc(100vh-20rem)] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center text-center p-8 shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                                <MessageSquare size={28} />
                            </div>
                            <h3 className="text-lg font-medium text-slate-800 mb-1">Sélectionnez un Ticket</h3>
                            <p className="text-slate-500 text-sm">Choisissez une demande anonyme dans la boîte de réception pour répondre.</p>
                        </div>
                    ) : (
                        <Card className="h-[calc(100vh-20rem)] flex flex-col overflow-hidden border-slate-200 shadow-sm">
                            <CardHeader className="bg-white border-b py-3 px-6 flex flex-row items-center justify-between">
                                <div>
                                    <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">Identifiant Anonyme</div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        {activeTicket.id}
                                    </CardTitle>
                                </div>
                                {activeTicket.status !== 'Fermé' && (
                                    <Button variant="outline" size="sm" onClick={handleCloseTicket} className="text-slate-600 hover:text-red-600">
                                        Fermer le Ticket
                                    </Button>
                                )}
                            </CardHeader>

                            <CardContent className="flex-1 p-0 flex flex-col bg-slate-50/50">
                                {/* Chat History Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {activeTicket.messages.map((msg) => (
                                        <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.sender === 'Assistante Sociale' ? "ml-auto items-end" : "mr-auto items-start")}>
                                            <div className="text-[10px] font-medium text-slate-400 mb-1 px-1 uppercase tracking-wider">
                                                {msg.sender === 'Employé' ? 'Expéditeur Anonyme' : 'Vous'}
                                            </div>
                                            <div className={cn(
                                                "px-4 py-3 rounded-2xl text-sm shadow-sm",
                                                msg.sender === 'Assistante Sociale'
                                                    ? "bg-blue-600 text-white rounded-tr-sm"
                                                    : "bg-white border text-slate-800 rounded-tl-sm"
                                            )}>
                                                {msg.body}
                                            </div>
                                            <div className="text-[9px] text-slate-400 mt-1 px-1">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Input Area */}
                                {activeTicket.status !== 'Fermé' && (
                                    <div className="p-4 bg-white border-t border-slate-100">
                                        <form onSubmit={handleSendReply} className="flex gap-2">
                                            <Input
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Tapez votre réponse officielle..."
                                                className="bg-slate-50 focus-visible:ring-blue-600 border-slate-200"
                                            />
                                            <Button type="submit" className="px-4 bg-blue-600 hover:bg-blue-700" disabled={!replyMessage.trim()}>
                                                <Send size={16} />
                                            </Button>
                                        </form>
                                    </div>
                                )}
                                {activeTicket.status === 'Fermé' && (
                                    <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-sm text-slate-500 font-medium">
                                        Ce ticket a été fermé. Aucune autre réponse ne peut être envoyée.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
