const express = require('express');
const router = express.Router();

let candidaturesJobDating = [
    {
        id: 'job-qr-101',
        candidatNom: 'Mireille Koffi',
        telephone: '+225 07 48 11 22 99',
        email: 'mireille.koffi@gmail.com',
        agenceScannee: 'Agence Orange Cocody Angré 8ème Tranche',
        heureCandidature: 'Aujourd\'hui, 09:15',
        diplome: 'BTS Gestion Commerciale (Promo 2025)',
        quartierHabitation: 'Angré Pétro Ivoire (à 800m de l\'agence)',
        scoreMotivationIA: '96%',
        delaiReponseMinutes: 18,
        statutCandidature: 'CONVOQUE_ENTRETIEN_JOUR',
        creneauEntretien: 'Aujourd\'hui à 15:30 avec le Chef d\'Agence',
        smsConfirmationEnvoye: true
    },
    {
        id: 'job-qr-102',
        candidatNom: 'Arnaud Gnahoré',
        telephone: '+225 05 64 88 12 00',
        email: 'arnaud.gnahore@yahoo.fr',
        agenceScannee: 'Agence Orange Treichville Arras',
        heureCandidature: 'Aujourd\'hui, 10:04',
        diplome: 'Licence Pro Télécoms & Réseaux',
        quartierHabitation: 'Treichville Avenue 16 (à 500m)',
        scoreMotivationIA: '92%',
        delaiReponseMinutes: 22,
        statutCandidature: 'CONVOQUE_ENTRETIEN_JOUR',
        creneauEntretien: 'Aujourd\'hui à 16:00 au Guichet Recrutement',
        smsConfirmationEnvoye: true
    },
    {
        id: 'job-qr-103',
        candidatNom: 'Bintou Cissé',
        telephone: '+225 01 02 44 91 88',
        email: 'bintou.cisse@outlook.com',
        agenceScannee: 'Agence Orange Yopougon Siporex',
        heureCandidature: 'Hier, 16:45',
        diplome: 'Baccalauréat G2 + 1 an caisse',
        quartierHabitation: 'Abobo BC (Trajet > 1h30)',
        scoreMotivationIA: '74%',
        delaiReponseMinutes: 35,
        statutCandidature: 'VIVIER_AGENCE_ABOBO',
        creneauEntretien: 'Transféré à l\'agence Orange Abobo Mairie (proximité domicile)',
        smsConfirmationEnvoye: true
    }
];

router.get('/statut', (req, res) => {
    res.json({
        succes: true,
        candidaturesDuMois: 142,
        entretiensRealises: 48,
        embauchesSaisonnieresConclues: 26,
        delaiMoyenConvocationMinutes: 24,
        qrCodeVitrineUrl: 'https://sirh.sii-ci.com/apply/qr-boutique-orange',
        candidatures: candidaturesJobDating
    });
});

router.post('/simuler-candidature', (req, res) => {
    const { candidatNom, telephone, agenceScannee, diplome, quartierHabitation } = req.body;
    const nouvelle = {
        id: `job-qr-${Date.now().toString().slice(-4)}`,
        candidatNom: candidatNom || 'Candidat Jeune Talent',
        telephone: telephone || '+225 07 00 11 22 33',
        email: 'talent.express@sii-ci.com',
        agenceScannee: agenceScannee || 'Agence Orange Plateau',
        heureCandidature: 'À l\'instant',
        diplome: diplome || 'BTS Vente & Négociation',
        quartierHabitation: quartierHabitation || 'Quartier Proche Agence',
        scoreMotivationIA: '95%',
        delaiReponseMinutes: 5,
        statutCandidature: 'CONVOQUE_ENTRETIEN_JOUR',
        creneauEntretien: 'Aujourd\'hui à 17:00 en boutique',
        smsConfirmationEnvoye: true
    };
    candidaturesJobDating.unshift(nouvelle);
    res.json({ succes: true, candidature: nouvelle });
});

module.exports = router;
