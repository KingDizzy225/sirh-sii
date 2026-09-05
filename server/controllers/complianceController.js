const prisma = require('../prismaClient');

exports.getComplianceRules = async (req, res) => {
    try {
        const rules = await prisma.complianceRule.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(rules);
    } catch (error) {
        console.error('Error fetching compliance rules:', error);
        res.status(500).json({ error: 'Failed to fetch compliance rules' });
    }
};

exports.createComplianceRule = async (req, res) => {
    try {
        const { title, description, target, frequencyMonths } = req.body;
        const newRule = await prisma.complianceRule.create({
            data: { title, description, target, frequencyMonths: parseInt(frequencyMonths) }
        });
        res.status(201).json(newRule);
    } catch (error) {
        console.error('Error creating compliance rule:', error);
        res.status(500).json({ error: 'Failed to create compliance rule' });
    }
};

exports.deleteComplianceRule = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.complianceRule.delete({ where: { id } });
        res.status(200).json({ message: 'Compliance rule deleted successfully' });
    } catch (error) {
        console.error('Error deleting compliance rule:', error);
        res.status(500).json({ error: 'Failed to delete compliance rule' });
    }
};

/**
 * Indicateurs de conformité calculés sur les données réelles.
 *
 * Le tableau de bord affichait jusqu'ici quatre alertes codées en dur —
 * « 2 fins de contrat sans action », « index de parité 88/100 » — identiques
 * quel que soit l'effectif, y compris sur une base vide. Un directeur des
 * ressources humaines qui s'y fiait décidait sur du vide.
 */
exports.getComplianceDashboard = async (req, res) => {
    try {
        const maintenant = new Date();
        const dans30Jours = new Date(maintenant);
        dans30Jours.setDate(dans30Jours.getDate() + 30);

        const actifs = { status: { not: 'TERMINATED' } };
        const indicateurs = [];

        // 1. Visites médicales à planifier
        const visitesProches = await prisma.medicalRecord.count({
            where: { nextCheckupDate: { gte: maintenant, lte: dans30Jours } }
        });
        const effectif = await prisma.employee.count({ where: actifs });
        const suivis = await prisma.medicalRecord.findMany({
            where: {}, select: { employeeId: true }, distinct: ['employeeId']
        });
        const jamaisSuivis = Math.max(effectif - suivis.length, 0);

        indicateurs.push({
            titre: 'Visites Médicales',
            statut: (visitesProches + jamaisSuivis) === 0 ? 'safe' : (jamaisSuivis > 0 ? 'danger' : 'warning'),
            message: jamaisSuivis > 0
                ? `${jamaisSuivis} salarié(s) sans aucune visite enregistrée, ${visitesProches} à replanifier sous 30 jours.`
                : visitesProches > 0
                    ? `${visitesProches} visite(s) à planifier avant 30 jours.`
                    : 'Tous les suivis médicaux sont à jour.'
        });

        // 2. Fins de CDD approchantes
        const cddProches = await prisma.employee.count({
            where: { ...actifs, contractEndDate: { gte: maintenant, lte: dans30Jours } }
        });
        const cddDepasses = await prisma.employee.count({
            where: { ...actifs, contractEndDate: { lt: maintenant } }
        });
        indicateurs.push({
            titre: 'Contrats à durée déterminée',
            statut: cddDepasses > 0 ? 'danger' : cddProches > 0 ? 'warning' : 'safe',
            message: cddDepasses > 0
                ? `${cddDepasses} contrat(s) arrivé(s) à terme sans action, ${cddProches} sous 30 jours.`
                : cddProches > 0
                    ? `${cddProches} fin(s) de contrat sous 30 jours.`
                    : 'Aucune échéance de contrat à court terme.'
        });

        // 3. Périodes d'essai
        const essaisProches = await prisma.employee.count({
            where: { ...actifs, trialPeriodEndDate: { gte: maintenant, lte: dans30Jours } }
        });
        indicateurs.push({
            titre: "Périodes d'essai",
            statut: essaisProches > 0 ? 'warning' : 'safe',
            message: essaisProches > 0
                ? `${essaisProches} décision(s) de confirmation à prendre sous 30 jours.`
                : "Aucune période d'essai à trancher."
        });

        // 4. Parité femmes/hommes
        const parGenre = await prisma.employee.groupBy({
            by: ['gender'], where: actifs, _count: { _all: true }
        });
        const compte = (valeurs) => parGenre
            .filter(g => valeurs.includes((g.gender || '').toLowerCase()))
            .reduce((s, g) => s + g._count._all, 0);
        const femmes = compte(['f', 'femme', 'féminin', 'feminin']);
        const hommes = compte(['m', 'homme', 'masculin']);
        const renseignes = femmes + hommes;
        const partFemmes = renseignes > 0 ? Math.round((femmes / renseignes) * 100) : null;

        indicateurs.push({
            titre: 'Répartition femmes / hommes',
            // Le genre étant facultatif, un effectif majoritairement non
            // renseigné rend l'indicateur non concluant : mieux vaut le dire
            // que d'afficher un chiffre calculé sur une poignée de fiches.
            statut: renseignes < effectif / 2 ? 'warning' : (partFemmes >= 40 && partFemmes <= 60) ? 'safe' : 'warning',
            message: renseignes === 0
                ? 'Genre non renseigné : indicateur indisponible.'
                : renseignes < effectif / 2
                    ? `Genre renseigné pour ${renseignes} salarié(s) sur ${effectif} seulement.`
                    : `${partFemmes} % de femmes sur ${renseignes} fiches renseignées.`
        });

        const enAlerte = indicateurs.filter(i => i.statut !== 'safe').length;
        res.json({
            calculeLe: maintenant,
            effectif,
            indicateurs,
            score: indicateurs.length ? Math.round(((indicateurs.length - enAlerte) / indicateurs.length) * 100) : null
        });
    } catch (error) {
        console.error('Error building compliance dashboard:', error);
        res.status(500).json({ error: 'Erreur lors du calcul des indicateurs de conformité.' });
    }
};
