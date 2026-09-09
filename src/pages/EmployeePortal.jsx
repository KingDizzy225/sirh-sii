import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, FileText, Receipt, Heart, Clock, ArrowRight, ShieldCheck, DollarSign, User, CheckCircle2, Award, Sparkles, X, MessageCircle, Send, Bot, Banknote, TrendingUp, AlertCircle, Check, BookOpen, ChevronDown , IdCard} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function EmployeePortal() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [logs, setLogs] = useState([]);
    const [isClocking, setIsClocking] = useState(false);
    const [clockNotice, setClockNotice] = useState(null); // { tone: 'success' | 'warning', text }
    const [accessTrace, setAccessTrace] = useState(null); // null = en cours de chargement
    const [regles, setRegles] = useState(null); // null = en cours de chargement
    const [regleOuverte, setRegleOuverte] = useState(null);
    const [pointagesEnAttente, setPointagesEnAttente] = useState(0);
    const [salaireDisponible, setSalaireDisponible] = useState(null);

    // Titres et habilitations du salarié. `null` distingue « pas encore lu » de
    // « dossier vide » : afficher « aucun titre » pendant le chargement ferait
    // croire à une absence.
    const [mesPieces, setMesPieces] = useState(null);
    const [typesPiece, setTypesPiece] = useState([]);
    const [depotEnCours, setDepotEnCours] = useState(false);
    const [messagePiece, setMessagePiece] = useState(null);

    /** Dossier de titres du salarié : ce qu'il a déposé, et où en est chaque pièce. */
    const chargerMesPieces = async (employeeId) => {
        try {
            const res = await fetch(`${API_URL}/api/pieces/employe/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) { setMesPieces([]); return; }
            const donnees = await res.json();
            setMesPieces(Array.isArray(donnees?.pieces) ? donnees.pieces : []);
        } catch {
            // Le portail ne doit pas devenir inutilisable parce qu'une carte
            // secondaire n'a pas répondu.
            setMesPieces([]);
        }
    };

    /**
     * Dépôt d'un titre depuis le portail.
     *
     * Le salarié ne choisit ni le dossier de destination ni le statut : le
     * serveur déduit le premier de son compte et impose « à contrôler » au
     * second. Ce qui part d'ici est une demande de vérification, pas une mise à
     * jour du dossier.
     */
    const deposerPiece = async (evenement) => {
        evenement.preventDefault();
        const formulaire = evenement.target;
        const donnees = new FormData(formulaire);
        if (!donnees.get('type')) return;

        setDepotEnCours(true);
        setMessagePiece(null);
        try {
            const res = await fetch(`${API_URL}/api/pieces/portail`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: donnees
            });
            const detail = await res.json().catch(() => ({}));
            if (!res.ok) {
                setMessagePiece({ ton: 'alerte', texte: detail.error || 'Dépôt refusé.' });
                return;
            }
            setMessagePiece({ ton: 'succes', texte: detail.message || 'Pièce déposée.' });
            formulaire.reset();
            if (profile?.id) chargerMesPieces(profile.id);
        } catch (err) {
            setMessagePiece({ ton: 'alerte', texte: err.message || 'Dépôt impossible.' });
        } finally {
            setDepotEnCours(false);
        }
    };
    const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
    const [absenceForm, setAbsenceForm] = useState({
        type: 'Absence injustifiée',
        dateStart: new Date().toISOString().split('T')[0],
        dateEnd: new Date().toISOString().split('T')[0],
        justification: '',
        file: null
    });

    // Salary Advance State
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [advanceForm, setAdvanceForm] = useState({
        amount: '',
        reason: '',
        repaymentMonths: '3'
    });
    const [myAdvances, setMyAdvances] = useState([]);
    const [isSubmittingAdvance, setIsSubmittingAdvance] = useState(false);
    const [advanceNotification, setAdvanceNotification] = useState(null);

    const [currentTime, setCurrentTime] = useState(new Date());

    // Chatbot State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: 'Bonjour ! Je suis votre Assistant RH. Posez-moi une question ou demandez-moi de poser un congé pour vous !' }
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentMessage.trim()) return;

        const userMsg = currentMessage.trim();
        setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setCurrentMessage('');
        setIsChatLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply || "Erreur de réponse." }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { sender: 'bot', text: "Erreur réseau." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Catalogue des types de titres, qui alimente le formulaire de dépôt.
        fetch(`${API_URL}/api/pieces/types`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => (res.ok ? res.json() : null))
            .then((donnees) => {
                if (Array.isArray(donnees?.types)) setTypesPiece(donnees.types);
            })
            .catch(() => { /* le formulaire restera sans choix, il le montrera */ });
    }, [token]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/employees/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const fiche = await res.json();
                    setProfile(fiche);
                    if (fiche?.id) chargerMesPieces(fiche.id);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };

        const fetchLogs = async () => {
            try {
                const res = await fetch(`${API_URL}/api/time-logs/today`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setLogs(await res.json());
            } catch (err) {
                console.error("Failed to load time logs", err);
            }
        };

        const fetchMyAdvances = async () => {
            try {
                const res = await fetch(`${API_URL}/api/advances`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const all = await res.json();
                    setMyAdvances(all.filter(a => a.employee === user?.name) || all);
                }
            } catch (err) {
                console.error("Failed to load advances", err);
            }
        };

        const fetchSalaireDisponible = async () => {
            try {
                const res = await fetch(`${API_URL}/api/advances/earned`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setSalaireDisponible(res.ok ? await res.json() : null);
            } catch (err) {
                setSalaireDisponible(null);
            }
        };

        /**
         * Règles internes de l'entreprise.
         *
         * Elles n'étaient lisibles que par la RH : un collaborateur ne pouvait
         * connaître le règlement qui fonde ses droits qu'en interrogeant
         * l'assistant, une question à la fois.
         */
        const fetchRegles = async () => {
            try {
                const res = await fetch(`${API_URL}/api/policies/consultation`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRegles(Array.isArray(data.regles) ? data.regles : []);
                } else {
                    setRegles([]);
                }
            } catch (err) {
                console.error('Règles internes indisponibles', err);
                setRegles([]);
            }
        };

        const fetchAccessTrace = async () => {
            try {
                const res = await fetch(`${API_URL}/api/audit/my-access`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAccessTrace(res.ok ? await res.json() : []);
            } catch (err) {
                setAccessTrace([]);
            }
        };

        if (token) {
            fetchProfile();
            fetchLogs();
            fetchMyAdvances();
            fetchAccessTrace();
            fetchRegles();
            fetchSalaireDisponible();

            // Rattrapage des pointages différés : au chargement, puis dès que
            // le navigateur signale le retour de la connexion.
            setPointagesEnAttente(lireFileAttente().length);
            synchroniserPointages().then(fetchLogs);
            window.addEventListener('online', synchroniserPointages);
            return () => window.removeEventListener('online', synchroniserPointages);
        }
    }, [token]);

    /**
     * File d'attente des pointages hors connexion, conservée sur l'appareil.
     *
     * La clé porte l'identité du salarié. Elle était commune à l'appareil : sur
     * un téléphone de chantier partagé, le pointage laissé en attente par l'un
     * repartait avec le jeton du suivant, et le serveur — qui déduit le salarié
     * du jeton — l'attribuait à ce dernier. Le premier perdait sa présence, le
     * second en gagnait une qu'il n'avait pas.
     */
    const CLE_FILE = `sirh_pointages_en_attente_${user?.email || 'anonyme'}`;
    const lireFileAttente = () => {
        try {
            const brut = localStorage.getItem(CLE_FILE);
            const liste = brut ? JSON.parse(brut) : [];
            return Array.isArray(liste) ? liste : [];
        } catch {
            return [];
        }
    };
    const ecrireFileAttente = (liste) => {
        try { localStorage.setItem(CLE_FILE, JSON.stringify(liste)); } catch { /* stockage indisponible */ }
    };

    /**
     * Transmet les pointages différés. Chaque envoi conserve l'horodatage du
     * moment où le salarié a réellement pointé : c'est cette heure qui fait foi,
     * pas celle de la synchronisation.
     */
    const synchroniserPointages = async () => {
        const attente = lireFileAttente();
        if (attente.length === 0 || !token) return;

        const restants = [];
        const refuses = [];
        for (const p of attente) {
            try {
                const res = await fetch(`${API_URL}/api/time-logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(p)
                });
                if (res.ok) continue;

                // Un refus définitif ne s'améliorera pas à la prochaine
                // tentative : le garder en file le ferait rejouer à chaque
                // reconnexion, indéfiniment et en silence. On le sort, et on le
                // dit. Restent en file les échecs qui peuvent encore passer :
                // panne serveur, jeton expiré, débit dépassé.
                if (res.status >= 400 && ![401, 403, 408, 429].includes(res.status)) {
                    refuses.push(p);
                } else {
                    restants.push(p);
                }
            } catch {
                restants.push(p);
            }
        }

        ecrireFileAttente(restants);
        setPointagesEnAttente(restants.length);

        const transmis = attente.length - restants.length - refuses.length;
        if (refuses.length > 0) {
            setClockNotice({
                tone: 'warning',
                text: `${refuses.length} pointage(s) différé(s) refusés par le serveur et retirés de la file. ` +
                      'Signalez-le aux ressources humaines pour régularisation.'
            });
        } else if (transmis > 0) {
            setClockNotice({
                tone: 'success',
                text: `${transmis} pointage(s) différé(s) transmis.`
            });
        }
    };

    // Récupère la position GPS (résout null si refusée/indisponible : le pointage n'est jamais bloqué)
    const getPosition = () => new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
            }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
    });

    /**
     * Référence unique du pointage, produite par l'appareil.
     * Elle accompagne chaque envoi et chaque renvoi : c'est elle qui permet au
     * serveur de reconnaître un pointage déjà enregistré dont la réponse s'est
     * perdue, plutôt que d'en compter deux.
     */
    const nouvelleReference = () => {
        try {
            if (crypto?.randomUUID) return crypto.randomUUID();
        } catch { /* API indisponible */ }
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    };

    const mettreEnAttente = (charge, texte) => {
        const attente = lireFileAttente();
        attente.push(charge);
        ecrireFileAttente(attente);
        setPointagesEnAttente(attente.length);
        setClockNotice({ tone: 'warning', text: `${texte} (${attente.length} en attente).` });
    };

    const handleClock = async (type) => {
        setIsClocking(true);
        setClockNotice(null);

        const coords = await getPosition();
        // L'heure du pointage est celle du geste, non celle de l'envoi : un
        // pointage transmis le lendemain doit rester daté de la veille.
        const charge = {
            type,
            clientRef: nouvelleReference(),
            horodatageLocal: new Date().toISOString(),
            ...(coords || {})
        };

        try {
            const res = await fetch(`${API_URL}/api/time-logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(charge)
            });

            if (!res.ok) {
                /**
                 * Un pointage refusé n'était ni enregistré, ni mis en attente,
                 * ni signalé : seul un statut ≥ 500 levait une exception. Un
                 * jeton expiré — le cas ordinaire après plusieurs jours hors
                 * connexion — faisait donc disparaître le pointage en silence.
                 *
                 * Tout ce qui peut encore passer retourne en file ; ce qui est
                 * définitivement refusé est dit au salarié, jamais tu.
                 */
                if ([401, 403, 408, 429].includes(res.status) || res.status >= 500) {
                    mettreEnAttente(charge,
                        'Serveur momentanément indisponible : pointage conservé sur cet appareil et transmis plus tard');
                } else {
                    const detail = await res.json().catch(() => ({}));
                    setClockNotice({
                        tone: 'warning',
                        text: `Pointage refusé : ${detail.error || `erreur ${res.status}`}. Prévenez les ressources humaines.`
                    });
                }
                return;
            }

            const newLog = await res.json();
            setLogs((precedents) => [...precedents.filter((l) => l.id !== newLog.id), newLog]);

            if (newLog.deja) {
                setClockNotice({ tone: 'success', text: 'Pointage déjà enregistré, rien n\'a été compté deux fois.' });
            } else if (newLog.locationStatus === 'OFF_SITE') {
                setClockNotice({
                    tone: 'warning',
                    text: `Pointage enregistré hors zone (à ${newLog.distanceMeters} m du site ${newLog.workSite?.name || ''}).`
                });
            } else if (newLog.locationStatus === 'NO_GPS') {
                setClockNotice({
                    tone: 'warning',
                    text: "Pointage enregistré sans position GPS. Autorisez la localisation pour valider votre présence sur site."
                });
            } else if (newLog.locationStatus === 'ON_SITE') {
                setClockNotice({
                    tone: 'success',
                    text: `Pointage validé sur site${newLog.workSite?.name ? ` (${newLog.workSite.name})` : ''}.`
                });
            }
        } catch (err) {
            // Réseau absent : on conserve le pointage plutôt que de le perdre.
            // Sur un chantier mal couvert, refuser le pointage revient à priver
            // le salarié de la preuve de sa présence. La position déjà relevée
            // est réutilisée — la reprendre coûterait un second relevé GPS de
            // plusieurs secondes, pour une position qui aurait pu changer.
            console.warn('Pointage différé, réseau indisponible', err);
            mettreEnAttente(charge,
                'Réseau indisponible : pointage enregistré sur cet appareil et transmis dès le retour de la connexion');
        } finally {
            setIsClocking(false);
        }
    };

    const handleDownloadAttestation = async () => {
        if (!profile || !profile.id) return alert("Profil non chargé.");
        try {
            const res = await fetch(`${API_URL}/api/documents/generate-attestation/${profile.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Attestation_${profile.lastName}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Erreur lors de la génération du document.");
            }
        } catch (error) {
            console.error("Download error", error);
            alert("Impossible de générer l'attestation.");
        }
    };

    const handleAbsenceSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('type', absenceForm.type);
        formData.append('dateStart', absenceForm.dateStart);
        formData.append('dateEnd', absenceForm.dateEnd);
        formData.append('justification', absenceForm.justification);
        if (absenceForm.file) {
            formData.append('justificatif', absenceForm.file);
        }

        try {
            const res = await fetch(`${API_URL}/api/absences`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                alert("Demande transmise avec succès.");
                setIsAbsenceModalOpen(false);
                setAbsenceForm({ type: 'Absence injustifiée', dateStart: new Date().toISOString().split('T')[0], dateEnd: new Date().toISOString().split('T')[0], justification: '', file: null });
            } else {
                alert("Erreur lors de l'envoi.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau.");
        }
    };

    const handleAdvanceSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingAdvance(true);
        try {
            const res = await fetch(`${API_URL}/api/advances`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    amount: parseInt(advanceForm.amount),
                    reason: advanceForm.reason,
                    repaymentMonths: parseInt(advanceForm.repaymentMonths)
                })
            });
            if (res.ok) {
                const newAdv = await res.json();
                setMyAdvances(prev => [newAdv, ...prev]);
                setIsAdvanceModalOpen(false);
                setAdvanceForm({ amount: '', reason: '', repaymentMonths: '3' });
                setAdvanceNotification('✅ Votre demande d\'avance a été soumise avec succès !');
                setTimeout(() => setAdvanceNotification(null), 4000);
            } else {
                setAdvanceNotification('❌ Erreur lors de l\'envoi de la demande.');
                setTimeout(() => setAdvanceNotification(null), 4000);
            }
        } catch (err) {
            console.error(err);
            setAdvanceNotification('❌ Erreur réseau. Veuillez réessayer.');
            setTimeout(() => setAdvanceNotification(null), 4000);
        } finally {
            setIsSubmittingAdvance(false);
        }
    };

    const formatAmount = (n) => new Intl.NumberFormat('fr-CI').format(n || 0) + ' FCFA';

    const getAdvanceStatusStyle = (status) => {
        switch(status) {
            case 'Approuvé': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Rejeté': return 'bg-red-100 text-red-700 border-red-200';
            case 'Déduit': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getAdvanceStatusIcon = (status) => {
        switch(status) {
            case 'Approuvé': return <CheckCircle2 size={14} />;
            case 'Rejeté': return <X size={14} />;
            case 'Déduit': return <Check size={14} />;
            default: return <Clock size={14} />;
        }
    };

    const hasClockedIn = logs.some(l => l.type === 'CLOCK_IN');
    const hasClockedOut = logs.some(l => l.type === 'CLOCK_OUT');
    const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

    const firstName = profile?.firstName || user?.name?.split(' ')[0] || 'Collaborateur';
    const currentHour = currentTime.getHours();
    const greeting = currentHour < 12 ? 'Bonjour' : currentHour < 18 ? 'Bon après-midi' : 'Bonsoir';
    
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };


    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 bg-slate-50/50 min-h-[calc(100vh-4rem)] overflow-x-hidden relative">
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2 font-['Outfit']">
                            {greeting}, <span className="text-gradient">{firstName}</span>
                        </h2>
                        <p className="text-slate-500 text-lg flex items-center gap-2">
                            <Sparkles className="text-amber-400" size={18} />
                            {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} — Prêt pour une excellente journée ?
                        </p>
                    </div>
                </motion.div>

                {/* Onboarding Gamifié */}
                {profile && (new Date() - new Date(profile.hireDate)) / (1000 * 60 * 60 * 24) < 90 && (
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-primary to-accent rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
                            <Award size={150} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-3 font-['Outfit']">
                                    <Award className="text-yellow-300" size={28} /> Quêtes d'Intégration
                                </h3>
                                <p className="text-white/80 mt-1">Complétez votre profil pour débloquer le badge "Nouvelle Recrue" !</p>
                            </div>
                            <div className="text-right shrink-0 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                                <span className="text-3xl font-extrabold">66%</span>
                            </div>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 mb-6 relative overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '66%' }}
                                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-3 rounded-full shadow-[0_0_10px_rgba(253,224,71,0.5)]" 
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass rounded-xl p-4 flex items-center gap-3 !bg-white/10 !border-white/20">
                                <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                                <span className="text-sm font-medium line-through opacity-70">Connexion réussie</span>
                            </div>
                            <div className="glass rounded-xl p-4 flex items-center gap-3 !bg-white/10 !border-white/20">
                                <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                                <span className="text-sm font-medium line-through opacity-70">Lire la charte</span>
                            </div>
                            <div className="glass rounded-xl p-4 flex items-center gap-3 !bg-white/20 !border-yellow-400/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                <div className="w-6 h-6 rounded-full border-2 border-dashed border-white/70 flex items-center justify-center shrink-0"></div>
                                <span className="text-sm font-bold text-yellow-100">Uploader le RIB</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Les Widgets Principaux */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* WIDGET: Mon Salaire */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Card className="glass-panel h-full rounded-3xl border-0 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <DollarSign size={100} />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-inner">
                                    <DollarSign size={24} />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 font-['Outfit']">
                                    Ma Paie
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* « Dernier versement : 28 Fév 2026 » était écrit en dur. Le
                                    portail ne lit pas les bulletins ; il renvoie donc vers eux
                                    plutôt que d'annoncer une date qu'il ignore. */}
                                <p className="text-sm text-slate-500 mb-2 font-medium">Montant masqué sur cet écran</p>
                                <div className="text-4xl font-extrabold text-slate-900 mb-6 font-['Outfit']">
                                    *** *** <span className="text-2xl text-slate-400 font-medium">FCFA</span>
                                </div>
                                <Link to="/documents">
                                    <Button variant="outline" className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl transition-all">
                                        Voir mes bulletins
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* WIDGET: Mes Congés */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Card className="glass-panel h-full rounded-3xl border-0 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Calendar size={100} />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-inner">
                                    <Calendar size={24} />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 font-['Outfit']">
                                    Mes Congés
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 mb-2 font-medium">Solde disponible (Congés Annuels)</p>
                                {/* Ce chiffre valait « 14.5 » pour tout le monde : une constante
                                    écrite dans la page, que chaque salarié lisait comme son propre
                                    solde. Le solde réel figure sur sa fiche. */}
                                <div className="text-4xl font-extrabold text-slate-900 mb-6 font-['Outfit']">
                                    {profile && profile.annualLeaveBalance !== undefined && profile.annualLeaveBalance !== null ? (
                                        <>
                                            {Number(profile.annualLeaveBalance).toLocaleString('fr-FR')}{' '}
                                            <span className="text-2xl font-medium text-slate-400">Jours</span>
                                        </>
                                    ) : (
                                        <span className="text-base font-medium text-slate-400">
                                            Solde non disponible
                                        </span>
                                    )}
                                </div>
                                <Link to="/leaves">
                                    <Button variant="outline" className="w-full text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all">
                                        Poser une absence
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* WIDGET: Badgeage / Pointage */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Card className="glass-panel h-full rounded-3xl border-0 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Clock size={100} />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
                                    <Clock size={24} />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 font-['Outfit']">
                                    Présence
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 mb-4 font-medium">
                                    {lastLog ? `Dernier pointage : ${new Date(lastLog.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}` : "Aucun pointage aujourd'hui"}
                                </p>
                                
                                <div className="space-y-3">
                                    {!hasClockedIn || (hasClockedIn && hasClockedOut) ? (
                                        <Button 
                                            onClick={() => handleClock('CLOCK_IN')} 
                                            disabled={isClocking}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 rounded-xl py-6 transition-all active:scale-95">
                                            {isClocking ? 'Pointage...' : 'Signaler mon ARRIVÉE'}
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleClock('CLOCK_OUT')} 
                                            disabled={isClocking}
                                            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200 rounded-xl py-6 transition-all active:scale-95">
                                            {isClocking ? 'Pointage...' : 'Signaler mon DÉPART'}
                                        </Button>
                                    )}
                                    
                                    {pointagesEnAttente > 0 && (
                                        <div className="flex items-start gap-2 text-xs font-medium rounded-xl p-3 bg-slate-100 text-slate-600 border border-slate-200">
                                            <Clock size={14} className="mt-0.5 shrink-0" />
                                            <span>
                                                {pointagesEnAttente} pointage(s) en attente de transmission.
                                                L'envoi se fera automatiquement au retour du réseau.
                                            </span>
                                        </div>
                                    )}

                                    {clockNotice && (
                                        <div className={`flex items-start gap-2 text-xs font-medium rounded-xl p-3 ${clockNotice.tone === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                            {clockNotice.tone === 'success' ? <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                                            <span>{clockNotice.text}</span>
                                        </div>
                                    )}

                                    <Link to="/timesheet">
                                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100/50">
                                            Voir mon historique
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* WIDGET: Mes titres et habilitations

                        Le salarié dépose son permis renouvelé ou son certificat
                        d'aptitude depuis chez lui, au lieu de passer au bureau. Ce
                        qu'il dépose attend une vérification : la conformité ne se
                        déclare pas elle-même. */}
                    <motion.div variants={itemVariants} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 400 }}>
                        <Card className="glass-panel h-full rounded-3xl border-0 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <IdCard size={100} />
                            </div>
                            <CardHeader className="pb-2">
                                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 shadow-inner">
                                    <IdCard size={24} />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 font-['Outfit']">
                                    Mes titres
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {mesPieces === null ? (
                                    <p className="text-sm text-slate-400 mb-4">Lecture de votre dossier…</p>
                                ) : mesPieces.length === 0 ? (
                                    <p className="text-sm text-slate-500 mb-4">
                                        Aucun titre enregistré : permis de conduire, aptitude médicale,
                                        habilitation.
                                    </p>
                                ) : (
                                    <ul className="space-y-2 mb-4">
                                        {mesPieces.slice(0, 3).map((p) => (
                                            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                                                <span className="text-slate-700 truncate">{p.libelle}</span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border shrink-0 ${
                                                    p.etat === 'EXPIREE' ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                    : p.etat === 'BIENTOT_EXPIREE' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : p.statut === 'A_CONTROLER' ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    {p.etat === 'EXPIREE' ? 'expiré'
                                                     : p.etat === 'BIENTOT_EXPIREE' ? 'à renouveler'
                                                     : p.statut === 'A_CONTROLER' ? 'en vérification'
                                                     : 'valide'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {messagePiece && (
                                    <p className={`text-xs rounded-xl p-3 mb-3 ${
                                        messagePiece.ton === 'succes'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                                    }`}>
                                        {messagePiece.texte}
                                    </p>
                                )}

                                <form onSubmit={deposerPiece} className="space-y-2">
                                    <select
                                        name="type"
                                        required
                                        aria-label="Type de titre"
                                        className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
                                    >
                                        <option value="">Type de titre…</option>
                                        {typesPiece.map((t) => (
                                            <option key={t.code} value={t.code}>{t.libelle}</option>
                                        ))}
                                    </select>
                                    <label className="block text-xs text-slate-500">
                                        Expire le
                                        <input type="date" name="expireLe"
                                               className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm mt-1" />
                                    </label>
                                    <input type="file" name="fichier" required
                                           accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                                           aria-label="Fichier du titre"
                                           className="w-full text-xs" />
                                    <Button type="submit" disabled={depotEnCours}
                                            className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl">
                                        {depotEnCours ? 'Envoi…' : 'Déposer'}
                                    </Button>
                                </form>
                                <p className="text-[11px] text-slate-400 mt-2 leading-snug">
                                    Votre dépôt est vérifié par les ressources humaines avant d'être
                                    pris en compte.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Règles internes : le texte qui fonde ses droits, lisible
                    directement. L'assistant peut les citer, mais il faut savoir
                    quoi lui demander — et une réponse ne remplace pas la
                    lecture du texte. */}
                <motion.div variants={itemVariants}>
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BookOpen size={17} className="text-slate-500" />
                                Règles internes
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Congés, horaires, avantages : les règles de l'entreprise, telles qu'elles s'appliquent.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {regles === null ? (
                                <p className="text-xs text-slate-400">Chargement…</p>
                            ) : regles.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    Aucune règle n'a encore été publiée par les ressources humaines.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                    {regles.map((r) => (
                                        <div key={r.id} className="border border-slate-100 rounded-lg">
                                            <button
                                                onClick={() => setRegleOuverte(regleOuverte === r.id ? null : r.id)}
                                                className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 bg-transparent border-0 cursor-pointer hover:bg-slate-50 rounded-lg"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold text-slate-800 truncate">{r.titre}</span>
                                                    <span className="block text-[11px] text-slate-400">{r.categorie}</span>
                                                </span>
                                                <ChevronDown
                                                    size={15}
                                                    className={`text-slate-400 shrink-0 transition-transform ${regleOuverte === r.id ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {regleOuverte === r.id && (
                                                <div className="px-3 pb-3 pt-1 border-t border-slate-100">
                                                    <p className="text-sm text-slate-700 whitespace-pre-line">{r.contenu}</p>
                                                    {r.source && (
                                                        <p className="text-[11px] text-slate-400 mt-2">Source : {r.source}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Transparence : accès à son propre dossier.
                    Détenir salaires et données de santé crée une obligation
                    d'information envers l'intéressé ; il la consulte ici
                    directement, sans avoir à la demander à la RH. */}
                <motion.div variants={itemVariants}>
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck size={17} className="text-slate-500" />
                                Accès à mon dossier
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Les consultations de votre dossier par un tiers apparaissent ici.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {accessTrace === null ? (
                                <p className="text-xs text-slate-400">Chargement…</p>
                            ) : accessTrace.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    Personne n'a consulté votre dossier récemment.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {accessTrace.map(a => (
                                        <div key={a.id} className="flex items-center justify-between gap-3 text-sm border-b border-slate-50 pb-2 last:border-0">
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{a.consultePar}</p>
                                                <p className="text-xs text-slate-500">
                                                    {a.ressource === 'PAIE' ? 'Bulletin de paie'
                                                        : a.ressource === 'DOCUMENTS' ? 'Documents personnels'
                                                        : a.ressource === 'DISCIPLINAIRE' ? 'Dossier disciplinaire'
                                                        : a.ressource}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-400 shrink-0">
                                                {new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions Dock (Guichet Unique RH) */}
                <motion.div variants={itemVariants}>
                    <div className="mt-4 mb-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Sparkles size={16} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 font-['Outfit']">Actions Rapides</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAbsenceModalOpen(true)} 
                            className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:border-primary/30 hover:shadow-md transition-all group"
                        >
                            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 transition-colors duration-300">
                                <Calendar size={28} />
                            </div>
                            <span className="font-semibold text-slate-700 text-center group-hover:text-slate-900">Je suis absent</span>
                        </motion.div>

                        <motion.div 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAdvanceModalOpen(true)}
                            className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all group h-full"
                        >
                            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white text-emerald-500 transition-colors duration-300">
                                <Banknote size={28} />
                            </div>
                            <span className="font-semibold text-slate-700 text-center group-hover:text-slate-900">Avance sur salaire</span>
                        </motion.div>

                        <motion.div 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleDownloadAttestation} 
                            className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group"
                        >
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white text-blue-500 transition-colors duration-300">
                                <FileText size={28} />
                            </div>
                            <span className="font-semibold text-slate-700 text-center group-hover:text-slate-900">Demander une attestation</span>
                        </motion.div>

                        <motion.div 
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => { setIsAbsenceModalOpen(true); setAbsenceForm({...absenceForm, type: "Demande d'autorisation"}); }} 
                            className="cursor-pointer flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:border-rose-300 hover:shadow-md transition-all group"
                        >
                            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white text-rose-500 transition-colors duration-300">
                                <Heart size={28} />
                            </div>
                            <span className="font-semibold text-slate-700 text-center group-hover:text-slate-900">Autorisation spéciale</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Section: Suivi de mes Avances sur Salaire */}
                {myAdvances.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <div className="mt-4 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <TrendingUp size={16} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 font-['Outfit']">Mes Demandes d'Avance</h3>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {myAdvances.slice(0, 6).map((adv, idx) => (
                                <motion.div
                                    key={adv.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <Banknote size={20} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-slate-900 font-['Outfit']">{formatAmount(adv.amount)}</p>
                                                <p className="text-xs text-slate-400">{adv.requestedAt || adv.requestDate || '—'}</p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getAdvanceStatusStyle(adv.status)}`}>
                                            {getAdvanceStatusIcon(adv.status)}
                                            {adv.status || 'En attente'}
                                        </span>
                                    </div>
                                    {adv.reason && (
                                        <p className="text-sm text-slate-500 line-clamp-2">{adv.reason}</p>
                                    )}
                                    {adv.repaymentMonths && (
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                                            <Clock size={12} />
                                            <span>Remboursement : {adv.repaymentMonths} mois</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Privacy Section Highlight */}
                 <motion.div variants={itemVariants} className="mt-8 bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldCheck size={160} />
                    </div>
                    <div className="relative z-10 space-y-3 mb-6 md:mb-0 max-w-2xl">
                        <h3 className="text-2xl font-bold flex items-center gap-3 font-['Outfit']">
                            <ShieldCheck className="text-emerald-400" size={28} />
                            Confidentialité Absolue
                        </h3>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Vos requêtes d'assistance sociale et vos données personnelles sont chiffrées et gérées de manière strictement confidentielle par le service dédié.
                        </p>
                    </div>
                    <Button variant="outline" className="relative z-10 border-white/20 hover:bg-white/10 text-white rounded-xl">
                        En savoir plus
                    </Button>
                </motion.div>

            </motion.div>

            {/* Modal Absence / Autorisation */}
            <AnimatePresence>
                {isAbsenceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                        >
                            <div className="bg-gradient-to-r from-primary to-accent p-6 text-white flex justify-between items-center">
                                <h3 className="text-2xl font-bold font-['Outfit']">
                                    {absenceForm.type === "Demande d'autorisation" ? "Autorisation d'absence" : "Déclarer une Absence"}
                                </h3>
                                <button onClick={() => setIsAbsenceModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAbsenceSubmit} className="p-8 space-y-6 bg-slate-50/50">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Type de demande</label>
                                    <select 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 bg-white shadow-sm transition-all"
                                        value={absenceForm.type}
                                        onChange={(e) => setAbsenceForm({...absenceForm, type: e.target.value})}
                                    >
                                        <option value="Absence injustifiée">Absence (déjà passée)</option>
                                        <option value="Demande d'autorisation">Autorisation d'absence (future)</option>
                                        <option value="Retard">Signalement de retard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date de début *</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 bg-white shadow-sm transition-all"
                                        value={absenceForm.dateStart}
                                        onChange={(e) => {
                                            const newStart = e.target.value;
                                            setAbsenceForm(prev => ({
                                                ...prev, 
                                                dateStart: newStart,
                                                dateEnd: prev.dateEnd < newStart ? newStart : prev.dateEnd
                                            }));
                                        }}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date de fin *</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none text-slate-700 bg-white shadow-sm transition-all"
                                        value={absenceForm.dateEnd}
                                        min={absenceForm.dateStart}
                                        onChange={(e) => setAbsenceForm({...absenceForm, dateEnd: e.target.value})}
                                        required
                                    />
                                </div>
                                {/* Calcul automatique de la durée */}
                                {absenceForm.dateStart && absenceForm.dateEnd && (
                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-500 font-medium">Durée de l'absence</p>
                                            <p className="text-lg font-bold text-indigo-700 font-['Outfit']">
                                                {(() => {
                                                    const start = new Date(absenceForm.dateStart);
                                                    const end = new Date(absenceForm.dateEnd);
                                                    const diffTime = end - start;
                                                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                    if (diffDays <= 0) return '—';
                                                    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
                                                })()}
                                            </p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-xs text-indigo-400">Du {new Date(absenceForm.dateStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                            <p className="text-xs text-indigo-400">Au {new Date(absenceForm.dateEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Justification / Commentaire</label>
                                    <textarea 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none h-32 text-slate-700 bg-white shadow-sm transition-all resize-none"
                                        placeholder="Précisez le motif..."
                                        value={absenceForm.justification}
                                        onChange={(e) => setAbsenceForm({...absenceForm, justification: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Pièce jointe (Optionnel)</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={(e) => setAbsenceForm({...absenceForm, file: e.target.files[0]})}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-colors bg-white border border-slate-200 rounded-xl p-1 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl text-lg font-bold shadow-xl shadow-primary/20 transition-all active:scale-95">
                                        Envoyer la demande
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Advance Notification Toast */}
            <AnimatePresence>
                {advanceNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 size={18} className="text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium">{advanceNotification}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Demande d'Avance sur Salaire */}
            <AnimatePresence>
                {isAdvanceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
                        >
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Banknote size={80} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold font-['Outfit'] flex items-center gap-2">
                                        <Banknote size={24} />
                                        Demande d'Avance
                                    </h3>
                                    <p className="text-emerald-100 text-sm mt-1">Soumettez votre demande d'avance sur salaire</p>
                                </div>
                                <button onClick={() => setIsAdvanceModalOpen(false)} className="relative z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAdvanceSubmit} className="p-8 space-y-6 bg-slate-50/50">
                                {/* Salaire déjà gagné : rattache la demande à ce qui est
                                    réellement acquis, plutôt qu'à un montant arbitraire. */}
                                {salaireDisponible && (
                                    <div className={`rounded-2xl p-4 border ${
                                        salaireDisponible.eligible
                                            ? 'bg-emerald-50 border-emerald-100'
                                            : 'bg-slate-100 border-slate-200'
                                    }`}>
                                        {salaireDisponible.eligible ? (
                                            <>
                                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                                                    Déjà gagné et mobilisable
                                                </p>
                                                <p className="text-2xl font-black text-emerald-800 mt-1">
                                                    {salaireDisponible.disponible.toLocaleString('fr-FR')} FCFA
                                                </p>
                                                <p className="text-[11px] text-emerald-700/80 mt-1">
                                                    {salaireDisponible.detail.joursEcoules} jour(s) travaillé(s) sur{' '}
                                                    {salaireDisponible.detail.joursDansMois}, soit{' '}
                                                    {salaireDisponible.detail.acquisCeMois.toLocaleString('fr-FR')} FCFA acquis —
                                                    {' '}{salaireDisponible.detail.partDisponible} % mobilisable
                                                    {salaireDisponible.detail.dejaEngage > 0 &&
                                                        `, moins ${salaireDisponible.detail.dejaEngage.toLocaleString('fr-FR')} FCFA déjà engagés`}.
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-xs text-slate-600">{salaireDisponible.motif}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Montant demandé (FCFA) *</label>
                                    <div className="relative">
                                        <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="number" 
                                            min="10000"
                                            step="5000"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/50 outline-none text-slate-700 bg-white shadow-sm transition-all text-lg font-semibold"
                                            placeholder="Ex: 150 000"
                                            value={advanceForm.amount}
                                            onChange={(e) => setAdvanceForm({...advanceForm, amount: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">Montant minimum : 10 000 FCFA</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Plan de remboursement *</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['1', '2', '3', '4'].map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onClick={() => setAdvanceForm({...advanceForm, repaymentMonths: m})}
                                                className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                                                    advanceForm.repaymentMonths === m 
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200' 
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {m} mois
                                            </button>
                                        ))}
                                    </div>
                                    {advanceForm.amount && (
                                        <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                                                <TrendingUp size={14} />
                                                Mensualité estimée : <span className="font-bold">{formatAmount(Math.ceil(parseInt(advanceForm.amount) / parseInt(advanceForm.repaymentMonths)))}</span> / mois
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Motif de la demande *</label>
                                    <textarea 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/50 outline-none h-28 text-slate-700 bg-white shadow-sm transition-all resize-none"
                                        placeholder="Précisez le motif de votre demande d'avance (ex: urgence médicale, frais de scolarité, etc.)"
                                        value={advanceForm.reason}
                                        onChange={(e) => setAdvanceForm({...advanceForm, reason: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-700 space-y-1">
                                        <p className="font-bold">Conditions d'avance sur salaire :</p>
                                        <ul className="list-disc pl-4 space-y-0.5">
                                            <li>L'avance ne peut excéder 50% du salaire net</li>
                                            <li>Le remboursement est déduit automatiquement sur le bulletin de paie</li>
                                            <li>Délai de traitement : 48 à 72 heures ouvrables</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmittingAdvance || !advanceForm.amount || !advanceForm.reason}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl text-lg font-bold shadow-xl shadow-emerald-200/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmittingAdvance ? (
                                            <span className="flex items-center gap-2">
                                                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                                                Envoi en cours...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Send size={20} />
                                                Soumettre la demande
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Assistant Chat Widget */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
                <AnimatePresence>
                    {isChatOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 mb-4 overflow-hidden flex flex-col"
                        >
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-4 text-white flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Bot size={24} />
                                    <h3 className="font-bold">Assistant RH</h3>
                                </div>
                                <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-slate-50">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm text-sm text-slate-500 flex gap-1">
                                            <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                <input
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 px-3 py-2 bg-slate-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl outline-none text-sm transition-all"
                                    disabled={isChatLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!currentMessage.trim() || isChatLoading}
                                    className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isChatOpen && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsChatOpen(true)}
                        className="w-16 h-16 bg-indigo-600 rounded-full text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-indigo-600/30 border-4 border-white"
                    >
                        <MessageCircle size={28} />
                    </motion.button>
                )}
            </div>

        </div>
    );
}
