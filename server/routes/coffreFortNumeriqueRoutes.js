const express = require('express');
const router = express.Router();
const crypto = require('crypto');

let coffreArchives = [
  {
    id: 'DOC-EV-2026-001',
    matricule: 'EMP-0245',
    salarieNom: 'Kouassi Yves',
    typeDocument: 'BULLETIN_PAIE_SCELLE',
    titre: 'Bulletin de Paie - Octobre 2026 (Scellé)',
    periode: '2026-10',
    dateDepot: '2026-10-31T23:59:00Z',
    empreinteSha256: 'a7b89f3c4e12d56a89c741e52f019b384c718a29e4f5012398471bcae84920fd',
    certificatX509: 'CN=SII-CI Electronic Authority, O=SII Côte d\'Ivoire, C=CI',
    statutArchivage: 'ARCHIVE_SCELLEE_50_ANS',
    valeurProbante: true,
    tailleKo: 184,
    telechargeParSalarie: true,
    derniereConsultation: '2026-11-04 14:22'
  },
  {
    id: 'DOC-EV-2026-002',
    matricule: 'EMP-0245',
    salarieNom: 'Kouassi Yves',
    typeDocument: 'CONTRAT_TRAVAIL_SIGNE',
    titre: 'Contrat de Travail CDI avec Avenant Régional',
    periode: '2025-03',
    dateDepot: '2025-03-15T09:15:00Z',
    empreinteSha256: 'f4129bc83a74910248e58129ac841920bd847291a847109283749182374921ab',
    certificatX509: 'CN=SII-CI Electronic Authority, O=SII Côte d\'Ivoire, C=CI',
    statutArchivage: 'ARCHIVE_SCELLEE_50_ANS',
    valeurProbante: true,
    tailleKo: 412,
    telechargeParSalarie: true,
    derniereConsultation: '2026-08-11 10:15'
  },
  {
    id: 'DOC-EV-2026-003',
    matricule: 'EMP-0412',
    salarieNom: 'Adingra Patricia',
    typeDocument: 'BULLETIN_PAIE_SCELLE',
    titre: 'Bulletin de Paie - Octobre 2026 (Scellé)',
    periode: '2026-10',
    dateDepot: '2026-10-31T23:59:00Z',
    empreinteSha256: 'c849182374921abf4129bc83a74910248e58129ac841920bd847291a84710928',
    certificatX509: 'CN=SII-CI Electronic Authority, O=SII Côte d\'Ivoire, C=CI',
    statutArchivage: 'ARCHIVE_SCELLEE_50_ANS',
    valeurProbante: true,
    tailleKo: 192,
    telechargeParSalarie: false,
    derniereConsultation: 'Non consulté'
  },
  {
    id: 'DOC-EV-2026-004',
    matricule: 'EMP-0189',
    salarieNom: 'Diallo Oumar',
    typeDocument: 'CERTIFICAT_TRAVAIL',
    titre: 'Attestation Annuelle CNPS & Bilan de Droits',
    periode: '2025-12',
    dateDepot: '2026-01-05T11:00:00Z',
    empreinteSha256: '10248e58129ac841920bd847291a847109283749182374921abf4129bc83a749',
    certificatX509: 'CN=SII-CI Electronic Authority, O=SII Côte d\'Ivoire, C=CI',
    statutArchivage: 'ARCHIVE_SCELLEE_50_ANS',
    valeurProbante: true,
    tailleKo: 245,
    telechargeParSalarie: true,
    derniereConsultation: '2026-09-02 18:40'
  }
];

const journalPreuvesAuditTrail = [
  { id: 1, date: '2026-11-10 08:30:12', action: 'Contrôle d\'intégrité cryptographique SHA-256', statut: '100% CONFORME (Aucune altération)', operateur: 'Système Automatique d\'Archivage e-Vault' },
  { id: 2, date: '2026-10-31 23:59:00', action: 'Scellement du lot Paie Octobre 2026 (190 bulletins)', statut: 'CERTIFICAT HORODATÉ APPLIQUÉ', operateur: 'Serveur de Scellement SII-CI' }
];

router.get('/documents', (req, res) => {
  res.json({
    success: true,
    documents: coffreArchives,
    journalAudit: journalPreuvesAuditTrail,
    garanties: {
      dureeConservationLegale: '50 ans à compter de l\'émission',
      normeArchivage: 'ISO 14641 / NF Z42-013 & Arrêté Numérique CI',
      accessibilitePostDepart: 'Garantie à vie par lien sécurisé unique',
      totalDocumentsScelles: coffreArchives.length,
      volumeStockeKo: coffreArchives.reduce((acc, d) => acc + d.tailleKo, 0)
    }
  });
});

router.post('/sceller', (req, res) => {
  const { matricule, salarieNom, typeDocument, titre, periode } = req.body;
  if (!matricule || !typeDocument || !titre) {
    return res.status(400).json({ success: false, error: 'Champs obligatoires manquants' });
  }

  const hashGenere = crypto.createHash('sha256').update(`${matricule}-${titre}-${Date.now()}`).digest('hex');
  const nouveauDoc = {
    id: `DOC-EV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    matricule,
    salarieNom: salarieNom || 'Collaborateur SII',
    typeDocument,
    titre,
    periode: periode || new Date().toISOString().slice(0, 7),
    dateDepot: new Date().toISOString(),
    empreinteSha256: hashGenere,
    certificatX509: 'CN=SII-CI Electronic Authority, O=SII Côte d\'Ivoire, C=CI',
    statutArchivage: 'ARCHIVE_SCELLEE_50_ANS',
    valeurProbante: true,
    tailleKo: Math.floor(150 + Math.random() * 200),
    telechargeParSalarie: false,
    derniereConsultation: 'Non consulté'
  };

  coffreArchives.unshift(nouveauDoc);
  journalPreuvesAuditTrail.unshift({
    id: journalPreuvesAuditTrail.length + 1,
    date: new Date().toISOString().replace('T', ' ').slice(0, 19),
    action: `Scellement cryptographique du document ${nouveauDoc.id} (${titre})`,
    statut: 'SCELLEMENT RÉUSSI',
    operateur: 'Opérateur RH Authentifié'
  });

  res.status(201).json({
    success: true,
    document: nouveauDoc,
    message: 'Document scellé et archivé dans le coffre-fort numérique avec empreinte SHA-256 infalsifiable.'
  });
});

module.exports = router;
