/**
 * Prêts au personnel, remboursables en plusieurs échéances.
 *
 * `SalaryAdvance` ne porte qu'un seul `deductedOnPayrollId` : une avance se
 * rembourse en une fois, sur une paie. Un salarié qui emprunte cinq cent mille
 * francs n'avait donc que deux issues — voir la somme retenue d'un coup sur un
 * seul bulletin, ou faire créer par la RH cinq avances fictives dont plus rien
 * ne dit qu'elles n'en forment qu'une.
 *
 * Deux règles tiennent ce module :
 *
 *  - **L'échéancier est arrêté à l'accord**, pas recalculé à chaque paie. Un
 *    barème qui bougerait entre deux retenues ferait varier la mensualité sans
 *    que le salarié ait rien signé.
 *  - **Le solde restant dû est la somme des échéances non soldées**, jamais un
 *    compteur décrémenté à part. Un compteur se désynchronise ; une somme, non.
 */

const nombre = (variable, defaut) => {
    const v = parseFloat(process.env[variable]);
    return Number.isFinite(v) ? v : defaut;
};

/**
 * Part maximale du net qu'une retenue peut absorber.
 *
 * Une retenue qui laisserait le salarié sans rémunération n'est pas un
 * remboursement, c'est une saisie. Le plafond est vérifié à l'accord et à
 * chaque retenue, car le net peut baisser entre-temps.
 */
const QUOTITE_MAX = nombre('PRET_QUOTITE_MAX', 0.33);

/** Nombre d'échéances au-delà duquel un prêt cesse d'être un prêt de dépannage. */
const ECHEANCES_MAX = nombre('PRET_ECHEANCES_MAX', 24);

const arrondir = (n) => Math.round(Number(n) || 0);

/**
 * Échéancier d'un prêt.
 *
 * Les mensualités sont égales, sauf la dernière qui absorbe le reste : répartir
 * l'arrondi sur toutes les échéances ferait que leur somme ne retomberait pas
 * sur le montant emprunté, et le salarié rembourserait un franc de trop ou de
 * moins sans que personne sache pourquoi.
 *
 * @param {number} montant     capital emprunté
 * @param {number} echeances   nombre de mensualités
 * @param {Date|string} premiereEcheance  mois de la première retenue
 * @returns {Array<{rang:number, periode:string, montant:number}>}
 */
function echeancier(montant, echeances, premiereEcheance) {
    const capital = arrondir(montant);
    const n = Math.floor(Number(echeances) || 0);
    if (capital <= 0 || n <= 0) return [];

    const base = Math.floor(capital / n);
    const debut = new Date(premiereEcheance);
    if (isNaN(debut.getTime())) return [];

    const lignes = [];
    let cumul = 0;
    for (let i = 0; i < n; i++) {
        const d = new Date(debut.getFullYear(), debut.getMonth() + i, 1);
        const dernier = i === n - 1;
        const m = dernier ? capital - cumul : base;
        cumul += m;
        lignes.push({
            rang: i + 1,
            periode: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            montant: m
        });
    }
    return lignes;
}

/**
 * Ce qui empêche d'accorder un prêt.
 *
 * Le refus nomme la raison : un plafond atteint et un net insuffisant
 * n'appellent pas la même suite.
 */
function obstacles({ montant, echeances, netMensuel, encoursMensuel = 0 }) {
    const empechements = [];
    const capital = arrondir(montant);
    const n = Math.floor(Number(echeances) || 0);

    if (capital <= 0) empechements.push('Le montant emprunté doit être supérieur à zéro.');
    if (n <= 0) empechements.push("Le nombre d'échéances doit être supérieur à zéro.");
    if (n > ECHEANCES_MAX) {
        empechements.push(`Le remboursement ne peut excéder ${ECHEANCES_MAX} mensualités.`);
    }
    if (capital > 0 && n > 0) {
        const mensualite = Math.ceil(capital / n);
        const net = arrondir(netMensuel);
        if (net <= 0) {
            empechements.push(
                "Aucun net mensuel connu pour ce salarié : la quotité saisissable "
                + "n'est pas vérifiable, et le prêt ne peut pas être accordé à l'aveugle."
            );
        } else if (mensualite + arrondir(encoursMensuel) > net * QUOTITE_MAX) {
            empechements.push(
                `La mensualité de ${mensualite.toLocaleString('fr-FR')} F`
                + (encoursMensuel > 0
                    ? `, ajoutée aux ${arrondir(encoursMensuel).toLocaleString('fr-FR')} F déjà retenus,`
                    : '')
                + ` dépasse ${Math.round(QUOTITE_MAX * 100)} % du net mensuel `
                + `(${net.toLocaleString('fr-FR')} F). Allonger la durée ou réduire le montant.`
            );
        }
    }
    return empechements;
}

/**
 * Solde restant dû, calculé depuis les échéances plutôt que depuis un compteur.
 * @param {Array} echeances lignes du prêt, avec leur statut
 */
function soldeRestant(echeances = []) {
    return echeances
        .filter((e) => e.statut !== 'RETENUE' && e.statut !== 'ANNULEE')
        .reduce((t, e) => t + (Number(e.montant) || 0), 0);
}

/** Échéance à retenir sur une période donnée, s'il y en a une. */
function echeanceDue(echeances = [], periode) {
    return echeances.find((e) => e.periode === periode && e.statut === 'A_RETENIR') || null;
}

/** Vue d'un prêt pour l'affichage. */
function etat(pret, echeances = []) {
    const restant = soldeRestant(echeances);
    const retenues = echeances.filter((e) => e.statut === 'RETENUE');
    return {
        id: pret.id,
        montant: pret.montant,
        echeances: echeances.length,
        echeancesSoldees: retenues.length,
        rembourse: pret.montant - restant,
        restantDu: restant,
        // « Soldé » se déduit des échéances, jamais d'un indicateur posé à part
        // qui pourrait mentir sur l'état réel.
        solde: restant === 0,
        prochaine: echeances.find((e) => e.statut === 'A_RETENIR') || null
    };
}

module.exports = {
    QUOTITE_MAX, ECHEANCES_MAX,
    echeancier, obstacles, soldeRestant, echeanceDue, etat
};
