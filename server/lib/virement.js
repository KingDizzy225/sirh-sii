const crypto = require('crypto');
const prisma = require('../prismaClient');
const identite = require('./identite');

/**
 * Lot de virements : l'ordre de paiement remis à la banque.
 *
 * C'était le dernier grand trou : rien ne produisait d'ordre de paiement, et
 * le statut `PAID` d'un bulletin n'était jamais posé par personne. La paie
 * s'arrêtait au bulletin, le virement se faisait ailleurs, et l'application ne
 * savait pas qui avait été payé.
 *
 * **Le format n'est pas codé, il est décrit.** Chaque banque a le sien. Un
 * format est une liste de colonnes — champ, titre, largeur, alignement — que
 * la RH saisit une fois. Le jour où la banque remet sa spécification, c'est
 * cette description qu'on modifie, pas le programme.
 */

/** Champs qu'une colonne peut porter. */
const CHAMPS = {
    nom: 'Nom du bénéficiaire',
    compte: 'Numéro de compte',
    banque: 'Banque',
    montant: 'Montant',
    reference: 'Référence',
    periode: 'Période de paie',
    matricule: 'Matricule',
    donneur: "Nom de l'entreprise"
};

/** Format de repli, tant que la banque n'a pas remis le sien. */
const FORMAT_PAR_DEFAUT = {
    nom: 'CSV générique',
    type: 'CSV',
    separateur: ';',
    extension: 'csv',
    colonnes: [
        { champ: 'nom', titre: 'Beneficiaire' },
        { champ: 'banque', titre: 'Banque' },
        { champ: 'compte', titre: 'Compte' },
        { champ: 'montant', titre: 'Montant', format: 'ENTIER' },
        { champ: 'reference', titre: 'Reference' }
    ],
    entete: { inclure: true }
};

const sansAccent = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Une valeur de colonne, mise en forme selon la description. */
function valeur(colonne, ligne, contexte) {
    const brut = {
        nom: ligne.nom,
        compte: ligne.compte,
        banque: ligne.banque,
        montant: ligne.montant,
        reference: ligne.reference,
        matricule: ligne.matricule,
        periode: contexte.periode,
        donneur: contexte.donneur
    }[colonne.champ];

    if (colonne.format === 'ENTIER') return String(Math.round(Number(brut) || 0));
    if (colonne.format === 'CENTIMES') return String(Math.round((Number(brut) || 0) * 100));
    if (colonne.format === 'SANS_ACCENT') return sansAccent(brut);
    if (colonne.format === 'SANS_ESPACE') return String(brut ?? '').replace(/\s+/g, '');
    return brut === null || brut === undefined ? '' : String(brut);
}

/** Cale une valeur à la largeur voulue, pour les formats à colonnes fixes. */
function caler(texte, colonne) {
    const largeur = Number(colonne.largeur);
    if (!Number.isFinite(largeur) || largeur <= 0) return texte;
    const coupe = texte.slice(0, largeur);
    const remplissage = colonne.remplissage ?? (colonne.alignement === 'DROITE' ? '0' : ' ');
    return colonne.alignement === 'DROITE'
        ? coupe.padStart(largeur, remplissage)
        : coupe.padEnd(largeur, remplissage);
}

/**
 * Produit le fichier. Fonction pure : elle ne lit ni base ni disque, et se
 * vérifie donc sur un jeu de lignes connu.
 */
function produire(format, lignes, contexte = {}) {
    const description = format || FORMAT_PAR_DEFAUT;
    const colonnes = Array.isArray(description.colonnes) && description.colonnes.length
        ? description.colonnes
        : FORMAT_PAR_DEFAUT.colonnes;
    const fixe = description.type === 'FIXE';
    const separateur = fixe ? '' : (description.separateur || ';');

    const echapper = (texte) => {
        if (fixe) return texte;
        return separateur && (texte.includes(separateur) || texte.includes('"') || texte.includes('\n'))
            ? `"${texte.replace(/"/g, '""')}"`
            : texte;
    };

    const rangees = [];
    if (!fixe && description.entete?.inclure !== false) {
        rangees.push(colonnes.map((c) => echapper(c.titre || c.champ)).join(separateur));
    }
    for (const ligne of lignes) {
        rangees.push(colonnes.map((c) => echapper(caler(valeur(c, ligne, contexte), c))).join(separateur));
    }
    if (description.pied?.inclure) {
        const total = lignes.reduce((s, l) => s + (Number(l.montant) || 0), 0);
        rangees.push([description.pied.marque || 'TOTAL', String(lignes.length), String(Math.round(total))]
            .map(echapper).join(separateur || ';'));
    }

    const contenu = rangees.join('\r\n') + '\r\n';
    return {
        contenu,
        empreinte: crypto.createHash('sha256').update(contenu).digest('hex'),
        nomFichier: `virements-${(contexte.periode || 'lot').replace(/[^0-9a-zA-Z-]/g, '')}.${description.extension || 'csv'}`
    };
}

/** Bulletins payables du mois, et ceux qui ne le sont pas. */
async function preparer(periode) {
    const debut = new Date(`${periode}-01T00:00:00.000Z`);
    const fin = new Date(Date.UTC(debut.getUTCFullYear(), debut.getUTCMonth() + 1, 1));

    const bulletins = await prisma.payroll.findMany({
        where: { period: { gte: debut, lt: fin }, status: { in: ['APPROVED', 'PAID'] } },
        include: {
            employee: {
                select: { id: true, firstName: true, lastName: true, matricule: true, bankName: true, bankAccount: true, status: true }
            }
        },
        orderBy: { employee: { lastName: 'asc' } }
    });

    const lignes = [];
    const ecartes = [];
    for (const b of bulletins) {
        const e = b.employee;
        const nom = `${e.lastName} ${e.firstName}`.trim();
        const montant = Math.round(Number(b.netSalary) || 0);

        if (b.status === 'PAID') { ecartes.push({ nom, motif: 'Bulletin déjà marqué payé.' }); continue; }
        if (!e.bankAccount || String(e.bankAccount).trim().length < 6) {
            ecartes.push({ nom, motif: 'Aucune coordonnée bancaire au dossier.' });
            continue;
        }
        if (montant <= 0) { ecartes.push({ nom, motif: `Net à payer nul ou négatif (${montant}).` }); continue; }

        lignes.push({
            employeeId: e.id,
            payrollId: b.id,
            nom,
            banque: e.bankName || null,
            compte: String(e.bankAccount).trim(),
            montant,
            matricule: e.matricule || null,
            reference: `SAL-${periode}-${(e.matricule || e.id.slice(0, 6)).toString().toUpperCase()}`
        });
    }

    // Deux salariés sur un même compte : c'est peut-être un ménage, c'est
    // peut-être une erreur de saisie. On ne bloque pas, on le signale.
    const parCompte = new Map();
    for (const l of lignes) parCompte.set(l.compte, [...(parCompte.get(l.compte) || []), l.nom]);
    const comptesPartages = [...parCompte.entries()]
        .filter(([, noms]) => noms.length > 1)
        .map(([compte, noms]) => ({ compte, noms }));

    return {
        periode,
        lignes,
        ecartes,
        comptesPartages,
        totaux: { lignes: lignes.length, montant: lignes.reduce((s, l) => s + l.montant, 0) },
        donneur: identite.nom()
    };
}

module.exports = { CHAMPS, FORMAT_PAR_DEFAUT, valeur, caler, produire, preparer };
