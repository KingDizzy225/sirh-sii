const prisma = require('../prismaClient');
const primeAnnuelle = require('../lib/primeAnnuelle');
const journal = require('../lib/journal');

/**
 * Prime de fin d'année.
 *
 * L'écran sert deux usages qu'il ne faut pas confondre : la provision, qui se
 * consulte toute l'année et bouge à chaque paie, et l'arrêté, qui fige les
 * montants dus et part en paie.
 */

exports.provision = async (req, res) => {
    try {
        const annee = parseInt(req.query.annee, 10) || new Date().getFullYear();
        const etat = await primeAnnuelle.provision(annee);
        const arretees = await prisma.primeAnnuelle.findMany({
            where: { annee },
            include: { employee: { select: { firstName: true, lastName: true } } },
            orderBy: { montant: 'desc' }
        });
        res.json({
            ...etat,
            arretees: arretees.map((p) => ({
                id: p.id,
                employeeId: p.employeeId,
                nom: `${p.employee.lastName} ${p.employee.firstName}`.trim(),
                base: p.base,
                moisComptes: p.moisComptes,
                montant: p.montant,
                statut: p.statut,
                periodeVersement: p.periodeVersement,
                verseLe: p.verseLe
            })),
            avertissement: etat.parametree
                ? null
                : "Aucune règle n'est paramétrée (PRIME_FIN_ANNEE_FRACTION). Le treizième mois n'est pas "
                  + "une obligation légale générale : il tient à votre convention collective ou à un usage "
                  + "de l'entreprise. Tant que la fraction n'est pas posée, aucun montant n'est calculé."
        });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};

exports.arreter = async (req, res) => {
    try {
        const annee = parseInt(req.body.annee, 10) || new Date().getFullYear();
        const bilan = await primeAnnuelle.arreter(annee, {
            creePar: req.user?.name || req.user?.email || null
        });

        journal.ecrireSansAttendre({
            userId: req.user?.id || 'INCONNU',
            action: 'PRIME_ANNUELLE_ARRETEE',
            tableName: 'PrimeAnnuelle',
            recordId: String(annee),
            newData: JSON.stringify(bilan),
            ipAddress: req.ip
        });

        res.json({
            message: `Exercice ${annee} arrêté : ${bilan.crees} prime(s) établie(s), ${bilan.majs} mise(s) à jour.`
                + (bilan.figees ? ` ${bilan.figees} déjà versée(s), laissée(s) intacte(s).` : ''),
            ...bilan
        });
    } catch (erreur) {
        res.status(erreur.statut || 500).json({ error: erreur.message });
    }
};

exports.annuler = async (req, res) => {
    try {
        const { id } = req.params;
        const existante = await prisma.primeAnnuelle.findUnique({ where: { id } });
        if (!existante) return res.status(404).json({ error: 'Prime introuvable.' });
        if (existante.statut === 'VERSE') {
            return res.status(409).json({
                error: 'Cette prime a été versée sur un bulletin.',
                remede: 'Une prime versée se corrige en relançant la paie du mois concerné.'
            });
        }
        await prisma.primeAnnuelle.update({ where: { id }, data: { statut: 'ANNULE' } });
        res.json({ message: 'Prime annulée.' });
    } catch (erreur) {
        res.status(500).json({ error: erreur.message });
    }
};
