const prisma = require('../prismaClient');
const pret = require('../lib/pret');
const paie = require('../lib/paie');
const { salaireConnu } = require('../lib/demographie');
const { canAccessEmployeeData, getRequesterEmployee } = require('../lib/access');

/**
 * Prêts au personnel.
 *
 * Une règle traverse ce fichier : **le solde restant dû est la somme des
 * échéances non soldées**, jamais un compteur tenu à part. Un compteur se
 * désynchronise dès la première retenue passée deux fois ou annulée à la main ;
 * une somme, non.
 */

/** Net mensuel de référence, pour vérifier la quotité saisissable. */
async function netMensuelDe(employeeId) {
    const salarie = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: {
            baseSalary: true,
            payrolls: { orderBy: { period: 'desc' }, take: 1, select: { baseSalary: true, netSalary: true } }
        }
    });
    if (!salarie) return 0;

    // Le net du dernier bulletin fait foi ; à défaut, il est estimé depuis le
    // salaire de référence. L'estimation est signalée à l'appelant.
    const dernier = salarie.payrolls[0];
    if (dernier && dernier.netSalary > 0) return { net: dernier.netSalary, estime: false };

    const base = salaireConnu(salarie);
    if (base === 0) return { net: 0, estime: false };
    return { net: paie.calculerPaie({ baseSalary: base }).netSalary, estime: true };
}

/** Retenues mensuelles déjà en cours pour ce salarié. */
async function encoursMensuel(employeeId, pretIgnore) {
    const enCours = await prisma.pret.findMany({
        where: {
            employeeId, statut: 'EN_COURS',
            ...(pretIgnore ? { id: { not: pretIgnore } } : {})
        },
        select: { mensualite: true }
    });
    return enCours.reduce((t, p) => t + (p.mensualite || 0), 0);
}

/** GET /api/prets — la RH voit tout, un salarié ne voit que les siens. */
exports.lister = async (req, res) => {
    try {
        const { employeeId } = req.query;
        let filtre = {};

        if (employeeId) {
            if (!(await canAccessEmployeeData(req.user, employeeId))) {
                return res.status(403).json({ error: 'Accès interdit aux prêts de ce salarié.' });
            }
            filtre = { employeeId };
        } else if (!(await canAccessEmployeeData(req.user, null))) {
            const moi = await getRequesterEmployee(req.user);
            if (!moi) return res.status(404).json({ error: 'Aucun dossier salarié rattaché à ce compte.' });
            filtre = { employeeId: moi.id };
        }

        const prets = await prisma.pret.findMany({
            where: filtre,
            include: {
                echeances: { orderBy: { rang: 'asc' } },
                employee: { select: { firstName: true, lastName: true, department: true } }
            },
            orderBy: { accordeLe: 'desc' }
        });

        res.json(prets.map((p) => ({
            ...pret.etat(p, p.echeances),
            motif: p.motif,
            statut: p.statut,
            accordeLe: p.accordeLe,
            accordePar: p.accordePar,
            mensualite: p.mensualite,
            salarie: p.employee
                ? { nom: `${p.employee.firstName} ${p.employee.lastName}`, service: p.employee.department }
                : null,
            lignes: p.echeances
        })));
    } catch (error) {
        console.error('Erreur lecture des prêts :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des prêts.' });
    }
};

/**
 * POST /api/prets/simuler — l'échéancier avant de s'engager.
 *
 * Le refus nomme sa raison : un plafond de quotité atteint et un net inconnu
 * n'appellent pas la même suite.
 */
exports.simuler = async (req, res) => {
    try {
        const { employeeId, montant, echeances, premiereEcheance } = req.body || {};
        if (!employeeId) return res.status(400).json({ error: 'Salarié requis.' });

        const { net, estime } = await netMensuelDe(employeeId);
        const encours = await encoursMensuel(employeeId);
        const empechements = pret.obstacles({ montant, echeances, netMensuel: net, encoursMensuel: encours });

        const debut = premiereEcheance
            ? new Date(`${premiereEcheance}-01T00:00:00`)
            : (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })();

        res.json({
            lignes: empechements.length === 0 ? pret.echeancier(montant, echeances, debut) : [],
            netMensuel: Math.round(net),
            netEstime: estime,
            encoursMensuel: Math.round(encours),
            quotiteMax: pret.QUOTITE_MAX,
            plafondMensuel: Math.round(net * pret.QUOTITE_MAX),
            empechements
        });
    } catch (error) {
        console.error('Erreur simulation de prêt :', error);
        res.status(500).json({ error: 'Erreur lors de la simulation.' });
    }
};

/** POST /api/prets — accord d'un prêt et arrêté de son échéancier. */
exports.accorder = async (req, res) => {
    try {
        const { employeeId, montant, echeances, premiereEcheance, motif } = req.body || {};

        const salarie = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const { net } = await netMensuelDe(employeeId);
        const encours = await encoursMensuel(employeeId);
        const empechements = pret.obstacles({ montant, echeances, netMensuel: net, encoursMensuel: encours });
        if (empechements.length > 0) {
            return res.status(409).json({ error: empechements.join(' '), empechements });
        }

        const debut = premiereEcheance
            ? new Date(`${premiereEcheance}-01T00:00:00`)
            : (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; })();

        const lignes = pret.echeancier(montant, echeances, debut);
        if (lignes.length === 0) {
            return res.status(400).json({ error: "L'échéancier n'a pas pu être établi." });
        }

        // L'échéancier est arrêté ici, dans la même transaction que le prêt :
        // un prêt sans échéances ne se rembourserait jamais.
        const cree = await prisma.$transaction(async (tx) => {
            const p = await tx.pret.create({
                data: {
                    employeeId,
                    montant: Math.round(Number(montant)),
                    motif: motif || null,
                    mensualite: lignes[0].montant,
                    accordePar: req.user?.name || req.user?.email || null
                }
            });
            await tx.echeancePret.createMany({
                data: lignes.map((l) => ({ pretId: p.id, rang: l.rang, periode: l.periode, montant: l.montant }))
            });
            return tx.pret.findUnique({ where: { id: p.id }, include: { echeances: { orderBy: { rang: 'asc' } } } });
        });

        res.status(201).json({ ...pret.etat(cree, cree.echeances), lignes: cree.echeances });
    } catch (error) {
        console.error('Erreur accord de prêt :', error);
        res.status(500).json({ error: "Erreur lors de l'accord du prêt." });
    }
};

/**
 * GET /api/prets/echeances/:periode — retenues dues sur une paie.
 *
 * Consulté avant de lancer la paie : la RH voit ce qui sera retenu, et sur qui.
 */
exports.echeancesDues = async (req, res) => {
    try {
        const periode = String(req.params.periode || '').slice(0, 7);
        if (!/^\d{4}-\d{2}$/.test(periode)) {
            return res.status(400).json({ error: 'Période attendue au format AAAA-MM.' });
        }

        const dues = await prisma.echeancePret.findMany({
            where: { periode, statut: 'A_RETENIR', pret: { statut: 'EN_COURS' } },
            include: {
                pret: {
                    include: { employee: { select: { id: true, firstName: true, lastName: true } } }
                }
            },
            orderBy: { montant: 'desc' }
        });

        res.json({
            periode,
            total: dues.reduce((t, e) => t + e.montant, 0),
            lignes: dues.map((e) => ({
                echeanceId: e.id,
                pretId: e.pretId,
                employeeId: e.pret.employeeId,
                salarie: `${e.pret.employee.firstName} ${e.pret.employee.lastName}`,
                rang: e.rang,
                montant: e.montant
            }))
        });
    } catch (error) {
        console.error('Erreur lecture des échéances dues :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des échéances.' });
    }
};

/**
 * POST /api/prets/:id/annuler
 *
 * Les échéances déjà retenues ne sont pas défaites : elles ont été prélevées
 * sur des bulletins remis. Seules les échéances à venir sont annulées, et le
 * restant dû est abandonné explicitement.
 */
exports.annuler = async (req, res) => {
    try {
        const { motif } = req.body || {};
        if (!motif) return res.status(400).json({ error: "L'annulation d'un prêt doit être motivée." });

        const existant = await prisma.pret.findUnique({
            where: { id: req.params.id },
            include: { echeances: true }
        });
        if (!existant) return res.status(404).json({ error: 'Prêt introuvable.' });
        if (existant.statut !== 'EN_COURS') {
            return res.status(409).json({ error: `Ce prêt est déjà « ${existant.statut} ».` });
        }

        const restant = pret.soldeRestant(existant.echeances);

        await prisma.$transaction([
            prisma.echeancePret.updateMany({
                where: { pretId: existant.id, statut: 'A_RETENIR' },
                data: { statut: 'ANNULEE' }
            }),
            prisma.pret.update({
                where: { id: existant.id },
                data: { statut: 'ANNULE', annuleLe: new Date(), annuleMotif: motif }
            })
        ]);

        res.json({
            message: 'Prêt annulé.',
            restantAbandonne: restant,
            reserve: 'Les échéances déjà retenues sur des bulletins remis ne sont pas défaites.'
        });
    } catch (error) {
        console.error('Erreur annulation de prêt :', error);
        res.status(500).json({ error: "Erreur lors de l'annulation." });
    }
};
