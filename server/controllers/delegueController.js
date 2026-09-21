const prisma = require('../prismaClient');
const delegues = require('../lib/delegues');

/**
 * Délégués du personnel : scrutins, mandats, réunions.
 */

const COLLEGES = ['UNIQUE', 'CADRES', 'AGENTS', 'OUVRIERS'];
const QUALITES = ['TITULAIRE', 'SUPPLEANT'];

exports.situation = async (req, res) => {
    try {
        res.json(await delegues.situation());
    } catch (erreur) {
        console.error('[DÉLÉGUÉS] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Situation des délégués indisponible.' });
    }
};

/**
 * Enregistre un scrutin et les mandats qui en sortent.
 *
 * Les deux vont ensemble : un scrutin sans élus ne prouve rien, et un mandat
 * sans scrutin ne se justifie pas devant l'inspection.
 */
exports.enregistrerScrutin = async (req, res) => {
    try {
        const date = new Date(req.body?.date);
        const inscrits = Number(req.body?.inscrits);
        const votants = Number(req.body?.votants);
        const college = COLLEGES.includes(req.body?.college) ? req.body.college : 'UNIQUE';
        const tour = Number(req.body?.tour) === 2 ? 2 : 1;
        const elus = Array.isArray(req.body?.elus) ? req.body.elus : [];

        if (isNaN(date.getTime())) return res.status(400).json({ error: 'Date du scrutin invalide.' });
        if (!Number.isFinite(inscrits) || inscrits <= 0) return res.status(400).json({ error: "Indiquer le nombre d'inscrits." });
        if (!Number.isFinite(votants) || votants < 0 || votants > inscrits) {
            return res.status(400).json({ error: 'Le nombre de votants doit être compris entre 0 et le nombre d\'inscrits.' });
        }
        if (elus.length === 0) return res.status(400).json({ error: 'Enregistrer au moins un élu.' });

        const debut = new Date(date);
        const fin = new Date(date);
        fin.setUTCMonth(fin.getUTCMonth() + delegues.DUREE_MANDAT_MOIS);

        const identifiants = elus.map((e) => e.employeeId);
        const connus = await prisma.employee.count({ where: { id: { in: identifiants }, status: { not: 'TERMINATED' } } });
        if (connus !== identifiants.length) return res.status(400).json({ error: 'Un élu ne correspond à aucun salarié en activité.' });

        const scrutin = await prisma.scrutin.create({
            data: {
                date, tour, college, inscrits, votants,
                observations: String(req.body?.observations || '').trim() || null,
                creePar: req.user?.name || req.user?.email || null,
                mandats: {
                    create: elus.map((e) => ({
                        employeeId: e.employeeId,
                        college: COLLEGES.includes(e.college) ? e.college : college,
                        qualite: QUALITES.includes(e.qualite) ? e.qualite : 'TITULAIRE',
                        debut,
                        fin
                    }))
                }
            },
            include: { mandats: true }
        });

        res.status(201).json({
            scrutin,
            message: `Scrutin enregistré : ${scrutin.mandats.length} mandat(s) jusqu'au ${fin.toISOString().slice(0, 10)} `
                + `(${delegues.DUREE_MANDAT_MOIS} mois). Le renouvellement sera signalé ${delegues.PREAVIS_FIN_MANDAT_JOURS} jours avant.`
        });
    } catch (erreur) {
        console.error('[DÉLÉGUÉS] Scrutin non enregistré :', erreur.message);
        res.status(500).json({ error: 'Enregistrement du scrutin impossible.' });
    }
};

/** Fin anticipée : démission, départ de l'entreprise, révocation. */
exports.terminerMandat = async (req, res) => {
    try {
        const motif = String(req.body?.motif || '').trim();
        if (motif.length < 5) return res.status(400).json({ error: 'Indiquer le motif de la fin de mandat.' });
        const mandat = await prisma.mandatDelegue.findUnique({ where: { id: req.params.id } });
        if (!mandat) return res.status(404).json({ error: 'Mandat introuvable.' });
        if (mandat.finAnticipeeLe) return res.status(409).json({ error: 'Ce mandat est déjà clos.' });

        await prisma.mandatDelegue.update({
            where: { id: mandat.id },
            data: { finAnticipeeLe: new Date(), finAnticipeeMotif: motif }
        });
        res.json({ message: "Mandat clos. Si le collège n'a plus de titulaire, un scrutin partiel s'impose." });
    } catch (erreur) {
        console.error('[DÉLÉGUÉS] Fin de mandat impossible :', erreur.message);
        res.status(500).json({ error: 'Fin de mandat impossible.' });
    }
};

exports.enregistrerReunion = async (req, res) => {
    try {
        const date = new Date(req.body?.date);
        const objet = String(req.body?.objet || '').trim();
        if (isNaN(date.getTime())) return res.status(400).json({ error: 'Date de réunion invalide.' });
        if (objet.length < 3) return res.status(400).json({ error: "Indiquer l'objet de la réunion." });

        const reunion = await prisma.reunionDelegues.create({
            data: {
                date, objet,
                compteRendu: String(req.body?.compteRendu || '').trim() || null,
                presents: Array.isArray(req.body?.presents) ? req.body.presents : null,
                creePar: req.user?.name || req.user?.email || null
            }
        });
        res.status(201).json({ reunion, message: 'Réunion enregistrée.' });
    } catch (erreur) {
        console.error('[DÉLÉGUÉS] Réunion non enregistrée :', erreur.message);
        res.status(500).json({ error: 'Enregistrement de la réunion impossible.' });
    }
};

exports.COLLEGES = COLLEGES;
exports.QUALITES = QUALITES;
