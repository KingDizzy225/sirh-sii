const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');
const pre = require('../lib/preAccueil');
const badges = require('../lib/badge');

/**
 * Pré-accueil : préparation par la RH, consultation et dépôt de pièces par le
 * futur salarié.
 */

const DOSSIER_DOCUMENTS = path.join(__dirname, '../uploads/documents');
const DOSSIER_PHOTOS = path.join(__dirname, '../uploads/badges');
const DEPOT = 'Pré-accueil';

const abandonner = (fichier) => { if (fichier?.path) fs.promises.unlink(fichier.path).catch(() => {}); };

/** Titres des pièces déjà déposées, pour cocher la liste sans renvoyer les fichiers. */
async function piecesDeposees(employeeId) {
    const docs = await prisma.employeeDocument.findMany({
        where: { employeeId, uploadedBy: DEPOT },
        select: { title: true }
    });
    return new Set(docs.map((d) => d.title));
}

exports.lister = async (req, res) => {
    try {
        const depuis = new Date();
        depuis.setUTCDate(depuis.getUTCDate() - pre.JOURS_APRES_EMBAUCHE);
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' }, hireDate: { gte: depuis } },
            orderBy: { hireDate: 'asc' },
            select: {
                id: true, firstName: true, lastName: true, positionTitle: true, department: true, phone: true, hireDate: true, managerId: true,
                preAccueil: true
            }
        });
        const lignes = [];
        for (const s of salaries) {
            const p = s.preAccueil;
            const deposees = p ? await piecesDeposees(s.id) : new Set();
            lignes.push({
                employeeId: s.id,
                nom: `${s.firstName} ${s.lastName}`,
                prenom: s.firstName,
                fonction: s.positionTitle,
                service: s.department,
                telephone: s.phone,
                dateArrivee: s.hireDate,
                joursAvant: pre.joursAvant(s.hireDate),
                responsableParDefaut: s.managerId,
                preAccueil: p ? {
                    lien: pre.lienDe(p.token),
                    etat: pre.etat(p, s),
                    responsableId: p.responsableId,
                    workSiteId: p.workSiteId,
                    heureArrivee: p.heureArrivee,
                    programme: p.programme,
                    motAccueil: p.motAccueil,
                    piecesAttendues: p.piecesAttendues,
                    piecesRecues: p.piecesAttendues.filter((c) => deposees.has(pre.titreDepot(c))),
                    ouvertLe: p.ouvertLe,
                    ouvertures: p.ouvertures
                } : null
            });
        }
        res.json({ pieces: pre.PIECES, lignes });
    } catch (erreur) {
        console.error('[PRÉ-ACCUEIL] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des arrivées impossible.' });
    }
};

exports.enregistrer = async (req, res) => {
    try {
        const salarie = await prisma.employee.findUnique({ where: { id: req.params.employeeId } });
        if (!salarie || salarie.status === 'TERMINATED') return res.status(404).json({ error: 'Salarié introuvable.' });

        const corps = req.body || {};
        const heure = String(corps.heureArrivee || '').trim();
        if (heure && !/^([01]\d|2[0-3]):[0-5]\d$/.test(heure)) return res.status(400).json({ error: "Heure d'arrivée attendue au format HH:MM." });

        for (const [cle, modele] of [['responsableId', 'employee'], ['workSiteId', 'workSite']]) {
            if (corps[cle] && !(await prisma[modele].findUnique({ where: { id: corps[cle] } }))) {
                return res.status(400).json({ error: cle === 'responsableId' ? 'Responsable introuvable.' : 'Site introuvable.' });
            }
        }

        const donnees = {
            responsableId: corps.responsableId || null,
            workSiteId: corps.workSiteId || null,
            heureArrivee: heure || null,
            programme: String(corps.programme || '').trim().slice(0, 4000) || null,
            motAccueil: String(corps.motAccueil || '').trim().slice(0, 1000) || null,
            piecesAttendues: pre.codesValides(corps.piecesAttendues)
        };
        const p = await prisma.preAccueil.upsert({
            where: { employeeId: salarie.id },
            create: { ...donnees, employeeId: salarie.id, token: pre.nouveauJeton(), creePar: req.user?.name || req.user?.email || null },
            update: donnees
        });
        res.json({ lien: pre.lienDe(p.token), message: 'Pré-accueil enregistré. Le lien reste le même après chaque modification.' });
    } catch (erreur) {
        console.error('[PRÉ-ACCUEIL] Enregistrement impossible :', erreur.message);
        res.status(500).json({ error: 'Enregistrement impossible.' });
    }
};

exports.supprimer = async (req, res) => {
    try {
        const { count } = await prisma.preAccueil.deleteMany({ where: { employeeId: req.params.employeeId } });
        if (count === 0) return res.status(404).json({ error: 'Aucun pré-accueil pour ce salarié.' });
        res.json({ message: 'Lien annulé. Un nouveau lien sera produit au prochain enregistrement.' });
    } catch (erreur) {
        console.error('[PRÉ-ACCUEIL] Suppression impossible :', erreur.message);
        res.status(500).json({ error: 'Annulation impossible.' });
    }
};

async function trouver(token) {
    if (!/^[a-f0-9]{64}$/.test(String(token || ''))) return null;
    return prisma.preAccueil.findUnique({
        where: { token },
        include: {
            employee: { select: { id: true, firstName: true, hireDate: true, status: true, positionTitle: true } },
            responsable: {
                select: {
                    id: true, firstName: true, lastName: true, positionTitle: true, status: true, exitDate: true,
                    badges: { where: { revoqueLe: null }, orderBy: { emisLe: 'desc' }, take: 1 }
                }
            },
            workSite: { select: { name: true, latitude: true, longitude: true } }
        }
    });
}

const MOTIF_CLOS = "Ce lien n'est plus actif. Pour toute question, contactez le service des ressources humaines.";

/** La photo du responsable n'est montrée que si son badge est valide et en porte une. */
const photoResponsable = (responsable) => {
    const badge = responsable?.badges?.[0];
    return badge?.photoPath && badges.etat(badge, responsable) === 'VALIDE' ? badge : null;
};

exports.accueil = async (req, res) => {
    try {
        const p = await trouver(req.params.token);
        const etat = pre.etat(p, p?.employee);
        if (etat !== 'OUVERT') return res.status(etat === 'INTROUVABLE' ? 404 : 410).json({ etat, motif: etat === 'INTROUVABLE' ? "Ce lien n'est pas valide." : MOTIF_CLOS });

        const deposees = await piecesDeposees(p.employee.id);
        await prisma.preAccueil.update({
            where: { id: p.id },
            data: { ouvertLe: p.ouvertLe || new Date(), ouvertures: { increment: 1 } }
        });

        res.set('Cache-Control', 'no-store');
        res.json({
            etat,
            organisation: require('../lib/identite').nom(),
            prenom: p.employee.firstName,
            fonction: p.employee.positionTitle || null,
            dateArrivee: p.employee.hireDate,
            joursAvant: pre.joursAvant(p.employee.hireDate),
            heureArrivee: p.heureArrivee,
            responsable: p.responsable && p.responsable.status !== 'TERMINATED' ? {
                prenom: p.responsable.firstName,
                nom: p.responsable.lastName,
                fonction: p.responsable.positionTitle || null,
                photo: Boolean(photoResponsable(p.responsable))
            } : null,
            site: p.workSite ? { nom: p.workSite.name, latitude: p.workSite.latitude, longitude: p.workSite.longitude } : null,
            programme: p.programme,
            motAccueil: p.motAccueil,
            pieces: p.piecesAttendues.map((code) => ({ code, libelle: pre.PIECES[code], recue: deposees.has(pre.titreDepot(code)) }))
        });
    } catch (erreur) {
        console.error('[PRÉ-ACCUEIL] Accueil indisponible :', erreur.message);
        res.status(500).json({ error: 'Page indisponible.' });
    }
};

exports.photoResponsable = async (req, res) => {
    try {
        const p = await trouver(req.params.token);
        if (pre.etat(p, p?.employee) !== 'OUVERT') return res.sendStatus(404);
        const badge = photoResponsable(p.responsable);
        if (!badge) return res.sendStatus(404);
        const chemin = path.join(DOSSIER_PHOTOS, path.basename(badge.photoPath));
        if (!fs.existsSync(chemin)) return res.sendStatus(404);
        res.set('Cache-Control', 'private, max-age=300');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.sendFile(chemin);
    } catch (erreur) {
        console.error('[PRÉ-ACCUEIL] Photo indisponible :', erreur.message);
        res.sendStatus(500);
    }
};

/**
 * Dépôt d'une pièce. Le fichier rejoint les documents du dossier ; il n'est
 * jamais renvoyé par ce lien, qui peut circuler.
 */
exports.deposer = async (req, res) => {
    const fichier = req.file;
    try {
        const p = await trouver(req.params.token);
        if (pre.etat(p, p?.employee) !== 'OUVERT') { abandonner(fichier); return res.status(410).json({ error: MOTIF_CLOS }); }
        const { code } = req.params;
        if (!p.piecesAttendues.includes(code)) { abandonner(fichier); return res.status(400).json({ error: "Cette pièce n'est pas demandée." }); }
        if (!fichier) return res.status(400).json({ error: 'Aucun fichier reçu.' });

        await prisma.employeeDocument.create({
            data: {
                employeeId: p.employee.id,
                title: pre.titreDepot(code),
                type: code === 'RIB' ? 'Paie' : code === 'DIPLOMES' ? 'Autre' : 'Identité',
                filePath: `/uploads/documents/${path.basename(fichier.path)}`,
                fileSize: fichier.size || 0,
                uploadedBy: DEPOT
            }
        });
        res.status(201).json({ message: `${pre.PIECES[code]} : reçu, merci !` });
    } catch (erreur) {
        abandonner(fichier);
        console.error('[PRÉ-ACCUEIL] Dépôt impossible :', erreur.message);
        res.status(500).json({ error: 'Dépôt impossible. Réessayez.' });
    }
};

exports.DOSSIER_DOCUMENTS = DOSSIER_DOCUMENTS;
