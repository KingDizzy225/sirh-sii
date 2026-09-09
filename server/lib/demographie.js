/**
 * Lecture des données démographiques servant aux comparaisons.
 *
 * Ces deux règles étaient définies dans le seul contrôleur d'équité salariale.
 * Le tableau de bord analytique en a désormais besoin lui aussi, et deux
 * définitions concurrentes de « comment on lit le genre » finiraient par donner
 * deux écarts salariaux différents dans la même application, sans que personne
 * ne sache lequel croire.
 */

/**
 * Normalise le genre déclaré sur la fiche employé.
 *
 * Le champ est libre et facultatif ; il vaut « Non spécifié » par défaut. Tout
 * ce qui n'est pas reconnu comme féminin ou masculin est classé « inconnu » et
 * exclu des comparaisons : une valeur non renseignée ne doit ni être devinée,
 * ni être versée arbitrairement dans l'un des deux groupes.
 */
const normaliserGenre = (valeur) => {
    const v = String(valeur || '').trim().toLowerCase();
    if (['f', 'femme', 'féminin', 'feminin', 'female'].includes(v)) return 'F';
    if (['m', 'homme', 'masculin', 'male'].includes(v)) return 'M';
    return null;
};

/**
 * Nombre minimal de personnes dans un groupe pour qu'une moyenne soit publiable.
 *
 * En deçà, la moyenne d'un groupe revient à divulguer une rémunération
 * individuelle : dans un service comptant une seule femme, « salaire moyen des
 * femmes du service » est son salaire, nommément. Le seuil protège la personne,
 * et il vaut mieux ne rien afficher que d'afficher cela.
 */
const EFFECTIF_MIN_COMPARAISON = parseInt(process.env.EFFECTIF_MIN_EQUITE, 10) || 3;

/**
 * Salaire de référence d'un salarié.
 *
 * La fiche fait foi ; le dernier bulletin ne sert que de repli. Renvoie 0
 * lorsqu'aucun des deux n'est connu — jamais un montant supposé, qui se
 * propagerait ensuite dans une masse salariale ou une simulation budgétaire.
 */
function salaireConnu(employe) {
    if (employe.baseSalary != null && employe.baseSalary > 0) return employe.baseSalary;
    const bulletins = employe.payrolls || [];
    if (bulletins.length > 0 && bulletins[0].baseSalary > 0) return bulletins[0].baseSalary;
    return 0;
}

module.exports = { normaliserGenre, EFFECTIF_MIN_COMPARAISON, salaireConnu };
