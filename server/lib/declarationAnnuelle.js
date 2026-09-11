const prisma = require('../prismaClient');
const dossier = require('./dossier');
const cloture = require('./cloture');

/**
 * Récapitulatif annuel des salaires : ce que demandent la DISA (CNPS) et
 * l'état annuel des retenues d'ITS (DGI).
 *
 * Il n'existait qu'un récapitulatif mensuel. Le bouton « Export DISA »
 * produisait un fichier par mois — pas par an —, qui reprenait tous les
 * bulletins de toutes les périodes à la suite, et dont la colonne « Num. CNPS »
 * contenait l'identifiant technique du salarié.
 *
 * Ce module agrège les bulletins **enregistrés** de l'année, salarié par
 * salarié. Il ne recalcule rien, et dit ce qui empêcherait une déclaration
 * sincère : bulletins sans décomposition, dossiers sans numéro CNPS, mois non
 * clôturés dont les montants peuvent encore changer, mois sans aucun bulletin.
 *
 * **Le format de dépôt n'est pas reproduit.** Les gabarits de la CNPS et de la
 * DGI ne sont pas connus de l'application ; un fichier qui en imiterait un
 * serait rejeté après l'échéance. Le fichier produit est un état de contrôle
 * et de saisie, et il le dit.
 */

const AVERTISSEMENT_FORMAT = "État de contrôle et de saisie : ce fichier ne reproduit pas le gabarit "
    + "de dépôt de la CNPS ni celui de la DGI. Reporter les montants dans le format demandé par chaque organisme.";

const montant = (x) => Math.round((x || 0) * 100) / 100;

async function recapituler(annee, reference = new Date()) {
    const a = parseInt(annee, 10) || reference.getUTCFullYear();
    const debut = new Date(Date.UTC(a, 0, 1));
    const fin = new Date(Date.UTC(a + 1, 0, 1));

    const fiches = await prisma.payroll.findMany({
        where: { period: { gte: debut, lt: fin } },
        include: { employee: true },
        orderBy: { period: 'asc' }
    });

    const parSalarie = new Map();
    for (const f of fiches) {
        if (!f.employee) continue;
        if (!parSalarie.has(f.employeeId)) {
            parSalarie.set(f.employeeId, {
                salarie: f.employee, mois: new Set(), sansDetail: 0,
                brut: 0, cnpsSalarie: 0, cnpsPatronal: 0, cmu: 0, assietteITS: 0, its: 0, net: 0
            });
        }
        const l = parSalarie.get(f.employeeId);
        l.mois.add(new Date(f.period).toISOString().slice(0, 7));
        if (f.grossSalary == null) l.sansDetail++;
        l.brut += f.grossSalary || 0;
        l.cnpsSalarie += f.cnpsEmployee || 0;
        l.cnpsPatronal += f.employerContributions || 0;
        l.cmu += f.cmu || 0;
        l.assietteITS += f.taxableIncome || 0;
        l.its += f.its || 0;
        l.net += f.netSalary || 0;
    }

    const lignes = [...parSalarie.values()].map((l) => {
        const s = l.salarie;
        return {
            employeeId: s.id,
            nom: s.lastName,
            prenoms: s.firstName,
            matricule: s.matricule || null,
            numeroCnps: s.cnpsNumber || null,
            dateNaissance: s.birthDate || null,
            dateEntree: s.hireDate || null,
            dateSortie: s.exitDate || null,
            moisPayes: l.mois.size,
            mois: [...l.mois].sort(),
            brut: montant(l.brut),
            cnpsSalarie: montant(l.cnpsSalarie),
            cnpsPatronal: montant(l.cnpsPatronal),
            cmu: montant(l.cmu),
            assietteITS: montant(l.assietteITS),
            its: montant(l.its),
            net: montant(l.net),
            bulletinsSansDetail: l.sansDetail,
            declarable: dossier.declarable(s),
            manquants: dossier.declarable(s) ? [] : dossier.manquants(s, 'declaration').map((m) => m.libelle)
        };
    }).sort((x, y) => `${x.nom} ${x.prenoms}`.localeCompare(`${y.nom} ${y.prenoms}`));

    const total = (champ) => montant(lignes.reduce((t, l) => t + l[champ], 0));

    // Mois couverts, clôturés ou non.
    const moisCouverts = [...new Set(lignes.flatMap((l) => l.mois))].sort();
    const etats = await Promise.all(moisCouverts.map((m) => cloture.etat(m)));
    const nonClotures = etats.filter((e) => !e.cloturee).map((e) => e.periode);

    // Mois écoulés de l'année sans aucun bulletin : l'année en cours s'arrête
    // au mois précédent, qui peut ne pas encore être payé.
    const anneeCourante = reference.getUTCFullYear();
    const derniersMois = a < anneeCourante ? 12 : a === anneeCourante ? reference.getUTCMonth() : 0;
    const moisSansBulletin = [];
    for (let m = 1; m <= derniersMois; m++) {
        const cle = `${a}-${String(m).padStart(2, '0')}`;
        if (!moisCouverts.includes(cle)) moisSansBulletin.push(cle);
    }

    const anomalies = [];
    const sansDetail = lignes.reduce((t, l) => t + l.bulletinsSansDetail, 0);
    if (sansDetail > 0) {
        anomalies.push({
            gravite: 'bloquante',
            libelle: `${sansDetail} bulletin(s) sans décomposition des cotisations`,
            consequence: 'Leurs cotisations seraient déclarées à zéro.',
            remede: 'Relancer la paie des mois concernés, ou exécuter npm run repair-payrolls.'
        });
    }
    const nonDeclarables = lignes.filter((l) => !l.declarable);
    if (nonDeclarables.length > 0) {
        anomalies.push({
            gravite: 'bloquante',
            libelle: `${nonDeclarables.length} salarié(s) sans matricule ou sans numéro CNPS`,
            consequence: 'Leur ligne serait rejetée au dépôt.',
            remede: 'Compléter les dossiers depuis Effectif › Conformité.'
        });
    }
    if (nonClotures.length > 0) {
        anomalies.push({
            gravite: 'avertissement',
            libelle: `${nonClotures.length} mois non clôturé(s) : ${nonClotures.join(', ')}`,
            consequence: 'Leurs bulletins peuvent encore être relancés, et les montants changer après dépôt.',
            remede: 'Clôturer ces mois depuis la préparation de la paie avant de déclarer.'
        });
    }
    if (moisSansBulletin.length > 0) {
        anomalies.push({
            gravite: 'avertissement',
            libelle: `${moisSansBulletin.length} mois sans aucun bulletin : ${moisSansBulletin.join(', ')}`,
            consequence: "Les salaires de ces mois manqueraient à la déclaration, s'ils ont été versés hors de l'application.",
            remede: 'Vérifier que la paie de ces mois a bien été produite ici.'
        });
    }

    return {
        annee: a,
        effectif: lignes.length,
        totaux: {
            brut: total('brut'), cnpsSalarie: total('cnpsSalarie'), cnpsPatronal: total('cnpsPatronal'),
            cmu: total('cmu'), assietteITS: total('assietteITS'), its: total('its'), net: total('net')
        },
        moisCouverts,
        anomalies,
        bloquee: anomalies.some((x) => x.gravite === 'bloquante'),
        avertissementFormat: AVERTISSEMENT_FORMAT,
        lignes
    };
}

const cellule = (v) => {
    const texte = v == null ? '' : String(v);
    return /[;"\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte;
};
const date = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '');

/** État annuel au format CSV (séparateur « ; », encodage UTF-8 avec BOM pour Excel). */
function versCsv(recap) {
    const entetes = [
        'Matricule', 'Numéro CNPS', 'Nom', 'Prénoms', 'Date de naissance', "Date d'entrée", 'Date de sortie',
        'Mois payés', 'Salaire brut annuel', 'CNPS part salariale', 'CNPS part patronale', 'CMU',
        'Assiette ITS', 'ITS retenu', 'Net versé'
    ];
    const lignes = recap.lignes.map((l) => [
        l.matricule, l.numeroCnps, l.nom, l.prenoms, date(l.dateNaissance), date(l.dateEntree), date(l.dateSortie),
        l.moisPayes, Math.round(l.brut), Math.round(l.cnpsSalarie), Math.round(l.cnpsPatronal), Math.round(l.cmu),
        Math.round(l.assietteITS), Math.round(l.its), Math.round(l.net)
    ].map(cellule).join(';'));

    return '\uFEFF' + [
        cellule(`Récapitulatif annuel des salaires ${recap.annee} — ${AVERTISSEMENT_FORMAT}`),
        entetes.map(cellule).join(';'),
        ...lignes
    ].join('\r\n') + '\r\n';
}

module.exports = { recapituler, versCsv, AVERTISSEMENT_FORMAT };
