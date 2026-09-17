const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const prisma = require('../prismaClient');
const badges = require('../lib/badge');

/**
 * Badges numériques : émission et révocation par la RH, carte et vérification
 * publiques.
 */

const DOSSIER_PHOTOS = path.join(__dirname, '../uploads/badges');

const CHAMPS_SALARIE = {
    id: true, firstName: true, lastName: true, positionTitle: true, department: true,
    matricule: true, status: true, exitDate: true, phone: true
};

/** Supprime un fichier téléversé qu'on n'utilisera pas. */
const abandonner = (fichier) => {
    if (fichier?.path) fs.promises.unlink(fichier.path).catch(() => {});
};

exports.lister = async (req, res) => {
    try {
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
            select: {
                ...CHAMPS_SALARIE,
                badges: { orderBy: { emisLe: 'desc' }, take: 1 }
            }
        });
        const maintenant = new Date();
        res.json(salaries.map(({ badges: derniers, ...s }) => ({
            employeeId: s.id,
            nom: `${s.firstName} ${s.lastName}`,
            fonction: s.positionTitle,
            departement: s.department,
            telephone: s.phone,
            badge: badges.pourRh(derniers[0], s, maintenant)
        })));
    } catch (erreur) {
        console.error('[BADGES] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des badges impossible.' });
    }
};

/**
 * Émet un badge. Le précédent, s'il existe, est révoqué dans la même
 * transaction : deux cartes valides pour une même personne, c'est une carte
 * perdue qui continue de fonctionner.
 */
exports.emettre = async (req, res) => {
    const fichier = req.file;
    try {
        const salarie = await prisma.employee.findUnique({ where: { id: req.params.employeeId }, select: CHAMPS_SALARIE });
        if (!salarie) { abandonner(fichier); return res.status(404).json({ error: 'Salarié introuvable.' }); }
        if (salarie.status === 'TERMINATED' || (salarie.exitDate && new Date(salarie.exitDate) <= new Date())) {
            abandonner(fichier);
            return res.status(409).json({ error: "Ce salarié a quitté l'entreprise : aucun badge ne peut être émis." });
        }

        const auteur = req.user?.name || req.user?.email || null;
        const precedent = await prisma.badgeSalarie.findFirst({
            where: { employeeId: salarie.id, revoqueLe: null },
            orderBy: { emisLe: 'desc' }
        });
        // Sans nouvelle photo, on garde celle du badge remplacé.
        const photoPath = fichier ? path.basename(fichier.path) : (precedent?.photoPath || null);

        const [, badge] = await prisma.$transaction([
            prisma.badgeSalarie.updateMany({
                where: { employeeId: salarie.id, revoqueLe: null },
                data: { revoqueLe: new Date(), revoqueMotif: 'Remplacé par un nouveau badge.' }
            }),
            prisma.badgeSalarie.create({
                data: {
                    employeeId: salarie.id,
                    jetonPorteur: badges.nouveauJeton(),
                    jetonVerification: badges.nouveauJeton(),
                    photoPath,
                    emisPar: auteur,
                    expireLe: badges.echeance()
                }
            })
        ]);

        res.status(201).json({
            message: precedent ? 'Nouveau badge émis ; le précédent est annulé.' : 'Badge émis.',
            badge: badges.pourRh(badge, salarie)
        });
    } catch (erreur) {
        abandonner(fichier);
        console.error('[BADGES] Émission impossible :', erreur.message);
        res.status(500).json({ error: "Émission du badge impossible." });
    }
};

exports.revoquer = async (req, res) => {
    try {
        const motif = String(req.body?.motif || '').trim();
        if (motif.length < 5) return res.status(400).json({ error: "Indiquer le motif de l'annulation." });
        const badge = await prisma.badgeSalarie.findUnique({ where: { id: req.params.id } });
        if (!badge) return res.status(404).json({ error: 'Badge introuvable.' });
        if (badge.revoqueLe) return res.status(409).json({ error: 'Ce badge est déjà annulé.' });
        await prisma.badgeSalarie.update({ where: { id: badge.id }, data: { revoqueLe: new Date(), revoqueMotif: motif } });
        res.json({ message: 'Badge annulé : il ne se vérifie plus.' });
    } catch (erreur) {
        console.error('[BADGES] Révocation impossible :', erreur.message);
        res.status(500).json({ error: 'Annulation du badge impossible.' });
    }
};

const jetonValide = (jeton) => /^[a-f0-9]{48}$/.test(String(jeton || ''));

/** La carte, pour son porteur. */
exports.carte = async (req, res) => {
    try {
        const { jeton } = req.params;
        if (!jetonValide(jeton)) return res.status(404).json({ valide: false, motif: badges.MOTIFS_PORTEUR.INTROUVABLE });
        const badge = await prisma.badgeSalarie.findUnique({ where: { jetonPorteur: jeton }, include: { employee: { select: CHAMPS_SALARIE } } });
        const vue = badges.pourPorteur(badge, badge?.employee);
        if (!vue.valide) return res.status(vue.etat === 'INTROUVABLE' ? 404 : 410).json(vue);

        const qr = await QRCode.toDataURL(vue.lienVerification, { margin: 1, width: 320, errorCorrectionLevel: 'M' });
        res.set('Cache-Control', 'no-store');
        res.json({ ...vue, qr });
    } catch (erreur) {
        console.error('[BADGES] Carte indisponible :', erreur.message);
        res.status(500).json({ error: 'Carte indisponible.' });
    }
};

/** Vérification par un tiers qui scanne le QR. */
exports.verifier = async (req, res) => {
    try {
        const { jeton } = req.params;
        if (!jetonValide(jeton)) return res.status(404).json(badges.pourVerificateur(null, null));
        const badge = await prisma.badgeSalarie.findUnique({ where: { jetonVerification: jeton }, include: { employee: { select: CHAMPS_SALARIE } } });
        const vue = badges.pourVerificateur(badge, badge?.employee);
        if (badge) {
            prisma.badgeSalarie.update({
                where: { id: badge.id },
                data: { verifications: { increment: 1 }, derniereVerification: new Date() }
            }).catch((e) => console.error('[BADGES] Trace de vérification :', e.message));
        }
        res.set('Cache-Control', 'no-store');
        res.status(badge ? 200 : 404).json(vue);
    } catch (erreur) {
        console.error('[BADGES] Vérification impossible :', erreur.message);
        res.status(500).json({ error: 'Vérification indisponible.' });
    }
};

/**
 * Photo du badge. Servie seulement tant que le badge est valide : la photo
 * d'un ancien salarié n'a plus à circuler.
 */
exports.photo = async (req, res) => {
    try {
        const { jeton } = req.params;
        if (!jetonValide(jeton)) return res.sendStatus(404);
        const badge = await prisma.badgeSalarie.findFirst({
            where: { OR: [{ jetonPorteur: jeton }, { jetonVerification: jeton }] },
            include: { employee: { select: CHAMPS_SALARIE } }
        });
        if (!badge?.photoPath || badges.etat(badge, badge.employee) !== 'VALIDE') return res.sendStatus(404);

        const chemin = path.join(DOSSIER_PHOTOS, path.basename(badge.photoPath));
        if (!fs.existsSync(chemin)) return res.sendStatus(404);
        res.set('Cache-Control', 'private, max-age=300');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.sendFile(chemin);
    } catch (erreur) {
        console.error('[BADGES] Photo indisponible :', erreur.message);
        res.sendStatus(500);
    }
};

exports.DOSSIER_PHOTOS = DOSSIER_PHOTOS;
