const path = require('path');
const fs = require('fs');
const prisma = require('../prismaClient');

/**
 * Identité de l'entreprise : nom, logo, couleurs, coordonnées.
 *
 * Le nom venait d'une variable d'environnement, lue à quinze endroits avec
 * quatre valeurs par défaut différentes (« SIRH-SII », « SII », « SII Côte
 * d'Ivoire »…). Le logo des bulletins était un fichier fixe du dépôt, et
 * l'écran « Profil de l'entreprise » des paramètres n'enregistrait rien : un
 * logo « transféré » disparaissait au rechargement, et la raison sociale
 * affichée était un exemple.
 *
 * Tout se lit désormais ici. La lecture est synchrone — les documents et les
 * pages publiques en ont besoin partout — sur une copie tenue à jour : chargée
 * au démarrage, rafraîchie à chaque modification et au plus tard toutes les
 * cinq minutes.
 */

const DOSSIER_LOGOS = path.join(__dirname, '../uploads/identite');
const LOGO_DEPOT = path.join(__dirname, '../../public/logo.png');
const FRAICHEUR_MS = 5 * 60 * 1000;
const COULEUR = /^#[0-9a-f]{6}$/i;

let copie = null;
let lueLe = 0;

async function rafraichir() {
    try {
        copie = await prisma.identiteEntreprise.findUnique({ where: { id: 'principale' } });
        lueLe = Date.now();
    } catch (erreur) {
        // Table absente avant migration, base momentanément injoignable : on
        // garde la copie précédente plutôt que d'effacer le nom partout.
        console.error('[IDENTITÉ] Lecture impossible :', erreur.message);
    }
    return copie;
}

/** Relance une lecture en arrière-plan si la copie a vieilli. */
function copieFraiche() {
    if (Date.now() - lueLe > FRAICHEUR_MS) {
        lueLe = Date.now();
        rafraichir().catch(() => {});
    }
    return copie;
}

/** Nom affiché : celui saisi, sinon la variable d'environnement, sinon le défaut donné. */
function nom(parDefaut = 'SIRH-SII') {
    return copieFraiche()?.nomCommercial || process.env.ORGANISATION_NAME || parDefaut;
}

/** Chemin du logo à apposer sur un PDF, ou null. */
function cheminLogo() {
    const saisi = copieFraiche()?.logoPath;
    if (saisi) {
        const chemin = path.join(DOSSIER_LOGOS, path.basename(saisi));
        if (fs.existsSync(chemin)) return chemin;
    }
    return fs.existsSync(LOGO_DEPOT) ? LOGO_DEPOT : null;
}

/** Luminance relative (WCAG) d'une couleur #rrggbb. */
function luminance(hex) {
    const canaux = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * canaux[0] + 0.7152 * canaux[1] + 0.0722 * canaux[2];
}

/** Contraste d'un texte blanc sur cette couleur. */
const contrasteBlanc = (hex) => Math.round((1.05 / (luminance(hex) + 0.05)) * 100) / 100;

/**
 * Valide une saisie.
 * @returns {{donnees: object, avertissements: string[]}|{erreur: string}}
 */
function valider(corps = {}) {
    const texte = (v, max) => {
        const t = String(v ?? '').trim();
        return t ? t.slice(0, max) : null;
    };
    const donnees = {
        nomCommercial: texte(corps.nomCommercial, 80),
        raisonSociale: texte(corps.raisonSociale, 160),
        rccm: texte(corps.rccm, 60),
        adresse: texte(corps.adresse, 200),
        ville: texte(corps.ville, 80),
        telephone: texte(corps.telephone, 40),
        email: texte(corps.email, 120),
        siteWeb: texte(corps.siteWeb, 160),
        slogan: texte(corps.slogan, 120)
    };
    if (donnees.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donnees.email)) return { erreur: 'Adresse électronique invalide.' };
    if (donnees.siteWeb && !/^https?:\/\//i.test(donnees.siteWeb)) donnees.siteWeb = `https://${donnees.siteWeb}`;

    const avertissements = [];
    for (const cle of ['couleurPrincipale', 'couleurSecondaire']) {
        if (corps[cle] === undefined) continue;
        if (!COULEUR.test(String(corps[cle]))) return { erreur: 'Couleur attendue au format #RRGGBB.' };
        donnees[cle] = String(corps[cle]).toLowerCase();
        // Les pages publiques écrivent en blanc sur ces couleurs.
        if (contrasteBlanc(donnees[cle]) < 3) {
            avertissements.push(`La couleur ${donnees[cle]} est trop claire : un texte blanc y sera difficile à lire.`);
        }
    }
    return { donnees, avertissements };
}

/** Ce que les pages publiques peuvent lire. */
function pourPublic(ligne = copieFraiche()) {
    return {
        nom: ligne?.nomCommercial || process.env.ORGANISATION_NAME || 'SIRH-SII',
        slogan: ligne?.slogan || null,
        couleurPrincipale: ligne?.couleurPrincipale || '#f97316',
        couleurSecondaire: ligne?.couleurSecondaire || '#7e22ce',
        logo: Boolean(ligne?.logoPath),
        telephone: ligne?.telephone || null,
        email: ligne?.email || null,
        siteWeb: ligne?.siteWeb || null,
        version: ligne?.majLe ? new Date(ligne.majLe).getTime() : 0
    };
}

module.exports = { DOSSIER_LOGOS, rafraichir, nom, cheminLogo, contrasteBlanc, valider, pourPublic };
