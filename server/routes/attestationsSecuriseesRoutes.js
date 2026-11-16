const express = require('express');
const router = express.Router();
const crypto = require('crypto');

let documentsCertifies = [
    {
        id: 'cert-8891',
        employeNom: 'Awa Ouattara',
        matricule: 'EMP-3209',
        typeDocument: 'ATTESTATION_TRAVAIL_PRET',
        banqueCible: 'SGBCI (Société Générale Côte d\'Ivoire)',
        dateDelivrance: '08/11/2026',
        salaireBrutDeclareFcfa: 485000,
        ancienneteReconnue: '3 ans et 4 mois',
        statutContrat: 'CDI - Cadre Commercial',
        empreinteSHA256: 'a9f24c0e6b81d9f582c7a31b490f23e7104d55b8e9102c48197ffb0981e4b931',
        urlVerificationPublique: 'https://sirh.sii-ci.com/verify/cert-8891',
        qrCodeScelle: 'VALID_HASH_OFFICIAL_SII_CI',
        statut: 'DELIVRE_ACTIF',
        telechargements: 2
    },
    {
        id: 'cert-8892',
        employeNom: 'Yves Tanoh Brou',
        matricule: 'EMP-6041',
        typeDocument: 'ATTESTATION_NON_REDEVANCE',
        banqueCible: 'Ecobank Côte d\'Ivoire',
        dateDelivrance: '04/11/2026',
        salaireBrutDeclareFcfa: 350000,
        ancienneteReconnue: '1 an et 8 mois',
        statutContrat: 'CDI - Superviseur Boutique',
        empreinteSHA256: '5e71c8901bfa9822ef4190c4278ad65198e3b4a20bfa184029ce76d10459a91c',
        urlVerificationPublique: 'https://sirh.sii-ci.com/verify/cert-8892',
        qrCodeScelle: 'VALID_HASH_OFFICIAL_SII_CI',
        statut: 'DELIVRE_ACTIF',
        telechargements: 1
    },
    {
        id: 'cert-8893',
        employeNom: 'Marie-Josée Gnahoré',
        matricule: 'EMP-4488',
        typeDocument: 'CERTIFICAT_EMPLOI_VISA',
        banqueCible: 'Consulat Général de France à Abidjan',
        dateDelivrance: '01/11/2026',
        salaireBrutDeclareFcfa: 620000,
        ancienneteReconnue: '4 ans et 11 mois',
        statutContrat: 'CDI - Responsable Audit Interne',
        empreinteSHA256: '99b821a0f81d92305ca77a3421d098ef134267ab50821c9a419711da0923e412',
        urlVerificationPublique: 'https://sirh.sii-ci.com/verify/cert-8893',
        qrCodeScelle: 'VALID_HASH_OFFICIAL_SII_CI',
        statut: 'DELIVRE_ACTIF',
        telechargements: 3
    }
];

router.get('/documents', (req, res) => {
    res.json({
        succes: true,
        totalEmis: documentsCertifies.length,
        delaiMoyenGenerationSec: 1.8,
        tauxAuthenticiteConstate: '100%',
        banquesPartenairesConnectees: ['SGBCI', 'Ecobank', 'NSIA', 'BICICI', 'Coris Bank', 'Bridge Bank'],
        documents: documentsCertifies
    });
});

router.post('/generer', (req, res) => {
    const { employeNom, matricule, typeDocument, banqueCible, salaireBrutFcfa } = req.body;
    const hash = crypto.createHash('sha256').update(`${employeNom}-${Date.now()}-SIRH-SII-CI`).digest('hex');
    const nouveau = {
        id: `cert-${Math.floor(1000 + Math.random() * 9000)}`,
        employeNom: employeNom || 'Salarié SII CI',
        matricule: matricule || 'EMP-9988',
        typeDocument: typeDocument || 'ATTESTATION_TRAVAIL_PRET',
        banqueCible: banqueCible || 'Banque de l\'Union (BDU-CI)',
        dateDelivrance: new Date().toLocaleDateString('fr-FR'),
        salaireBrutDeclareFcfa: Number(salaireBrutFcfa) || 450000,
        ancienneteReconnue: '2 ans et 6 mois',
        statutContrat: 'CDI - Distributeur Agréé Orange CI',
        empreinteSHA256: hash,
        urlVerificationPublique: `https://sirh.sii-ci.com/verify/cert-${hash.slice(0, 8)}`,
        qrCodeScelle: 'VALID_HASH_OFFICIAL_SII_CI',
        statut: 'DELIVRE_ACTIF',
        telechargements: 1
    };
    documentsCertifies.unshift(nouveau);
    res.json({ succes: true, document: nouveau });
});

module.exports = router;
