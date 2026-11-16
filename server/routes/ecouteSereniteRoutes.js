const express = require('express');
const router = express.Router();

let consultationsSerenite = [
  {
    id: 1,
    matriculeAnonyme: 'AGENT-SEC-***89',
    agenceOuZone: 'Agence Yopougon Keneya',
    motifPrincipal: 'INCIDENT_CLIENT', // INCIDENT_CLIENT, BURN_OUT, DEUIL_FAMILIAL, STRESS_OBJECTIF, CONFLIT_COLLEGUE
    severite: 'elevee', // faible, moderee, elevee, critique
    dateSignalement: '2026-11-08',
    sasDecompressionActive: true,
    reposRecuperationAccorde: '2 jours (dispense autorisée RH)',
    statutAccompagnement: 'en_cours', // oriente_psychologue, en_cours, cloture_apaise, suivi_medecine_travail
    praticienAssigne: 'Dr. Assi (Cabinet Psychologie du Travail Abidjan)',
    prochaineSeance: '2026-11-12 14:00',
    resumeConfidentiel: 'Altercation verbale agressive avec un client mécontent suite à un blocage Orange Money. Protocole décompression d\'urgence activé.'
  },
  {
    id: 2,
    matriculeAnonyme: 'AGENT-SEC-***14',
    agenceOuZone: 'Flotte Vente Nomade Adjamé',
    motifPrincipal: 'STRESS_OBJECTIF',
    severite: 'moderee',
    dateSignalement: '2026-11-04',
    sasDecompressionActive: false,
    reposRecuperationAccorde: 'Non (aménagement horaire)',
    statutAccompagnement: 'en_cours',
    praticienAssigne: 'Mme Bamba (Médiatrice RH interne)',
    prochaineSeance: '2026-11-11 10:30',
    resumeConfidentiel: 'Surcharge perçue liée aux objectifs de fin d\'année. Mise en place d\'un binômage terrain avec un animateur senior.'
  },
  {
    id: 3,
    matriculeAnonyme: 'AGENT-SEC-***52',
    agenceOuZone: 'Guichet Treichville',
    motifPrincipal: 'BURN_OUT',
    severite: 'moderee',
    dateSignalement: '2026-10-25',
    sasDecompressionActive: true,
    reposRecuperationAccorde: '3 jours',
    statutAccompagnement: 'cloture_apaise',
    praticienAssigne: 'Dr. Assi (Cabinet Psychologie du Travail Abidjan)',
    prochaineSeance: 'Suivi trimestriel',
    resumeConfidentiel: 'Fatigue nerveuse accumulée. Séances de relaxation et retour progressif réussi.'
  }
];

const indicateursBienEtre = {
  indiceSereniteGlobal: '78 / 100',
  tauxRecuperationApresIncident: '94%',
  alertesActives: consultationsSerenite.filter(c => c.severite === 'elevee' || c.severite === 'critique').length,
  tempsMoyenPriseEnChargeHeures: '2.4h',
  lignesEcoute247: 'Numéro Vert Gratuit : 800 00 225 (Ligne Écoute Partenaire SII / Santé Travail)'
};

router.get('/consultations', (req, res) => {
  res.json({
    success: true,
    consultations: consultationsSerenite,
    indicateurs: indicateursBienEtre
  });
});

router.post('/signaler', (req, res) => {
  const { agenceOuZone, motifPrincipal, severite, description, demandeAnonyme, contactRappel } = req.body;
  if (!motifPrincipal || !agenceOuZone) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' });
  }

  const nouvelleConsultation = {
    id: consultationsSerenite.length + 1,
    matriculeAnonyme: demandeAnonyme ? `AGENT-ANON-${Math.floor(100 + Math.random() * 900)}` : (contactRappel || 'AGENT-DECLARED'),
    agenceOuZone,
    motifPrincipal,
    severite: severite || 'moderee',
    dateSignalement: new Date().toISOString().split('T')[0],
    sasDecompressionActive: severite === 'elevee' || severite === 'critique',
    reposRecuperationAccorde: severite === 'elevee' ? '1 jour de sas accordé' : 'À évaluer',
    statutAccompagnement: 'oriente_psychologue',
    praticienAssigne: 'Cellule Médico-Psychologique Partenaire',
    prochaineSeance: 'Prise de contact sous 4h',
    resumeConfidentiel: description || 'Signalement bien-être pris en charge en toute confidentialité.'
  };

  consultationsSerenite.unshift(nouvelleConsultation);
  res.status(201).json({
    success: true,
    consultation: nouvelleConsultation,
    message: 'Signalement reçu avec succès. Un psychologue ou médiateur prendra contact en urgence.'
  });
});

module.exports = router;
