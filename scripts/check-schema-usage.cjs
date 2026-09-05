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
        for (const ligne of m[2].split('\n')) {
            const t = ligne.trim();
            if (!t || t.startsWith('//') || t.startsWith('@@')) continue;
            const champ = t.match(/^(\w+)\s+\S/);
            if (champ) champs.add(champ[1]);
        }
        modeles[nom] = champs;
        // Prisma expose les modèles en camelCase : prisma.employee -> Employee
        modeles[nom[0].toLowerCase() + nom.slice(1)] = champs;
    }
    return modeles;
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

/** Clés de premier niveau d'un littéral objet. */
function clesPremierNiveau(bloc) {
    const cles = [];
    let profondeur = 0, dansTexte = null;
    let debutLigne = 0;
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
            const segment = bloc.slice(debutLigne, i);
            const cle = segment.match(/(?:^|\n)\s*(\w+)\s*:/);
            if (cle) cles.push(cle[1]);
            debutLigne = i + 1;
        }
    }
    const dernier = bloc.slice(debutLigne).match(/(?:^|\n)\s*(\w+)\s*:/);
    if (dernier) cles.push(dernier[1]);
    return cles;
}

const modeles = lireModeles();
const anomalies = [];
let ecrituresAnalysees = 0;

for (const fichier of fs.readdirSync(CONTROLEURS).filter(f => f.endsWith('.js'))) {
    const src = fs.readFileSync(path.join(CONTROLEURS, fichier), 'utf8');

    // prisma.<modele>.create / update / upsert / createMany ... { data: { ... } }
    const motif = /prisma\.(\w+)\.(create|update|upsert|createMany|updateMany)\s*\(/g;
    for (const m of src.matchAll(motif)) {
        const modele = m[1];
        const champs = modeles[modele];
        if (!champs) continue; // modèle inconnu : hors périmètre

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
    console.log('\n✅ Tous les champs écrits existent dans le schéma.');
    process.exit(0);
}

console.log(`\n❌ ${anomalies.length} champ(s) écrit(s) sans exister dans le schéma :\n`);
for (const a of anomalies) {
    console.log(`   ${a.fichier}:${a.ligne} — prisma.${a.modele}.${a.operation}() écrit « ${a.champ} »`);
}
console.log('\nPrisma rejette les champs inconnus : ces appels échouent à l\'exécution.');
process.exit(1);
