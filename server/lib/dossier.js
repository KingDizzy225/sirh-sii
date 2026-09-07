/**
 * Complétude du dossier administratif d'un salarié.
 *
 * Le registre unique du personnel et la déclaration sociale n'exigent pas les
 * mêmes pièces, et une pièce absente n'a pas la même conséquence selon le
 * document : sans nationalité, le registre s'imprime mais reste incomplet
 * devant l'inspection ; sans numéro CNPS, la déclaration est déposée puis
 * rejetée, et le rejet arrive après l'échéance.
 *
 * Cette table dit, pour chaque mention, à quoi elle sert et ce qu'elle empêche.
 * C'est ce que l'écran de conformité affiche, et ce sur quoi l'export
 * déclaratif se fonde pour refuser de produire un fichier inexploitable.
 */

const MENTIONS = [
    {
        champ: 'matricule',
        libelle: 'Matricule interne',
        usage: 'declaration',
        bloquant: true,
        pourquoi: "Identifie le salarié dans les fichiers déposés et dans les ordres de virement. Deux homonymes sans matricule sont indiscernables."
    },
    {
        champ: 'cnpsNumber',
        libelle: 'Numéro CNPS',
        usage: 'declaration',
        bloquant: true,
        pourquoi: "Exigé par la déclaration sociale. Un dépôt sans ce numéro est rejeté après coup, souvent passé l'échéance."
    },
    {
        champ: 'birthDate',
        libelle: 'Date de naissance',
        usage: 'registre',
        bloquant: false,
        pourquoi: "Mention obligatoire du registre unique du personnel."
    },
    {
        champ: 'nationality',
        libelle: 'Nationalité',
        usage: 'registre',
        bloquant: false,
        pourquoi: "Mention obligatoire du registre unique du personnel ; sert aussi au décompte des travailleurs non nationaux."
    },
    {
        champ: 'contractType',
        libelle: 'Nature du contrat',
        usage: 'registre',
        bloquant: false,
        pourquoi: "Mention obligatoire du registre unique du personnel."
    },
    {
        champ: 'bankAccount',
        libelle: 'Coordonnées bancaires',
        usage: 'paiement',
        bloquant: false,
        pourquoi: "Sans elles, le salaire ne peut être viré et le paiement se fait hors du système."
    }
];

/** Champs à sélectionner en base pour évaluer un dossier. */
const CHAMPS = ['id', 'firstName', 'lastName', 'department', 'status']
    .concat(MENTIONS.map((m) => m.champ));

const selection = () => Object.fromEntries(CHAMPS.map((c) => [c, true]));

const renseigne = (valeur) =>
    valeur !== null && valeur !== undefined && String(valeur).trim() !== '';

/** Mentions manquantes d'un salarié, éventuellement filtrées par usage. */
function manquants(salarie, usage = null) {
    return MENTIONS
        .filter((m) => (usage ? m.usage === usage : true))
        .filter((m) => !renseigne(salarie[m.champ]));
}

/** Vrai si le dossier permet de figurer dans un dépôt déclaratif. */
function declarable(salarie) {
    return manquants(salarie, 'declaration').filter((m) => m.bloquant).length === 0;
}

/**
 * Synthèse sur un ensemble de salariés.
 * @returns {{total:number, complets:number, incomplets:number, parMention:object[], salaries:object[]}}
 */
function synthese(salaries) {
    const detail = salaries.map((s) => {
        const absents = manquants(s);
        return {
            id: s.id,
            nom: `${s.lastName || ''} ${s.firstName || ''}`.trim(),
            departement: s.department || null,
            statut: s.status || null,
            declarable: declarable(s),
            manquants: absents.map((m) => ({
                champ: m.champ, libelle: m.libelle, usage: m.usage,
                bloquant: m.bloquant, pourquoi: m.pourquoi
            }))
        };
    });

    const parMention = MENTIONS.map((m) => ({
        champ: m.champ,
        libelle: m.libelle,
        usage: m.usage,
        bloquant: m.bloquant,
        pourquoi: m.pourquoi,
        manquants: salaries.filter((s) => !renseigne(s[m.champ])).length
    }));

    return {
        total: salaries.length,
        complets: detail.filter((d) => d.manquants.length === 0).length,
        incomplets: detail.filter((d) => d.manquants.length > 0).length,
        nonDeclarables: detail.filter((d) => !d.declarable).length,
        parMention,
        salaries: detail
    };
}

module.exports = { MENTIONS, CHAMPS, selection, renseigne, manquants, declarable, synthese };
