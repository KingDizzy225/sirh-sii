const crypto = require('crypto');
const prisma = require('../prismaClient');
const apposition = require('../lib/apposition');
const finContrat = require('../lib/finContrat');
const soldeToutCompte = require('../lib/soldeToutCompte');
const historique = require('../lib/historique');

/**
 * Émission des documents de fin de contrat.
 *
 * Les lettres de rupture annonçaient trois pièces que rien ne produisait. Elles
 * le sont désormais ici, signées et scellées comme les autres documents émis :
 * inscrites au registre, porteuses d'un QR de vérification, révocables.
 *
 * Une règle tenue partout dans ce fichier : **aucun document n'est produit sur
 * une donnée manquante**. Un certificat de travail sans date de sortie, une
 * attestation portant une date inventée ou un reçu établi sur un décompte non
 * arrêté ressemblent à des documents et n'en sont pas. Le refus dit ce qui
 * manque ; c'est plus utile qu'un PDF à jeter.
 */

/** Enregistre le document au registre et renvoie l'entrée créée. */
async function inscrire(type, employee, req) {
    return prisma.issuedDocument.create({
        data: {
            token: crypto.randomBytes(24).toString('hex'),
            type,
            employeeId: employee.id,
            issuedByEmail: req.user && req.user.email ? req.user.email : null,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            positionTitle: employee.positionTitle || employee.role,
            department: employee.department,
            hireDate: employee.hireDate
        }
    });
}

/** Envoie le PDF produit, signé et scellé. */
async function envoyer(res, req, { produit, employee, registre, typeDocument, nomFichier }) {
    const signataire = await apposition.choisirSignataire(req.query.signataireId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nomFichier}`);
    produit.doc.pipe(res);

    await apposition.apposer(produit.doc, {
        signataire,
        registre,
        employe: employee,
        typeDocument
    });

    produit.doc.fontSize(7).fillColor('#94a3b8')
        .text(`Référence : ${registre.token.slice(0, 12).toUpperCase()}`, 400, 760);

    produit.doc.end();
}

/** Salarié et contrôle commun aux trois pièces. */
async function chargerSortant(employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) return { erreur: { code: 404, message: 'Employé introuvable.' } };
    if (!employee.exitDate) {
        return {
            erreur: {
                code: 409,
                message:
                    "La date de sortie n'est pas renseignée pour ce salarié. Les documents de " +
                    "fin de contrat attestent de la fin d'un contrat : les produire sans cette " +
                    'date reviendrait à certifier un fait inconnu.'
            }
        };
    }
    return { employee };
}

/**
 * GET /api/offboarding/:employeeId/certificat-travail
 *
 * Dû à toute sortie, quelle qu'en soit la cause. Les emplois occupés viennent
 * de l'historisation quand elle existe : un salarié promu y retrouve ses deux
 * postes, au lieu du seul dernier que porte sa fiche.
 */
exports.certificatTravail = async (req, res) => {
    try {
        const { employee, erreur } = await chargerSortant(req.params.employeeId);
        if (erreur) return res.status(erreur.code).json({ error: erreur.message });

        const { segments } = await historique.parcours(employee.id);
        const emplois = segments
            .slice()
            .sort((a, b) => new Date(a.effectiveFrom) - new Date(b.effectiveFrom))
            .filter((s) => s.positionTitle)
            .map((s) => ({
                poste: s.positionTitle,
                departement: s.department,
                du: s.effectiveFrom,
                au: s.effectiveTo
            }));

        const registre = await inscrire('CERTIFICAT_TRAVAIL', employee, req);

        // Ni le motif ni la nature de la rupture ne sont transmis : le
        // certificat n'a pas à les porter, et ne pas les passer vaut mieux que
        // de compter sur le fait qu'on ne les affichera pas.
        const produit = finContrat.certificatTravail({
            salarie: {
                nom: `${employee.firstName} ${employee.lastName}`,
                dateNaissance: employee.birthDate,
                dateEmbauche: employee.hireDate,
                dateSortie: employee.exitDate,
                poste: employee.positionTitle,
                departement: employee.department
            },
            emplois
        });

        await envoyer(res, req, {
            produit, employee, registre,
            typeDocument: 'Certificat de travail',
            nomFichier: `certificat_travail_${employee.lastName}.pdf`
        });
    } catch (error) {
        console.error('Erreur génération du certificat de travail :', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors de la génération du certificat de travail.' });
        }
    }
};

/**
 * GET /api/offboarding/:employeeId/attestation-cessation
 *
 * Celle-ci porte les identifiants et la cause de la cessation, que réclament
 * la caisse et l'administration. C'est ce qui la distingue du certificat.
 */
exports.attestationCessation = async (req, res) => {
    try {
        const { employee, erreur } = await chargerSortant(req.params.employeeId);
        if (erreur) return res.status(erreur.code).json({ error: erreur.message });

        const procedure = await prisma.procedure.findFirst({
            where: { employeeId: employee.id, statut: 'CLOTUREE' },
            orderBy: { clotureeLe: 'desc' },
            select: { type: true }
        });

        const registre = await inscrire('ATTESTATION_CESSATION', employee, req);

        const produit = finContrat.attestationCessation({
            salarie: {
                nom: `${employee.firstName} ${employee.lastName}`,
                matricule: employee.matricule,
                cnps: employee.cnpsNumber,
                dateEmbauche: employee.hireDate,
                dateSortie: employee.exitDate,
                poste: employee.positionTitle,
                typeContrat: employee.contractType
            },
            rupture: procedure ? { nature: procedure.type } : null
        });

        await envoyer(res, req, {
            produit, employee, registre,
            typeDocument: "Attestation de cessation d'emploi",
            nomFichier: `attestation_cessation_${employee.lastName}.pdf`
        });
    } catch (error) {
        console.error("Erreur génération de l'attestation de cessation :", error);
        if (!res.headersSent) {
            res.status(500).json({ error: "Erreur lors de la génération de l'attestation." });
        }
    }
};

/**
 * POST /api/offboarding/:employeeId/solde/arreter
 *
 * Fige le décompte. Tant qu'il ne l'est pas, aucun reçu n'est produit : un
 * document signé par le salarié ne peut pas reposer sur un calcul qui suivrait
 * la base au jour le jour.
 */
exports.arreterSolde = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { observations } = req.body || {};

        const resultat = await soldeToutCompte.arreter(employeeId, {
            par: req.user && (req.user.name || req.user.email) ? (req.user.name || req.user.email) : null,
            observations
        });

        res.status(201).json({
            arrete: {
                arreteLe: resultat.arrete.arreteLe,
                arretePar: resultat.arrete.arretePar,
                netArrete: resultat.arrete.netArrete,
                observations: resultat.arrete.observations
            },
            recusRevoques: resultat.revoques,
            message: resultat.revoques > 0
                ? `Décompte arrêté. ${resultat.revoques} reçu(s) précédemment émis ont été révoqués : ` +
                  'toute vérification les signalera désormais comme invalides.'
                : 'Décompte arrêté. Le reçu peut être édité.'
        });
    } catch (error) {
        if (error.code === 'INTROUVABLE') return res.status(404).json({ error: error.message });
        if (error.code === 'INCOMPLET') {
            return res.status(409).json({ error: error.message, empechements: error.empechements });
        }
        console.error('Erreur arrêté du solde de tout compte :', error);
        res.status(500).json({ error: "Erreur lors de l'arrêté du décompte." });
    }
};

/** GET /api/offboarding/:employeeId/solde/arrete — état de l'arrêté, pour l'écran. */
exports.lireArreteSolde = async (req, res) => {
    try {
        const arrete = await soldeToutCompte.lireArrete(req.params.employeeId);
        if (!arrete) return res.json({ arrete: null });

        res.json({
            arrete: {
                arreteLe: arrete.arreteLe,
                arretePar: arrete.arretePar,
                dateSortie: arrete.dateSortie,
                netArrete: arrete.netArrete,
                observations: arrete.observations,
                remisLe: arrete.remisLe
            },
            lignes: arrete.detail ? arrete.detail.lignes : []
        });
    } catch (error) {
        console.error('Erreur lecture du décompte arrêté :', error);
        res.status(500).json({ error: 'Erreur lors de la lecture du décompte arrêté.' });
    }
};

/**
 * GET /api/offboarding/:employeeId/solde/recu
 *
 * Produit depuis l'arrêté conservé, jamais d'un nouveau calcul.
 */
exports.recuSolde = async (req, res) => {
    try {
        const { employee, erreur } = await chargerSortant(req.params.employeeId);
        if (erreur) return res.status(erreur.code).json({ error: erreur.message });

        const arrete = await soldeToutCompte.lireArrete(employee.id);
        if (!arrete) {
            return res.status(409).json({
                error:
                    "Le décompte de ce salarié n'a pas été arrêté. Un reçu pour solde de tout " +
                    'compte fait décharge : il doit porter des montants figés, et non un calcul ' +
                    "refait à l'impression."
            });
        }
        if (!arrete.detail) {
            return res.status(500).json({
                error: 'Le détail du décompte arrêté est illisible. Reprendre l\'arrêté avant d\'éditer le reçu.'
            });
        }

        const registre = await inscrire('RECU_SOLDE_TOUT_COMPTE', employee, req);

        const produit = finContrat.recuSoldeToutCompte({
            salarie: {
                nom: `${employee.firstName} ${employee.lastName}`,
                dateEmbauche: employee.hireDate,
                dateSortie: employee.exitDate
            },
            arrete,
            detail: arrete.detail
        });

        await envoyer(res, req, {
            produit, employee, registre,
            typeDocument: 'Reçu pour solde de tout compte',
            nomFichier: `recu_solde_${employee.lastName}.pdf`
        });
    } catch (error) {
        console.error('Erreur génération du reçu pour solde de tout compte :', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur lors de la génération du reçu.' });
        }
    }
};
