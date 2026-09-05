#!/usr/bin/env node
/**
 * Vérifie que les champs écrits par les contrôleurs existent dans le schéma
 * Prisma.
 *
 * Motivation : la création d'une note de frais échouait systématiquement parce
 * que le contrôleur écrivait un champ `receiptPath` absent du modèle. Prisma
 * rejette les champs inconnus, mais l'erreur ne survient qu'à l'exécution, sur
 * cet appel précis — ni la compilation, ni le lint, ni la vérification des
 * routes ne la voient. La fonctionnalité était morte depuis son écriture.
 *
 *   node scripts/check-schema-usage.cjs
 *
 * Sort en erreur si un champ écrit n'existe pas sur le modèle visé.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA = path.join(ROOT, 'server/prisma/schema.prisma');
const CONTROLEURS = path.join(ROOT, 'server/controllers');

// --- 1. Champs déclarés par modèle -----------------------------------------
function lireModeles() {
    const src = fs.readFileSync(SCHEMA, 'utf8');
    const modeles = {};
    for (const m of src.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/g)) {
        const nom = m[1];
        const champs = new Set();
        const obligatoires = new Set();
        for (const ligne of m[2].split('\n')) {
            const t = ligne.trim();
            if (!t || t.startsWith('//') || t.startsWith('@@')) continue;
            const champ = t.match(/^(\w+)\s+(\S+)/);
            if (!champ) continue;
            champs.add(champ[1]);
            // Un type sans « ? » final est obligatoire. Les listes (`Type[]`)
            // sont des relations, jamais nulles non plus mais hors sujet ici.
            if (!champ[2].endsWith('?') && !champ[2].endsWith('[]')) {
                obligatoires.add(champ[1]);
            }
        }
        const entree = { champs, obligatoires };
        modeles[nom] = entree;
        // Prisma expose les modèles en camelCase : prisma.employee -> Employee
        modeles[nom[0].toLowerCase() + nom.slice(1)] = entree;
    }
    return modeles;
}

/**
 * Neutralise les commentaires en conservant longueur et retours à la ligne.
 *
 * Indispensable avant toute analyse par balayage : l'apostrophe est traitée
 * comme une ouverture de chaîne, si bien qu'un commentaire français — « le
 * modèle n'a pas de createdAt » — ouvrait une chaîne fictive qui se refermait
 * sur le premier guillemet du code suivant. Tout ce qui se trouvait entre les
 * deux devenait invisible : le contrôle passait au vert sur des défauts bien
 * réels. Les offsets sont préservés pour que les numéros de ligne restent justes.
 */
function sansCommentaires(src) {
    let out = '';
    let i = 0;
    let dansTexte = null;
    while (i < src.length) {
        const c = src[i];
        if (dansTexte) {
            out += c;
            if (c === '\\') { out += src[i + 1] || ''; i += 2; continue; }
            if (c === dansTexte) dansTexte = null;
            i++;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { dansTexte = c; out += c; i++; continue; }
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') { out += ' '; i++; }
            continue;
        }
        if (c === '/' && src[i + 1] === '*') {
            while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
                out += src[i] === '\n' ? '\n' : ' ';
                i++;
            }
            out += '  '; i += 2;
            continue;
        }
        out += c;
        i++;
    }
    return out;
}

// --- 2. Écritures repérées dans les contrôleurs -----------------------------
/** Extrait le contenu équilibré d'un bloc { ... } à partir de son accolade. */
function blocEquilibre(src, debut) {
    let profondeur = 0;
    for (let i = debut; i < src.length; i++) {
        if (src[i] === '{') profondeur++;
        else if (src[i] === '}') {
            profondeur--;
            if (profondeur === 0) return src.slice(debut + 1, i);
        }
    }
    return null;
}

/**
 * Nom de propriété porté par un segment de littéral objet.
 *
 * Reconnaît les deux écritures : `champ: valeur` et la forme abrégée `champ`.
 * Cette seconde forme était ignorée, ce qui rendait le contrôle aveugle sur la
 * majorité des blocs `data:` — `prisma.applicant.create({ data: { jobOfferId,
 * firstName, experience, status: 'NEW' } })` ne faisait examiner que `status`,
 * et le champ `experience`, absent du modèle, passait inaperçu.
 */
function nomDePropriete(segment) {
    const nu = segment
        .replace(/\/\/[^\n]*/g, '')      // commentaires de ligne
        .replace(/\/\*[\s\S]*?\*\//g, '') // commentaires de bloc
        .trim();
    if (!nu || nu.startsWith('...')) return null; // opérateur de décomposition
    const m = nu.match(/^(\w+)\s*(:|$)/);
    return m ? m[1] : null;
}

/** Segments de premier niveau d'un littéral objet : [{ cle, texte }]. */
function segmentsPremierNiveau(bloc) {
    const segments = [];
    let profondeur = 0, dansTexte = null;
    let debutSegment = 0;
    const ajouter = (texte) => {
        const cle = nomDePropriete(texte);
        if (cle) segments.push({ cle, texte });
    };
    for (let i = 0; i < bloc.length; i++) {
        const c = bloc[i];
        if (dansTexte) {
            if (c === dansTexte && bloc[i - 1] !== '\\') dansTexte = null;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { dansTexte = c; continue; }
        if ('{[('.includes(c)) profondeur++;
        else if ('}])'.includes(c)) profondeur--;
        else if (c === ',' && profondeur === 0) {
            ajouter(bloc.slice(debutSegment, i));
            debutSegment = i + 1;
        }
    }
    ajouter(bloc.slice(debutSegment));
    return segments;
}

/** Clés de premier niveau d'un littéral objet. */
function clesPremierNiveau(bloc) {
    return segmentsPremierNiveau(bloc).map(s => s.cle);
}

/**
 * Contenu du littéral objet associé à une clé **de premier niveau**.
 *
 * Cette restriction est essentielle : chercher `orderBy` n'importe où dans les
 * arguments attribuait au modèle principal des tris imbriqués sous `include`,
 * qui portent en réalité sur le modèle de la relation. `include: { timeLogs:
 * { orderBy: { timestamp: 'desc' } } }` était ainsi signalé comme un tri de
 * `Employee` sur un champ inexistant, alors qu'il trie `TimeLog` correctement.
 */
function blocDeCle(args, cleCherchee) {
    for (const segment of segmentsPremierNiveau(args)) {
        if (segment.cle !== cleCherchee) continue;
        const ouvrant = segment.texte.indexOf('{');
        if (ouvrant === -1) return null;
        return blocEquilibre(segment.texte, ouvrant);
    }
    return null;
}

const modeles = lireModeles();
const anomalies = [];
let ecrituresAnalysees = 0;

/** Fichiers serveur susceptibles d'appeler Prisma. */
function fichiersServeur() {
    const trouves = [];
    const parcourir = (dossier) => {
        if (!fs.existsSync(dossier)) return;
        for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
            const complet = path.join(dossier, entree.name);
            if (entree.isDirectory()) {
                if (entree.name === 'node_modules') continue;
                parcourir(complet);
            } else if (entree.name.endsWith('.js')) {
                trouves.push(complet);
            }
        }
    };
    for (const sous of ['controllers', 'jobs', 'lib', 'middleware', 'routes', 'scripts']) {
        parcourir(path.join(ROOT, 'server', sous));
    }
    return trouves;
}

for (const chemin of fichiersServeur()) {
    const src = sansCommentaires(fs.readFileSync(chemin, 'utf8'));
    const fichier = path.relative(path.join(ROOT, 'server'), chemin);

    // --- a. Filtres `not: null` sur des champs obligatoires -----------------
    // Prisma rejette `not: null` sur un champ non nullable, à l'exécution
    // seulement. Deux occurrences avaient tué le tableau de bord analytique et
    // le récapitulatif hebdomadaire, chacune pendant des mois.
    const lecture = /prisma\.(\w+)\.(findMany|findFirst|findUnique|count|aggregate|groupBy|deleteMany|updateMany)\s*\(/g;
    for (const m of src.matchAll(lecture)) {
        const modele = m[1];
        const entree = modeles[modele];
        if (!entree) continue;

        const apres = src.indexOf('{', m.index + m[0].length - 1);
        if (apres === -1) continue;
        const args = blocEquilibre(src, apres);
        if (!args) continue;

        const ligne = src.slice(0, m.index).split('\n').length;

        // L'absence de `where` ne doit pas interrompre l'examen : un `continue`
        // placé ici sautait au motif suivant sans jamais atteindre le contrôle
        // du tri, et `prisma.applicant.findMany({ include, orderBy })` — sans
        // `where` — échappait entièrement à la vérification.
        const bloc = blocDeCle(args, 'where');
        if (bloc) {
            for (const f of bloc.matchAll(/(\w+)\s*:\s*\{\s*not\s*:\s*null\s*\}/g)) {
                if (entree.obligatoires.has(f[1])) {
                    anomalies.push({
                        fichier, ligne, modele, champ: f[1], operation: m[2],
                        genre: 'not-null'
                    });
                }
            }
        }

        // --- Champs de tri inexistants -------------------------------------
        // `orderBy: { createdAt: 'desc' }` sur un modèle dont la date s'appelle
        // `appliedDate` : Prisma rejette la requête à l'exécution. La liste des
        // candidatures répondait ainsi 500 à chaque consultation.
        // Clés d'agrégat de Prisma : légitimes dans un `orderBy`, sans jamais
        // correspondre à un champ du modèle (`orderBy: { _count: 'desc' }`).
        const AGREGATS = new Set(['_count', '_avg', '_sum', '_min', '_max', '_relevance']);

        const blocTri = blocDeCle(args, 'orderBy');
        if (blocTri) {
            for (const cle of clesPremierNiveau(blocTri)) {
                if (!AGREGATS.has(cle) && !entree.champs.has(cle)) {
                    anomalies.push({
                        fichier, ligne, modele, champ: cle, operation: m[2],
                        genre: 'order-by'
                    });
                }
            }
        }
    }

    if (!chemin.startsWith(CONTROLEURS)) continue;

    // --- b. Champs écrits absents du schéma ---------------------------------
    // prisma.<modele>.create / update / upsert / createMany ... { data: { ... } }
    const motif = /prisma\.(\w+)\.(create|update|upsert|createMany|updateMany)\s*\(/g;
    for (const m of src.matchAll(motif)) {
        const modele = m[1];
        const entree = modeles[modele];
        if (!entree) continue; // modèle inconnu : hors périmètre
        const champs = entree.champs;

        const apres = src.indexOf('{', m.index + m[0].length - 1);
        if (apres === -1) continue;
        const args = blocEquilibre(src, apres);
        if (!args) continue;

        // Repérer le bloc `data:` dans les arguments
        const posData = args.search(/\bdata\s*:\s*[{[]/);
        if (posData === -1) continue;
        const ouvrant = args.indexOf('{', posData + args.slice(posData).indexOf(':'));
        if (ouvrant === -1) continue;
        const bloc = blocEquilibre(args, ouvrant);
        if (!bloc) continue;

        ecrituresAnalysees++;
        for (const cle of clesPremierNiveau(bloc)) {
            // Les opérateurs Prisma ne sont pas des champs
            if (['connect', 'connectOrCreate', 'set', 'increment', 'decrement'].includes(cle)) continue;
            if (!champs.has(cle)) {
                const ligne = src.slice(0, m.index).split('\n').length;
                anomalies.push({ fichier, ligne, modele, champ: cle, operation: m[2] });
            }
        }
    }
}

console.log(`Modèles lus : ${Object.keys(modeles).length / 2} · écritures analysées : ${ecrituresAnalysees}`);

if (anomalies.length === 0) {
    console.log('\n✅ Champs écrits et filtres cohérents avec le schéma.');
    process.exit(0);
}

const inconnus = anomalies.filter(a => !a.genre);
const notNull = anomalies.filter(a => a.genre === 'not-null');
const tris = anomalies.filter(a => a.genre === 'order-by');

if (inconnus.length > 0) {
    console.log(`\n❌ ${inconnus.length} champ(s) écrit(s) sans exister dans le schéma :\n`);
    for (const a of inconnus) {
        console.log(`   ${a.fichier}:${a.ligne} — prisma.${a.modele}.${a.operation}() écrit « ${a.champ} »`);
    }
    console.log('\nPrisma rejette les champs inconnus : ces appels échouent à l\'exécution.');
}

if (notNull.length > 0) {
    console.log(`\n❌ ${notNull.length} filtre(s) « not: null » sur un champ obligatoire :\n`);
    for (const a of notNull) {
        console.log(`   ${a.fichier}:${a.ligne} — prisma.${a.modele}.${a.operation}() filtre « ${a.champ}: { not: null } »`);
    }
    console.log('\nPrisma refuse « not: null » sur un champ non nullable : la requête');
    console.log('échoue à l\'exécution. Le filtre est de toute façon sans objet.');
}

if (tris.length > 0) {
    console.log(`\n❌ ${tris.length} tri(s) sur un champ absent du modèle :\n`);
    for (const a of tris) {
        console.log(`   ${a.fichier}:${a.ligne} — prisma.${a.modele}.${a.operation}() trie sur « ${a.champ} »`);
    }
    console.log('\nPrisma rejette un `orderBy` portant sur un champ inconnu :');
    console.log('la route répond 500 à chaque appel.');
}
process.exit(1);
