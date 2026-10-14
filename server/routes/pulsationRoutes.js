const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire des micro-humeurs du jour
let pulsations = [
    {
        id: 'pls-1',
        employeNom: 'Mariam D.',
        siteNom: 'Agence Orange Plateau',
        humeur: 'FEU', // FEU (top), BIEN, FATIGUE, COMPLIQUE
        commentaire: 'Super journée, objectif fibre atteint !',
        date: new Date(Date.now() - 3600000)
    },
    {
        id: 'pls-2',
        employeNom: 'Yves K.',
        siteNom: 'Agence Orange Plateau',
        humeur: 'BIEN',
        commentaire: '',
        date: new Date(Date.now() - 7200000)
    },
    {
        id: 'pls-3',
        employeNom: 'Bintou S.',
        siteNom: 'Agence Cap Sud Marcory',
        humeur: 'FATIGUE',
        commentaire: 'Affluence très forte en caisse Orange Money sans pause.',
        date: new Date(Date.now() - 10800000)
    }
];

/**
 * POST /api/public/pulsation
 * Micro-enregistrement de l'humeur en 1 tap au moment du pointage/départ
 */
router.post('/pulsation', async (req, res) => {
    try {
        const { jeton, humeur, siteNom, commentaire } = req.body || {};
        if (!humeur) return res.status(400).json({ error: "Humeur requise." });

        let salarieNom = 'Collaborateur';
        if (jeton) {
            const badge = await prisma.badgeSalarie.findUnique({
                where: { jetonPorteur: jeton },
                include: { employee: { select: { firstName: true, lastName: true } } }
            });
            if (badge?.employee) {
                salarieNom = `${badge.employee.firstName} ${badge.employee.lastName ? badge.employee.lastName[0] + '.' : ''}`;
            }
        }

        const nouvellePulsation = {
            id: `pls-${Date.now()}`,
            employeNom: salarieNom,
            siteNom: siteNom || 'Agence Orange',
            humeur, // 'FEU' | 'BIEN' | 'FATIGUE' | 'COMPLIQUE'
            commentaire: commentaire || '',
            date: new Date()
        };

        pulsations.unshift(nouvellePulsation);

        // Détection d'alerte bienveillance RH si 'COMPLIQUE' ou 'FATIGUE' répété
        const alertesAiguës = pulsations.filter(p => 
            p.siteNom === nouvellePulsation.siteNom && 
            ['COMPLIQUE', 'FATIGUE'].includes(p.humeur) &&
            (Date.now() - new Date(p.date).getTime()) < 24 * 3600000
        );

        res.status(201).json({
            succes: true,
            message: "Merci pour ton ressenti ! Bonne soirée et repose-toi bien.",
            alerteSurmenage: alertesAiguës.length >= 3
        });
    } catch (e) {
        console.error('[PULSATION] Erreur enregistrement:', e.message);
        res.status(500).json({ error: "Impossible d'enregistrer le ressenti." });
    }
});

/**
 * GET /api/pulsations/synthese
 * Métriques agrégées du climat émotionnel pour la DRH
 */
router.get('/synthese', (req, res) => {
    const total = pulsations.length;
    const repartition = {
        FEU: pulsations.filter(p => p.humeur === 'FEU').length,
        BIEN: pulsations.filter(p => p.humeur === 'BIEN').length,
        FATIGUE: pulsations.filter(p => p.humeur === 'FATIGUE').length,
        COMPLIQUE: pulsations.filter(p => p.humeur === 'COMPLIQUE').length
    };

    const ratioPositif = total > 0 ? Math.round(((repartition.FEU + repartition.BIEN) / total) * 100) : 100;

    res.json({
        succes: true,
        total,
        ratioPositif,
        repartition,
        dernieresPulsations: pulsations.slice(0, 15)
    });
});

module.exports = router;
