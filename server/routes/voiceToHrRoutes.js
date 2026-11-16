const express = require('express');
const router = express.Router();

let messagesVocaux = [
    {
        id: 'voc-001',
        employeNom: 'Kouassi Konan Yao',
        matricule: 'EMP-4102',
        agence: 'Agence Orange Treichville Arras',
        poste: 'Conseiller Commercial',
        dateEnvoi: 'Aujourd\'hui, 07:42',
        dureeAudioSec: 38,
        canal: 'WhatsApp Bot RH',
        langueDetectee: 'Français ivoirien / Nouchi',
        transcriptionBrute: "Allô patron, c'est Kouassi depuis Treichville. Ya gbata bloqué vers le carrefour Solibra à cause d'un camion en panne et la pluie qui commence. Je vais faire retard de 35 minutes le temps de trouver un wôrô-wôrô qui contourne.",
        analyseIA: {
            categorie: 'RETARD_INTEMPERIE_TRAFIC',
            motifExtrait: 'Blocage circulation carrefour Solibra (pluie + camion en panne)',
            retardEstimeMin: 35,
            impactService: 'MINEUR',
            justificatifValideAuto: true,
            statutRH: 'APPROUVE_NOTIFIE'
        },
        actionExecutee: 'Notification envoyée au Chef d\'Agence Treichville + pointage pré-ajusté à 08:35.'
    },
    {
        id: 'voc-002',
        employeNom: 'Fatouma Traoré',
        matricule: 'EMP-5519',
        agence: 'Agence Orange Cocody Angré 8ème Tranche',
        poste: 'Caissière Principale',
        dateEnvoi: 'Aujourd\'hui, 08:15',
        dureeAudioSec: 52,
        canal: 'Application Mobile SIRH Voice',
        langueDetectee: 'Français ivoirien',
        transcriptionBrute: "Bonjour Mme la RH, j'ai mon petit dernier qui chauffe fort depuis 4h du matin. Je l'ai emmené à la clinique Sainte Anne pour faire la goutte épaisse de palu. Je dépose le bulletin de consultation dès que les analyses sortent vers 11h.",
        analyseIA: {
            categorie: 'URGENCE_ENFANT_MALADE',
            motifExtrait: 'Hospitalisation enfant en urgence (suspicion paludisme)',
            retardEstimeMin: 180,
            impactService: 'MODERE_REMPLACEMENT_OUVERT',
            justificatifValideAuto: true,
            statutRH: 'EN_ATTENTE_PIECE_JOINTE'
        },
        actionExecutee: 'Alerte remplacement envoyée au pool caisse mobile de Cocody.'
    },
    {
        id: 'voc-003',
        employeNom: 'Bakary Soro',
        matricule: 'EMP-6890',
        agence: 'Zone Commerciale Intérieur - Korhogo Centre',
        poste: 'Commercial Terrain B2B',
        dateEnvoi: 'Hier, 17:30',
        dureeAudioSec: 44,
        canal: 'WhatsApp Bot RH',
        langueDetectee: 'Français / Malinké',
        transcriptionBrute: "Patron bonsoir, la mission sur Ferkessédougou s'est bien passée, 14 contrats de flottes Fibre Pro signés. Par contre le pneu arrière de la moto de service a crevé vers Sinématiali. J'ai fait réparer à la vulcanisation pour 3 500 FCFA.",
        analyseIA: {
            categorie: 'RAPPORT_MISSION_ET_FRAIS',
            motifExtrait: 'Succès prospection B2B + note de frais vulcanisation 3 500 FCFA',
            retardEstimeMin: 0,
            impactService: 'SUCCES_COMMERCIAL',
            justificatifValideAuto: true,
            statutRH: 'NOTE_FRAIS_GENEREE'
        },
        actionExecutee: 'Note de frais automatique créditée pour validation remboursement express Orange Money.'
    }
];

router.get('/messages', (req, res) => {
    res.json({
        succes: true,
        totalTraites: messagesVocaux.length,
        tauxPrecisionIA: '98.4%',
        tempsMoyenTraitementSec: 4.2,
        messages: messagesVocaux
    });
});

router.post('/traiter-vocal', (req, res) => {
    const { employeNom, agence, audioText, canal } = req.body;
    const nouveau = {
        id: `voc-${Date.now().toString().slice(-4)}`,
        employeNom: employeNom || 'Conseiller Commercial Terrain',
        matricule: 'EMP-AUTO',
        agence: agence || 'Agence Orange Plateau',
        poste: 'Conseiller Clientèle',
        dateEnvoi: 'À l\'instant',
        dureeAudioSec: 25,
        canal: canal || 'WhatsApp Bot RH',
        langueDetectee: 'Français ivoirien / Nouchi',
        transcriptionBrute: audioText || "Note vocale reçue : retard signalé pour contrainte transport.",
        analyseIA: {
            categorie: 'DECLARATION_INSTANTANEE',
            motifExtrait: audioText ? audioText.slice(0, 60) + '...' : 'Signalement de retard ponctuel',
            retardEstimeMin: 30,
            impactService: 'MINEUR',
            justificatifValideAuto: true,
            statutRH: 'APPROUVE_NOTIFIE'
        },
        actionExecutee: 'Traitement automatique IA effectué et consigné au registre de présence.'
    };
    messagesVocaux.unshift(nouveau);
    res.json({ succes: true, message: nouveau });
});

module.exports = router;
