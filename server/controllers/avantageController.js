const prisma = require('../prismaClient');
const paie = require('../lib/paie');

/**
 * Prime de transport et avantages en nature.
 *
 * Le bulletin ne connaissait qu'une ligne « primes », fourre-tout. Or la prime
 * de transport est exonérée jusqu'à un plafond, et les avantages en nature
 * entrent dans l'assiette sans être versés en espèces. Confondus avec une
 * prime ordinaire, les premiers étaient surtaxés et les seconds gonflaient le
 * net à payer d'un logement déjà occupé.
 */

const TYPES = {
    LOGEMENT: 'Logement',
    VEHICULE: 'Véhicule',
    DOMESTICITE: 'Domesticité',
    ELECTRICITE: 'Électricité',
    EAU: 'Eau',
    NOURRITURE: 'Nourriture',
    AUTRE: 'Autre'
};

exports.lister = async (req, res) => {
    try {
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' } },
            orderBy: [{ lastName: 'asc' }],
            select: {
                id: true, firstName: true, lastName: true, positionTitle: true, primeTransport: true,
                avantages: { orderBy: { debut: 'desc' } }
            }
        });
        const maintenant = new Date();
        res.json({
            types: TYPES,
            plafondTransportExonere: paie.TAUX.transportPlafondExonere,
            lignes: salaries.map((s) => {
                const enCours = s.avantages.filter((a) => new Date(a.debut) <= maintenant && (!a.fin || new Date(a.fin) >= maintenant));
                return {
                    employeeId: s.id,
                    nom: `${s.lastName} ${s.firstName}`.trim(),
                    fonction: s.positionTitle,
                    primeTransport: s.primeTransport || 0,
                    avantages: s.avantages,
                    totalEnCours: enCours.reduce((t, a) => t + a.montantMensuel, 0)
                };
            })
        });
    } catch (erreur) {
        console.error('[AVANTAGES] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des avantages impossible.' });
    }
};

/** Prime de transport mensuelle d'un salarié. */
exports.definirTransport = async (req, res) => {
    try {
        const montant = Number(req.body?.montant);
        if (!Number.isFinite(montant) || montant < 0) return res.status(400).json({ error: 'Montant invalide.' });
        const salarie = await prisma.employee.findUnique({ where: { id: req.params.employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        await prisma.employee.update({ where: { id: salarie.id }, data: { primeTransport: montant || null } });
        const ventilation = paie.ventilerTransport(montant);
        res.json({
            ventilation,
            message: ventilation.imposable > 0
                ? `Prime enregistrée. ${ventilation.exonere} FCFA sont exonérés, ${ventilation.imposable} entrent dans l'assiette.`
                : 'Prime enregistrée, entièrement exonérée.'
        });
    } catch (erreur) {
        console.error('[AVANTAGES] Prime de transport non enregistrée :', erreur.message);
        res.status(500).json({ error: 'Enregistrement impossible.' });
    }
};

exports.ajouter = async (req, res) => {
    try {
        const type = TYPES[req.body?.type] ? req.body.type : null;
        const montantMensuel = Number(req.body?.montantMensuel);
        const debut = new Date(req.body?.debut || Date.now());
        const fin = req.body?.fin ? new Date(req.body.fin) : null;

        if (!type) return res.status(400).json({ error: 'Type d\'avantage inconnu.' });
        if (!Number.isFinite(montantMensuel) || montantMensuel <= 0) return res.status(400).json({ error: 'Le montant doit être positif.' });
        if (isNaN(debut.getTime())) return res.status(400).json({ error: 'Date de début invalide.' });
        if (fin && (isNaN(fin.getTime()) || fin <= debut)) return res.status(400).json({ error: 'La fin précède le début.' });

        const salarie = await prisma.employee.findUnique({ where: { id: req.params.employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const avantage = await prisma.avantageNature.create({
            data: {
                employeeId: salarie.id, type, montantMensuel, debut, fin,
                note: String(req.body?.note || '').trim() || null,
                creePar: req.user?.name || req.user?.email || null
            }
        });
        res.status(201).json({
            avantage,
            message: `${TYPES[type]} enregistré. Sa valeur entre dans l'assiette des cotisations et de l'impôt, `
                + "et se retranche du net à payer : le salarié le reçoit en nature, pas en argent."
        });
    } catch (erreur) {
        console.error('[AVANTAGES] Ajout impossible :', erreur.message);
        res.status(500).json({ error: 'Ajout impossible.' });
    }
};

exports.terminer = async (req, res) => {
    try {
        const fin = new Date(req.body?.fin || Date.now());
        if (isNaN(fin.getTime())) return res.status(400).json({ error: 'Date de fin invalide.' });
        const avantage = await prisma.avantageNature.findUnique({ where: { id: req.params.id } });
        if (!avantage) return res.status(404).json({ error: 'Avantage introuvable.' });
        if (fin <= new Date(avantage.debut)) return res.status(400).json({ error: 'La fin précède le début.' });

        await prisma.avantageNature.update({ where: { id: avantage.id }, data: { fin } });
        res.json({ message: 'Avantage clos : il ne figurera plus sur les bulletins postérieurs à cette date.' });
    } catch (erreur) {
        console.error('[AVANTAGES] Clôture impossible :', erreur.message);
        res.status(500).json({ error: 'Clôture impossible.' });
    }
};

exports.TYPES = TYPES;
