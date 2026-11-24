const prisma = require('../prismaClient');
const paie = require('../lib/paie');

/**
 * Stagiaires et apprentis.
 *
 * Les types de contrat se limitaient à CDI et CDD : un stagiaire était donc
 * soit absent de l'application, soit enregistré comme salarié — et il faussait
 * alors l'effectif, la masse salariale et le seuil des délégués du personnel.
 *
 * **Ce qui les distingue** : une convention tripartite avec l'école, un
 * tuteur, un terme, et une gratification qui n'est pas un salaire.
 *
 * **Ce que l'application ne tranche pas** : le régime fiscal et social de la
 * gratification. Il dépend de son montant et de la nature du stage ; la paie
 * la traite comme une rémunération ordinaire tant que le cabinet n'a pas dit
 * le contraire, et l'écran le signale plutôt que de le taire.
 */

const AVERTISSEMENT_GRATIFICATION =
    "La gratification est traitée comme une rémunération ordinaire (cotisations et impôt). "
    + "Si votre cabinet retient une exonération, le montant doit être ajusté en conséquence : "
    + "l'application ne décide pas seule d'un régime dérogatoire.";

const TYPES = ['STAGE', 'APPRENTISSAGE'];

const vue = (c) => ({
    id: c.id,
    employeeId: c.employeeId,
    nom: `${c.employee.lastName} ${c.employee.firstName}`.trim(),
    typeContrat: c.employee.contractType,
    statut: c.employee.status,
    ecole: c.ecole,
    niveau: c.niveau,
    tuteur: c.tuteur ? `${c.tuteur.firstName} ${c.tuteur.lastName}` : null,
    tuteurId: c.tuteurId,
    debut: c.debut,
    fin: c.fin,
    gratificationMensuelle: c.gratificationMensuelle,
    objet: c.objet,
    jusquAuTerme: Math.round((new Date(c.fin) - Date.now()) / 86400000)
});

exports.lister = async (req, res) => {
    try {
        const conventions = await prisma.conventionStage.findMany({
            orderBy: { fin: 'asc' },
            include: {
                employee: { select: { firstName: true, lastName: true, contractType: true, status: true } },
                tuteur: { select: { firstName: true, lastName: true } }
            }
        });
        const lignes = conventions.map(vue);
        res.json({
            types: TYPES,
            avertissement: AVERTISSEMENT_GRATIFICATION,
            horsEffectif: TYPES,
            enCours: lignes.filter((l) => l.jusquAuTerme >= 0 && l.statut !== 'TERMINATED').length,
            lignes
        });
    } catch (erreur) {
        console.error('[STAGES] Lecture impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des conventions impossible.' });
    }
};

/**
 * Crée ou met à jour la convention, et aligne le type de contrat du salarié :
 * sans cela, un stagiaire resterait compté comme un CDI dans les effectifs.
 */
exports.enregistrer = async (req, res) => {
    try {
        const salarie = await prisma.employee.findUnique({ where: { id: req.params.employeeId } });
        if (!salarie) return res.status(404).json({ error: 'Salarié introuvable.' });

        const typeContrat = TYPES.includes(req.body?.typeContrat) ? req.body.typeContrat : 'STAGE';
        const debut = new Date(req.body?.debut);
        const fin = new Date(req.body?.fin);
        const gratification = Number(req.body?.gratificationMensuelle);

        if (isNaN(debut.getTime()) || isNaN(fin.getTime())) return res.status(400).json({ error: 'Dates de début et de fin requises.' });
        if (fin <= debut) return res.status(400).json({ error: 'Le terme précède le début.' });
        if (!Number.isFinite(gratification) || gratification < 0) return res.status(400).json({ error: 'Gratification invalide.' });
        if (req.body?.tuteurId) {
            if (req.body.tuteurId === salarie.id) return res.status(400).json({ error: 'Le stagiaire ne peut pas être son propre tuteur.' });
            const tuteur = await prisma.employee.findUnique({ where: { id: req.body.tuteurId } });
            if (!tuteur || tuteur.status === 'TERMINATED') return res.status(400).json({ error: 'Tuteur introuvable ou sorti.' });
        }

        const donnees = {
            ecole: String(req.body?.ecole || '').trim() || null,
            niveau: String(req.body?.niveau || '').trim() || null,
            tuteurId: req.body?.tuteurId || null,
            debut,
            fin,
            gratificationMensuelle: gratification,
            objet: String(req.body?.objet || '').trim() || null
        };

        await prisma.$transaction([
            prisma.conventionStage.upsert({
                where: { employeeId: salarie.id },
                create: { ...donnees, employeeId: salarie.id, creePar: req.user?.name || req.user?.email || null },
                update: donnees
            }),
            prisma.employee.update({
                where: { id: salarie.id },
                // La gratification tient lieu de rémunération de référence : la
                // paie doit verser quelque chose, et ce quelque chose est elle.
                data: { contractType: typeContrat, contractEndDate: fin, baseSalary: gratification || salarie.baseSalary }
            })
        ]);

        const net = gratification > 0 ? Math.round(paie.calculerPaie({ baseSalary: gratification }).netSalary) : 0;
        res.status(201).json({
            message: `Convention enregistrée. ${salarie.firstName} compte désormais comme ${typeContrat === 'STAGE' ? 'stagiaire' : 'apprenti'} : `
                + "hors de l'effectif qui déclenche l'élection des délégués.",
            netEstime: net,
            avertissement: AVERTISSEMENT_GRATIFICATION
        });
    } catch (erreur) {
        console.error('[STAGES] Enregistrement impossible :', erreur.message);
        res.status(500).json({ error: 'Enregistrement de la convention impossible.' });
    }
};

exports.supprimer = async (req, res) => {
    try {
        const { count } = await prisma.conventionStage.deleteMany({ where: { employeeId: req.params.employeeId } });
        if (count === 0) return res.status(404).json({ error: 'Aucune convention pour ce salarié.' });
        res.json({ message: 'Convention retirée. Le type de contrat du salarié reste à corriger s\'il est embauché.' });
    } catch (erreur) {
        console.error('[STAGES] Suppression impossible :', erreur.message);
        res.status(500).json({ error: 'Suppression impossible.' });
    }
};

exports.TYPES = TYPES;
exports.AVERTISSEMENT_GRATIFICATION = AVERTISSEMENT_GRATIFICATION;
