const prisma = require('../prismaClient');
const cdd = require('../lib/cdd');
const historique = require('../lib/historique');
const evenements = require('../lib/evenements');

/**
 * Suivi des contrats à durée déterminée.
 *
 * Voir lib/cdd.js : l'application ne connaissait que la date de fin d'un CDD,
 * jamais depuis quand le salarié enchaînait les contrats.
 */

const PERIODES = { orderBy: { debut: 'asc' } };

/** GET /api/cdd — CDD en cours, du plus exposé au moins exposé. */
exports.lister = async (req, res) => {
    try {
        const salaries = await prisma.employee.findMany({
            where: { status: { not: 'TERMINATED' }, contractType: { equals: 'CDD', mode: 'insensitive' } },
            select: {
                id: true, firstName: true, lastName: true, positionTitle: true, department: true,
                hireDate: true, contractEndDate: true, contractType: true, status: true,
                periodesCdd: PERIODES
            }
        });

        const maintenant = new Date();
        const rang = (etat) => cdd.URGENCE.indexOf(etat);
        const lignes = salaries
            .map((s) => ({
                employeeId: s.id,
                nom: `${s.lastName} ${s.firstName}`.trim(),
                poste: s.positionTitle,
                service: s.department,
                ...cdd.bilan(s, s.periodesCdd, maintenant)
            }))
            .sort((a, b) => (rang(a.etat) - rang(b.etat))
                || ((a.fin ? new Date(a.fin).getTime() : Infinity) - (b.fin ? new Date(b.fin).getTime() : Infinity)));

        const synthese = lignes.reduce((m, l) => ({ ...m, [l.etat]: (m[l.etat] || 0) + 1 }), {});

        res.json({
            regles: {
                dureeMaxMois: cdd.DUREE_MAX_MOIS,
                horizonJours: cdd.HORIZON_JOURS,
                renouvellementsMax: cdd.RENOUVELLEMENTS_MAX
            },
            synthese,
            lignes
        });
    } catch (error) {
        console.error('Erreur suivi des CDD :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des CDD.' });
    }
};

/**
 * POST /api/cdd/:employeeId/renouveler { nouvelleFin, motif }
 *
 * Refuse tout renouvellement qui ferait dépasser le plafond : le refus dit
 * jusqu'à quelle date un renouvellement reste possible, et quoi faire au-delà.
 */
exports.renouveler = async (req, res) => {
    try {
        const { nouvelleFin, motif } = req.body || {};
        const avant = await prisma.employee.findUnique({
            where: { id: req.params.employeeId },
            include: { periodesCdd: PERIODES }
        });
        if (!avant) return res.status(404).json({ error: 'Salarié introuvable.' });
        if (!cdd.estCdd(avant.contractType)) {
            return res.status(409).json({
                error: `Ce salarié est en ${avant.contractType || 'contrat non renseigné'}, pas en CDD.`
            });
        }
        const texte = String(motif || '').trim();
        if (!texte) {
            return res.status(400).json({ error: 'Motif du renouvellement requis : il figure au suivi du contrat.' });
        }

        const situation = cdd.bilan(avant, avant.periodesCdd);
        const obstacle = cdd.obstaclesRenouvellement(situation, nouvelleFin);
        if (obstacle) {
            return res.status(409).json({ error: obstacle, finMaxLegale: situation.finMaxLegale });
        }

        const auteur = req.user?.name || req.user?.email || null;
        const terme = new Date(nouvelleFin);

        const apres = await prisma.$transaction(async (tx) => {
            // Premier renouvellement suivi : la période initiale est consignée
            // telle que la fiche la décrit, pour que le cumul parte du bon jour.
            if (avant.periodesCdd.length === 0) {
                await tx.periodeCdd.create({
                    data: {
                        employeeId: avant.id, debut: situation.debut, fin: situation.fin,
                        nature: 'INITIAL', motif: 'Période reprise de la fiche au premier renouvellement suivi',
                        creePar: auteur
                    }
                });
            }
            await tx.periodeCdd.create({
                data: {
                    employeeId: avant.id,
                    debut: new Date(situation.fin.getTime() + cdd.JOUR),
                    fin: terme,
                    nature: 'RENOUVELLEMENT',
                    motif: texte,
                    creePar: auteur
                }
            });
            return tx.employee.update({ where: { id: avant.id }, data: { contractEndDate: terme } });
        });

        await historique.suivreChangement(avant, apres, { motif: `Renouvellement de CDD : ${texte}` })
            .catch((e) => console.error('[CDD] Historique non consigné :', e.message));

        evenements.emettreSansAttendre('CONTRACT_RENEWED', {
            salarie: evenements.salarie(apres),
            ancienTerme: situation.fin,
            nouveauTerme: terme
        });

        const periodes = await prisma.periodeCdd.findMany({ where: { employeeId: avant.id }, ...PERIODES });
        res.status(201).json({
            message: `Contrat renouvelé jusqu'au ${terme.toLocaleDateString('fr-FR', { timeZone: 'UTC' })}.`,
            ...cdd.bilan(apres, periodes)
        });
    } catch (error) {
        console.error('Erreur renouvellement de CDD :', error);
        res.status(500).json({ error: 'Erreur lors du renouvellement.' });
    }
};
