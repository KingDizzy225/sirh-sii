const prisma = require('../prismaClient');
const { intervalleMois } = require('./paie');

/**
 * Contrôle de vraisemblance des bulletins d'un mois.
 *
 * La paie ne se relisait pas. Un seul écart était signalé — le salaire de base
 * différent de la fiche —, et rien d'autre : une prime saisie avec un zéro de
 * trop, quatre-vingts heures supplémentaires au lieu de huit, un net négatif,
 * un salarié sorti payé quand même. Ces erreurs ne se découvrent qu'au
 * virement, ou par le salarié.
 *
 * Deux niveaux, et la distinction compte :
 *
 *  - **bloquant** : ce qui ne peut pas être vrai — un net supérieur au brut,
 *    deux bulletins pour le même mois, un salarié payé après sa sortie. La
 *    clôture est refusée tant que ce n'est pas corrigé.
 *  - **à viser** : ce qui est inhabituel sans être faux — un net qui double
 *    (prime de fin d'année), des retenues élevées (prêt), beaucoup d'heures
 *    supplémentaires (inventaire). La RH les voit et clôture en connaissance
 *    de cause.
 *
 * Aucun seuil n'est une règle de droit : ce sont des repères, réglables.
 */

const nombre = (v, defaut) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : defaut;
};

const SEUILS = {
    /** Net rapporté à la médiane des mois précédents. */
    hausseNet: nombre(process.env.VRAISEMBLANCE_HAUSSE_NET, 1.5),
    baisseNet: nombre(process.env.VRAISEMBLANCE_BAISSE_NET, 0.6),
    /** Au-delà, la hausse n'est plus une prime : elle est bloquante. */
    hausseBloquante: nombre(process.env.VRAISEMBLANCE_HAUSSE_BLOQUANTE, 3),
    /** Part des retenues dans le brut. */
    partRetenues: nombre(process.env.VRAISEMBLANCE_PART_RETENUES, 0.5),
    /** Heures supplémentaires dans le mois. */
    heuresSupMois: nombre(process.env.VRAISEMBLANCE_HEURES_SUP, 60),
    /** Primes rapportées au salaire de base. */
    primeSurBase: nombre(process.env.VRAISEMBLANCE_PRIME_SUR_BASE, 1),
    /** Historique retenu pour la comparaison, en mois. */
    moisCompares: nombre(process.env.VRAISEMBLANCE_MOIS_COMPARES, 6)
};

const fcfa = (n) => `${Math.round(n || 0).toLocaleString('fr-FR')} F`;

function mediane(valeurs) {
    const tries = valeurs.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (tries.length === 0) return null;
    const milieu = Math.floor(tries.length / 2);
    return tries.length % 2 ? tries[milieu] : (tries[milieu - 1] + tries[milieu]) / 2;
}

/**
 * @param {string} periode « AAAA-MM »
 * @returns {Promise<{periode:string, bulletins:number, controles:Array, resume:object}>}
 */
async function analyser(periode) {
    const mois = intervalleMois(periode);

    const fiches = await prisma.payroll.findMany({
        where: { period: { gte: mois.gte, lt: mois.lt } },
        include: {
            employee: {
                select: {
                    id: true, firstName: true, lastName: true, department: true,
                    status: true, exitDate: true, hireDate: true
                }
            }
        }
    });

    const identifiants = [...new Set(fiches.map((f) => f.employeeId))];
    const controles = [];

    if (identifiants.length === 0) {
        return { periode: mois.libelle, bulletins: 0, controles, resume: { bloquantes: 0, avertissements: 0 } };
    }

    const debutHistorique = new Date(Date.UTC(
        mois.gte.getUTCFullYear(), mois.gte.getUTCMonth() - SEUILS.moisCompares, 1
    ));

    const [anterieurs, pointagesMois, pointagesAvant, congesMois] = await Promise.all([
        prisma.payroll.findMany({
            where: { employeeId: { in: identifiants }, period: { gte: debutHistorique, lt: mois.gte } },
            select: { employeeId: true, period: true, netSalary: true },
            orderBy: { period: 'desc' }
        }),
        prisma.timeLog.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, timestamp: { gte: mois.gte, lt: mois.lt } },
            _count: { _all: true }
        }),
        prisma.timeLog.groupBy({
            by: ['employeeId'],
            where: { employeeId: { in: identifiants }, timestamp: { gte: debutHistorique, lt: mois.gte } },
            _count: { _all: true }
        }),
        prisma.leave.findMany({
            where: {
                employeeId: { in: identifiants },
                startDate: { lt: mois.lt },
                endDate: { gte: mois.gte }
            },
            select: { employeeId: true }
        })
    ]);

    const netsAnterieurs = new Map();
    for (const a of anterieurs) {
        if (!netsAnterieurs.has(a.employeeId)) netsAnterieurs.set(a.employeeId, []);
        netsAnterieurs.get(a.employeeId).push(a.netSalary || 0);
    }
    const compter = (groupes) => new Map(groupes.map((g) => [g.employeeId, g._count._all]));
    const pointesMois = compter(pointagesMois);
    const pointesAvant = compter(pointagesAvant);
    const enConge = new Set(congesMois.map((c) => c.employeeId));

    const parSalarie = new Map();
    for (const f of fiches) {
        if (!parSalarie.has(f.employeeId)) parSalarie.set(f.employeeId, []);
        parSalarie.get(f.employeeId).push(f);
    }

    const signaler = (fiche, gravite, code, libelle, detail) => controles.push({
        employeeId: fiche.employeeId,
        nom: `${fiche.employee?.lastName || ''} ${fiche.employee?.firstName || ''}`.trim(),
        service: fiche.employee?.department || null,
        payrollId: fiche.id,
        gravite, code, libelle, detail
    });

    for (const [, sesFiches] of parSalarie) {
        // Deux bulletins pour le même mois : la déclaration compterait deux
        // fois, et le salarié serait payé deux fois.
        if (sesFiches.length > 1) {
            signaler(sesFiches[0], 'bloquante', 'DOUBLON_BULLETIN',
                `${sesFiches.length} bulletins sur le même mois`,
                'Relancer la paie du mois pour ne conserver qu’un bulletin par salarié.');
        }

        for (const f of sesFiches) {
            const brut = f.grossSalary != null ? f.grossSalary : (f.baseSalary || 0);
            const net = f.netSalary || 0;
            const salarie = f.employee;

            if (net <= 0) {
                signaler(f, 'bloquante', 'NET_NUL',
                    `Net à payer de ${fcfa(net)}`,
                    'Un bulletin ne peut pas être remis avec un net nul ou négatif : vérifier les retenues.');
            }
            if (f.grossSalary != null && net > f.grossSalary) {
                signaler(f, 'bloquante', 'NET_SUPERIEUR_BRUT',
                    `Net (${fcfa(net)}) supérieur au brut (${fcfa(f.grossSalary)})`,
                    'Incohérence de calcul : relancer la paie de ce salarié.');
            }
            if (salarie?.exitDate && new Date(salarie.exitDate) < mois.gte) {
                signaler(f, 'bloquante', 'SALARIE_SORTI',
                    `Sorti le ${new Date(salarie.exitDate).toLocaleDateString('fr-FR')}, payé sur ${mois.libelle}`,
                    'Retirer ce salarié de la paie, ou corriger sa date de sortie.');
            }
            if (salarie?.hireDate && new Date(salarie.hireDate) >= mois.lt) {
                signaler(f, 'bloquante', 'PAYE_AVANT_EMBAUCHE',
                    `Embauché le ${new Date(salarie.hireDate).toLocaleDateString('fr-FR')}, payé sur ${mois.libelle}`,
                    'La période de paie précède la date d’embauche.');
            }

            // Comparaison à son propre passé : la médiane, non la moyenne,
            // pour qu'un seul mois atypique ne déplace pas la référence.
            const reference = mediane(netsAnterieurs.get(f.employeeId) || []);
            const comparable = (netsAnterieurs.get(f.employeeId) || []).length >= 2 && reference > 0;
            if (comparable && net > 0) {
                const rapport = net / reference;
                if (rapport >= SEUILS.hausseBloquante) {
                    signaler(f, 'bloquante', 'NET_MULTIPLIE',
                        `Net multiplié par ${rapport.toFixed(1)} (${fcfa(net)} contre ${fcfa(reference)} d’habitude)`,
                        'Un tel écart vient presque toujours d’une saisie : vérifier prime et heures supplémentaires.');
                } else if (rapport >= SEUILS.hausseNet) {
                    signaler(f, 'avertissement', 'NET_EN_HAUSSE',
                        `Net en hausse de ${Math.round((rapport - 1) * 100)} % (${fcfa(net)} contre ${fcfa(reference)})`,
                        'Prime exceptionnelle ou heures supplémentaires : à confirmer.');
                } else if (rapport <= SEUILS.baisseNet) {
                    signaler(f, 'avertissement', 'NET_EN_BAISSE',
                        `Net en baisse de ${Math.round((1 - rapport) * 100)} % (${fcfa(net)} contre ${fcfa(reference)})`,
                        'Absence non rémunérée, retenue ou mois incomplet : à confirmer.');
                }
            }

            if (brut > 0 && (f.deductions || 0) > brut * SEUILS.partRetenues) {
                signaler(f, 'avertissement', 'RETENUES_ELEVEES',
                    `Retenues de ${fcfa(f.deductions)} sur un brut de ${fcfa(brut)}`,
                    'Au-delà de la moitié du brut, vérifier la quotité saisissable.');
            }
            if ((f.overtimeHours || 0) > SEUILS.heuresSupMois) {
                signaler(f, 'avertissement', 'HEURES_SUP_ELEVEES',
                    `${f.overtimeHours} heures supplémentaires sur le mois`,
                    'Vérifier le relevé de pointage avant de payer.');
            }
            if ((f.baseSalary || 0) > 0 && (f.bonus || 0) > f.baseSalary * SEUILS.primeSurBase) {
                signaler(f, 'avertissement', 'PRIME_ELEVEE',
                    `Prime de ${fcfa(f.bonus)} pour un salaire de base de ${fcfa(f.baseSalary)}`,
                    'Vérifier qu’il ne s’agit pas d’un zéro de trop.');
            }

            // Salarié qui pointait et ne pointe plus : payé sans aucune trace
            // d'activité ni congé posé.
            const pointaitAvant = (pointesAvant.get(f.employeeId) || 0) >= 5;
            const pointeCeMois = (pointesMois.get(f.employeeId) || 0) > 0;
            if (pointaitAvant && !pointeCeMois && !enConge.has(f.employeeId)) {
                signaler(f, 'avertissement', 'SANS_ACTIVITE',
                    'Payé sans aucun pointage ni congé sur le mois',
                    'Ce salarié pointait les mois précédents : vérifier qu’il est bien en poste.');
            }
        }
    }

    const bloquantes = controles.filter((c) => c.gravite === 'bloquante');
    return {
        periode: mois.libelle,
        bulletins: fiches.length,
        seuils: SEUILS,
        controles,
        resume: {
            bloquantes: bloquantes.length,
            avertissements: controles.length - bloquantes.length,
            salariesConcernes: new Set(controles.map((c) => c.employeeId)).size
        }
    };
}

module.exports = { analyser, SEUILS, mediane };
