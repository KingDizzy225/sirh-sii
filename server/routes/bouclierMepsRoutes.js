const express = require('express');
const router = express.Router();

let piecesObligatoiresMEPS = [
    {
        id: 'chk-01',
        intitule: 'Registre Unique du Personnel (RUP) Scellé',
        baseLegale: 'Art. L.93.1 du Code du Travail CI & Décret d\'application',
        statutConformite: 'CONFORME_A_JOUR',
        derniereMiseAJour: 'Aujourd\'hui, 08:00 (385 salariés actifs répertoriés)',
        inspecteurValidateur: 'Direction Régionale du Travail Abidjan 1',
        actionsRequises: 'Aucune (Registre horodaté et certifié conforme)',
        prioriteControle: 'CRITIQUE'
    },
    {
        id: 'chk-02',
        intitule: 'Attestation de Régularité des Cotisations CNPS',
        baseLegale: 'Code de Prévoyance Sociale CI - Déclarations mensuelles',
        statutConformite: 'CONFORME_A_JOUR',
        derniereMiseAJour: '05/11/2026 (Quitus CNPS Quinzaine Octobre validé)',
        inspecteurValidateur: 'Agence CNPS Cocody / Plateau',
        actionsRequises: 'Conserver la quittance de télé-virement dans le classeur',
        prioriteControle: 'CRITIQUE'
    },
    {
        id: 'chk-03',
        intitule: 'Affichage des Horaires de Travail & Repos Hebdomadaire',
        baseLegale: 'Art. L.21.3 du Code du Travail (Horaires 40h/semaine)',
        statutConformite: 'CONFORME_A_JOUR',
        derniereMiseAJour: '28/10/2026 (Affiché à l\'entrée du personnel de chaque agence)',
        inspecteurValidateur: 'Chefs d\'Agences Réseau Orange CI',
        actionsRequises: 'Contrôler le panneau de Treichville après réaménagement du guichet',
        prioriteControle: 'ELEVEE'
    },
    {
        id: 'chk-04',
        intitule: 'Procès-Verbaux d\'Élections des Délégués du Personnel',
        baseLegale: 'Art. L.61.1 et Décret n°96-207 - Scrutins paritaires',
        statutConformite: 'CONFORME_A_JOUR',
        derniereMiseAJour: 'Scrutin du 14/03/2025 (Mandats valables jusqu\'au 14/03/2027)',
        inspecteurValidateur: 'Inspection du Travail du Siège (Marcory)',
        actionsRequises: 'Mandats en cours (6 titulaires, 6 suppléants déclarés)',
        prioriteControle: 'CRITIQUE'
    },
    {
        id: 'chk-05',
        intitule: 'Registre de Sécurité, Incendie & Hygiène (CSST)',
        baseLegale: 'Comité de Santé et Sécurité au Travail (Entreprises > 50 salariés)',
        statutConformite: 'CONFORME_A_JOUR',
        derniereMiseAJour: '15/10/2026 (Dernière réunion trimestrielle CSST archivée)',
        inspecteurValidateur: 'Direction de la Santé et Sécurité au Travail (DSST)',
        actionsRequises: 'Prochaine session CSST programmée le 18 Décembre 2026',
        prioriteControle: 'ELEVEE'
    },
    {
        id: 'chk-06',
        intitule: 'Fiches Médicales d\'Aptitude Périodique (Médecine du Travail)',
        baseLegale: 'Décret n°95-309 relatif à la Médecine du Travail',
        statutConformite: 'ATTENTION_RENOUVELLEMENT',
        derniereMiseAJour: '92% des visites périodiques effectuées',
        inspecteurValidateur: 'Service Médical Interentreprises SMIT',
        actionsRequises: '14 conseillers de l\'agence Yopougon à planifier pour fin novembre',
        prioriteControle: 'MOYENNE'
    },
    {
        id: 'chk-07',
        intitule: 'Déclaration Annuelle de Situation de Main d\'Œuvre (DASMO)',
        baseLegale: 'Obligation annuelle MEPS - Transmission AGEPE',
        statutConformite: 'CONFORME_A_JOUR',
        derniereMiseAJour: 'Dépôt validé avec récépissé MEPS n° 2026/DASMO/0941',
        inspecteurValidateur: 'Ministère de l\'Emploi et de la Protection Sociale',
        actionsRequises: 'Archivée pour l\'exercice fiscal en cours',
        prioriteControle: 'ELEVEE'
    }
];

let historiqueControlesPasses = [
    {
        id: 'ctrl-2026-01',
        dateControle: '24/06/2026',
        directionInspection: 'Direction Régionale de l\'Inspection du Travail de Cocody',
        inspecteurNom: 'M. Kouadio Brou (Inspecteur Principal)',
        typeVisite: 'VISITE_INOPINEE_DE_CONTROLE',
        siteVisite: 'Agence Principale Deux-Plateaux & Siège',
        scoreConformite: '97.5%',
        conclusionsInspecteur: 'Tenue exemplaire des registres, régularité parfaite des cotisations CNPS et bonne représentativité syndicale des délégués.',
        miseEnDemeure: 'AUCUNE (Quitus d\'inspection sans réserve délivré)',
        statutQuitus: 'QUITUS_OFFICIEL_DELIVRE'
    },
    {
        id: 'ctrl-2025-02',
        dateControle: '18/11/2025',
        directionInspection: 'Inspection du Travail de Treichville / Marcory',
        inspecteurNom: 'Mme Koné Fatoumata (Inspectrice du Travail)',
        typeVisite: 'CONTROLE_PROGRAMME_CSST',
        siteVisite: 'Agence Orange Treichville Arras & Entrepôt Logistique',
        scoreConformite: '94.0%',
        conclusionsInspecteur: 'Observations mineures sur l\'encombrement des sorties de secours lors des livraisons de cartes SIM, levées sous 48h.',
        miseEnDemeure: 'Recommandation levée avec attestation de conformité',
        statutQuitus: 'QUITUS_OFFICIEL_DELIVRE'
    }
];

router.get('/statut', (req, res) => {
    const totalPieces = piecesObligatoiresMEPS.length;
    const piecesConformes = piecesObligatoiresMEPS.filter(p => p.statutConformite === 'CONFORME_A_JOUR').length;
    const scorePourcentage = Math.round((piecesConformes / totalPieces) * 100);

    res.json({
        succes: true,
        scoreGlobalConformite: `${scorePourcentage}%`,
        statutGeneral: scorePourcentage >= 90 ? 'BOUCLIER_ACTIF_CONFORME' : 'VIGILANCE_RENOUVELLEMENT',
        piecesObligatoires: piecesObligatoiresMEPS,
        historiqueControles: historiqueControlesPasses,
        packControleGenere: {
            nomFichier: 'PACK_INSPECTION_MEPS_SIRH_SII_CI_2026.pdf',
            tailleMo: 4.8,
            horodatageScellement: new Date().toISOString(),
            qrVerification: 'MEPS-CI-VERIFIED-HASH-9981'
        }
    });
});

router.post('/mettre-a-jour-piece', (req, res) => {
    const { pieceId, statut, actionsRequises } = req.body;
    const piece = piecesObligatoiresMEPS.find(p => p.id === pieceId);
    if (piece) {
        if (statut) piece.statutConformite = statut;
        if (actionsRequises) piece.actionsRequises = actionsRequises;
        piece.derniereMiseAJour = `Mis à jour le ${new Date().toLocaleDateString('fr-FR')} par la Direction Juridique`;
    }
    res.json({ succes: true, piece });
});

module.exports = router;
