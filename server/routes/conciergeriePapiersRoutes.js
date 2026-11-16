const express = require('express');
const router = express.Router();

let demandesConciergerie = [
  {
    id: 1,
    matricule: 'EMP-0245',
    nom: 'Kouassi Yves',
    departement: 'Ventes Réseau B2C',
    typeDemarche: 'CNI_ONECI', // CNI_ONECI, PASSEPORT, PERMIS_CONDUIRE, CASIER_JUDICIAIRE, EXTRAIT_NAISSANCE
    libelle: 'Renouvellement CNI biométrique ONECI express',
    statut: 'en_cours_traitement', // depot_dossier, en_cours_traitement, rdv_enrolement_fixe, document_recupere, remis_agent
    lieuDepotOuRdv: 'Centre ONECI Cocody Attoban',
    dateDemande: '2026-11-05',
    dateRdv: '2026-11-12 09:30',
    coursierAssigne: 'M. Touré (Navette RH)',
    fraisPrisEnCharge: true,
    avanceSalaireDediee: false,
    piecesJointes: ['Certificat_Nationalite.pdf', 'Ancienne_CNI.pdf'],
    commentaires: 'Dossier pré-validé par le juriste RH. Coupe-file entreprise réservé.'
  },
  {
    id: 2,
    matricule: 'EMP-0412',
    nom: 'Adingra Patricia',
    departement: 'Finance & Trésorerie',
    typeDemarche: 'PASSEPORT',
    libelle: 'Demande Passeport Biométrique SNEDAI mission sous-régionale',
    statut: 'rdv_enrolement_fixe',
    lieuDepotOuRdv: 'SNEDAI Plateau Immeuble Postel 2001',
    dateDemande: '2026-11-02',
    dateRdv: '2026-11-11 11:00',
    coursierAssigne: 'M. Coulibaly (Liaison RH)',
    fraisPrisEnCharge: true,
    avanceSalaireDediee: false,
    piecesJointes: ['Ordre_Mission_CEDEAO.pdf', 'Justificatif_Domicile.pdf'],
    commentaires: 'Prise en charge intégrale par la direction pour déplacement audit Dakar.'
  },
  {
    id: 3,
    matricule: 'EMP-0189',
    nom: 'Diallo Oumar',
    departement: 'Flotte Logistique & Motards',
    typeDemarche: 'PERMIS_CONDUIRE',
    libelle: 'Renouvellement Permis Moto Catégorie A (Quipux / OSER)',
    statut: 'document_recupere',
    lieuDepotOuRdv: 'Guichet Unique Automobile Koumassi',
    dateDemande: '2026-10-28',
    dateRdv: '2026-11-08 14:00',
    coursierAssigne: 'M. Touré (Navette RH)',
    fraisPrisEnCharge: true,
    avanceSalaireDediee: false,
    piecesJointes: ['Visite_Medicale_OSER.pdf', 'Photo_Identite.jpg'],
    commentaires: 'Permis sécurisé récupéré par le coursier RH, disponible à l\'accueil RH.'
  }
];

const typesDemarchesDisponibles = [
  { code: 'CNI_ONECI', titre: 'CNI Biométrique ONECI', delaiMoyen: '5 à 10 jours', documentsRequis: ['Extrait de naissance original', 'Certificat de nationalité', 'Ancienne pièce'] },
  { code: 'PASSEPORT', titre: 'Passeport Biométrique SNEDAI', delaiMoyen: '72h Express / 1 semaine standard', documentsRequis: ['Attestation d\'identité / CNI', 'Extrait d\'acte de naissance sécurisé', 'Reçu paiement en ligne'] },
  { code: 'PERMIS_CONDUIRE', titre: 'Renouvellement Permis Quipux Afrique', delaiMoyen: '7 jours ouvrés', documentsRequis: ['Visite médicale agréée OSER', 'Photocopie CNI', 'Ancien permis'] },
  { code: 'CASIER_JUDICIAIRE', titre: 'Bulletin N°3 Casier Judiciaire', delaiMoyen: '48h', documentsRequis: ['Copie acte de naissance', 'Fiche d\'état civil'] },
  { code: 'EXTRAIT_NAISSANCE', titre: 'Copie Intégrale d\'Acte de Naissance (Mairies Abidjan)', delaiMoyen: '48h', documentsRequis: ['Nom du centre d\'état civil', 'Numéro de registre et année'] }
];

router.get('/demandes', (req, res) => {
  res.json({
    success: true,
    demandes: demandesConciergerie,
    catalogueServices: typesDemarchesDisponibles,
    stats: {
      totalDemandes: demandesConciergerie.length,
      heuresEconomiseesSalaries: 42, // estimation heures de travail non perdues en file d'attente
      enCours: demandesConciergerie.filter(d => d.statut !== 'remis_agent').length,
      finaliseesCeMois: 14
    }
  });
});

router.post('/demandes', (req, res) => {
  const { matricule, nom, departement, typeDemarche, libelle, dateRdvPrevue, commentaires } = req.body;
  if (!nom || !typeDemarche) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' });
  }

  const nouvelleDemande = {
    id: demandesConciergerie.length + 1,
    matricule: matricule || 'EMP-AUTO',
    nom,
    departement: departement || 'Opérations Générales',
    typeDemarche,
    libelle: libelle || typesDemarchesDisponibles.find(t => t.code === typeDemarche)?.titre || 'Démarche Administrative',
    statut: 'depot_dossier',
    lieuDepotOuRdv: 'Pôle Conciergerie RH Siège',
    dateDemande: new Date().toISOString().split('T')[0],
    dateRdv: dateRdvPrevue || 'À définir par le coursier RH',
    coursierAssigne: 'Navette RH Quotidienne',
    fraisPrisEnCharge: true,
    avanceSalaireDediee: false,
    piecesJointes: [],
    commentaires: commentaires || 'Dossier pris en charge par la Conciergerie RH'
  };

  demandesConciergerie.unshift(nouvelleDemande);
  res.status(201).json({ success: true, demande: nouvelleDemande, message: 'Demande de conciergerie enregistrée avec succès' });
});

module.exports = router;
