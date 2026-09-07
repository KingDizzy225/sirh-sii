const express = require('express');
const router = express.Router();
const subcontractorController = require('../controllers/subcontractorController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Dépôt des attestations de prestataires.
 *
 * Une attestation dont on connaît la date mais pas le fichier est à moitié
 * inutile le jour d'un contrôle : c'est la pièce elle-même qu'il faut pouvoir
 * produire.
 */
const dossierPieces = path.join(__dirname, '../uploads/sous-traitance');
if (!fs.existsSync(dossierPieces)) fs.mkdirSync(dossierPieces, { recursive: true });

const stockage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dossierPieces),
    filename: (req, file, cb) => {
        const suffixe = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, suffixe + path.extname(file.originalname));
    }
});

// Formats attendus d'une attestation : un document, pas un exécutable. Le
// contrôle porte sur le type déclaré et sur l'extension, faute de quoi un
// fichier renommé passerait sur la seule extension.
const FORMATS = new Set([
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'
]);
const EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.heic']);

const televerser = multer({
    storage: stockage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (!FORMATS.has(file.mimetype) || !EXTENSIONS.has(extension)) {
            return cb(new Error('Format non accepté : joindre un PDF ou une image.'));
        }
        cb(null, true);
    }
});

router.use(verifyToken);
// Only HR / Admin for managing external workforce
router.use(requireRole(['Administrator', 'HR']));

// Routes nommées avant `/:id` : « conformite » et « pieces » ne doivent pas
// être pris pour des identifiants de prestataire.
router.get('/conformite', subcontractorController.getConformite);
router.get('/pieces', subcontractorController.getPieces);

router.get('/', subcontractorController.getSubcontractors);
router.post('/', requireRole(['ADMIN', 'HR']), subcontractorController.createSubcontractor);
router.put('/:id', requireRole(['ADMIN', 'HR']), subcontractorController.updateSubcontractor);

// Pièces justificatives du prestataire
router.get('/:id/documents', subcontractorController.getDocuments);
router.post('/:id/documents', requireRole(['ADMIN', 'HR']),
    // Le rejet de multer doit revenir en 400 avec son motif : sans cela, un
    // format refusé remonterait en 500 et passerait pour une panne.
    (req, res, next) => televerser.single('fichier')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    }),
    subcontractorController.addDocument);
router.get('/documents/:documentId/fichier', subcontractorController.getDocumentFile);
router.delete('/documents/:documentId', requireRole(['ADMIN', 'HR']), subcontractorController.deleteDocument);

module.exports = router;
