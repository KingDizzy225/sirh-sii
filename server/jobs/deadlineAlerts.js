const prisma = require('../prismaClient');
const { runOnce, dayPeriod } = require('./runOnce');
const { notifierRH } = require('../lib/notify');
const { PAR_CODE: PIECES_PAR_CODE } = require('../lib/sousTraitance');
const { decrire: decrireProcedure } = require('../controllers/procedureController');

const DAYS_AHEAD = parseInt(process.env.ALERT_DAYS_AHEAD || '30', 10);

const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

/**
 * Balaie les échéances RH et crée les notifications correspondantes.
 *
 * Ces alertes existaient à l'écran mais n'étaient calculées que lorsqu'un
 * utilisateur ouvrait le tableau de bord : une échéance pouvait passer
 * inaperçue si personne ne regardait au bon moment.
 */
async function scanDeadlines(referenceDate = new Date()) {
    const period = dayPeriod(referenceDate);

    return runOnce('DEADLINE_ALERTS', period, async () => {
        const horizon = new Date(referenceDate);
        horizon.setDate(horizon.getDate() + DAYS_AHEAD);

        const summary = [];

        // 1. Fins de CDD approchantes
        const endingContracts = await prisma.employee.findMany({
            where: {
                status: { not: 'TERMINATED' },
                contractEndDate: { gte: referenceDate, lte: horizon }
            },
            select: { firstName: true, lastName: true, contractEndDate: true }
        });
        for (const e of endingContracts) {
            await notifyHR(
                `Fin de contrat le ${formatDate(e.contractEndDate)} : ${e.firstName} ${e.lastName}. Renouvellement ou sortie à préparer.`,
                'Alerte',
                '/employees'
            );
        }
        summary.push(`${endingContracts.length} fin(s) de contrat`);

        // 2. Périodes d'essai arrivant à terme
        const endingTrials = await prisma.employee.findMany({
            where: {
                status: { not: 'TERMINATED' },
                trialPeriodEndDate: { gte: referenceDate, lte: horizon }
            },
            select: { firstName: true, lastName: true, trialPeriodEndDate: true }
        });
        for (const e of endingTrials) {
            await notifyHR(
                `Fin de période d'essai le ${formatDate(e.trialPeriodEndDate)} : ${e.firstName} ${e.lastName}. Décision de confirmation à prendre.`,
                'Alerte',
                '/employees'
            );
        }
        summary.push(`${endingTrials.length} période(s) d'essai`);

        // 3. Visites médicales à replanifier
        const dueCheckups = await prisma.medicalRecord.findMany({
            where: { nextCheckupDate: { gte: referenceDate, lte: horizon } },
            include: { employee: { select: { firstName: true, lastName: true } } }
        });
        for (const record of dueCheckups) {
            await notifyHR(
                `Visite médicale à planifier avant le ${formatDate(record.nextCheckupDate)} : ${record.employee.firstName} ${record.employee.lastName}.`,
                'Info',
                '/medical-hub'
            );
        }
        summary.push(`${dueCheckups.length} visite(s) médicale(s)`);

        // 4. Attestations de sous-traitants expirées ou proches de l'échéance
        //
        // Une attestation périmée vaut une attestation absente : le donneur
        // d'ordre répond des salariés que le prestataire n'a pas déclarés. La
        // différence avec les autres échéances est qu'elle ne se voit nulle
        // part — personne n'ouvre le dossier d'un prestataire en cours de
        // mission.
        const attestations = await prisma.subcontractorDocument.findMany({
            where: {
                expiresAt: { lte: horizon },
                subcontractor: { status: { not: 'Terminated' } }
            },
            include: { subcontractor: { select: { companyName: true, status: true } } }
        });

        let expirees = 0;
        for (const doc of attestations) {
            const piece = PIECES_PAR_CODE[doc.type];
            // Les pièces facultatives ne sont pas relancées : leur absence
            // n'engage pas le donneur d'ordre.
            if (!piece || !piece.exigee) continue;

            const perimee = new Date(doc.expiresAt) < referenceDate;
            if (perimee) expirees++;
            await notifyHR(
                perimee
                    ? `${piece.libelle} expirée depuis le ${formatDate(doc.expiresAt)} — ${doc.subcontractor.companyName}. ` +
                      "Le prestataire n'est plus couvert."
                    : `${piece.libelle} à renouveler avant le ${formatDate(doc.expiresAt)} — ${doc.subcontractor.companyName}.`,
                perimee ? 'Alerte' : 'Info',
                '/subcontractors'
            );
        }
        summary.push(`${attestations.length} attestation(s) de prestataire dont ${expirees} expirée(s)`);

        // 5. Procédures dont une étape a dépassé son délai
        //
        // Le retard était calculé et affiché en rouge sur l'écran, mais rien
        // n'en avertissait : il fallait ouvrir la page pour l'apprendre. Une
        // sanction qui devient contestable par simple écoulement du temps
        // mérite mieux qu'un badge que personne ne regarde.
        const enCours = await prisma.procedure.findMany({
            where: { statut: 'EN_COURS' },
            include: {
                etapes: true,
                employee: { select: { id: true, firstName: true, lastName: true, positionTitle: true, department: true } }
            }
        });

        let retards = 0;
        for (const procedure of enCours) {
            const vue = decrireProcedure(procedure);
            if (!vue.enRetard) continue;
            const etape = vue.etapes.find((e) => e.enRetard);
            retards++;
            await notifyHR(
                `Procédure ${vue.libelle.toLowerCase()} — ${vue.salarie?.nom} : ` +
                `« ${etape.libelle} » devait être consignée avant le ${formatDate(etape.limiteLe)}. ` +
                'Passé ce délai, le lien entre les faits et la décision se discute.',
                'Alerte',
                '/procedures'
            );
        }
        summary.push(`${enCours.length} procédure(s) en cours dont ${retards} en retard`);

        return summary.join(', ') + ` (horizon ${DAYS_AHEAD} jours)`;
    });
}

module.exports = { scanDeadlines, DAYS_AHEAD };
