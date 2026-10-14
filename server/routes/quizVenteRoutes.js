const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des quiz
let quizActifs = [
    {
        id: 'quiz-1',
        theme: 'Offres Fibre Orange CI',
        question: 'Quel est le débit download max de la Box Fibre Max Orange à 25 000 FCFA/mois ?',
        options: [
            { numero: 1, texte: '50 Mbps' },
            { numero: 2, texte: '100 Mbps (Recommandé)' },
            { numero: 3, texte: '200 Mbps' }
        ],
        reponseCorrecte: 2,
        explication: 'La formule Fibre Max offre 100 Mbps symétriques avec la TV Orange et la téléphonie fixe incluse.',
        pointsGagnes: 10,
        date: new Date().toISOString().slice(0, 10)
    },
    {
        id: 'quiz-2',
        theme: 'Sécurité Orange Money',
        question: 'Quel est le plafond journalier de retrait Orange Money pour un compte vérifié CNI ?',
        options: [
            { numero: 1, texte: '1 000 000 FCFA' },
            { numero: 2, texte: '2 000 000 FCFA' },
            { numero: 3, texte: '5 000 000 FCFA' }
        ],
        reponseCorrecte: 2,
        explication: 'Conformément aux normes BCEAO & Orange Money CI, le compte vérifié autorise jusqu\'à 2M FCFA/jour.',
        pointsGagnes: 10,
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    }
];

let participations = [
    {
        id: 'part-1',
        employeNom: 'Awa Traoré',
        siteNom: 'Agence Orange Plateau',
        quizId: 'quiz-1',
        reponseChoisie: 2,
        estCorrect: true,
        points: 10,
        date: new Date()
    },
    {
        id: 'part-2',
        employeNom: 'Kouassi Konan',
        siteNom: 'Agence Cap Sud Marcory',
        quizId: 'quiz-1',
        reponseChoisie: 1,
        estCorrect: false,
        points: 0,
        date: new Date()
    }
];

/**
 * GET /api/quiz-vente/actuel
 * Renvoie le quiz du jour et les statistiques
 */
router.get('/actuel', (req, res) => {
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const quiz = quizActifs.find(q => q.date === aujourdhui) || quizActifs[0];
    
    const reponsesQuiz = participations.filter(p => p.quizId === quiz.id);
    const reussites = reponsesQuiz.filter(p => p.estCorrect).length;
    const tauxReussite = reponsesQuiz.length > 0 ? Math.round((reussites / reponsesQuiz.length) * 100) : 0;

    res.json({
        succes: true,
        quiz,
        totalParticipants: reponsesQuiz.length,
        tauxReussite,
        participations: reponsesQuiz.slice(0, 10)
    });
});

/**
 * POST /api/quiz-vente/repondre
 * Soumettre une réponse (depuis WhatsApp ou l'interface web)
 */
router.post('/repondre', async (req, res) => {
    const { quizId, employeNom, siteNom, reponseNumero } = req.body || {};
    const quiz = quizActifs.find(q => q.id === quizId) || quizActifs[0];
    const estCorrect = parseInt(reponseNumero, 10) === quiz.reponseCorrecte;
    const points = estCorrect ? quiz.pointsGagnes : 0;

    const participation = {
        id: `part-${Date.now()}`,
        employeNom: employeNom || req.user?.name || 'Conseiller Vente',
        siteNom: siteNom || 'Agence Orange',
        quizId: quiz.id,
        reponseChoisie: parseInt(reponseNumero, 10),
        estCorrect,
        points,
        date: new Date()
    };

    participations.unshift(participation);

    res.json({
        succes: true,
        estCorrect,
        pointsGagnes: points,
        explication: quiz.explication,
        message: estCorrect 
            ? `🎉 Bravo ! +${points} points ajoutés à ton profil d'expertise commerciale.` 
            : `❌ Presque ! La bonne réponse était la N°${quiz.reponseCorrecte}. Retiens bien : ${quiz.explication}`
    });
});

/**
 * POST /api/quiz-vente/diffuser-whatsapp
 * Diffuse le quiz du matin aux commerciaux
 */
router.post('/diffuser-whatsapp', async (req, res) => {
    const quiz = quizActifs[0];
    const message = 
        `⚡ *DÉFI ÉCLAIR DU MATIN — SII* ⚡\n` +
        `📚 _Thème : ${quiz.theme}_\n\n` +
        `${quiz.question}\n\n` +
        quiz.options.map(o => `*${o.numero}* : ${o.texte}`).join('\n') + '\n\n' +
        `👉 Répondez simplement par *!quiz 1*, *!quiz 2* ou *!quiz 3* pour remporter +10 points sur votre badge !`;

    res.json({
        succes: true,
        messageDiffusable: message,
        info: "Quiz prêt pour diffusion WhatsApp aux conseillers boutique."
    });
});

module.exports = router;
module.exports.quizActifs = quizActifs;
module.exports.participations = participations;
