const prisma = require('../prismaClient');
const mission = require('../lib/mission');
const journal = require('../lib/journal');

/**
 * Ordres de mission.
 *
 * Autoriser un déplacement engage l'entreprise : l'autorisation et le refus
 * sont journalisés, avec leur auteur.
 */

exports.lister = async (req, res) => {
    try {
        const registre = await mission.registre({ depuis: req.query.depuis, jusqua: req.query.jusqua });
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            select: { id: true, firstName: true, lastName: true, positionTitle: true },
            orderBy: { lastName: 'asc' }
        });
        res.json({
            ...registre,
            salaries: salaries.map((s) => ({
                id: s.id, nom: `${s.lastName} ${s.firstName}`.trim(), fonction: s.positionTitle
            })),
            avertissement: registre.forfaits
                ? null
                : "Aucun forfait de per diem n'est déclaré (MISSION_PER_DIEM) : le montant est saisi "
                  + "mission par mission. L'ordre de mission vaut par lui-même — l'autorisation écrite "
                  + "de partir — même sans montant."
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.demander = async (req, res) => {
    try {
        const { employeeId, objet, destination, zone, debut, fin, perDiemJour, avance, moyenTransport } = req.body;
        if (!employeeId || !objet || !destination || !debut || !fin) {
            return res.status(400).json({ error: 'Salarié, objet, destination, début et fin sont obligatoires.' });
        }
        if (new Date(fin) < new Date(debut)) {
            return res.status(400).json({ error: 'La fin précède le début.' });
        }
        const zoneRetenue = String(zone || 'LOCALE').toUpperCase();
        if (!mission.ZONES.includes(zoneRetenue)) {
            return res.status(400).json({ error: `Zone inconnue. Attendu : ${mission.ZONES.join(', ')}.` });
        }

        const chiffre = mission.indemnite({ debut, fin, zone: zoneRetenue, perDiemJour });
        const creee = await prisma.ordreMission.create({
            data: {
                employeeId,
                objet, destination, zone: zoneRetenue,
                debut: new Date(debut), fin: new Date(fin),
                perDiemJour: chiffre.perDiemJour,
                montantPrevu: chiffre.total,
                avance: Math.max(Number(avance) || 0, 0),
                moyenTransport: moyenTransport || null,
                creePar: req.user?.name || req.user?.email || null
            }
        });
        res.status(201).json({
            message: chiffre.chiffrable
                ? `Mission demandée : ${chiffre.jours} jour(s), ${Math.round(chiffre.total)} FCFA prévus.`
                : `Mission demandée : ${chiffre.jours} jour(s). Le montant reste à fixer.`,
            mission: creee
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.decider = async (req, res) => {
    try {
        const { id } = req.params;
        const { accord, motif } = req.body;
        const existante = await prisma.ordreMission.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Mission introuvable.' });
        if (existante.statut !== 'DEMANDEE') {
            return res.status(409).json({ error: `Cette mission est déjà ${existante.statut.toLowerCase()}.` });
        }
        if (!accord && !motif) {
            return res.status(400).json({ error: 'Un refus se motive.' });
        }

        const auteur = req.user?.name || req.user?.email || 'INCONNU';
        const maj = await prisma.ordreMission.update({
            where: { id },
            data: accord
                ? { statut: 'AUTORISEE', autorisePar: auteur, autoriseeLe: new Date() }
                : { statut: 'REFUSEE', autorisePar: auteur, autoriseeLe: new Date(), motifRefus: motif }
        });

        journal.ecrireSansAttendre({
            userId: req.user?.id || auteur,
            action: accord ? 'MISSION_AUTORISEE' : 'MISSION_REFUSEE',
            tableName: 'OrdreMission',
            recordId: id,
            newData: JSON.stringify({ destination: existante.destination, montant: existante.montantPrevu, motif: motif || null }),
            ipAddress: req.ip
        });

        res.json({ message: accord ? 'Mission autorisée.' : 'Mission refusée.', mission: maj });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

/** Retour de mission : compte rendu, puis solde de l'avance. */
exports.cloturer = async (req, res) => {
    try {
        const { id } = req.params;
        const { compteRendu, solde } = req.body;
        const existante = await prisma.ordreMission.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Mission introuvable.' });
        if (!['AUTORISEE', 'EFFECTUEE'].includes(existante.statut)) {
            return res.status(409).json({
                error: "Seule une mission autorisée se clôt.",
                remede: "Une mission refusée ou annulée n'a pas eu lieu."
            });
        }
        const maj = await prisma.ordreMission.update({
            where: { id },
            data: {
                statut: solde ? 'SOLDEE' : 'EFFECTUEE',
                compteRendu: compteRendu || existante.compteRendu
            }
        });
        res.json({
            message: solde
                ? 'Mission soldée.'
                : existante.avance > 0
                    ? `Mission constatée. Une avance de ${Math.round(existante.avance)} FCFA reste à solder.`
                    : 'Mission constatée.',
            mission: maj
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
