const prisma = require('../prismaClient');

/**
 * Budget d'effectif et de masse salariale.
 *
 * L'application savait dire ce qui avait été payé, jamais ce qui avait été
 * prévu : le mot « budget » n'apparaissait nulle part dans le modèle. Un écart
 * ne se voit pas sans point de comparaison, et c'est ce point qui manquait.
 *
 * Trois précautions, toutes prises pour la même raison — un chiffre de gestion
 * qu'on ne peut pas rattacher à sa source ne vaut rien :
 *
 *  - Le réalisé ne compte que les bulletins décomposés. Une fiche sans
 *    décomposition compterait pour zéro et ferait apparaître une économie qui
 *    n'existe pas ; elle est écartée du total et signalée à part.
 *  - La masse s'entend en coût employeur — brut plus charges patronales — car
 *    c'est ce que l'entreprise décaisse, et la seule grandeur comparable au
 *    budget.
 *  - La projection de fin d'exercice est annoncée comme telle, et n'est
 *    calculée qu'à partir du moment où assez de mois sont renseignés pour
 *    qu'elle veuille dire quelque chose.
 */

// En deçà, extrapoler l'année sur les mois écoulés donnerait un chiffre plus
// trompeur qu'utile : un seul mois multiplié par douze n'est pas une prévision.
const MOIS_MIN_PROJECTION = parseInt(process.env.BUDGET_MOIS_MIN_PROJECTION, 10) || 3;

const anneeDemandee = (req) => {
    const v = parseInt(req.query.annee, 10);
    return Number.isFinite(v) && v > 2000 && v < 2200 ? v : new Date().getFullYear();
};

const arrondir = (n) => Math.round(Number(n) || 0);

/**
 * Synthèse budgétaire d'un exercice, service par service.
 */
exports.getSynthese = async (req, res) => {
    try {
        const annee = anneeDemandee(req);
        const debut = new Date(Date.UTC(annee, 0, 1));
        const fin = new Date(Date.UTC(annee + 1, 0, 1));

        const [lignes, effectif, bulletins] = await Promise.all([
            prisma.budgetEffectif.findMany({ where: { annee }, orderBy: { departement: 'asc' } }),
            prisma.employee.findMany({
                where: { status: { not: 'TERMINATED' } },
                select: { id: true, department: true }
            }),
            prisma.payroll.findMany({
                where: { period: { gte: debut, lt: fin } },
                select: {
                    period: true, grossSalary: true, employerContributions: true,
                    employee: { select: { department: true } }
                }
            })
        ]);

        // Mois effectivement renseignés : c'est sur eux, et non sur le
        // calendrier, que se fonde la projection.
        const moisRenseignes = new Set(
            bulletins.map((b) => new Date(b.period).toISOString().slice(0, 7))
        ).size;

        const services = new Map();
        const service = (nom) => {
            const cle = nom || 'Non affecté';
            if (!services.has(cle)) {
                services.set(cle, {
                    departement: cle,
                    effectifBudgete: 0, masseSalarialeBudgetee: 0,
                    effectifReel: 0, masseRealisee: 0,
                    bulletinsIncomplets: 0, commentaire: null, id: null
                });
            }
            return services.get(cle);
        };

        for (const l of lignes) {
            const s = service(l.departement);
            s.id = l.id;
            s.effectifBudgete = l.effectifBudgete;
            s.masseSalarialeBudgetee = l.masseSalarialeBudgetee;
            s.commentaire = l.commentaire;
        }
        for (const e of effectif) service(e.department).effectifReel += 1;

        for (const b of bulletins) {
            const s = service(b.employee?.department);
            if (b.grossSalary == null) {
                // Une fiche sans décomposition ne vaut pas zéro : elle vaut
                // « inconnu ». La compter ferait apparaître une économie.
                s.bulletinsIncomplets += 1;
                continue;
            }
            s.masseRealisee += (b.grossSalary || 0) + (b.employerContributions || 0);
        }

        const projetable = moisRenseignes >= MOIS_MIN_PROJECTION;

        const detail = [...services.values()].map((s) => {
            const projection = projetable
                ? arrondir((s.masseRealisee / moisRenseignes) * 12)
                : null;
            return {
                ...s,
                masseRealisee: arrondir(s.masseRealisee),
                ecartEffectif: s.effectifReel - s.effectifBudgete,
                ecartMasse: s.masseSalarialeBudgetee
                    ? arrondir(s.masseRealisee - s.masseSalarialeBudgetee)
                    : null,
                projectionAnnuelle: projection,
                // Un dépassement ne se constate qu'en fin d'exercice ; en cours
                // d'année, seule la projection permet d'en parler.
                depassementProjete: projection != null && s.masseSalarialeBudgetee > 0
                    ? projection > s.masseSalarialeBudgetee
                    : null,
                budgete: s.masseSalarialeBudgetee > 0 || s.effectifBudgete > 0
            };
        }).sort((a, b) => a.departement.localeCompare(b.departement));

        const somme = (champ) => detail.reduce((t, d) => t + (d[champ] || 0), 0);

        res.json({
            annee,
            moisRenseignes,
            moisMinProjection: MOIS_MIN_PROJECTION,
            projetable,
            // Dit explicitement pourquoi la projection est absente, plutôt que
            // de laisser un champ vide s'interpréter comme une valeur nulle.
            motifSansProjection: projetable ? null :
                `Projection non calculée : ${moisRenseignes} mois de paie renseigné(s) sur ${MOIS_MIN_PROJECTION} requis.`,
            totaux: {
                effectifBudgete: somme('effectifBudgete'),
                effectifReel: somme('effectifReel'),
                masseSalarialeBudgetee: arrondir(somme('masseSalarialeBudgetee')),
                masseRealisee: arrondir(somme('masseRealisee')),
                projectionAnnuelle: projetable ? arrondir(somme('projectionAnnuelle')) : null,
                bulletinsIncomplets: somme('bulletinsIncomplets')
            },
            services: detail,
            // Services présents dans l'effectif mais absents du budget : ce sont
            // eux qu'on découvre en fin d'exercice.
            horsBudget: detail.filter((d) => !d.budgete && d.effectifReel > 0).map((d) => d.departement)
        });
    } catch (error) {
        console.error('Erreur synthèse budgétaire :', error);
        res.status(500).json({ error: 'Erreur lors du calcul du budget.' });
    }
};

/** Crée ou met à jour la ligne budgétaire d'un service. */
exports.enregistrer = async (req, res) => {
    try {
        const { annee, departement, effectifBudgete, masseSalarialeBudgetee, commentaire } = req.body;

        const an = parseInt(annee, 10);
        if (!Number.isFinite(an) || an < 2000 || an > 2200) {
            return res.status(400).json({ error: 'Exercice invalide.' });
        }
        if (!departement || !String(departement).trim()) {
            return res.status(400).json({ error: 'Service requis.' });
        }

        const effectif = parseInt(effectifBudgete, 10);
        const masse = parseFloat(masseSalarialeBudgetee);
        if (!Number.isFinite(effectif) || effectif < 0) {
            return res.status(400).json({ error: "L'effectif budgété doit être un nombre positif." });
        }
        if (!Number.isFinite(masse) || masse < 0) {
            return res.status(400).json({ error: 'La masse salariale budgétée doit être un nombre positif.' });
        }

        const donnees = {
            effectifBudgete: effectif,
            masseSalarialeBudgetee: masse,
            commentaire: commentaire || null,
            majPar: (req.user && (req.user.email || req.user.name)) || null
        };

        const ligne = await prisma.budgetEffectif.upsert({
            where: { annee_departement: { annee: an, departement: String(departement).trim() } },
            create: { annee: an, departement: String(departement).trim(), ...donnees },
            update: donnees
        });

        res.status(201).json(ligne);
    } catch (error) {
        console.error('Erreur enregistrement budgétaire :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement du budget." });
    }
};

/** Retire une ligne budgétaire. */
exports.supprimer = async (req, res) => {
    try {
        const ligne = await prisma.budgetEffectif.findUnique({ where: { id: req.params.id } });
        if (!ligne) return res.status(404).json({ error: 'Ligne budgétaire introuvable.' });
        await prisma.budgetEffectif.delete({ where: { id: ligne.id } });
        res.json({ message: `Budget ${ligne.annee} de ${ligne.departement} retiré.` });
    } catch (error) {
        console.error('Erreur suppression budgétaire :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression.' });
    }
};
