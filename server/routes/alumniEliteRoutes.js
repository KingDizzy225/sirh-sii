const express = require('express');
const router = express.Router();

let portraitsAlumni = [
    {
        id: 'alm-01',
        nom: 'Diallo Souleymane',
        posteActuel: 'Directeur Régional des Ventes Abidjan Sud',
        posteOrigine: 'Conseiller Commercial Stagiaire en Boutique (2018)',
        anneesAnciennete: 8,
        citationInspirante: 'J\'ai commencé en distribuant des cartes SIM au carrefour Siporex. La rigueur et la formation continue de SII m\'ont ouvert les portes de la direction.',
        conseilAuxJuniors: 'Ne sous-estimez jamais une vente. Chaque client Orange bien servi aujourd\'hui est un futur grand compte.',
        photoInitiale: 'DS',
        badge: '🌟 Parcours d\'Exception'
    },
    {
        id: 'alm-02',
        nom: 'Kouassi Affoué Christelle',
        posteActuel: 'Responsable Nationale des Formations & Expérience Client',
        posteOrigine: 'Hôtesse d\'Accueil & Caissière Orange Money (2020)',
        anneesAnciennete: 6,
        citationInspirante: 'L\'écoute active et l\'empathie envers nos clients de boutique m\'ont permis de bâtir le standard de formation de tout le réseau SII.',
        conseilAuxJuniors: 'Votre sourire au guichet est votre premier passeport pour l\'évolution professionnelle.',
        photoInitiale: 'KC',
        badge: '🏅 Mentor Émérite'
    }
];

router.get('/portraits', (req, res) => {
    res.json({
        succes: true,
        tauxPromotionInterneSii: '74% des managers actuels sont issus du terrain',
        alumni: portraitsAlumni
    });
});

module.exports = router;
