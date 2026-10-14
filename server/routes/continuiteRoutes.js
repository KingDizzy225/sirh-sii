const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Données en mémoire pour le simulateur de résilience des sites
let statutsSites = new Map();

/**
 * Calcul de la distance orthodromique (Haversine) en km
 */
function calculerDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}

/**
 * GET /api/continuite/sites
 * Liste tous les sites avec leur statut de continuité opérationnelle
 */
router.get('/sites', async (req, res) => {
    try {
        const sites = await prisma.workSite.findMany({
            where: { isActive: true },
            include: {
                ecrans: {
                    select: {
                        id: true,
                        nom: true,
                        derniereConsultation: true,
                        pointageActif: true
                    }
                },
                _count: {
                    select: { timeLogs: true }
                }
            }
        });

        const maintenant = new Date();
        const resultat = sites.map(site => {
            // État personnalisé si basculé manuellement
            const custom = statutsSites.get(site.id) || {};
            
            // Calcul automatique basé sur le dernier ping de l'écran TV (si pas de ping depuis 10 min = suspicion de coupure)
            const dernierPing = site.ecrans.reduce((recent, e) => {
                if (!e.derniereConsultation) return recent;
                const d = new Date(e.derniereConsultation);
                return !recent || d > recent ? d : recent;
            }, null);

            const minutesSansPing = dernierPing ? Math.round((maintenant - dernierPing) / 60000) : 999;
            const coupureDetectee = minutesSansPing > 10;

            const modeActif = custom.modeDegrade !== undefined 
                ? custom.modeDegrade 
                : coupureDetectee;

            // Trouver l'agence opérationnelle de repli la plus proche
            const voisins = sites
                .filter(s => s.id !== site.id)
                .map(v => ({
                    id: v.id,
                    name: v.name,
                    distanceKm: calculerDistanceKm(site.latitude, site.longitude, v.latitude, v.longitude)
                }))
                .sort((a, b) => a.distanceKm - b.distanceKm);

            return {
                id: site.id,
                nom: site.name,
                latitude: site.latitude,
                longitude: site.longitude,
                ecransConnectes: site.ecrans.length,
                dernierPing,
                modeDegrade: modeActif,
                typeIncident: custom.typeIncident || (coupureDetectee ? 'COUPURE_ENERGIE_RESEAU' : 'AUCUN'),
                groupeElectrogene: custom.groupeElectrogene || false,
                box4gSecours: custom.box4gSecours || false,
                siteRepli: voisins[0] || null,
                messageSecours: custom.messageSecours || "Accueil en mode dégradé. Émargement papier & pointage hors-ligne en vigueur."
            };
        });

        res.json({
            succes: true,
            totalSites: resultat.length,
            enModeDegrade: resultat.filter(s => s.modeDegrade).length,
            sites: resultat
        });
    } catch (e) {
        console.error('[CONTINUITE] Erreur listing:', e.message);
        res.status(500).json({ error: "Impossible de charger la continuité des sites." });
    }
});

/**
 * POST /api/continuite/sites/:id/basculer
 * Activer ou désactiver le mode dégradé sur une agence
 */
router.post('/sites/:id/basculer', async (req, res) => {
    try {
        const { id } = req.params;
        const { modeDegrade, typeIncident, groupeElectrogene, box4gSecours, messageSecours } = req.body || {};

        const site = await prisma.workSite.findUnique({ where: { id } });
        if (!site) return res.status(404).json({ error: "Site introuvable." });

        statutsSites.set(id, {
            modeDegrade: Boolean(modeDegrade),
            typeIncident: typeIncident || 'COUPURE_COURANT',
            groupeElectrogene: Boolean(groupeElectrogene),
            box4gSecours: Boolean(box4gSecours),
            messageSecours: messageSecours || "Attention : Agence en protocole de secours.",
            modifieLe: new Date()
        });

        res.json({
            succes: true,
            site: site.name,
            modeDegrade: Boolean(modeDegrade),
            message: modeDegrade 
                ? `Mode secours activé pour ${site.name}. SMS de redirection prêts.` 
                : `Retour à la normale validé pour ${site.name}.`
        });
    } catch (e) {
        console.error('[CONTINUITE] Erreur bascule:', e.message);
        res.status(500).json({ error: "Impossible de basculer le mode secours." });
    }
});

module.exports = router;
