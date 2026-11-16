const express = require('express');
const router = express.Router();

let capsulesPodcasts = [
    {
        id: 'pod-01',
        titre: 'Vendre la Box Fibre Pro aux Grossistes du Grand Marché',
        langue: 'Dioula (Commerçants & Marchés)',
        dureeMin: '2:15',
        formateurNom: 'Bakary Cissé (Top Vendeur B2B Adjamé)',
        theme: 'FIBRE_ENTREPRISE_ET_PME',
        ecoutesCumulees: 342,
        scoreEvaluation: '4.9/5',
        resumeArgumentaire: 'Comment expliquer le débit garanti, la caméra de surveillance boutique et le paiement Orange Money mensuel sans paperasse bancaire.',
        phrasesClesDialecte: '« Anw ka connexion in ka teli kosèbè, a tɛ dabila laji waati... » (Notre connexion est ultra rapide, elle ne coupe pas pendant la pluie...)',
        statut: 'DISPONIBLE_OFFLINE'
    },
    {
        id: 'pod-02',
        titre: 'Convaincre les Planteurs de Sécuriser leur Récolte sur Orange Money',
        langue: 'Baoulé (Centre & Bouaké / Yamoussoukro)',
        dureeMin: '1:58',
        formateurNom: 'Yao Kouassi N\'Goran (Chef d\'Agence Toumodi)',
        theme: 'ORANGE_MONEY_ET_EPARGNE',
        ecoutesCumulees: 289,
        scoreEvaluation: '4.8/5',
        resumeArgumentaire: 'Rassurer les coopératives agricoles sur la sécurité des retraits avec code secret et l\'absence de risque de braquage sur les pistes rurales.',
        phrasesClesDialecte: '« Sika nga i o sika kpa su, sran fi kwla wuo man... » (Cet argent est en sécurité totale, personne ne peut vous le voler sur la route...)',
        statut: 'DISPONIBLE_OFFLINE'
    },
    {
        id: 'pod-03',
        titre: 'Le Pitch Nouchi Express pour la jeunesse & les gamers',
        langue: 'Nouchi (Jeunesse Abidjanaise / Yopougon)',
        dureeMin: '1:45',
        formateurNom: 'Gervais Dago (Promoteur Vente Plateau)',
        theme: 'PASS_DATA_4G_5G_ILLIMITE',
        ecoutesCumulees: 512,
        scoreEvaluation: '5.0/5',
        resumeArgumentaire: 'Vocabulaire percutant, vitesse ping pour Free Fire / TikTok et forfaits nuits à prix cassés.',
        phrasesClesDialecte: '« C\'est du lourd deh ! Connexion là ne cale pas, ça gba seulement sans sciencer... »',
        statut: 'DISPONIBLE_OFFLINE'
    },
    {
        id: 'pod-04',
        titre: 'Accueil Chaleureux & Souscription Famille en Bété',
        langue: 'Bété (Gagnoa / Daloa / San Pedro)',
        dureeMin: '2:30',
        formateurNom: 'Hélène Gnahoré (Conseillère Guichet)',
        theme: 'ACCUEIL_ET_FORFAITS_FAMILLE',
        ecoutesCumulees: 178,
        scoreEvaluation: '4.7/5',
        resumeArgumentaire: 'Techniques d\'accueil respectueux des aînés et présentation des forfaits partage de gigas en famille.',
        phrasesClesDialecte: '« A té gnouman... connexion kpa o kpa pour tous les enfants à la maison... »',
        statut: 'DISPONIBLE_OFFLINE'
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        totalCapsulesAudio: capsulesPodcasts.length,
        totalEcoutesReseau: 1321,
        tauxSatisfactionVendeurs: '98.5%',
        podcasts: capsulesPodcasts
    });
});

router.post('/ajouter-capsule', (req, res) => {
    const { titre, langue, formateurNom, theme, resumeArgumentaire, phrasesClesDialecte } = req.body;
    const nouvelle = {
        id: `pod-${Date.now().toString().slice(-4)}`,
        titre: titre || 'Argumentaire Vente Télécom de Proximité',
        langue: langue || 'Dioula / Français populaire',
        dureeMin: '2:00',
        formateurNom: formateurNom || 'Conseiller Senior Orange CI',
        theme: theme || 'VENTE_PROXIMITE',
        ecoutesCumulees: 1,
        scoreEvaluation: '5.0/5',
        resumeArgumentaire: resumeArgumentaire || 'Argumentaire de vente adapté aux clients des marchés.',
        phrasesClesDialecte: phrasesClesDialecte || 'Expressions et salutations clés en langue locale.',
        statut: 'DISPONIBLE_OFFLINE'
    };
    capsulesPodcasts.unshift(nouvelle);
    res.json({ succes: true, podcast: nouvelle });
});

module.exports = router;
