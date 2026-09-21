const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// The employee creates a support ticket without auth
router.post('/tickets', publicController.createPublicTicket);

// The employee views their ticket status using the tracking ID
router.get('/tickets/:id', publicController.getPublicTicketStatus);

// The employee adds a message to their ticket
router.post('/tickets/:id/messages', publicController.addPublicMessage);

// Pointage universel (Arrivée, Départ, Retard)
router.post('/clock-in', publicController.publicClockIn);

// Vérification d'authenticité d'un document par son QR code (banque, bailleur,
// administration). Aucune donnée sensible n'est exposée — voir le contrôleur.
const verificationController = require('../controllers/verificationController');
router.get('/verify/:token', verificationController.verifyDocument);

// Suivi d'un dépôt par sa référence. Elle est rendue au salarié après chaque
// demande, et ne menait jusqu'ici nulle part.
router.get('/suivi/:reference', publicController.suivreDemande);

/**
 * Remise d'un document au salarié, par lien.
 *
 * Hors de toute session : les salariés n'ouvrent plus de compte, et c'est le
 * jeton du lien qui vaut autorisation. La vérification est refaite à chaque
 * étape — l'ouverture ne délivre aucun laissez-passer.
 */
const remiseController = require('../controllers/remiseController');
router.get('/documents/:token', remiseController.consulter);
router.post('/documents/:token/ouvrir', remiseController.ouvrir);
router.get('/documents/:token/fichier', remiseController.telecharger);

// Mur d'agence : l'écran de boutique ne se connecte pas, son jeton l'autorise.
router.get('/ecrans/:token', require('../controllers/ecranController').afficher);
router.get('/ecrans/:token/code', require('../controllers/ecranController').codePointage);

// Badge numérique : la carte du porteur, sa photo, et la vérification par un tiers.
const badgeController = require('../controllers/badgeController');
router.get('/badges/verifier/:jeton', badgeController.verifier);
router.get('/badges/:jeton', badgeController.carte);
router.get('/badges/:jeton/photo', badgeController.photo);

// Espace du salarié, reconnu par son badge : pointer sur l'écran d'agence,
// proposer ou reprendre un créneau.
const espaceSalarieController = require('../controllers/espaceSalarieController');
router.post('/badges/:jeton/pointer', espaceSalarieController.pointer);
router.get('/badges/:jeton/espace', espaceSalarieController.espace);
router.post('/badges/:jeton/remplacements', espaceSalarieController.proposer);
router.post('/badges/:jeton/remplacements/:id/annuler', espaceSalarieController.annuler);
router.post('/badges/:jeton/remplacements/:id/accepter', espaceSalarieController.reprendre);

// Passations d'équipe en agence.
const passationController = require('../controllers/passationController');
router.get('/badges/:jeton/passations', passationController.espace);
router.post('/badges/:jeton/passations', passationController.ecrire);
router.post('/badges/:jeton/passations/:id/acquitter', passationController.acquitter);
router.post('/badges/:jeton/passations/elements/:id/resoudre', passationController.resoudre);

// Émargement des formations : QR projeté en salle, scan avec le badge.
const emargementController = require('../controllers/emargementController');
router.get('/emargements/:token/code', emargementController.code);
router.post('/badges/:jeton/emarger', emargementController.emarger);

// Identité de l'entreprise, lue par toutes les pages publiques.
const identiteController = require('../controllers/identiteController');
router.get('/identite', identiteController.lirePublic);
router.get('/identite/logo', identiteController.logo);

// Pré-accueil du futur salarié : la page, la photo de son responsable, ses pièces.
const preAccueilController = require('../controllers/preAccueilController');
const multer = require('multer');
const pathModule = require('path');
const fsModule = require('fs');
if (!fsModule.existsSync(preAccueilController.DOSSIER_DOCUMENTS)) fsModule.mkdirSync(preAccueilController.DOSSIER_DOCUMENTS, { recursive: true });
const FORMATS_PIECES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const EXTENSIONS_PIECES = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);
const depotPiece = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, preAccueilController.DOSSIER_DOCUMENTS),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${pathModule.extname(file.originalname).toLowerCase()}`)
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = pathModule.extname(file.originalname).toLowerCase();
        if (!FORMATS_PIECES.has(file.mimetype) || !EXTENSIONS_PIECES.has(extension)) {
            return cb(new Error('Format non accepté : PDF ou photo (JPEG, PNG, WebP).'));
        }
        cb(null, true);
    }
});
router.get('/preaccueil/:token', preAccueilController.accueil);
router.get('/preaccueil/:token/photo-responsable', preAccueilController.photoResponsable);
router.post('/preaccueil/:token/pieces/:code', (req, res, next) => depotPiece.single('fichier')(req, res, (erreur) => {
    if (erreur) return res.status(400).json({ error: erreur.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop lourd (10 Mo au plus).' : erreur.message });
    next();
}), preAccueilController.deposer);

// Livre d'or : écrire un mot, et lire le livre le jour venu.
const livreDorController = require('../controllers/livreDorController');
router.get('/livres-dor/remise/:jeton', livreDorController.remise);
router.get('/livres-dor/:jeton', livreDorController.contribution);
router.post('/livres-dor/:jeton/mots', livreDorController.ecrire);

// « Mon année chez SII » : accueil, puis bilan après vérification.
const retrospectiveController = require('../controllers/retrospectiveController');
router.get('/retrospectives/:token', retrospectiveController.accueil);
router.post('/retrospectives/:token/ouvrir', retrospectiveController.ouvrir);

// Générateur instantané d'attestation RH (PDF officiel en streaming)
router.post('/certificate', publicController.generatePublicCertificate);

// Suivi universel de dossier (Ticket, Absence, Avance sur salaire)
router.get('/track/:query', publicController.trackPublicRequest);

// Dépôt public de notes de frais
router.post('/expenses', publicController.submitPublicExpense);

// Climat social, eNPS & Boîte à idées
router.post('/feedback', publicController.submitPublicFeedback);

// Chatbot Assistant FAQ RH
router.post('/faq-chat', publicController.publicFaqChat);

module.exports = router;
