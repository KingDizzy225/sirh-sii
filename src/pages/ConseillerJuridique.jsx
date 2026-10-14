import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Scale, MessageSquare, FileText, Calculator, Send, Copy, Check, Sparkles, BookOpen, AlertTriangle, ShieldCheck, Printer, RefreshCw } from 'lucide-react';
import { api } from '../lib/api.js';

export function ConseillerJuridique() {
    const [onglet, setOnglet] = useState('chat'); // 'chat' | 'courriers' | 'calculateur'

    // État Chat
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Bonjour. Je suis votre conseiller juridique RH dédié au droit du travail ivoirien (Loi n° 2015-532, Décret 96-203 et CCNI). Quelle situation ou interrogation juridique souhaitez-vous examiner aujourd'hui ?"
        }
    ]);
    const [chargementChat, setChargementChat] = useState(false);

    // État Courriers
    const [formCourrier, setFormCourrier] = useState({
        typeActe: "Demande d'explications écrites",
        nomSalarie: '',
        poste: '',
        dateFaits: '',
        motifs: '',
        dateEntretien: '',
        sanctions: ''
    });
    const [courrierGenere, setCourrierGenere] = useState(null);
    const [chargementCourrier, setChargementCourrier] = useState(false);
    const [copie, setCopie] = useState(false);

    // État Calculateur
    const [calc, setCalc] = useState({
        salaireMoyen: 350000,
        anciennete: 4.5,
        categorie: 'EMPLOYES'
    });
    const [resultatCalc, setResultatCalc] = useState(null);
    const [chargementCalc, setChargementCalc] = useState(false);

    // Questions rapides suggérées
    const questionsSuggerees = [
        "Procédure de licenciement pour faute lourde et délais de préavis ?",
        "Congés exceptionnels pour événements familiaux selon la CCNI ?",
        "Calcul des heures supplémentaires de nuit et jours fériés (Décret 96-203) ?",
        "Durée maximale d'un CDD et conditions de requalification en CDI ?"
    ];

    const envoyerQuestion = async (texteAEnvoyer) => {
        const q = texteAEnvoyer || question;
        if (!q.trim() || chargementChat) return;

        const nouveauHistorique = [...messages, { role: 'user', content: q }];
        setMessages(nouveauHistorique);
        setQuestion('');
        setChargementChat(true);

        try {
            const res = await api.post('/juridique/consulter', {
                question: q,
                historique: messages.map(m => ({ role: m.role, content: m.content }))
            });
            setMessages([...nouveauHistorique, { role: 'assistant', content: res?.data?.reponse || "Aucune réponse générée." }]);
        } catch (err) {
            setMessages([...nouveauHistorique, { role: 'assistant', content: `⚠️ Erreur : ${err.response?.data?.error || err.message}` }]);
        } finally {
            setChargementChat(false);
        }
    };

    const genererCourrier = async (e) => {
        e.preventDefault();
        setChargementCourrier(true);
        try {
            const res = await api.post('/juridique/generer-courrier', formCourrier);
            setCourrierGenere(res?.data?.document || '');
        } catch (err) {
            alert(err.response?.data?.error || err.message || 'Erreur lors de la génération.');
        } finally {
            setChargementCourrier(false);
        }
    };

    const copierTexte = (texte) => {
        navigator.clipboard.writeText(texte);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    const calculerBareme = async () => {
        setChargementCalc(true);
        try {
            const res = await api.post('/juridique/calculer-bareme', {
                salaireMoyenMensuel: calc.salaireMoyen,
                ancienneteAnnees: calc.anciennete,
                categorie: calc.categorie
            });
            setResultatCalc(res?.data);
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setChargementCalc(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Scale className="w-7 h-7 text-indigo-600" />
                        Conseiller Juridique & Code du Travail CI
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Assistance légale instantanée, rédaction d'actes pré-contentieux et calcul des barèmes (Loi 2015-532 & CCNI).
                    </p>
                </div>
                <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border">
                    <button
                        onClick={() => setOnglet('chat')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${onglet === 'chat' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Consultation IA
                    </button>
                    <button
                        onClick={() => setOnglet('courriers')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${onglet === 'courriers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <FileText className="w-4 h-4" /> Actes & Courriers
                    </button>
                    <button
                        onClick={() => { setOnglet('calculateur'); if (!resultatCalc) calculerBareme(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${onglet === 'calculateur' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                        <Calculator className="w-4 h-4" /> Barèmes & Préavis
                    </button>
                </div>
            </div>

            {/* TAB 1: CONSULTATION IA */}
            {onglet === 'chat' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex flex-col h-[650px] bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500" /> Expert Juridique Virtuel (Droit Social Ivoirien)
                            </span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                                En ligne
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {chargementChat && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-100 rounded-2xl p-4 text-sm text-slate-500 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" /> Analyse des articles du Code du travail en cours…
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t bg-slate-50/50">
                            <form onSubmit={(e) => { e.preventDefault(); envoyerQuestion(); }} className="flex gap-2">
                                <input
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Ex: Procédure en cas d'abandon de poste de 3 jours..."
                                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                />
                                <Button type="submit" disabled={chargementChat || !question.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Card className="border-indigo-100 bg-indigo-50/40">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-indigo-600" /> Questions Fréquentes RH
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {questionsSuggerees.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => envoyerQuestion(q)}
                                        className="w-full text-left p-2.5 rounded-lg bg-white border border-indigo-100 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                    >
                                        💬 {q}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Références Intégrées
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs text-slate-600 space-y-2">
                                <p>• <strong>Loi n° 2015-532</strong> (Code du travail CI)</p>
                                <p>• <strong>Décret 96-203</strong> (Durée & Heures Supplémentaires)</p>
                                <p>• <strong>CCNI 1977</strong> (Convention Collective Interprofessionnelle)</p>
                                <p>• <strong>Règles CNPS & CMU</strong> de Côte d'Ivoire</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 2: ACTES & COURRIERS */}
            {onglet === 'courriers' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-600" /> Paramètres du document
                            </CardTitle>
                            <CardDescription>
                                L'acte est rédigé selon les formules obligatoires du droit du travail ivoirien.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={genererCourrier} className="space-y-4 text-sm">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Nature de l'acte juridique</label>
                                    <select
                                        value={formCourrier.typeActe}
                                        onChange={(e) => setFormCourrier(s => ({ ...s, typeActe: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                                    >
                                        <option value="Demande d'explications écrites">Demande d'explications écrites (Délai 48h obligatoire)</option>
                                        <option value="Lettre d'avertissement formel">Lettre d'avertissement formel</option>
                                        <option value="Mise à pied conservatoire">Notification de mise à pied conservatoire</option>
                                        <option value="Convocation à entretien préalable">Convocation à entretien préalable de licenciement</option>
                                        <option value="Notification de licenciement pour faute">Notification de licenciement pour faute</option>
                                        <option value="Accord de rupture conventionnelle">Protocole de rupture conventionnelle / amiable</option>
                                        <option value="Certificat de fin de travail">Certificat de travail officiel (Art. 16.14)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-medium text-slate-700 mb-1">Nom du salarié</label>
                                        <input
                                            value={formCourrier.nomSalarie}
                                            onChange={(e) => setFormCourrier(s => ({ ...s, nomSalarie: e.target.value }))}
                                            placeholder="Ex: KOUASSI Jean"
                                            required
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium text-slate-700 mb-1">Poste occupé</label>
                                        <input
                                            value={formCourrier.poste}
                                            onChange={(e) => setFormCourrier(s => ({ ...s, poste: e.target.value }))}
                                            placeholder="Ex: Conseiller Commercial"
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Date des faits / Constat</label>
                                    <input
                                        type="date"
                                        value={formCourrier.dateFaits}
                                        onChange={(e) => setFormCourrier(s => ({ ...s, dateFaits: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Faits et motifs constatés</label>
                                    <textarea
                                        value={formCourrier.motifs}
                                        onChange={(e) => setFormCourrier(s => ({ ...s, motifs: e.target.value }))}
                                        rows={4}
                                        placeholder="Ex: Absence injustifiée constatée du 1er au 3 octobre sans justificatif médical ni prévenance hiérarchique..."
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>

                                <Button type="submit" disabled={chargementCourrier} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                                    {chargementCourrier ? 'Rédaction de l\'acte…' : '📄 Rédiger l\'acte officiel'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base">Aperçu du courrier</CardTitle>
                                <CardDescription>Prêt pour impression ou décharge avec signature</CardDescription>
                            </div>
                            {courrierGenere && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => copierTexte(courrierGenere)}>
                                        {copie ? <Check className="w-4 h-4 text-emerald-600 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                                        {copie ? 'Copié' : 'Copier'}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                                        <Printer className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 bg-slate-50/50 p-4 rounded-b-xl border-t">
                            {courrierGenere ? (
                                <div className="bg-white p-6 rounded-xl border shadow-sm font-serif text-sm leading-relaxed whitespace-pre-wrap text-slate-800 h-[480px] overflow-y-auto">
                                    {courrierGenere}
                                </div>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <FileText className="w-12 h-12 stroke-[1.2]" />
                                    <p className="text-sm">Renseignez les champs à gauche pour générer l'acte juridique.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* TAB 3: CALCULATEUR DE BARÈMES */}
            {onglet === 'calculateur' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-indigo-600" /> Données du salarié
                            </CardTitle>
                            <CardDescription>Barème conventionnel CCNI Art. 31 et 34</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Salaire brut moyen mensuel (FCFA)</label>
                                <input
                                    type="number"
                                    value={calc.salaireMoyen}
                                    onChange={(e) => setCalc(s => ({ ...s, salaireMoyen: Number(e.target.value) }))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono font-semibold"
                                />
                                <span className="text-xs text-slate-400">Moyenne des 12 derniers mois (primes comprises)</span>
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Ancienneté (Années de présence)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={calc.anciennete}
                                    onChange={(e) => setCalc(s => ({ ...s, anciennete: Number(e.target.value) }))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Catégorie socio-professionnelle</label>
                                <select
                                    value={calc.categorie}
                                    onChange={(e) => setCalc(s => ({ ...s, categorie: e.target.value }))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                                >
                                    <option value="EMPLOYES">Employés & Ouvriers (Cat. 1 à 5)</option>
                                    <option value="MAITRISE">Agents de maîtrise & Techniciens (Cat. 6 à 11)</option>
                                    <option value="CADRES">Ingénieurs & Cadres assimilés</option>
                                </select>
                            </div>

                            <Button onClick={calculerBareme} disabled={chargementCalc} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                {chargementCalc ? 'Calcul…' : 'Calculer les indemnités'}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2 space-y-4">
                        {resultatCalc && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg">
                                        <p className="text-xs uppercase font-bold tracking-wider text-indigo-300">Indemnité de Licenciement (CCNI Art. 34)</p>
                                        <p className="text-4xl font-extrabold mt-2 text-white font-mono">
                                            {resultatCalc.recapitulatif.montantIndemniteLicenciement.toLocaleString('fr-FR')} FCFA
                                        </p>
                                        <p className="text-xs text-indigo-200 mt-2">
                                            Pour {resultatCalc.recapitulatif.anciennete} an(s) d'ancienneté
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-700 to-orange-800 text-white p-6 rounded-2xl shadow-lg">
                                        <p className="text-xs uppercase font-bold tracking-wider text-amber-200">Préavis Conventionnel Obligatoire</p>
                                        <p className="text-4xl font-extrabold mt-2 text-white font-mono">
                                            {resultatCalc.recapitulatif.dureePreavisMois} mois
                                        </p>
                                        <p className="text-xs text-amber-100 mt-2">
                                            Valeur compensatrice : {resultatCalc.recapitulatif.indemnitePreavisEstimee.toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                </div>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-bold text-slate-800">Détail du calcul tranche par tranche (CCNI)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b text-left text-slate-500 text-xs">
                                                        <th className="py-2">Période</th>
                                                        <th className="py-2">Taux légal</th>
                                                        <th className="py-2">Années retenues</th>
                                                        <th className="py-2 text-right">Montant</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {resultatCalc.indemnites.tranches.map((t, idx) => (
                                                        <tr key={idx} className="border-b last:border-0">
                                                            <td className="py-2.5 font-medium">{t.tranche}</td>
                                                            <td className="py-2.5 text-indigo-600 font-semibold">{t.taux}</td>
                                                            <td className="py-2.5">{t.annees} an(s)</td>
                                                            <td className="py-2.5 text-right font-mono font-bold text-slate-800">{t.montant.toLocaleString('fr-FR')} FCFA</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
