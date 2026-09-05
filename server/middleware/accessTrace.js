const prisma = require('../prismaClient');

/**
 * Traçabilité des consultations de données sensibles.
 *
 * La piste d'audit existante n'enregistre que les écritures : personne ne
 * pouvait donc savoir qui avait ouvert le bulletin de paie ou le dossier
 * médical de qui. C'est pourtant la première question posée lors d'un
 * contrôle de conformité.
 *
 * Volontairement ciblé : journaliser toutes les lectures noierait la base à
 * chaque ouverture du tableau de bord. Seules les consultations de données
 * rattachées à une personne sont tracées, et uniquement lorsqu'un tiers
 * consulte le dossier de quelqu'un d'autre — un salarié lisant son propre
 * dossier ne produit pas de trace.
 */

/**
 * @param {string} typeRessource  ex. 'PAIE', 'MEDICAL', 'DOCUMENTS'
 * @param {(req) => Promise<string|null>|string|null} resoudreCible
 *        Identifiant de l'employé concerné par la consultation.
 */
function traceAccess(typeRessource, resoudreCible) {
    return (req, res, next) => {
        // La trace est écrite après la réponse : une consultation refusée
        // (403) ou en erreur n'a pas à figurer comme un accès effectif.
        res.on('finish', async () => {
            if (res.statusCode < 200 || res.statusCode >= 300) return;

            try {
                const lecteur = req.user;
                if (!lecteur || !lecteur.email) return;

                const cibleId = await resoudreCible(req);
                if (!cibleId) return;

                // Un salarié consultant son propre dossier ne crée pas de trace
                const lecteurEmploye = await prisma.employee.findUnique({
                    where: { email: lecteur.email },
                    select: { id: true }
                });
                if (lecteurEmploye && lecteurEmploye.id === cibleId) return;

                await prisma.auditLog.create({
                    data: {
                        userId: lecteur.id || 'INCONNU',
                        action: 'CONSULT',
                        tableName: typeRessource,
                        recordId: cibleId,
                        newData: JSON.stringify({
                            consultePar: lecteur.email,
                            role: lecteur.role || null,
                            chemin: req.originalUrl.split('?')[0]
                        }),
                        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'inconnue'
                    }
                });
            } catch (err) {
                // Une trace manquée ne doit jamais dégrader le service rendu
                console.error('[TRACE] Consultation non journalisée :', err.message);
            }
        });

        next();
    };
}

/** Cibles courantes, pour éviter de réécrire les résolveurs. */
const cibles = {
    /** Routes du type /:employeeId */
    parParam: (nom = 'employeeId') => (req) => req.params[nom] || null,

    /** Bulletin de paie : l'employé concerné se déduit de la fiche. */
    parBulletin: async (req) => {
        const id = req.params.id;
        if (!id) return null;
        const paie = await prisma.payroll.findUnique({
            where: { id },
            select: { employeeId: true }
        });
        return paie ? paie.employeeId : null;
    }
};

module.exports = { traceAccess, cibles };
