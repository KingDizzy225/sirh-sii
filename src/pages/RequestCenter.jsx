import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
    Inbox, 
    Send, 
    CheckCircle2, 
    Clock, 
    MessageSquare, 
    Calendar, 
    CreditCard, 
    FileText, 
    Filter,
    User,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function RequestCenter() {
    const [tickets, setTickets] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('tickets');

    const token = localStorage.getItem('sirh_token');

    const fetchData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            
            // Fetch Support Tickets (Self-Service)
            const resTickets = await fetch(`${API_URL}/api/support/tickets`, { headers });
            if (resTickets.ok) setTickets(await resTickets.json());

            // Fetch Leaves
            const resLeaves = await fetch(`${API_URL}/api/leaves`, { headers });
            if (resLeaves.ok) {
                const allLeaves = await resLeaves.json();
                setLeaves(allLeaves.filter(l => l.status === 'PENDING' || l.status === 'EN_ATTENTE'));
            }

            // Fetch Advances
            const resAdvances = await fetch(`${API_URL}/api/advances`, { headers });
            if (resAdvances.ok) setAdvances((await resAdvances.json()).filter(a => a.status === 'PENDING'));

            // Fetch Expenses
            const resExpenses = await fetch(`${API_URL}/api/expenses`, { headers });
            if (resExpenses.ok) setExpenses((await resExpenses.json()).filter(e => e.status === 'PENDING'));

        } catch (err) {
            console.error("Fetch error in Request Center:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const handleAction = async (type, id, action) => {
        try {
            let endpoint = '';
            let status = action === 'approve' ? 'APPROVED' : 'REJECTED';
            
            if (type === 'leave') endpoint = `${API_URL}/api/leaves/${id}/status`;
            if (type === 'advance') endpoint = `${API_URL}/api/advances/${id}/status`;
            if (type === 'expense') endpoint = `${API_URL}/api/expenses/${id}/status`;

            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });

            if (res.ok) fetchData();
        } catch (err) {
            console.error("Action error:", err);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim() || !activeTicket) return;

        try {
            const res = await fetch(`${API_URL}/api/support/tickets/${activeTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ body: replyMessage, sender: 'Service RH' })
            });

            if (res.ok) {
                await fetch(`${API_URL}/api/support/tickets/${activeTicket.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ status: 'Répondu' })
                });
                setReplyMessage('');
                fetchData();
            }
        } catch (err) {
            console.error("Reply error:", err);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
            {/* Header Area */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Inbox className="text-indigo-600" /> Centre de Demandes Unifié
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Gérez toutes les requêtes collaborateurs (Self-Service, Absences, Financier).</p>
                    </div>
                    <div className="flex gap-3">
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                            {tickets.filter(t => t.status === 'Ouvert').length + leaves.length + advances.length + expenses.length} En attente
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 max-w-2xl mb-6 bg-slate-100 p-1">
                            <TabsTrigger value="tickets" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                <MessageSquare size={14} className="mr-2" /> Self-Service ({tickets.filter(t => t.status === 'Ouvert').length})
                            </TabsTrigger>
                            <TabsTrigger value="leaves" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                <Calendar size={14} className="mr-2" /> Absences ({leaves.length})
                            </TabsTrigger>
                            <TabsTrigger value="finance" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                <CreditCard size={14} className="mr-2" /> Financier ({advances.length + expenses.length})
                            </TabsTrigger>
                            <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                                <FileText size={14} className="mr-2" /> Archives
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tickets" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                {/* Ticket List */}
                                <div className="lg:col-span-1 space-y-3">
                                    {tickets.length === 0 ? (
                                        <div className="bg-white rounded-xl border border-dashed p-8 text-center text-slate-400">
                                            Aucun ticket ouvert.
                                        </div>
                                    ) : (
                                        tickets.map(t => (
                                            <div 
                                                key={t.id} 
                                                onClick={() => setActiveTicket(t)}
                                                className={cn(
                                                    "p-4 rounded-xl border cursor-pointer transition-all",
                                                    activeTicket?.id === t.id ? "bg-white border-indigo-300 shadow-md ring-2 ring-indigo-50" : "bg-white hover:bg-slate-50 border-slate-200"
                                                )}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold">{t.category}</Badge>
                                                    <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{t.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                                                <div className="flex items-center gap-2 mt-3 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                                    {t.status} <ArrowRight size={10} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Chat View */}
                                <div className="lg:col-span-2">
                                    {activeTicket ? (
                                        <Card className="h-full flex flex-col border-slate-200 shadow-sm overflow-hidden">
                                            <CardHeader className="py-4 border-b bg-white">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle className="text-lg">{activeTicket.title}</CardTitle>
                                                        <CardDescription>Réf: {activeTicket.id.split('-')[0].toUpperCase()}</CardDescription>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="text-xs">Fermer</Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                                                {activeTicket.messages?.map(m => (
                                                    <div key={m.id} className={cn("max-w-[80%] p-3 rounded-2xl text-sm", m.sender.includes('RH') ? "ml-auto bg-indigo-600 text-white" : "mr-auto bg-white border border-slate-100 text-slate-800")}>
                                                        <div className="font-bold text-[10px] mb-1 opacity-80">{m.sender}</div>
                                                        {m.body}
                                                    </div>
                                                ))}
                                            </CardContent>
                                            <div className="p-4 bg-white border-t border-slate-100">
                                                <form onSubmit={handleSendReply} className="flex gap-2">
                                                    <Input value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Répondre au collaborateur..." />
                                                    <Button type="submit" className="bg-indigo-600"><Send size={16} /></Button>
                                                </form>
                                            </div>
                                        </Card>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 p-20">
                                            <MessageSquare size={48} className="mb-4 opacity-20" />
                                            <p>Sélectionnez un ticket pour voir l'historique et répondre.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="leaves">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {leaves.length === 0 ? (
                                    <div className="md:col-span-full py-12 text-center text-slate-400">Aucune demande de congé en attente.</div>
                                ) : (
                                    leaves.map(l => (
                                        <Card key={l.id} className="overflow-hidden border-slate-200">
                                            <div className="bg-indigo-600 h-1" />
                                            <CardHeader className="p-4 pb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                                        {l.employee?.firstName ? l.employee.firstName[0] : 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-900">{l.employee?.firstName} {l.employee?.lastName}</div>
                                                        <div className="text-xs text-slate-500">{l.type}</div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-2">
                                                <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-2 mb-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 uppercase font-bold text-[9px]">Période</span>
                                                        <span className="font-bold text-slate-800">{new Date(l.startDate).toLocaleDateString()} → {new Date(l.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500 uppercase font-bold text-[9px]">Durée</span>
                                                        <span className="font-bold text-indigo-600">Calcul en cours...</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={() => handleAction('leave', l.id, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-8 text-xs">Approuver</Button>
                                                    <Button onClick={() => handleAction('leave', l.id, 'reject')} variant="outline" className="flex-1 h-8 text-xs border-slate-200 text-red-600 hover:bg-red-50">Refuser</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="finance">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Advances Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <CreditCard size={16} /> Acomptes & Avances ({advances.length})
                                    </h3>
                                    {advances.map(a => (
                                        <Card key={a.id} className="p-4 border-slate-200">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="font-bold text-slate-900">{a.employee?.firstName} {a.employee?.lastName}</div>
                                                    <div className="text-xs text-slate-500 font-mono">Montant : {a.amount.toLocaleString()} FCFA</div>
                                                </div>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">{a.type}</Badge>
                                            </div>
                                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded mb-4 italic">"{a.reason}"</p>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleAction('advance', a.id, 'approve')} size="sm" className="flex-1 bg-indigo-600 h-8">Valider</Button>
                                                <Button onClick={() => handleAction('advance', a.id, 'reject')} size="sm" variant="outline" className="h-8 border-slate-200">Refuser</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                {/* Expenses Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <FileText size={16} /> Notes de Frais ({expenses.length})
                                    </h3>
                                    {expenses.map(e => (
                                        <Card key={e.id} className="p-4 border-slate-200">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="font-bold text-slate-900">{e.employee?.firstName} {e.employee?.lastName}</div>
                                                    <div className="text-xs text-slate-500">{e.title}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-indigo-600">{e.amount.toLocaleString()} FCFA</div>
                                                    <div className="text-[9px] text-slate-400">{e.category}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={() => handleAction('expense', e.id, 'approve')} size="sm" className="flex-1 bg-emerald-600 h-8">Approuver</Button>
                                                <Button onClick={() => handleAction('expense', e.id, 'reject')} size="sm" variant="outline" className="h-8 border-slate-200">Rejeter</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
