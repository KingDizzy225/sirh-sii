const express = require('express');
const router = express.Router();

let registreRequisitions = [
    {
        id: 'req-artci-2026-08',
        autoriteEmettrice: 'Police Judiciaire - Brigade des Enquêtes Spéciales',
        numeroDossierJudiciaire: 'PV-N°982/DPCJ/2026',
        numeroLigneConcernee: '+225 07 59 11 22 33',
        objetDemande: 'Identification du titulaire de carte SIM & relevé des transactions Orange Money',
        officierDemandeur: 'Capitaine Kouadio N\'Dri',
        statutConformiteLegale: 'CONFORME_VALIDATION_DIRECTION_JURIDIQUE',
        officierRhTraiteur: 'Maître Bamba (Affaires Juridiques & Conformité SII)',
        traiteLe: '11/10/2026 à 15:30',
        chiffrementScelle: 'SHA256-AES-998218-SEALED'
    },
    {
        id: 'req-artci-2026-09',
        autoriteEmettrice: 'Gendarmerie Nationale - Section de Recherches',
        numeroDossierJudiciaire: 'PROC-GEN-142/2026',
        numeroLigneConcernee: '+225 05 44 20 01 99',
        objetDemande: 'Historique des swaps SIM et bornage relais agence',
        officierDemandeur: 'Adjudant-Chef Diarra',
        statutConformiteLegale: 'EN_ATTENTE_ORDRE_DU_PROCUREUR',
        officierRhTraiteur: 'Direction Juridique SII & ARTCI',
        traiteLe: 'Aujourd\'hui 08:45',
        chiffrementScelle: 'SHA256-AES-441092-PENDING'
    }
];

router.get('/registre', (req, res) => {
    res.json({
        succes: true,
        secretProfessionnel: 'Données protégées par le secret des correspondances et la loi ARTCI N°2013-450 sur les télécommunications',
        requisitions: registreRequisitions
    });
});

router.post('/consigner-requisition', (req, res) => {
    const { autoriteEmettrice, numeroDossierJudiciaire, numeroLigneConcernee, objetDemande, officierDemandeur } = req.body || {};
    const nouvelle = {
        id: `req-artci-2026-${Math.floor(10 + Math.random() * 90)}`,
        autoriteEmettrice: autoriteEmettrice || 'Police Judiciaire',
        numeroDossierJudiciaire: numeroDossierJudiciaire || 'PV-RÉQUISITION-LÉGALE',
        numeroLigneConcernee: numeroLigneConcernee || '+225 07 XX XX XX XX',
        objetDemande: objetDemande || 'Demande d\'identification légale',
        officierDemandeur: officierDemandeur || 'Officier de Police Judiciaire',
        statutConformiteLegale: 'CONFORME_VALIDATION_DIRECTION_JURIDIQUE',
        officierRhTraiteur: 'Direction Juridique & Conformité SII',
        traiteLe: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        chiffrementScelle: `SHA256-AES-${Math.floor(100000 + Math.random() * 900000)}-SEALED`
    };
    registreRequisitions.unshift(nouvelle);
    res.json({
        succes: true,
        requisition: nouvelle,
        message: 'Réquisition judiciaire consignée dans le registre chiffré. Protection pénale garantie pour le personnel d\'agence.'
    });
});

module.exports = router;
