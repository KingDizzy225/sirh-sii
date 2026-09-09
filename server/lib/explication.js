const paie = require('./paie');

/**
 * Le bulletin expliqué au salarié.
 *
 * La première question posée à une RH, tous pays confondus, est « pourquoi
 * j'ai touché ça ce mois-ci ? ». Le bulletin porte les lignes, jamais les
 * raisons — et le salarié qui constate cinquante mille francs de moins n'a
 * d'autre recours que de passer au bureau.
 *
 * L'application connaît pourtant les raisons : elle a calculé le brut, appliqué
 * la CNPS, retenu une tranche d'ITS, déduit une avance. Rien n'est recalculé
 * ici, et surtout rien n'est deviné : les écarts sont lus entre deux bulletins
 * enregistrés, et exprimés en français courant.
 *
 * Deux partis pris tiennent tout le module :
 *
 *  - **Une cause n'est pas une conséquence.** Une augmentation de cinquante
 *    mille francs n'ajoute pas cinquante mille francs au net : la CNPS et
 *    l'ITS en prélèvent une part. Confondre les deux ferait attendre au
 *    salarié un montant qu'il ne recevra pas, ce qui est précisément
 *    l'incompréhension qu'on cherche à lever.
 *  - **Ce qui n'est pas expliqué est dit tel quel.** Une explication qui
 *    tombe juste par construction est un récit, pas une explication. Le reste
 *    inexpliqué est calculé et affiché ; il révèle les bulletins anciens, dont
 *    le détail n'a jamais été enregistré.
 */

const FRANC = 1; // seuil d'insignifiance : sous un franc, on ne commente pas

/**
 * Tolérance sur le reste inexpliqué.
 *
 * Chaque ligne est arrondie au franc pour l'affichage, si bien que la somme des
 * lignes arrondies peut s'écarter du total de quelques francs. Le reste est
 * donc calculé sur les valeurs exactes, où l'identité
 * `Δnet = Δbrut − Δcnps − Δcmu − Δits − Δretenues` est vraie au centime près.
 * Cette tolérance ne couvre que le bruit du calcul flottant : au-delà, l'écart
 * est réel et vient d'un bulletin dont le détail n'a pas été enregistré.
 */
const TOLERANCE = 1;

const arrondir = (n) => Math.round(Number(n) || 0);

/** Formulation d'un montant signé, du point de vue du salarié. */
const signe = (n) => (n > 0 ? 'de plus' : 'de moins');

/**
 * Composition du net d'un bulletin : d'où part-on, et ce qui est retenu.
 *
 * Sert le premier bulletin, celui qu'aucun précédent n'éclaire, et reste utile
 * ensuite : beaucoup de questions ne portent pas sur un écart mais sur le
 * principe même des retenues.
 */
function composition(bulletin) {
    const d = paie.decomposer(bulletin);
    const lignes = [];

    lignes.push({
        libelle: 'Salaire de base',
        montant: arrondir(d.baseSalary),
        sens: 'credit',
        explication: 'La rémunération prévue à votre contrat pour un mois complet.'
    });

    if (arrondir(d.overtimeAmount) > 0) {
        lignes.push({
            libelle: 'Heures supplémentaires',
            montant: arrondir(d.overtimeAmount),
            sens: 'credit',
            explication: `${d.overtimeHours} heure(s) majorée(s) de `
                + `${Math.round((paie.TAUX.majorationHeureSup - 1) * 100)} %.`
        });
    }

    if (arrondir(d.bonus) > 0) {
        lignes.push({
            libelle: 'Primes',
            montant: arrondir(d.bonus),
            sens: 'credit',
            explication: 'Prime versée ce mois-ci. Elle entre dans le brut, et donc dans les cotisations.'
        });
    }

    if (arrondir(d.leaveDeduction) > 0) {
        lignes.push({
            libelle: 'Absences',
            montant: arrondir(d.leaveDeduction),
            sens: 'debit',
            explication: `${d.leaveDays} jour(s) non rémunéré(s), sur une base de `
                + `${paie.TAUX.joursOuvres} jours ouvrés.`
        });
    }

    lignes.push({
        libelle: 'Salaire brut',
        montant: arrondir(d.grossSalary),
        sens: 'total',
        explication: "C'est sur ce montant que se calculent les cotisations."
    });

    lignes.push({
        libelle: 'CNPS (part salariale)',
        montant: arrondir(d.cnpsEmployee),
        sens: 'debit',
        explication: `${(paie.TAUX.cnpsSalarie * 100).toFixed(1).replace('.', ',')} % du brut. `
            + "L'employeur verse en outre sa propre part, qui ne figure pas sur votre bulletin."
    });

    if (arrondir(d.cmu) > 0) {
        lignes.push({
            libelle: 'CMU',
            montant: arrondir(d.cmu),
            sens: 'debit',
            explication: 'Couverture maladie universelle : un forfait, identique quel que soit le salaire.'
        });
    }

    lignes.push({
        libelle: 'Impôt sur salaire (ITS)',
        montant: arrondir(d.its),
        sens: 'debit',
        explication: "Calculé par tranches sur le net imposable, c'est-à-dire le brut diminué "
            + 'de la CNPS et de la CMU. Une part plus élevée du salaire passe dans les tranches '
            + 'supérieures à mesure que celui-ci augmente.'
    });

    if (arrondir(d.deductions) > 0) {
        lignes.push({
            libelle: 'Autres retenues',
            montant: arrondir(d.deductions),
            sens: 'debit',
            explication: "Remboursement d'avance ou retenue exceptionnelle."
        });
    }

    return {
        lignes,
        net: arrondir(d.netSalary),
        complet: d.complet
    };
}

/**
 * Ce qui a changé depuis le bulletin précédent.
 *
 * Les causes agissent sur le brut ; les conséquences en découlent
 * mécaniquement. L'ordre de présentation suit l'ampleur : ce qui pèse le plus
 * se lit en premier, parce que c'est la réponse à la question posée.
 */
function changements(bulletin, precedent) {
    const a = paie.decomposer(precedent);
    const b = paie.decomposer(bulletin);

    /**
     * Net réellement versé.
     *
     * `decomposer` reconstitue un bulletin ancien à partir de ses seuls
     * éléments variables, et son net reconstitué peut différer de celui qui
     * figure sur le document remis au salarié. C'est ce dernier qu'il a en
     * tête : comparer au net reconstitué lui raconterait un écart qu'il n'a
     * pas constaté.
     */
    const netVerse = (brut, reconstitue) =>
        brut && brut.netSalary != null ? Number(brut.netSalary) : Number(reconstitue.netSalary) || 0;

    const netAvant = netVerse(precedent, a);
    const netApres = netVerse(bulletin, b);

    const ecart = (champ) => arrondir(b[champ]) - arrondir(a[champ]);

    const causes = [];
    const pousser = (liste, montant, libelle, explication) => {
        if (Math.abs(montant) >= FRANC) liste.push({ libelle, montant, explication });
    };

    pousser(causes, ecart('baseSalary'), 'Salaire de base',
        ecart('baseSalary') > 0
            ? "Votre salaire de base a augmenté."
            : "Votre salaire de base a diminué.");

    pousser(causes, ecart('bonus'), 'Primes',
        arrondir(a.bonus) > 0 && arrondir(b.bonus) === 0
            ? `La prime de ${arrondir(a.bonus).toLocaleString('fr-FR')} F du mois précédent `
              + "n'a pas été reconduite. C'est le motif le plus fréquent d'une baisse inattendue."
            : arrondir(b.bonus) > 0 && arrondir(a.bonus) === 0
                ? 'Une prime vous a été versée ce mois-ci.'
                : 'Le montant de votre prime a changé.');

    pousser(causes, ecart('overtimeAmount'), 'Heures supplémentaires',
        `${b.overtimeHours || 0} heure(s) ce mois-ci, contre ${a.overtimeHours || 0} le mois précédent.`);

    // La retenue d'absence diminue le brut : son augmentation pèse en négatif.
    pousser(causes, -ecart('leaveDeduction'), 'Absences',
        `${b.leaveDays || 0} jour(s) non rémunéré(s) ce mois-ci, contre ${a.leaveDays || 0} le mois précédent.`);

    pousser(causes, -ecart('deductions'), 'Autres retenues',
        arrondir(b.deductions) > arrondir(a.deductions)
            ? "Une retenue s'ajoute ce mois-ci : remboursement d'avance ou retenue exceptionnelle."
            : "Une retenue du mois précédent ne s'applique plus.");

    // Conséquences : elles suivent le brut, elles ne le décident pas.
    const consequences = [];
    pousser(consequences, -ecart('cnpsEmployee'), 'CNPS',
        `La cotisation suit le brut : ${(paie.TAUX.cnpsSalarie * 100).toFixed(1).replace('.', ',')} % `
        + "de celui-ci, elle varie donc dès qu'il varie.");
    pousser(consequences, -ecart('cmu'), 'CMU',
        'Le forfait CMU ne s\'applique que sur un mois rémunéré.');
    pousser(consequences, -ecart('its'), 'Impôt sur salaire (ITS)',
        "L'impôt étant calculé par tranches, il ne varie pas proportionnellement au brut : "
        + "une hausse de rémunération en voit une part passer dans une tranche supérieure.");

    causes.sort((x, y) => Math.abs(y.montant) - Math.abs(x.montant));
    consequences.sort((x, y) => Math.abs(y.montant) - Math.abs(x.montant));

    const ecartNet = arrondir(netApres) - arrondir(netAvant);

    // Le reste se calcule sur les montants exacts, jamais sur les lignes
    // arrondies : sept arrondis successifs suffisent à faire apparaître un
    // écart de quelques francs qui n'a aucune cause métier, et qu'il serait
    // trompeur de présenter au salarié comme inexpliqué.
    const exact = (champ) => (Number(b[champ]) || 0) - (Number(a[champ]) || 0);
    const expliqueExact =
        exact('baseSalary') + exact('bonus') + exact('overtimeAmount')
        - exact('leaveDeduction') - exact('deductions')
        - exact('cnpsEmployee') - exact('cmu') - exact('its');
    const resteExact = (netApres - netAvant) - expliqueExact;
    const reste = Math.abs(resteExact) <= TOLERANCE ? 0 : arrondir(resteExact);

    return {
        ecartNet,
        causes,
        consequences,
        // Ce qui ne s'explique pas se dit. C'est notamment le cas des bulletins
        // antérieurs à l'enregistrement du détail : leurs montants ont été
        // reconstitués, et l'écart ne se décompose pas exactement.
        reste,
        complet: a.complet && b.complet
    };
}

/**
 * Explication complète d'un bulletin.
 * @param {object} bulletin
 * @param {object|null} precedent  bulletin du mois précédent, s'il existe
 */
function expliquer(bulletin, precedent) {
    const compo = composition(bulletin);
    const resume = [];

    let evolution = null;
    if (precedent) {
        evolution = changements(bulletin, precedent);

        const principale = evolution.causes[0] || evolution.consequences[0];
        // Nommer un « principal motif » alors que l'essentiel de l'écart reste
        // inexpliqué désignerait un coupable au hasard. On ne le nomme que s'il
        // pèse davantage que ce qu'on ne sait pas expliquer.
        const motifCredible = principale
            && Math.abs(principale.montant) > Math.abs(evolution.reste);

        if (evolution.ecartNet === 0) {
            resume.push('Votre net est identique à celui du mois précédent.');
        } else {
            resume.push(
                `Votre net est de ${Math.abs(evolution.ecartNet).toLocaleString('fr-FR')} F `
                + `${signe(evolution.ecartNet)} que le mois précédent.`
            );
            if (motifCredible) {
                resume.push(
                    `Le principal motif : ${principale.libelle.toLowerCase()}, `
                    + `pour ${Math.abs(principale.montant).toLocaleString('fr-FR')} F.`
                );
            }
        }

        if (evolution.reste !== 0) {
            resume.push(
                motifCredible
                    ? `${Math.abs(evolution.reste).toLocaleString('fr-FR')} F de l'écart ne sont `
                      + 'pas expliqués par les éléments ci-dessus.'
                    : "L'essentiel de cet écart ne s'explique pas par les éléments ci-dessus : "
                      + "aucun motif ne peut vous être indiqué de façon fiable."
            );
            resume.push(
                "Le détail d'un des deux bulletins n'a pas été enregistré. Les ressources "
                + 'humaines peuvent le reconstituer.'
            );
        }
    } else {
        resume.push(
            "C'est le premier bulletin enregistré vous concernant : il n'y a pas de mois "
            + 'précédent auquel le comparer.'
        );
    }

    if (!compo.complet) {
        resume.push(
            'Ce bulletin est antérieur à l\'enregistrement du détail des cotisations : '
            + 'les montants ci-dessus ont été reconstitués et peuvent différer de ceux du '
            + 'document qui vous a été remis.'
        );
    }

    return { composition: compo, evolution, resume };
}

module.exports = { expliquer, composition, changements };
