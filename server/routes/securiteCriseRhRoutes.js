const express = require('express');
const router = express.Router();

let crisesHistorique = [
  {
    id: 'CRISE-2026-001',
    titre: 'Inondation majeure Carrefour Indénié & Voie Express Yopougon',
    typeEvenement: 'METEO_INONDATION', // METEO_INONDATION, INCENDIE_ZONE, TENSION_SOCIALE_EMEUTE, PANNE_DORSALE_FIBRE
    statut: 'CLOTUREE_RESOLUE', // EN_COURS_ACTIVE, VIGILANCE_PREVENTIVE, CLOTUREE_RESOLUE
    severite: 'CRITIQUE',
    dateDeclenchement: '2026-10-18T06:30:00Z',
    dateCloture: '2026-10-18T18:00:00Z',
    zoneConcernee: 'Yopougon, Attécoubé & Axe Indénié - Plateau',
    agencesImpactees: ['Agence Yopougon Keneya', 'Agence Yopougon Siporex', 'Point Relais Attécoubé'],
    effectifTotalZone: 42,
    safetyCheckResultats: {
      confirmesEnSecurite: 41,
      assistanceRequise: 1, // 1 salarié bloqué pris en charge par navette haute surélevée
      sansReponse: 0
    },
    planReaffectation: 'Bascule automatique en télétravail partiel et renfort sur l\'agence Plateau Pyramide',
    responsableCrise: 'Comité CSST & Direction Sécurité SII'
  },
  {
    id: 'CRISE-2026-002',
    titre: 'Alerte Vigilance Météo Pluies Diluviennes Abidjan Sud',
    typeEvenement: 'METEO_INONDATION',
    statut: 'EN_COURS_ACTIVE',
    severite: 'VIGILANCE_ORANGE',
    dateDeclenchement: '2026-11-15T14:00:00Z',
    dateCloture: null,
    zoneConcernee: 'Koumassi, Treichville, Port-Bouët & Marcory',
    agencesImpactees: ['Agence Treichville Arras', 'Agence Koumassi Remblais', 'Boutique Aéroport Félix H.B.'],
    effectifTotalZone: 36,
    safetyCheckResultats: {
      confirmesEnSecurite: 34,
      assistanceRequise: 0,
      sansReponse: 2
    },
    planReaffectation: 'Fermeture anticipée des guichets à 16h30 et départ groupé via les navettes sécurisées',
    responsableCrise: 'Cellule de Crise RH & Direction Générale'
  }
];

let registreEmployesAlerte = [
  { id: 1, matricule: 'EMP-0245', nom: 'Kouassi Yves', agence: 'Agence Treichville Arras', statutSecurite: 'EN_SECURITE', reponseHeure: '2026-11-15 14:12', moyenReponse: 'WhatsApp Flash', localisation: 'Plateau - Siège' },
  { id: 2, matricule: 'EMP-0412', nom: 'Adingra Patricia', agence: 'Agence Koumassi Remblais', statutSecurite: 'EN_SECURITE', reponseHeure: '2026-11-15 14:18', moyenReponse: 'SMS Push', localisation: 'Koumassi centre' },
  { id: 3, matricule: 'EMP-0518', nom: 'Touré Moussa', agence: 'Agence Koumassi Remblais', statutSecurite: 'SANS_REPONSE', reponseHeure: 'En attente', moyenReponse: 'Rappel téléphonique en cours', localisation: 'Dernier pointage Koumassi' },
  { id: 4, matricule: 'EMP-0329', nom: 'Konan Estelle', agence: 'Boutique Aéroport', statutSecurite: 'SANS_REPONSE', reponseHeure: 'En attente', moyenReponse: 'SMS Push', localisation: 'Aéroport Félix H.B.' }
];

router.get('/statut-crise', (req, res) => {
  res.json({
    success: true,
    crises: crisesHistorique,
    registreSalaries: registreEmployesAlerte,
    synthese: {
      criseActive: crisesHistorique.find(c => c.statut === 'EN_COURS_ACTIVE') || null,
      tauxReponseSafetyCheck: '94.4%',
      navettesSecoursPretes: 4,
      centresDeRepliActifs: ['Siège SII Plateau', 'Pôle Logistique Vridi']
    }
  });
});

router.post('/declencher-safety-check', (req, res) => {
  const { zoneConcernee, typeEvenement, messageDiffusion } = req.body;
  if (!zoneConcernee) {
    return res.status(400).json({ success: false, error: 'Zone concernée obligatoire' });
  }

  const nouvelleCrise = {
    id: `CRISE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    titre: `Safety Check Urgence : ${zoneConcernee}`,
    typeEvenement: typeEvenement || 'METEO_INONDATION',
    statut: 'EN_COURS_ACTIVE',
    severite: 'CRITIQUE',
    dateDeclenchement: new Date().toISOString(),
    dateCloture: null,
    zoneConcernee,
    agencesImpactees: ['Agences du périmètre d\'alerte'],
    effectifTotalZone: 36,
    safetyCheckResultats: {
      confirmesEnSecurite: 1,
      assistanceRequise: 0,
      sansReponse: 35
    },
    planReaffectation: messageDiffusion || 'Mise en sécurité immédiate et ralliement au centre de repli',
    responsableCrise: 'Cellule de Continuité d\'Urgence SII'
  };

  crisesHistorique.unshift(nouvelleCrise);

  res.status(201).json({
    success: true,
    crise: nouvelleCrise,
    message: 'Safety Check d\'urgence diffusé à l\'ensemble des collaborateurs de la zone avec succès.'
  });
});

router.post('/repondre-statut', (req, res) => {
  const { matricule, statutSecurite, localisation } = req.body;
  const employe = registreEmployesAlerte.find(e => e.matricule === matricule);
  if (employe) {
    employe.statutSecurite = statutSecurite || 'EN_SECURITE';
    employe.reponseHeure = new Date().toISOString().replace('T', ' ').slice(0, 16);
    if (localisation) employe.localisation = localisation;
  }

  res.json({
    success: true,
    message: 'Statut de sécurité mis à jour en direct.'
  });
});

module.exports = router;
