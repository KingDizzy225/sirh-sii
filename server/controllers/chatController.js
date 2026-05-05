const { GoogleGenAI } = require('@google/genai');

let ai;
try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch(e) { ai = null; }

exports.askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!ai) return res.status(500).json({ reply: 'La clé API IA n\'est pas configurée dans le backend.' });
        
        const systemPrompt = `Tu es l'assistant RH officiel pour l'entreprise ivoirienne SII.
Ton rôle est d'informer les collaborateurs avec un ton poli, professionnel, et concis (ne fais pas de longue intro).
Contexte d'entreprise (RAG simulé) :
- Heures de travail : 8h-17h du Lundi au Vendredi.
- Période d'essai CDI : 3 mois renouvelables une fois.
- Congés payés : 2 jours ouvrables par mois travaillé.
- Mutuelle Santé : L'entreprise prend en charge 80%, vous 20%. Demande via l'onglet Avantages.
- Télétravail : 2 jours par semaine max, en accord avec le manager.
- Notes de frais : Payées en fin de mois avec le salaire net, si soumises avant le 20.

Réponds de manière stricte et concise à cette question de l'employé : "${message}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemPrompt
        });

        res.json({ reply: response.text });
    } catch(err) {
        console.error("Chat Error:", err);
        res.status(500).json({ reply: 'Désolé, je rencontre des difficultés techniques actuellement.' });
    }
};
