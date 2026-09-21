const prisma = require('../prismaClient');
const virement = require('../lib/virement');
const journal = require('../lib/journal');

/**
 * Lots de virement : préparation, émission, annulation, et formats bancaires.
 *
 * L'émission est le seul endroit de l'application qui pose `PAID` sur un
 * bulletin. Elle est donc tracée, et réversible tant que la banque n'a pas
 * exécuté : annuler un lot rend les bulletins à l'état approuvé.
 */

const PERIODE = /^\d{4}-(0[1-9]|1[0-2])$/;

exports.formats = async (req, res) => {
    try {
        const formats = await prisma.formatVirement.findMany({ orderBy: { creeLe: 'asc' } });
        res.json({ champs: virement.CHAMPS, formatParDefaut: virement.FORMAT_PAR_DEFAUT, formats });
    } catch (erreur) {
        console.error('[VIREMENT] Lecture des formats impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des formats impossible.' });
    }
};

exports.enregistrerFormat = async (req, res) => {
    try {
        const nom = String(req.body?.nom || '').trim();
        const colonnes = req.body?.colonnes;
        if (nom.length < 2) return res.status(400).json({ error: 'Donner un nom au format.' });
        if (!Array.isArray(colonnes) || colonnes.length === 0) {
            return res.status(400).json({ error: 'Décrire au moins une colonne.' });
        }
        const inconnu = colonnes.find((c) => !virement.CHAMPS[c?.champ]);
        if (inconnu) return res.status(400).json({ error: `Champ inconnu : « ${inconnu.champ} ».` });

        const donnees = {
            type: req.body?.type === 'FIXE' ? 'FIXE' : 'CSV',
            separateur: String(req.body?.separateur ?? ';').slice(0, 3),
            extension: String(req.body?.extension || 'csv').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'csv',
            colonnes,
            entete: req.body?.entete ?? { inclure: true },
            pied: req.body?.pied ?? null,
            actif: req.body?.actif !== false
        };
        const format = await prisma.formatVirement.upsert({
            where: { nom },
            create: { nom, ...donnees, creePar: req.user?.name || req.user?.email || null },
            update: donnees
        });
        res.status(201).json({ format, message: 'Format enregistré. Produisez un lot d\'essai avant de le remettre à la banque.' });
    } catch (erreur) {
        console.error('[VIREMENT] Format non enregistré :', erreur.message);
        res.status(500).json({ error: 'Enregistrement du format impossible.' });
    }
};

/** Ce que contiendrait le lot, sans rien créer. */
exports.preparation = async (req, res) => {
    try {
        const periode = String(req.query.periode || '');
        if (!PERIODE.test(periode)) return res.status(400).json({ error: 'Période attendue au format AAAA-MM.' });
        res.json(await virement.preparer(periode));
    } catch (erreur) {
        console.error('[VIREMENT] Préparation impossible :', erreur.message);
        res.status(500).json({ error: 'Préparation impossible.' });
    }
};

exports.lister = async (req, res) => {
    try {
        const lots = await prisma.lotVirement.findMany({
            orderBy: { creeLe: 'desc' },
            take: 50,
            include: { _count: { select: { lignes: true } } }
        });
        res.json(lots.map((l) => ({
            id: l.id, periode: l.periode, statut: l.statut, format: l.formatNom,
            nombreLignes: l.nombreLignes, montantTotal: l.montantTotal, empreinte: l.empreinte,
            creeLe: l.creeLe, creePar: l.creePar, emisLe: l.emisLe, emisPar: l.emisPar,
            annuleLe: l.annuleLe, annuleMotif: l.annuleMotif
        })));
    } catch (erreur) {
        console.error('[VIREMENT] Lecture des lots impossible :', erreur.message);
        res.status(500).json({ error: 'Lecture des lots impossible.' });
    }
};

exports.creer = async (req, res) => {
    try {
        const periode = String(req.body?.periode || '');
        if (!PERIODE.test(periode)) return res.status(400).json({ error: 'Période attendue au format AAAA-MM.' });

        const enCours = await prisma.lotVirement.findFirst({ where: { periode, statut: { in: ['PREPARE', 'EMIS'] } } });
        if (enCours) {
            return res.status(409).json({
                error: `Un lot ${enCours.statut === 'EMIS' ? 'a déjà été émis' : 'est déjà préparé'} pour ${periode}.`,
                lotId: enCours.id
            });
        }

        const format = req.body?.formatId
            ? await prisma.formatVirement.findUnique({ where: { id: req.body.formatId } })
            : null;
        if (req.body?.formatId && !format) return res.status(400).json({ error: 'Format introuvable.' });

        const preparation = await virement.preparer(periode);
        if (preparation.lignes.length === 0) {
            return res.status(409).json({ error: 'Aucun bulletin payable pour cette période.', ecartes: preparation.ecartes });
        }

        const lot = await prisma.lotVirement.create({
            data: {
                periode,
                formatId: format?.id || null,
                formatNom: format?.nom || virement.FORMAT_PAR_DEFAUT.nom,
                nombreLignes: preparation.totaux.lignes,
                montantTotal: preparation.totaux.montant,
                creePar: req.user?.name || req.user?.email || null,
                lignes: {
                    create: preparation.lignes.map((l) => ({
                        employeeId: l.employeeId, payrollId: l.payrollId, nom: l.nom,
                        banque: l.banque, compte: l.compte, montant: l.montant, reference: l.reference
                    }))
                }
            }
        });

        res.status(201).json({
            lot,
            ecartes: preparation.ecartes,
            comptesPartages: preparation.comptesPartages,
            message: `Lot préparé : ${preparation.totaux.lignes} virement(s) pour ${preparation.totaux.montant} FCFA. `
                + 'Téléchargez le fichier, remettez-le à la banque, puis marquez le lot émis.'
        });
    } catch (erreur) {
        console.error('[VIREMENT] Création impossible :', erreur.message);
        res.status(500).json({ error: 'Création du lot impossible.' });
    }
};

async function contenuDuLot(id) {
    const lot = await prisma.lotVirement.findUnique({
        where: { id },
        include: { format: true, lignes: { orderBy: { nom: 'asc' }, include: { employee: { select: { matricule: true } } } } }
    });
    if (!lot) return null;
    const fichier = virement.produire(
        lot.format || null,
        lot.lignes.map((l) => ({ ...l, matricule: l.employee?.matricule || null })),
        { periode: lot.periode, donneur: (await prisma.identiteEntreprise.findUnique({ where: { id: 'principale' } }))?.nomCommercial || undefined }
    );
    return { lot, fichier };
}

exports.fichier = async (req, res) => {
    try {
        const resultat = await contenuDuLot(req.params.id);
        if (!resultat) return res.status(404).json({ error: 'Lot introuvable.' });
        const { lot, fichier } = resultat;

        // L'empreinte est figée à la première production : elle prouve que le
        // fichier remis à la banque est bien celui que l'application a produit.
        if (!lot.empreinte) {
            await prisma.lotVirement.update({ where: { id: lot.id }, data: { empreinte: fichier.empreinte } });
        }
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fichier.nomFichier}"`);
        res.send(fichier.contenu);
    } catch (erreur) {
        console.error('[VIREMENT] Fichier indisponible :', erreur.message);
        res.status(500).json({ error: 'Production du fichier impossible.' });
    }
};

/** Marque le lot émis : c'est ici, et nulle part ailleurs, que `PAID` est posé. */
exports.emettre = async (req, res) => {
    try {
        const lot = await prisma.lotVirement.findUnique({ where: { id: req.params.id }, include: { lignes: true } });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable.' });
        if (lot.statut !== 'PREPARE') return res.status(409).json({ error: `Ce lot est déjà ${lot.statut === 'EMIS' ? 'émis' : 'annulé'}.` });

        const auteur = req.user?.name || req.user?.email || null;
        const bulletins = lot.lignes.map((l) => l.payrollId).filter(Boolean);
        await prisma.$transaction([
            prisma.payroll.updateMany({ where: { id: { in: bulletins } }, data: { status: 'PAID' } }),
            prisma.lotVirement.update({ where: { id: lot.id }, data: { statut: 'EMIS', emisLe: new Date(), emisPar: auteur } })
        ]);

        journal.ecrireSansAttendre({
            userId: req.user?.id || auteur || 'INCONNU',
            action: 'VIREMENT_EMIS',
            tableName: 'LotVirement',
            recordId: lot.id,
            newData: JSON.stringify({ periode: lot.periode, lignes: lot.nombreLignes, montant: lot.montantTotal }),
            ipAddress: req.ip
        });

        res.json({ message: `Lot émis : ${bulletins.length} bulletin(s) passent au statut « payé ».` });
    } catch (erreur) {
        console.error('[VIREMENT] Émission impossible :', erreur.message);
        res.status(500).json({ error: 'Émission impossible.' });
    }
};

exports.annuler = async (req, res) => {
    try {
        const motif = String(req.body?.motif || '').trim();
        if (motif.length < 5) return res.status(400).json({ error: "Indiquer le motif de l'annulation." });
        const lot = await prisma.lotVirement.findUnique({ where: { id: req.params.id }, include: { lignes: true } });
        if (!lot) return res.status(404).json({ error: 'Lot introuvable.' });
        if (lot.statut === 'ANNULE') return res.status(409).json({ error: 'Ce lot est déjà annulé.' });

        const auteur = req.user?.name || req.user?.email || null;
        const bulletins = lot.lignes.map((l) => l.payrollId).filter(Boolean);
        await prisma.$transaction([
            // Les bulletins repassent à « approuvé » : ils n'ont pas été payés.
            prisma.payroll.updateMany({ where: { id: { in: bulletins }, status: 'PAID' }, data: { status: 'APPROVED' } }),
            prisma.lotVirement.update({ where: { id: lot.id }, data: { statut: 'ANNULE', annuleLe: new Date(), annuleMotif: motif } })
        ]);

        journal.ecrireSansAttendre({
            userId: req.user?.id || auteur || 'INCONNU',
            action: 'VIREMENT_ANNULE',
            tableName: 'LotVirement',
            recordId: lot.id,
            newData: JSON.stringify({ periode: lot.periode, motif }),
            ipAddress: req.ip
        });

        res.json({ message: 'Lot annulé : les bulletins redeviennent approuvés. Prévenez la banque si le fichier lui a été remis.' });
    } catch (erreur) {
        console.error('[VIREMENT] Annulation impossible :', erreur.message);
        res.status(500).json({ error: 'Annulation impossible.' });
    }
};
