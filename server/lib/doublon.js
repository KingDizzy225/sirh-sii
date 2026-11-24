const prisma = require('../prismaClient');

/**
 * Fiches salarié en double : les empêcher plutôt que les réparer.
 *
 * Seuls l'adresse électronique et le matricule portent une contrainte
 * d'unicité. Le numéro CNPS, lui, n'en porte aucune — or c'est l'identifiant
 * le plus stable dont dispose l'entreprise : il survit à un changement
 * d'adresse, à une réembauche et à une faute de frappe sur le matricule.
 *
 * Deux fiches ne sont jamais fusionnées d'office sur une ressemblance. Ce
 * module signale, et c'est la RH qui tranche : une homonymie existe, une
 * réembauche aussi, et un logiciel qui déciderait seul finirait par rattacher
 * les bulletins d'une personne à une autre.
 */

/**
 * Écriture canonique d'un identifiant administratif.
 *
 * Un numéro CNPS saisi « 01 234 567 » et un autre « 1234567 » désignent la
 * même personne : espaces, tirets, points et zéros de tête disparaissent.
 */
function canoniser(valeur) {
    const brut = String(valeur ?? '').trim();
    if (!brut) return null;
    const sansSeparateur = brut.replace(/[\s.\-/]/g, '').toUpperCase();
    const sansZeros = sansSeparateur.replace(/^0+(?=.)/, '');
    return sansZeros || null;
}

/** Nom normalisé, sans accents ni doubles espaces. Fonction pure. */
function nomCanonique(prenom, nom) {
    return `${String(prenom || '').trim()} ${String(nom || '').trim()}`
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();
}

const NIVEAUX = {
    CERTAIN: 'CERTAIN',
    PROBABLE: 'PROBABLE'
};

/**
 * Fiches qui pourraient être la même personne.
 *
 * @param {object} candidat  fiche en cours de saisie
 * @param {string} [exclureId]  fiche à ignorer (cas d'une modification)
 * @returns {Promise<Array>} correspondances, de la plus sûre à la moins sûre
 */
async function rapprocher(candidat, exclureId = null) {
    const cnps = canoniser(candidat?.cnpsNumber);
    const matricule = canoniser(candidat?.matricule);
    const nom = nomCanonique(candidat?.firstName, candidat?.lastName);
    const naissance = candidat?.birthDate ? new Date(candidat.birthDate) : null;

    if (!cnps && !matricule && !nom) return [];

    const existants = await prisma.employee.findMany({
        where: exclureId ? { id: { not: exclureId } } : {},
        select: {
            id: true, firstName: true, lastName: true, email: true, matricule: true,
            cnpsNumber: true, birthDate: true, department: true, status: true, hireDate: true
        }
    });

    const trouves = [];
    for (const fiche of existants) {
        const motifs = [];
        let niveau = null;

        if (cnps && canoniser(fiche.cnpsNumber) === cnps) {
            motifs.push('Même numéro CNPS');
            niveau = NIVEAUX.CERTAIN;
        }
        /**
         * Le matricule n'ouvre qu'une correspondance probable, jamais
         * certaine.
         *
         * Il porte déjà une contrainte d'unicité en base, qui refuse le
         * doublon avec son propre message. En faire ici une correspondance
         * certaine ajouterait un second refus, plus tôt, sur un cas que la
         * base traite mieux — et laisserait croire qu'on peut le franchir en
         * confirmant, alors que la contrainte, elle, ne se confirme pas.
         */
        if (matricule && canoniser(fiche.matricule) === matricule) {
            motifs.push('Même matricule');
            niveau = niveau || NIVEAUX.PROBABLE;
        }
        if (!niveau && nom && nomCanonique(fiche.firstName, fiche.lastName) === nom) {
            const memeNaissance = naissance && fiche.birthDate
                && new Date(fiche.birthDate).toISOString().slice(0, 10) === naissance.toISOString().slice(0, 10);
            if (memeNaissance) {
                motifs.push('Même nom et même date de naissance');
                niveau = NIVEAUX.PROBABLE;
            }
        }

        if (niveau) {
            trouves.push({
                id: fiche.id,
                nom: `${fiche.lastName} ${fiche.firstName}`.trim(),
                email: fiche.email,
                matricule: fiche.matricule,
                departement: fiche.department,
                statut: fiche.status,
                embauche: fiche.hireDate,
                niveau,
                motifs
            });
        }
    }

    // Les correspondances certaines d'abord : ce sont celles qui doivent
    // arrêter la saisie, les autres se contentent de l'avertir.
    return trouves.sort((a, b) => (a.niveau === NIVEAUX.CERTAIN ? -1 : 1) - (b.niveau === NIVEAUX.CERTAIN ? -1 : 1));
}

/** Doublons de la base entière, pour l'état des lieux avant migration. */
async function inventaire() {
    const salaries = await prisma.employee.findMany({
        select: { id: true, firstName: true, lastName: true, cnpsNumber: true, matricule: true, status: true }
    });

    const parCle = new Map();
    for (const s of salaries) {
        const cnps = canoniser(s.cnpsNumber);
        if (!cnps) continue;
        if (!parCle.has(cnps)) parCle.set(cnps, []);
        parCle.get(cnps).push(s);
    }

    const groupes = [...parCle.entries()]
        .filter(([, liste]) => liste.length > 1)
        .map(([cle, liste]) => ({
            cle,
            fiches: liste.map((s) => ({ id: s.id, nom: `${s.lastName} ${s.firstName}`.trim(), statut: s.status }))
        }));

    return {
        salaries: salaries.length,
        sansNumeroCnps: salaries.filter((s) => !canoniser(s.cnpsNumber)).length,
        groupes,
        fichesConcernees: groupes.reduce((n, g) => n + g.fiches.length, 0)
    };
}

module.exports = { NIVEAUX, canoniser, nomCanonique, rapprocher, inventaire };
