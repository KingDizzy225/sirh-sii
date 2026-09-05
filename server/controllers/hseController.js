/**
 * Santé, sécurité et conditions de travail.
 *
 * La page HSE tenait son registre d'accidents et son suivi de visites médicales
 * dans des tableaux écrits en dur : on pouvait déclarer un accident, il
 * disparaissait au rechargement. Or le registre est un document que
 * l'inspection du travail peut demander, et un accident du travail se déclare à
 * la CNPS dans un délai contraint.
 *
 * Le volet médical ne stocke rien de nouveau : il lit les `MedicalRecord` déjà
 * saisis dans le module de médecine du travail et n'en donne que la lecture qui
 * manquait — qui est en retard, qui approche de l'échéance. Dupliquer la saisie
 * aurait recréé le doublon de modules déjà corrigé une fois.
 */

const prisma = require('../prismaClient');

/**
 * Délai de déclaration d'un accident du travail à la CNPS, en heures.
 * Surchargeable : le délai réglementaire doit être confirmé par le service
 * juridique de l'entreprise, et ne pas être figé dans le code.
 */
const DELAI_DECLARATION_H = parseInt(process.env.DELAI_DECLARATION_CNPS_H, 10) || 48;

const TYPES = ['Accident du travail', 'Accident de trajet', 'Presque-accident', 'Maladie professionnelle'];
const GRAVITES = ['Mineur', 'Majeur', 'Grave'];
const STATUTS = ['Déclaré', 'Enquête en cours', 'Clos'];

const nomComplet = (e) => e ? `${e.firstName || ''} ${e.lastName || ''}`.trim() : 'Salarié inconnu';

/** Référence lisible et ordonnée : AT-2026-001. */
async function prochaineReference(annee) {
    const debut = new Date(Date.UTC(annee, 0, 1));
    const fin = new Date(Date.UTC(annee + 1, 0, 1));
    const compte = await prisma.workAccident.count({
        where: { occurredAt: { gte: debut, lt: fin } }
    });
    return `AT-${annee}-${String(compte + 1).padStart(3, '0')}`;
}

/**
 * Un accident du travail non encore déclaré dont le délai est écoulé.
 * Les presque-accidents ne se déclarent pas : les compter parmi les retards
 * ferait paraître l'entreprise en faute pour avoir justement signalé un
 * événement sans conséquence.
 */
const declarationEnRetard = (a) => {
    if (a.type === 'Presque-accident' || a.declaredToCnps) return false;
    const limite = new Date(a.occurredAt).getTime() + DELAI_DECLARATION_H * 3600 * 1000;
    return Date.now() > limite;
};

const presenter = (a) => ({
    id: a.id,
    reference: a.reference,
    employeeId: a.employeeId,
    salarie: nomComplet(a.employee),
    service: a.employee?.department || null,
    survenuLe: a.occurredAt,
    lieu: a.location,
    type: a.type,
    gravite: a.severity,
    description: a.description,
    joursArret: a.daysOff,
    declareCnps: a.declaredToCnps,
    declareLe: a.declaredAt,
    mesureCorrective: a.correctiveAction,
    statut: a.status,
    declarationEnRetard: declarationEnRetard(a)
});

/**
 * GET /api/hse/accidents
 * Registre complet, avec les indicateurs de la période.
 */
exports.getAccidents = async (req, res) => {
    try {
        const annee = parseInt(req.query.annee, 10) || new Date().getUTCFullYear();
        const debut = new Date(Date.UTC(annee, 0, 1));
        const fin = new Date(Date.UTC(annee + 1, 0, 1));

        const [accidents, effectif] = await Promise.all([
            prisma.workAccident.findMany({
                where: { occurredAt: { gte: debut, lt: fin } },
                include: { employee: { select: { firstName: true, lastName: true, department: true } } },
                orderBy: { occurredAt: 'desc' }
            }),
            prisma.employee.count({ where: { status: 'ACTIVE' } })
        ]);

        const registre = accidents.map(presenter);
        const avecArret = registre.filter(a => a.type !== 'Presque-accident' && a.joursArret > 0);
        const joursPerdus = registre.reduce((s, a) => s + (a.joursArret || 0), 0);

        // Heures travaillées théoriques : effectif × 173,33 h × mois écoulés.
        // Approximation assumée — le pointage réel ne couvre pas tout l'effectif —
        // qui sert à situer un ordre de grandeur, pas à produire un chiffre
        // opposable. Les taux valent null tant qu'aucune heure n'est cumulée.
        const moisEcoulés = annee === new Date().getUTCFullYear()
            ? new Date().getUTCMonth() + 1 : 12;
        const heures = effectif * 173.33 * moisEcoulés;
        const arrondi = (x) => Math.round(x * 100) / 100;

        res.json({
            annee,
            registre,
            indicateurs: {
                total: registre.length,
                parType: TYPES.reduce((acc, t) => ({ ...acc, [t]: registre.filter(a => a.type === t).length }), {}),
                parGravite: GRAVITES.reduce((acc, g) => ({ ...acc, [g]: registre.filter(a => a.gravite === g).length }), {}),
                avecArret: avecArret.length,
                joursPerdus,
                declarationsEnRetard: registre.filter(a => a.declarationEnRetard).length,
                // Indicateurs normalisés de la sécurité au travail.
                tauxFrequence: heures > 0 ? arrondi((avecArret.length * 1000000) / heures) : null,
                tauxGravite: heures > 0 ? arrondi((joursPerdus * 1000) / heures) : null,
                baseHeuresTheoriques: Math.round(heures),
                effectifActif: effectif
            },
            delaiDeclarationHeures: DELAI_DECLARATION_H
        });
    } catch (error) {
        console.error('Erreur registre HSE :', error);
        res.status(500).json({ error: 'Erreur lors du chargement du registre des accidents.' });
    }
};

/** POST /api/hse/accidents */
exports.createAccident = async (req, res) => {
    try {
        const { employeeId, occurredAt, location, type, severity, description, daysOff,
                declaredToCnps, correctiveAction } = req.body;

        const manquants = [];
        if (!employeeId) manquants.push('employeeId');
        if (!occurredAt) manquants.push('occurredAt');
        if (!location || !String(location).trim()) manquants.push('location');
        if (!description || !String(description).trim()) manquants.push('description');
        if (manquants.length > 0) {
            return res.status(400).json({ error: `Champ(s) obligatoire(s) manquant(s) : ${manquants.join(', ')}.` });
        }
        if (!TYPES.includes(type)) {
            return res.status(400).json({ error: `Type « ${type} » inconnu. Valeurs : ${TYPES.join(', ')}.` });
        }
        if (!GRAVITES.includes(severity)) {
            return res.status(400).json({ error: `Gravité « ${severity} » inconnue. Valeurs : ${GRAVITES.join(', ')}.` });
        }

        const date = new Date(occurredAt);
        if (Number.isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Date de survenue invalide.' });
        }
        // Un accident ne se déclare pas à l'avance : une date future signale
        // presque toujours une saisie erronée, et fausserait les délais.
        if (date.getTime() > Date.now()) {
            return res.status(400).json({ error: 'La date de survenue ne peut pas être dans le futur.' });
        }

        const salarie = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const jours = Math.max(parseInt(daysOff, 10) || 0, 0);
        const declare = declaredToCnps === true;

        const accident = await prisma.workAccident.create({
            data: {
                employeeId,
                reference: await prochaineReference(date.getUTCFullYear()),
                occurredAt: date,
                location: String(location).trim(),
                type,
                severity,
                description: String(description).trim(),
                daysOff: jours,
                declaredToCnps: declare,
                declaredAt: declare ? new Date() : null,
                correctiveAction: correctiveAction ? String(correctiveAction).trim() : null,
                reportedBy: req.user?.name || req.user?.email || null,
                status: 'Déclaré'
            },
            include: { employee: { select: { firstName: true, lastName: true, department: true } } }
        });

        res.status(201).json(presenter(accident));
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Une référence identique existe déjà, veuillez réessayer.' });
        }
        console.error('Erreur création accident :', error);
        res.status(500).json({ error: "Erreur lors de l'enregistrement de l'accident." });
    }
};

/** PATCH /api/hse/accidents/:id — suivi : déclaration, mesures, clôture. */
exports.updateAccident = async (req, res) => {
    try {
        const { id } = req.params;
        const { declaredToCnps, correctiveAction, status, daysOff } = req.body;

        const existant = await prisma.workAccident.findUnique({ where: { id } });
        if (!existant) return res.status(404).json({ error: 'Accident introuvable.' });

        if (status !== undefined && !STATUTS.includes(status)) {
            return res.status(400).json({ error: `Statut « ${status} » inconnu. Valeurs : ${STATUTS.join(', ')}.` });
        }

        const data = {};
        if (status !== undefined) data.status = status;
        if (correctiveAction !== undefined) data.correctiveAction = correctiveAction || null;
        if (daysOff !== undefined) data.daysOff = Math.max(parseInt(daysOff, 10) || 0, 0);
        if (declaredToCnps !== undefined) {
            data.declaredToCnps = declaredToCnps === true;
            // La date de déclaration n'est posée qu'au passage à « déclaré », et
            // conservée ensuite : la réécrire ferait perdre la trace du moment
            // où l'obligation a réellement été satisfaite.
            if (declaredToCnps === true && !existant.declaredToCnps) data.declaredAt = new Date();
            if (declaredToCnps === false) data.declaredAt = null;
        }

        const misAJour = await prisma.workAccident.update({
            where: { id }, data,
            include: { employee: { select: { firstName: true, lastName: true, department: true } } }
        });
        res.json(presenter(misAJour));
    } catch (error) {
        console.error('Erreur mise à jour accident :', error);
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'accident." });
    }
};

/**
 * GET /api/hse/visites
 *
 * Conformité des visites médicales, à partir des dossiers déjà saisis dans le
 * module de médecine du travail. Aucune saisie n'est proposée ici : c'est la
 * lecture qui manquait, pas un second endroit où enregistrer.
 */
exports.getSuiviVisites = async (req, res) => {
    try {
        const jours = parseInt(req.query.jours, 10) || 60;
        const maintenant = new Date();
        const horizon = new Date(maintenant.getTime() + jours * 86400000);

        const [salaries, dossiers] = await Promise.all([
            prisma.employee.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true, firstName: true, lastName: true, department: true, hireDate: true }
            }),
            prisma.medicalRecord.findMany({
                orderBy: { visitDate: 'desc' },
                select: {
                    id: true, employeeId: true, visitType: true, visitDate: true,
                    doctorName: true, aptitudeStatus: true, nextCheckupDate: true
                }
            })
        ]);

        // Seul le dossier le plus récent fait foi pour l'échéance.
        const dernier = new Map();
        for (const d of dossiers) if (!dernier.has(d.employeeId)) dernier.set(d.employeeId, d);

        const suivi = salaries.map(s => {
            const d = dernier.get(s.id) || null;
            const echeance = d?.nextCheckupDate ? new Date(d.nextCheckupDate) : null;

            let etat = 'A_JOUR';
            let joursRestants = null;
            if (!d) {
                // Un salarié sans aucun dossier n'est pas « à jour » : il est
                // hors suivi, ce qui est le cas le plus préoccupant et
                // disparaissait dans un simple décompte d'échéances.
                etat = 'JAMAIS_VU';
            } else if (!echeance) {
                etat = 'SANS_ECHEANCE';
            } else {
                joursRestants = Math.ceil((echeance - maintenant) / 86400000);
                if (echeance < maintenant) etat = 'DEPASSEE';
                else if (echeance <= horizon) etat = 'PROCHE';
            }

            return {
                employeeId: s.id,
                salarie: nomComplet(s),
                service: s.department,
                derniereVisite: d?.visitDate || null,
                typeVisite: d?.visitType || null,
                medecin: d?.doctorName || null,
                aptitude: d?.aptitudeStatus || null,
                prochaineEcheance: d?.nextCheckupDate || null,
                joursRestants,
                etat
            };
        });

        const compter = (e) => suivi.filter(s => s.etat === e).length;
        res.json({
            horizonJours: jours,
            suivi: suivi.sort((a, b) => {
                const ordre = { DEPASSEE: 0, JAMAIS_VU: 1, PROCHE: 2, SANS_ECHEANCE: 3, A_JOUR: 4 };
                return ordre[a.etat] - ordre[b.etat];
            }),
            indicateurs: {
                effectif: salaries.length,
                depassees: compter('DEPASSEE'),
                jamaisVus: compter('JAMAIS_VU'),
                proches: compter('PROCHE'),
                sansEcheance: compter('SANS_ECHEANCE'),
                aJour: compter('A_JOUR')
            }
        });
    } catch (error) {
        console.error('Erreur suivi des visites :', error);
        res.status(500).json({ error: 'Erreur lors du chargement du suivi des visites médicales.' });
    }
};
