const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pieceController = require('../controllers/pieceController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

/**
 * Dépôt des titres et habilitations des salariés.
 *
 * Même dispositif que pour les attestations de prestataires : une pièce dont on
 * connaît la date mais pas le fichier est à moitié inutile le jour d'un
 * contrôle, c'est le document lui-même qu'il faut pouvoir produire.
 */
const dossierPieces = path.join(__dirname, '../uploads/pieces-salaries');
if (!fs.existsSync(dossierPieces)) fs.mkdirSync(dossierPieces, { recursive: true });

const stockage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dossierPieces),
    filename: (req, file, cb) => {
        const suffixe = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, suffixe + path.extname(file.originalname));
    }
});

// Un document, pas un exécutable. Le contrôle porte sur le type déclaré et sur
// l'extension : sur la seule extension, un fichier renommé passerait.
const FORMATS = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']);
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

const RH = ['Administrator', 'HR', 'ADMIN'];

// Catalogue des types : ouvert à tout compte connecté, il alimente aussi le
// formulaire de dépôt du portail salarié.
router.get('/types', pieceController.getTypes);

/**
 * Dépôt par le salarié lui-même.
 *
 * Déclaré avant les routes réservées : c'est la seule écriture ouverte à un
 * salarié, et ce qu'il dépose vaut « à contrôler », jamais « valide ».
 */
router.post('/portail', televerser.single('fichier'), pieceController.deposerParSalarie);

// Écran de pilotage, réservé à la RH. Déclaré avant les routes à paramètre :
// aucune ne l'attraperait aujourd'hui, mais un futur `GET /:id` le ferait.
router.get('/echeances', requireRole(RH), pieceController.getEcheances);

// Consultation d'un dossier : la RH, ou l'intéressé pour le sien. Le tri de ce
// qui est visible se fait dans le contrôleur, pièce par pièce.
router.get('/employe/:employeeId', pieceController.getPiecesEmploye);
router.get('/:id/fichier', pieceController.getFichier);

// Enregistrement et contrôle : réservés à la RH.
router.post('/employe/:employeeId', requireRole(RH),
    televerser.single('fichier'), pieceController.enregistrerParRh);
router.post('/:id/controle', requireRole(RH), pieceController.controler);
router.delete('/:id', requireRole(RH), pieceController.supprimer);

module.exports = router;
