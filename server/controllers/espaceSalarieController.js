const prisma = require('../prismaClient');
const badges = require('../lib/badge');
const pointage = require('../lib/pointageEcran');
const remplacement = require('../lib/remplacement');
const presence = require('../lib/presence');
const { notifierSalarie, notifierRH } = require('../lib/notify');
const espacePersonnel = require('../lib/espacePersonnel');
const attestation = require('../lib/attestation');
const apposition = require('../lib/apposition');
const PDFDocument = require('pdfkit');

/**
 * Ce que le salarié fait depuis son téléphone, reconnu par son badge.
 *
 * Les salariés n'ont pas de compte. Le badge numérique, ouvert sur leur
 * téléphone, est ce qui les identifie : un jeton aléatoire que la RH leur a
 * remis, qui s'éteint à leur départ. Pointer sur l'écran d'agence et proposer
 * ou reprendre un créneau passent par lui.
 */

const JOURS_ESPACE = parseInt(process.env.ESPACE_JOURS_CRENEAUX, 10) || 14;

async function porteur(jeton) {
    if (!/^[a-f0-9]{48}$/.test(String(jeton || ''))) return null;
    const badge = await prisma.badgeSalarie.findUnique({
        where: { jetonPorteur: jeton },
        include: {
            employee: {
                select: { id: true, firstName: true, lastName: true, department: true, status: true, exitDate: true }
            }
        }
    });
    if (!badge || badges.etat(badge, badge.employee) !== 'VALIDE') return null;
    return badge.employee;
}

const refuserBadge = (res) => res.status(403).json({
    error: "Votre badge n'est pas valide sur ce téléphone. Rouvrez le lien de votre badge, ou demandez-en un nouveau à la RH."
});

const libelleCreneau = (shift) =>
    `${new Date(shift.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })} ` +
    `de ${shift.startTime} à ${shift.endTime}`;

// ── Pointage sur l'écran d'agence ─────────────────────────────────────────

exports.pointer = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const { ecran: ecranId, code } = req.body || {};
        const ecran = ecranId && /^[0-9a-f-]{36}$/.test(String(ecranId))
            ? await prisma.ecranAgence.findUnique({ where: { id: ecranId }, include: { workSite: true } })
            : null;
        if (!ecran || ecran.revoqueLe || !ecran.pointageActif || !ecran.workSite) {
            return res.status(404).json({ error: "Cet écran ne permet pas de pointer." });
        }

        const maintenant = new Date();
        const fenetre = pointage.verifier(ecran.secretPointage, code, maintenant);
        if (fenetre === null) {
            return res.status(410).json({ error: 'Code expiré. Scannez à nouveau le QR affiché sur l\'écran.' });
        }

        const dernier = await prisma.timeLog.findFirst({
            where: { employeeId: salarie.id, timestamp: { gte: presence.debutDuJour(maintenant) } },
            orderBy: { timestamp: 'desc' }
        });
        const { type, doublon } = pointage.typeSuivant(dernier, maintenant);
        if (doublon) {
            return res.json({
                enregistre: false,
                type: dernier.type,
                heure: dernier.timestamp,
                site: ecran.workSite.name,
                message: `Déjà pointé à ${new Date(dernier.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}.`
            });
        }

        const position = pointage.perimetre(ecran.workSite, req.body);
        let journal;
        try {
            journal = await prisma.timeLog.create({
                data: {
                    employeeId: salarie.id,
                    type,
                    timestamp: maintenant,
                    workSiteId: ecran.workSite.id,
                    // Un même code scanné deux fois ne compte qu'une.
                    clientRef: `ecran:${ecran.id}:${salarie.id}:${fenetre}`,
                    ...position
                }
            });
        } catch (erreur) {
            if (erreur.code === 'P2002') {
                return res.json({ enregistre: false, type, site: ecran.workSite.name, message: 'Pointage déjà enregistré.' });
            }
            throw erreur;
        }

        res.status(201).json({
            enregistre: true,
            type,
            heure: journal.timestamp,
            site: ecran.workSite.name,
            prenom: salarie.firstName,
            horsPerimetre: journal.withinPerimeter === false,
            message: type === 'CLOCK_IN' ? `Bonne journée, ${salarie.firstName} !` : `Bonne fin de journée, ${salarie.firstName} !`
        });
    } catch (erreur) {
        console.error('[POINTAGE ÉCRAN] Échec :', erreur.message);
        res.status(500).json({ error: 'Pointage impossible. Réessayez.' });
    }
};

// ── Créneaux et remplacements ─────────────────────────────────────────────

const vueDemande = (d, reference) => ({
    id: d.id,
    etat: remplacement.etat(d, reference),
    creneau: d.shift ? { id: d.shift.id, date: d.shift.date, debut: d.shift.startTime, fin: d.shift.endTime, libelle: libelleCreneau(d.shift) } : null,
    demandeur: d.demandeur ? d.demandeur.firstName : null,
    remplacant: d.remplacant ? d.remplacant.firstName : null,
    motif: d.motif,
    motifRefus: d.motifRefus
});

exports.espace = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const maintenant = new Date();
        const debut = presence.debutDuJour(maintenant);
        const fin = new Date(debut);
        fin.setUTCDate(fin.getUTCDate() + JOURS_ESPACE);

        const [creneaux, aReprendre, mesReprises] = await Promise.all([
            prisma.shiftSchedule.findMany({
                where: { employeeId: salarie.id, date: { gte: debut, lt: fin } },
                orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
                include: {
                    remplacements: { where: { statut: { in: ['OUVERTE', 'ACCEPTEE', 'REFUSEE'] } }, orderBy: { creeLe: 'desc' }, take: 1,
                        include: { remplacant: { select: { firstName: true } } } }
                }
            }),
            prisma.demandeRemplacement.findMany({
                where: {
                    statut: 'OUVERTE',
                    demandeurId: { not: salarie.id },
                    demandeur: { department: salarie.department, status: { not: 'TERMINATED' } },
                    shift: { date: { gte: debut, lt: fin } }
                },
                orderBy: { creeLe: 'asc' },
                include: { shift: true, demandeur: { select: { firstName: true } } }
            }),
            prisma.demandeRemplacement.findMany({
                where: { remplacantId: salarie.id, statut: { in: ['ACCEPTEE', 'VALIDEE'] }, shift: { date: { gte: debut } } },
                include: { shift: true, demandeur: { select: { firstName: true } } }
            })
        ]);

        const joursOccupes = new Set(creneaux.map((c) => new Date(c.date).toISOString().slice(0, 10)));

        res.set('Cache-Control', 'no-store');
        res.json({
            prenom: salarie.firstName,
            creneaux: creneaux
                .filter((c) => remplacement.debutCreneau(c) > maintenant)
                .map((c) => {
                    const demande = c.remplacements[0];
                    return {
                        id: c.id,
                        date: c.date,
                        debut: c.startTime,
                        fin: c.endTime,
                        libelle: libelleCreneau(c),
                        demande: demande ? { ...vueDemande({ ...demande, shift: c }, maintenant), remplacant: demande.remplacant?.firstName || null } : null
                    };
                }),
            aReprendre: aReprendre
                .filter((d) => remplacement.etat(d, maintenant) === 'OUVERTE')
                .map((d) => ({ ...vueDemande(d, maintenant), dejaOccupe: joursOccupes.has(new Date(d.shift.date).toISOString().slice(0, 10)) })),
            mesReprises: mesReprises.map((d) => vueDemande(d, maintenant))
        });
    } catch (erreur) {
        console.error('[ESPACE] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Vos créneaux sont indisponibles.' });
    }
};

exports.proposer = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const shiftId = String(req.body?.shiftId || '');
        const shift = /^[0-9a-f-]{36}$/.test(shiftId) ? await prisma.shiftSchedule.findUnique({ where: { id: shiftId } }) : null;
        const demandesEnCours = shift
            ? await prisma.demandeRemplacement.count({ where: { shiftId: shift.id, statut: { in: remplacement.STATUTS_EN_COURS } } })
            : 0;
        const refus = remplacement.refusProposition({ shift, demandeurId: salarie.id, demandesEnCours });
        if (refus) return res.status(409).json({ error: refus });

        const motif = String(req.body?.motif || '').trim().slice(0, 300) || null;
        const demande = await prisma.demandeRemplacement.create({
            data: { shiftId: shift.id, demandeurId: salarie.id, motif }
        });
        res.status(201).json({
            id: demande.id,
            message: "Créneau proposé à vos collègues du service. Tant qu'un responsable n'a pas validé un remplaçant, le créneau reste le vôtre."
        });
    } catch (erreur) {
        console.error('[REMPLACEMENT] Proposition impossible :', erreur.message);
        res.status(500).json({ error: 'Proposition impossible.' });
    }
};

exports.annuler = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);
        const demande = await prisma.demandeRemplacement.findUnique({ where: { id: req.params.id } });
        if (!demande || demande.demandeurId !== salarie.id) return res.status(404).json({ error: 'Demande introuvable.' });
        if (!remplacement.STATUTS_EN_COURS.includes(demande.statut)) return res.status(409).json({ error: 'Cette demande est déjà close.' });

        await prisma.demandeRemplacement.update({ where: { id: demande.id }, data: { statut: 'ANNULEE', decideeLe: new Date() } });
        if (demande.remplacantId) {
            await notifierSalarie({
                employeeId: demande.remplacantId,
                titre: 'Remplacement annulé',
                message: 'Le collègue dont vous deviez reprendre le créneau a retiré sa demande : le créneau reste le sien.'
            }).catch(() => {});
        }
        res.json({ message: 'Demande retirée : le créneau reste le vôtre.' });
    } catch (erreur) {
        console.error('[REMPLACEMENT] Annulation impossible :', erreur.message);
        res.status(500).json({ error: 'Annulation impossible.' });
    }
};

exports.reprendre = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const demande = await prisma.demandeRemplacement.findUnique({
            where: { id: req.params.id },
            include: { shift: true, demandeur: { select: { id: true, firstName: true, lastName: true, department: true } } }
        });
        const creneauxDuJour = demande
            ? await prisma.shiftSchedule.findMany({ where: { employeeId: salarie.id, date: demande.shift.date } })
            : [];
        const refus = remplacement.refusReprise({ demande, remplacant: salarie, creneauxDuJour });
        if (refus) return res.status(409).json({ error: refus });

        // Le premier qui accepte l'emporte : la mise à jour ne vaut que si la
        // demande est encore ouverte à l'instant de l'écriture.
        const { count } = await prisma.demandeRemplacement.updateMany({
            where: { id: demande.id, statut: 'OUVERTE' },
            data: { statut: 'ACCEPTEE', remplacantId: salarie.id, accepteeLe: new Date() }
        });
        if (count === 0) return res.status(409).json({ error: 'Un collègue a repris ce créneau juste avant vous.' });

        const libelle = libelleCreneau(demande.shift);
        await notifierRH(
            `${salarie.firstName} ${salarie.lastName} propose de remplacer ${demande.demandeur.firstName} ${demande.demandeur.lastName} ` +
            `le ${libelle}. À valider.`,
            'Info', '/remplacements', 'Remplacement à valider'
        ).catch((e) => console.error('[REMPLACEMENT] Notification RH :', e.message));

        res.json({ message: `Merci ${salarie.firstName} ! Un responsable doit encore valider : le créneau du ${libelle} ne vous est pas acquis avant.` });
    } catch (erreur) {
        console.error('[REMPLACEMENT] Reprise impossible :', erreur.message);
        res.status(500).json({ error: 'Reprise impossible.' });
    }
};

// ── Ce que le salarié voit de son propre dossier ──────────────────────────

/**
 * Droits acquis, bulletins expliqués, échéances et astreintes.
 *
 * Un seul appel plutôt que quatre : le badge s'ouvre sur un téléphone, souvent
 * en 3G, et quatre allers-retours pour une page se paient en secondes.
 */
exports.monDossier = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const [droits, bulletins, echeances, astreintes] = await Promise.all([
            espacePersonnel.droits(salarie.id),
            espacePersonnel.bulletins(salarie.id, req.query.bulletins),
            espacePersonnel.echeances(salarie.id),
            espacePersonnel.astreintes(salarie.id)
        ]);

        res.set('Cache-Control', 'no-store');
        res.json({
            prenom: salarie.firstName,
            droits,
            bulletins,
            echeances,
            astreintes,
            attestations: Object.entries(attestation.TYPES).map(([code, t]) => ({ code, libelle: t.libelle }))
        });
    } catch (erreur) {
        console.error('[ESPACE] Dossier indisponible :', erreur.message);
        res.status(500).json({ error: 'Votre dossier est momentanément indisponible.' });
    }
};

/**
 * Attestation émise par le salarié lui-même.
 *
 * Elle était une demande adressée aux ressources humaines, traitée à la main,
 * pour un document que l'application sait produire, signer et sceller seule.
 * Le registre garde qui l'a émise : ici, l'intéressé depuis son badge.
 */
exports.attestation = async (req, res) => {
    try {
        const salarie = await porteur(req.params.jeton);
        if (!salarie) return refuserBadge(res);

        const type = String(req.params.type || 'TRAVAIL').toUpperCase() === 'SALAIRE' ? 'SALAIRE' : 'TRAVAIL';
        const employe = await prisma.employee.findUnique({ where: { id: salarie.id } });

        const registre = await attestation.enregistrer(employe, type, 'PORTAIL_SALARIE');
        const signataire = await apposition.choisirSignataire();
        const salaire = type === 'SALAIRE' ? await attestation.elementsSalaire(employe.id) : null;

        const pdfDoc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename=Attestation_${type.toLowerCase()}_${employe.lastName}.pdf`);
        pdfDoc.pipe(res);

        await attestation.composer(pdfDoc, { employe, type, signataire, registre, salaire });
        pdfDoc.end();
    } catch (erreur) {
        console.error('[ESPACE] Attestation impossible :', erreur.message);
        if (!res.headersSent) res.status(500).json({ error: "L'attestation n'a pas pu être produite." });
    }
};

exports._interne = { porteur, libelleCreneau };
