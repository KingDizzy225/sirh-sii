import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, MessageSquare, PlusCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';

export function HRRequests() {
    const { user } = useAuth();
    const [savedTickets, setSavedTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Information');
    const [notification, setNotification] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadSavedTickets = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/support/tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const tickets = await res.json();
                // We filter out tickets that are obviously bugs or social support if needed
                // But for now, we'll just display tickets created by this user
                // Assuming backend already filters by requesterId in getTickets if the user is not HR/Admin
                const hrTickets = tickets.filter(t => !t.title.startsWith('[BUG]') && t.category !== 'Support Technique');
                setSavedTickets(hrTickets);
            }
        } catch (error) {
            console.error('Erreur chargement des demandes', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSavedTickets();
    }, []);

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !newTitle.trim()) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/support/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: newTitle,
                    description: newMessage,
                    category: newCategory,
                    priority: 'Medium'
                })
            });

            if (res.ok) {
                const createdTicket = await res.json();
                
                await fetch(`${API_URL}/api/support/tickets/${createdTicket.id}/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ body: newMessage, sender: 'Employé' })
                });

                await loadSavedTickets();
                setNewMessage('');
                setNewTitle('');
                setNewCategory('Information');
                setActiveTicket(null);
                showNotification(`Demande envoyée avec succès.`);
            } else {
                showNotification(`Erreur lors de la création.`);
            }
        } catch (error) {
            showNotification(`Erreur serveur lors de la connexion.`);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTicket) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('sirh_token');
            const res = await fetch(`${API_URL}/api/support/tickets/${activeTicket.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ body: newMessage, sender: 'Employé' })
            });

            if (res.ok) {
                const newMsgObj = await res.json();
                const updatedTicket = {
                    ...activeTicket,
                    messages: [...(activeTicket.messages || []), newMsgObj]
                };

                const updatedTickets = savedTickets.map(t => t.id === activeTicket.id ? updatedTicket : t);
                setSavedTickets(updatedTickets);
                setActiveTicket(updatedTicket);
                setNewMessage('');
            } else {
                showNotification(`Erreur d'envoi du message.`);
            }
        } catch (error) {
            showNotification(`Réseau instable, message non envoyé.`);
        }
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Mes Demandes RH</h2>
                    <p className="text-slate-500 mt-1">Créez et suivez vos requêtes auprès du service Ressources Humaines.</p>
                </div>
                {!activeTicket && (
                    <Button onClick={() => setActiveTicket('new')} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                        <PlusCircle size={16} /> Nouvelle Demande
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">

                {/* Left Column: Active Tickets List */}
                <div className={cn("md:col-span-1 space-y-4", activeTicket ? "hidden md:block" : "block")}>
                    <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare size={18} className="text-indigo-600" /> Historique
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Chargement...</div>
                            ) : savedTickets.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                                    <HelpCircle size={32} className="text-slate-300 mb-3" />
                                    <p className="text-sm">Vous n'avez fait aucune demande récente.</p>
                                </div>
                            ) : (
                                savedTickets.map(ticket => (
                                    <div
                                        key={ticket.id}
                                        onClick={() => setActiveTicket(ticket)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm",
                                            activeTicket?.id === ticket.id
                                                ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                                : "bg-white border-slate-100 hover:border-slate-300"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-800 text-sm tracking-wide truncate max-w-[150px]">{ticket.title}</span>
                                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", ticket.status === 'Ouvert' ? 'bg-amber-100 text-amber-700' : ticket.status === 'Répondu' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}>
                                                {ticket.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-indigo-600 mb-1">{ticket.category}</p>
                                        <p className="text-xs text-slate-500 line-clamp-2">{ticket.description}</p>
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
                            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                                <HelpCircle size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Besoin d'aide ?</h3>
                            <p className="text-slate-500 max-w-md text-sm mb-6">
                                Sélectionnez une demande dans la liste à gauche ou créez-en une nouvelle pour contacter le service RH.
                            </p>
                            <Button onClick={() => setActiveTicket('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                                <PlusCircle size={16} className="mr-2" /> Créer une Demande
                            </Button>
                        </div>
                    ) : (
                        <Card className="h-[calc(100vh-12rem)] flex flex-col overflow-hidden border-slate-200 shadow-sm">
                            <CardHeader className="bg-white border-b py-4 px-6 relative overflow-hidden">
                                <div className="flex items-center gap-3 relative z-10">
                                    <button onClick={handleCloseActive} className="md:hidden p-1 mr-2 rounded hover:bg-slate-100 text-slate-500">
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800">
                                            {activeTicket === 'new' ? 'Rédiger une Demande RH' : activeTicket.title}
                                        </CardTitle>
                                        {activeTicket !== 'new' && (
                                            <CardDescription className="text-slate-500 mt-1 text-xs font-medium">
                                                Catégorie : {activeTicket.category} • Réf: {activeTicket.id}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 flex flex-col bg-slate-50">
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {activeTicket === 'new' && (
                                            <form id="newTicketForm" onSubmit={handleCreateTicket} className="space-y-4 max-w-xl">
                                                <div>
                                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Objet de la demande</label>
                                                    <Input 
                                                        required
                                                        value={newTitle}
                                                        onChange={(e) => setNewTitle(e.target.value)}
                                                        placeholder="Ex: Demande de formation de secourisme" 
                                                        className="bg-white border-slate-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Catégorie</label>
                                                    <select 
                                                        value={newCategory} 
                                                        onChange={(e) => setNewCategory(e.target.value)}
                                                        className="w-full text-sm border-slate-200 rounded-md p-2 bg-white"
                                                    >
                                                        <option value="Information">Demande d'information</option>
                                                        <option value="Formation">Formation / Développement</option>
                                                        <option value="Paie">Paie / Rémunération</option>
                                                        <option value="Avantages">Avantages / Mutuelle</option>
                                                        <option value="Plainte">Plainte / Réclamation</option>
                                                        <option value="Autre">Autre</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Détails</label>
                                                    <textarea 
                                                        required
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        placeholder="Expliquez votre besoin en détail..." 
                                                        className="w-full text-sm border-slate-200 rounded-md p-3 h-32 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </form>
                                        )}

                                        {activeTicket !== 'new' && Array.isArray(activeTicket?.messages) && activeTicket.messages.map((msg) => (
                                            <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.sender === 'Employé' ? "ml-auto items-end" : "mr-auto items-start")}>
                                                <div className="text-[10px] font-bold text-slate-400 mb-1 px-1 uppercase tracking-wider">
                                                    {msg.sender === 'Employé' ? 'Moi' : 'Ressources Humaines'}
                                                </div>
                                                <div className={cn("px-5 py-3 text-sm shadow-sm", msg.sender === 'Employé' ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm")}>
                                                    {msg.body}
                                                </div>
                                                <div className="text-[9px] text-slate-400 mt-1 px-1 font-medium">
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                {/* Message Input Area */}
                                <div className="p-4 bg-white border-t border-slate-200">
                                    {activeTicket === 'new' ? (
                                        <div className="flex justify-end">
                                            <Button type="submit" form="newTicketForm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md">
                                                Envoyer la Demande
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendMessage} className="flex gap-2">
                                            <Input
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Tapez votre réponse..."
                                                className="bg-slate-50 focus-visible:ring-indigo-600 border-slate-200"
                                            />
                                            <Button type="submit" className="px-4 bg-indigo-600 hover:bg-indigo-700 shadow-sm" disabled={!newMessage.trim() || activeTicket.status === 'Fermé'}>
                                                <Send size={16} />
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
