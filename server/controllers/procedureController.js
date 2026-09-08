const prisma = require('../prismaClient');
const { MODELES, TYPES } = require('../data/proceduresRupture');
const courriers = require('../lib/courriers');
const apposition = require('../lib/apposition');

/**
 * Procédures disciplinaires et de rupture.
 *
 * L'application enregistrait la décision — `DisciplinaryRecord`, une date, un
 * type, un motif — et rien de la procédure qui la rend opposable. Or ce n'est
 * pas le motif qui fait perdre les litiges, c'est la forme : une convocation
 * dont on ne peut prouver la remise, un entretien tenu le jour même, une lettre
 * de notification sans motif.
 *
 * Ce contrôleur ne dit pas le droit. Il tient le chemin : l'ordre des étapes,
 * le délai qui les sépare, la date de chacune et sa preuve — et il refuse de
 * franchir une étape avant le délai que l'entreprise s'est donné.
 */

const JOUR = 24 * 3600 * 1000;

/** Modèles disponibles, pour l'écran d'ouverture. */
exports.getModeles = (req, res) => {
    res.json(TYPES.map((type) => ({
        type,
        libelle: MODELES[type].libelle,
        avertissement: MODELES[type].avertissement,
        etapes: MODELES[type].etapes.map((e, i) => ({
            ordre: i + 1, code: e.code, libelle: e.libelle,
            obligatoire: e.obligatoire, delaiMinJours: e.delaiMinJours
        }))
    })));
};

/**
 * Date à partir de laquelle une étape peut être franchie.
 * Comptée depuis l'étape précédente réellement faite ; à défaut, depuis
 * l'ouverture de la procédure.
 */
function exigibleLe(etape, precedente, procedure) {
    const depart = precedente?.faiteLe || procedure.ouverteLe;
    return new Date(new Date(depart).getTime() + (etape.delaiMinJours || 0) * JOUR);
}

/** Vue d'une procédure enrichie de ce que la RH doit voir : où elle en est. */
function decrire(procedure) {
    const etapes = [...procedure.etapes].sort((a, b) => a.ordre - b.ordre);
    let precedente = null;
    const detail = etapes.map((e) => {
        const exigible = exigibleLe(e, precedente, procedure);
        const depart = precedente?.faiteLe || procedure.ouverteLe;
        const limite = e.delaiMaxJours != null
            ? new Date(new Date(depart).getTime() + e.delaiMaxJours * JOUR)
            : null;

        const vue = {
            id: e.id, ordre: e.ordre, code: e.code, libelle: e.libelle,
            attendu: e.attendu, obligatoire: e.obligatoire,
            delaiMinJours: e.delaiMinJours, motifDelai: e.motifDelai,
            faiteLe: e.faiteLe, faitePar: e.faitePar, note: e.note, preuve: e.preuve,
            exigibleLe: e.faiteLe ? null : exigible,
            franchissable: Boolean(e.faiteLe) || new Date() >= exigible,
            limiteLe: e.faiteLe ? null : limite,
            enRetard: !e.faiteLe && limite != null && new Date() > limite
        };
        if (e.faiteLe) precedente = e;
        return vue;
    });

    const prochaine = detail.find((e) => !e.faiteLe) || null;

    return {
        id: procedure.id,
        type: procedure.type,
        libelle: MODELES[procedure.type]?.libelle || procedure.type,
        avertissement: MODELES[procedure.type]?.avertissement || null,
        motif: procedure.motif,
        statut: procedure.statut,
        issue: procedure.issue,
        ouvertePar: procedure.ouvertePar,
        ouverteLe: procedure.ouverteLe,
        clotureeLe: procedure.clotureeLe,
        salarie: procedure.employee ? {
            id: procedure.employee.id,
            nom: `${procedure.employee.lastName} ${procedure.employee.firstName}`.trim(),
            poste: procedure.employee.positionTitle,
            departement: procedure.employee.department
        } : null,
        etapes: detail,
        prochaine,
        // Une procédure ouverte dont toutes les étapes obligatoires sont faites
        // attend une clôture explicite : c'est la RH qui consigne l'issue.
        acheveeMaisOuverte: procedure.statut === 'EN_COURS' &&
            detail.filter((e) => e.obligatoire).every((e) => e.faiteLe),
        enRetard: detail.some((e) => e.enRetard)
    };
}

/**
 * Vue d'une procédure, exportée pour le balayage quotidien des échéances.
 * Une seule définition du retard : deux calculs finiraient par diverger, et
 * l'écran cesserait de dire la même chose que l'alerte.
 */
exports.decrire = decrire;

const inclusion = {
    etapes: true,
    employee: { select: { id: true, firstName: true, lastName: true, positionTitle: true, department: true } }
};

/** Ouvre une procédure à partir de son modèle. */
exports.ouvrir = async (req, res) => {
    try {
        const { employeeId, type, motif } = req.body;

        if (!TYPES.includes(type)) {
            return res.status(400).json({ error: `Type de procédure inconnu : ${type}.` });
        }
        if (!employeeId) return res.status(400).json({ error: 'Salarié requis.' });
        if (!motif || String(motif).trim().length < 10) {
            // Un motif vide ou expédié se retourne contre l'employeur : c'est
            // lui qui devra être repris dans la lettre de notification.
            return res.status(400).json({
                error: "Le motif doit être énoncé : il sera repris dans la notification écrite."
            });
        }

        const salarie = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const ouverte = await prisma.procedure.findFirst({
            where: { employeeId, statut: 'EN_COURS' }
        });
        if (ouverte) {
            // Deux procédures parallèles sur un même salarié rendent la
            // chronologie illisible, et c'est la chronologie qui se conteste.
            return res.status(409).json({
                error: 'Une procédure est déjà ouverte pour ce salarié.',
                procedureId: ouverte.id
            });
        }

        const modele = MODELES[type];
        const procedure = await prisma.procedure.create({
            data: {
                employeeId,
                type,
                motif: String(motif).trim(),
                ouvertePar: (req.user && (req.user.email || req.user.name)) || 'inconnu',
                etapes: {
                    create: modele.etapes.map((e, i) => ({
                        ordre: i + 1,
                        code: e.code,
                        libelle: e.libelle,
                        attendu: e.attendu,
                        obligatoire: e.obligatoire !== false,
                        delaiMinJours: e.delaiMinJours || 0,
                        delaiMaxJours: e.delaiMaxJours ?? null,
                        motifDelai: e.motifDelai || null
                    }))
                }
            },
            include: inclusion
        });

        res.status(201).json(decrire(procedure));
    } catch (error) {
        console.error('Erreur ouverture de procédure :', error);
        res.status(500).json({ error: "Erreur lors de l'ouverture de la procédure." });
    }
};

/** Liste des procédures, la plus récente d'abord. */
exports.lister = async (req, res) => {
    try {
        const where = {};
        if (req.query.statut) where.statut = String(req.query.statut);
        if (req.query.employeeId) where.employeeId = String(req.query.employeeId);

        const procedures = await prisma.procedure.findMany({
            where, include: inclusion, orderBy: { ouverteLe: 'desc' }
        });
        res.json(procedures.map(decrire));
    } catch (error) {
        console.error('Erreur lecture des procédures :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des procédures.' });
    }
};

exports.detail = async (req, res) => {
    try {
        const procedure = await prisma.procedure.findUnique({
            where: { id: req.params.id }, include: inclusion
        });
        if (!procedure) return res.status(404).json({ error: 'Procédure introuvable.' });
        res.json(decrire(procedure));
    } catch (error) {
        console.error('Erreur lecture de procédure :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture de la procédure.' });
    }
};

/**
 * Consigne une étape comme faite.
 *
 * C'est ici que se joue l'essentiel : l'étape est refusée si la précédente
 * n'est pas faite, ou si le délai qui l'en sépare n'est pas écoulé. Tenir un
 * entretien le jour de la convocation est le vice de forme le plus courant, et
 * l'enregistrer sans rien dire reviendrait à en garder la trace contre soi.
 */
exports.franchir = async (req, res) => {
    try {
        const { id, etapeId } = req.params;
        const { note, preuve, faiteLe } = req.body;

        const procedure = await prisma.procedure.findUnique({
            where: { id }, include: inclusion
        });
        if (!procedure) return res.status(404).json({ error: 'Procédure introuvable.' });
        if (procedure.statut !== 'EN_COURS') {
            return res.status(409).json({ error: 'Cette procédure est close.' });
        }

        const etapes = [...procedure.etapes].sort((a, b) => a.ordre - b.ordre);
        const etape = etapes.find((e) => e.id === etapeId);
        if (!etape) return res.status(404).json({ error: 'Étape introuvable.' });
        if (etape.faiteLe) return res.status(409).json({ error: 'Cette étape est déjà consignée.' });

        const precedentes = etapes.filter((e) => e.ordre < etape.ordre);
        const manquante = precedentes.find((e) => e.obligatoire && !e.faiteLe);
        if (manquante) {
            return res.status(409).json({
                error: `L'étape « ${manquante.libelle} » n'est pas encore consignée.`,
                etapeManquante: manquante.id
            });
        }

        const derniereFaite = [...precedentes].reverse().find((e) => e.faiteLe) || null;
        const quand = faiteLe ? new Date(faiteLe) : new Date();

        if (isNaN(quand.getTime())) return res.status(400).json({ error: 'Date invalide.' });
        if (quand > new Date()) {
            return res.status(400).json({ error: "Une étape ne peut pas être consignée à une date future." });
        }

        /**
         * Le délai se compte d'une étape à l'autre, jamais depuis la création de
         * la fiche. Le comparer à l'ouverture de la procédure interdisait de
         * consigner une convocation remise avant-hier dans une procédure
         * ouverte aujourd'hui — alors que documenter après coup une procédure
         * déjà engagée est l'usage courant, et le seul moyen de rattraper un
         * dossier tenu sur papier.
         *
         * Tant qu'aucune étape n'est faite, il n'y a rien à mesurer : seule
         * s'applique l'interdiction d'une date future.
         */
        if (derniereFaite) {
            const exigible = exigibleLe(etape, derniereFaite, procedure);
            if (quand < exigible) {
                const avant = quand < new Date(derniereFaite.faiteLe);
                return res.status(409).json({
                    error: avant
                        ? `Cette étape est antérieure à « ${derniereFaite.libelle} », consignée le ` +
                          `${new Date(derniereFaite.faiteLe).toLocaleDateString('fr-FR')}.`
                        : `Délai non écoulé : cette étape ne peut être consignée qu'à partir du ` +
                          `${exigible.toLocaleDateString('fr-FR')}.`,
                    motif: etape.motifDelai || null,
                    exigibleLe: exigible
                });
            }
        }

        await prisma.procedureEtape.update({
            where: { id: etapeId },
            data: {
                faiteLe: quand,
                faitePar: (req.user && (req.user.email || req.user.name)) || 'inconnu',
                note: note || null,
                preuve: preuve || null
            }
        });

        const majour = await prisma.procedure.findUnique({ where: { id }, include: inclusion });
        res.json(decrire(majour));
    } catch (error) {
        console.error('Erreur consignation d\'étape :', error);
        res.status(500).json({ error: "Erreur lors de la consignation de l'étape." });
    }
};

/** Clôt une procédure en consignant son issue. */
exports.cloturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { issue, abandon } = req.body;

        const procedure = await prisma.procedure.findUnique({ where: { id }, include: inclusion });
        if (!procedure) return res.status(404).json({ error: 'Procédure introuvable.' });
        if (procedure.statut !== 'EN_COURS') {
            return res.status(409).json({ error: 'Cette procédure est déjà close.' });
        }
        if (!issue || String(issue).trim().length < 3) {
            return res.status(400).json({ error: "L'issue doit être consignée." });
        }

        // Abandonner une procédure est une décision légitime — les faits ne
        // sont pas établis, le salarié s'est expliqué. Elle se consigne comme
        // telle, sans exiger les étapes restantes.
        if (!abandon) {
            const restantes = procedure.etapes.filter((e) => e.obligatoire && !e.faiteLe);
            if (restantes.length > 0) {
                return res.status(409).json({
                    error: `${restantes.length} étape(s) obligatoire(s) ne sont pas consignées.`,
                    etapes: restantes.map((e) => e.libelle),
                    remede: "Les consigner, ou clôturer la procédure comme abandonnée."
                });
            }
        }

        const close = await prisma.procedure.update({
            where: { id },
            data: {
                statut: abandon ? 'ABANDONNEE' : 'CLOTUREE',
                issue: String(issue).trim(),
                clotureeLe: new Date(),
                clotureePar: (req.user && (req.user.email || req.user.name)) || 'inconnu'
            },
            include: inclusion
        });

        // La décision rejoint le dossier disciplinaire, où elle sera opposable.
        if (!abandon && ['SANCTION', 'LICENCIEMENT'].includes(close.type)) {
            await prisma.disciplinaryRecord.create({
                data: {
                    employeeId: close.employeeId,
                    date: new Date(),
                    type: close.type === 'SANCTION' ? 'Sanction' : 'Licenciement',
                    reason: close.motif,
                    sanction: close.issue,
                    createdBy: (req.user && (req.user.email || req.user.name)) || 'inconnu'
                }
            }).catch((e) => console.error('Report au dossier disciplinaire :', e.message));
        }

        res.json(decrire(close));
    } catch (error) {
        console.error('Erreur clôture de procédure :', error);
        res.status(500).json({ error: 'Erreur lors de la clôture.' });
    }
};

// ----------------------------------------------------
// Courriers
// ----------------------------------------------------

/** Courriers que cette procédure permet de produire. */
exports.getCourriers = async (req, res) => {
    try {
        const procedure = await prisma.procedure.findUnique({
            where: { id: req.params.id }, include: inclusion
        });
        if (!procedure) return res.status(404).json({ error: 'Procédure introuvable.' });

        const disponibles = courriers.courriersDisponibles(procedure.type);
        const etapes = [...procedure.etapes].sort((a, b) => a.ordre - b.ordre);

        res.json(disponibles.map((c) => {
            const etape = etapes.find((e) => e.code === c.code);
            return {
                ...c,
                etapeId: etape ? etape.id : null,
                etapeLibelle: etape ? etape.libelle : null,
                dejaConsignee: Boolean(etape && etape.faiteLe)
            };
        }));
    } catch (error) {
        console.error('Erreur liste des courriers :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des courriers.' });
    }
};

/**
 * Produit le courrier d'une étape, en PDF.
 *
 * Le motif est repris du dossier sans modification : c'est ce même texte qui
 * devra être défendu s'il est contesté, et une lettre qui s'en écarterait
 * fragiliserait la procédure qu'elle est censée servir.
 */
exports.telechargerCourrier = async (req, res) => {
    try {
        const { id, code } = req.params;

        const procedure = await prisma.procedure.findUnique({
            where: { id }, include: inclusion
        });
        if (!procedure) return res.status(404).json({ error: 'Procédure introuvable.' });

        const vue = decrire(procedure);
        const etapes = vue.etapes;
        const etape = etapes.find((e) => e.code === code);

        // Dates utiles au corps de la lettre, tirées du dossier plutôt que
        // saisies à nouveau : une date recopiée à la main finit par différer.
        const convocation = etapes.find((e) => e.code === 'CONVOCATION');
        const entretien = etapes.find((e) => e.code === 'ENTRETIEN');
        const explication = etapes.find((e) => e.code === 'EXPLICATION');
        const reponse = etapes.find((e) => e.code === 'REPONSE');

        // Signataire habilité : le courrier part signé, au lieu d'être imprimé,
        // signé à la main puis rescanné.
        const habilite = await apposition.choisirSignataire(req.query.signataireId);

        const contexte = {
            signataire: habilite ? {
                nom: habilite.nom,
                fonction: habilite.fonction,
                image: apposition.imageDepuisDataUrl(habilite.signatureImage),
                cachet: apposition.imageDepuisDataUrl(habilite.cachetImage)
            } : null,
            motif: procedure.motif,
            sanction: procedure.issue,
            salarie: vue.salarie,
            lieu: process.env.ORGANISATION_VILLE || 'Abidjan',
            entretienPossibleLe: entretien
                ? (entretien.faiteLe || entretien.exigibleLe)
                : null,
            dateEntretien: entretien ? entretien.faiteLe : null,
            reponseAttendueLe: reponse ? (reponse.faiteLe || reponse.exigibleLe) : null,
            dateConvocation: convocation ? convocation.faiteLe : null
        };

        const produit = courriers.genererCourrier(procedure.type, code, contexte);
        if (!produit) {
            return res.status(404).json({
                error: "Cette étape ne donne pas lieu à un courrier.",
                disponibles: courriers.courriersDisponibles(procedure.type).map((c) => c.code)
            });
        }

        const nom = `${code.toLowerCase()}_${(vue.salarie?.nom || 'salarie').replace(/\s+/g, '_')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${nom}`);
        produit.doc.pipe(res);
        produit.doc.end();
    } catch (error) {
        console.error('Erreur génération de courrier :', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors de la génération du courrier.' });
        }
    }
};
