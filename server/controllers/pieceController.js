const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');
const pieces = require('../lib/pieces');
const { canAccessEmployeeData, getRequesterEmployee } = require('../lib/access');
const { hasRole } = require('../middleware/roleMiddleware');

/**
 * Titres et habilitations à échéance des salariés.
 *
 * Une règle traverse ce fichier : **une pièce déposée n'est jamais valide de
 * son propre fait**. Le salarié dépose, la RH contrôle. Sans cela, la
 * conformité se déclarerait elle-même, et l'écran des échéances ne dirait plus
 * qu'une chose — que chacun a bien cliqué.
 */

const estRh = (user) => hasRole(user, ['ADMIN', 'HR']);

/** Supprime un fichier téléversé qu'on renonce à enregistrer. */
const abandonner = (fichier) => {
    if (!fichier) return;
    fs.unlink(fichier.path, (e) => {
        if (e) console.error('[PIECES] Fichier abandonné non supprimé :', e.message);
    });
};

/** GET /api/pieces/types — le catalogue, pour alimenter les formulaires. */
exports.getTypes = (req, res) => {
    res.json({
        types: pieces.TYPES.map(({ code, libelle, validiteMois, confidentielle, pourquoi }) => ({
            code, libelle, validiteMois, confidentielle, pourquoi
        })),
        preavisJours: pieces.PREAVIS_JOURS
    });
};

/**
 * GET /api/pieces/echeances?jours=60
 *
 * L'écran de pilotage : ce qui a expiré, ce qui expire, ce qui attend un
 * contrôle. Les pièces expirées viennent d'abord — c'est l'ordre dans lequel
 * on veut les traiter, pas l'ordre alphabétique.
 */
exports.getEcheances = async (req, res) => {
    try {
        const jours = Math.min(Math.max(parseInt(req.query.jours, 10) || pieces.PREAVIS_JOURS, 1), 365);
        const limite = new Date(Date.now() + jours * 24 * 3600 * 1000);

        const enBase = await prisma.pieceSalarie.findMany({
            where: {
                statut: { not: 'REFUSEE' },
                OR: [
                    { expireLe: { lte: limite } },
                    { statut: 'A_CONTROLER' }
                ],
                employee: { status: { not: 'TERMINATED' } }
            },
            include: {
                employee: {
                    select: { id: true, firstName: true, lastName: true, department: true, positionTitle: true }
                }
            },
            orderBy: [{ expireLe: 'asc' }]
        });

        const rh = estRh(req.user);
        const moi = rh ? null : await getRequesterEmployee(req.user);

        const lignes = enBase.map((p) => ({
            ...pieces.pourLecteur(p, {
                estRhOuAdmin: rh,
                estTitulaire: Boolean(moi && moi.id === p.employeeId)
            }),
            salarie: {
                id: p.employee.id,
                nom: `${p.employee.firstName} ${p.employee.lastName}`,
                service: p.employee.department,
                poste: p.employee.positionTitle
            }
        }));

        const rang = { EXPIREE: 0, BIENTOT_EXPIREE: 1, SANS_ECHEANCE: 2, VALIDE: 3 };
        lignes.sort((a, b) => (rang[a.etat] - rang[b.etat])
            || ((a.joursRestants ?? 9e9) - (b.joursRestants ?? 9e9)));

        res.json({
            fenetreJours: jours,
            lignes,
            synthese: {
                expirees: lignes.filter((l) => l.etat === 'EXPIREE').length,
                aRenouveler: lignes.filter((l) => l.etat === 'BIENTOT_EXPIREE').length,
                aControler: lignes.filter((l) => l.statut === 'A_CONTROLER').length
            }
        });
    } catch (error) {
        console.error('Erreur lecture des échéances de pièces :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des échéances.' });
    }
};

/** GET /api/pieces/employe/:employeeId — le dossier d'un salarié. */
exports.getPiecesEmploye = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (!(await canAccessEmployeeData(req.user, employeeId))) {
            return res.status(403).json({ error: "Accès interdit aux pièces de ce salarié." });
        }

        const enBase = await prisma.pieceSalarie.findMany({
            where: { employeeId },
            orderBy: [{ type: 'asc' }, { createdAt: 'desc' }]
        });

        const rh = estRh(req.user);
        const moi = rh ? null : await getRequesterEmployee(req.user);
        const estTitulaire = Boolean(moi && moi.id === employeeId);

        res.json({
            pieces: enBase.map((p) => pieces.pourLecteur(p, { estRhOuAdmin: rh, estTitulaire })),
            bilan: pieces.bilan(enBase)
        });
    } catch (error) {
        console.error('Erreur lecture des pièces du salarié :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des pièces.' });
    }
};

/**
 * Enregistrement d'une pièce, commun aux deux voies d'entrée.
 * @param {boolean} parLaRh  détermine le statut initial, et lui seul.
 */
async function enregistrer({ employeeId, corps, fichier, user, parLaRh }) {
    const { type, reference, delivreeLe, expireLe, note } = corps || {};

    if (!pieces.CODES.includes(type)) {
        const e = new Error(`Type de pièce inconnu. Attendu : ${pieces.CODES.join(', ')}.`);
        e.code = 'TYPE';
        throw e;
    }

    const delivree = delivreeLe ? new Date(delivreeLe) : null;
    if (delivree && isNaN(delivree.getTime())) {
        const e = new Error('Date de délivrance invalide.'); e.code = 'DATE'; throw e;
    }

    let expire = expireLe ? new Date(expireLe) : null;
    if (expire && isNaN(expire.getTime())) {
        const e = new Error("Date d'expiration invalide."); e.code = 'DATE'; throw e;
    }
    // Une pièce enregistrée sans échéance ne serait jamais relancée : elle
    // dormirait au dossier en paraissant valide indéfiniment.
    if (!expire) expire = pieces.echeanceParDefaut(type, delivree);

    if (expire && delivree && expire < delivree) {
        const e = new Error("La date d'expiration précède la date de délivrance.");
        e.code = 'DATE';
        throw e;
    }

    return prisma.pieceSalarie.create({
        data: {
            employeeId,
            type,
            reference: reference || null,
            delivreeLe: delivree,
            expireLe: expire,
            note: note || null,
            filePath: fichier ? `pieces-salaries/${fichier.filename}` : null,
            // Le seul endroit où le statut initial se décide. Ce que le salarié
            // dépose attend un contrôle ; ce que la RH enregistre est déjà
            // contrôlé, puisqu'elle a la pièce sous les yeux.
            statut: parLaRh ? 'VALIDE' : 'A_CONTROLER',
            deposeePar: user?.email || null,
            controleePar: parLaRh ? (user?.name || user?.email || null) : null,
            controleeLe: parLaRh ? new Date() : null
        }
    });
}

/** POST /api/pieces/employe/:employeeId — enregistrement par la RH. */
exports.enregistrerParRh = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const salarie = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!salarie) {
            abandonner(req.file);
            return res.status(404).json({ error: 'Salarié introuvable.' });
        }

        const piece = await enregistrer({
            employeeId, corps: req.body, fichier: req.file, user: req.user, parLaRh: true
        });
        res.status(201).json(pieces.pourLecteur(piece, { estRhOuAdmin: true, estTitulaire: false }));
    } catch (error) {
        abandonner(req.file);
        if (['TYPE', 'DATE'].includes(error.code)) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erreur enregistrement de pièce :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de la pièce." });
    }
};

/**
 * POST /api/pieces/portail — dépôt par le salarié lui-même.
 *
 * Le salarié ne choisit ni le dossier de destination ni le statut : le premier
 * est déduit de son compte, le second vaut « à contrôler » quoi qu'il envoie.
 */
exports.deposerParSalarie = async (req, res) => {
    try {
        const moi = await getRequesterEmployee(req.user);
        if (!moi) {
            abandonner(req.file);
            return res.status(404).json({ error: 'Aucun dossier salarié rattaché à ce compte.' });
        }

        const piece = await enregistrer({
            employeeId: moi.id, corps: req.body, fichier: req.file, user: req.user, parLaRh: false
        });

        res.status(201).json({
            piece: pieces.pourLecteur(piece, { estRhOuAdmin: false, estTitulaire: true }),
            message: 'Pièce déposée. Elle sera vérifiée par les ressources humaines avant d\'être prise en compte.'
        });
    } catch (error) {
        abandonner(req.file);
        if (['TYPE', 'DATE'].includes(error.code)) {
            return res.status(400).json({ error: error.message });
        }
        console.error('Erreur dépôt de pièce par le salarié :', error);
        res.status(500).json({ error: 'Erreur lors du dépôt de la pièce.' });
    }
};

/** POST /api/pieces/:id/controle — validation ou refus par la RH. */
exports.controler = async (req, res) => {
    try {
        const { decision, motif } = req.body || {};
        if (!['VALIDE', 'REFUSEE'].includes(decision)) {
            return res.status(400).json({ error: "Décision attendue : « VALIDE » ou « REFUSEE »." });
        }
        if (decision === 'REFUSEE' && !motif) {
            // Un refus sans motif laisse le salarié sans rien à corriger.
            return res.status(400).json({ error: 'Un refus doit être motivé.' });
        }

        const piece = await prisma.pieceSalarie.findUnique({ where: { id: req.params.id } });
        if (!piece) return res.status(404).json({ error: 'Pièce introuvable.' });

        const misAJour = await prisma.pieceSalarie.update({
            where: { id: piece.id },
            data: {
                statut: decision,
                motifRefus: decision === 'REFUSEE' ? motif : null,
                controleePar: req.user?.name || req.user?.email || null,
                controleeLe: new Date()
            }
        });

        res.json(pieces.pourLecteur(misAJour, { estRhOuAdmin: true, estTitulaire: false }));
    } catch (error) {
        console.error('Erreur contrôle de pièce :', error);
        res.status(500).json({ error: 'Erreur lors du contrôle de la pièce.' });
    }
};

/**
 * GET /api/pieces/:id/fichier — la pièce elle-même.
 *
 * C'est ici que se joue la confidentialité : l'aptitude médicale et le titre de
 * séjour ne se consultent que par la RH ou l'intéressé. Un responsable voit
 * l'échéance dans la liste, jamais le document.
 */
exports.getFichier = async (req, res) => {
    try {
        const piece = await prisma.pieceSalarie.findUnique({ where: { id: req.params.id } });
        if (!piece) return res.status(404).json({ error: 'Pièce introuvable.' });

        if (!(await canAccessEmployeeData(req.user, piece.employeeId))) {
            return res.status(403).json({ error: 'Accès interdit à cette pièce.' });
        }
        if (!piece.filePath) {
            return res.status(404).json({ error: "Aucun fichier n'est joint à cette pièce." });
        }

        // Le nom est produit par le serveur, mais la vérification coûte moins
        // cher que la confiance.
        const relatif = path.normalize(piece.filePath).replace(/^(\.\.[/\\])+/, '');
        const racine = path.join(__dirname, '..', 'uploads');
        const chemin = path.join(racine, relatif);
        if (!chemin.startsWith(racine)) {
            return res.status(400).json({ error: 'Chemin de fichier invalide.' });
        }

        if (!fs.existsSync(chemin)) {
            // Sur un hébergement au disque éphémère, le fichier disparaît à
            // chaque redéploiement alors que la ligne subsiste.
            return res.status(404).json({
                error: "Le fichier n'est plus présent sur le serveur.",
                remede: "Le redéposer, et vérifier qu'un disque persistant est bien attaché à l'hébergement."
            });
        }

        res.sendFile(chemin);
    } catch (error) {
        console.error('Erreur lecture du fichier de pièce :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture du fichier.' });
    }
};

/** DELETE /api/pieces/:id — retrait d'une pièce enregistrée par erreur. */
exports.supprimer = async (req, res) => {
    try {
        const piece = await prisma.pieceSalarie.findUnique({ where: { id: req.params.id } });
        if (!piece) return res.status(404).json({ error: 'Pièce introuvable.' });

        await prisma.pieceSalarie.delete({ where: { id: piece.id } });

        if (piece.filePath) {
            const chemin = path.join(__dirname, '..', 'uploads', piece.filePath);
            fs.unlink(chemin, () => { /* le fichier a pu disparaître avant nous */ });
        }

        res.json({ message: 'Pièce retirée du dossier.' });
    } catch (error) {
        console.error('Erreur suppression de pièce :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
};
