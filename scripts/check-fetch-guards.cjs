#!/usr/bin/env node
/**
 * Vérifie qu'une réponse `fetch` n'alimente jamais un état sans être contrôlée.
 *
 * Motivation : `setActions(await actionRes.json())` plaçait tel quel le corps de
 * la réponse dans un état de liste. Sur une session refusée, ce corps est
 * `{ error: "..." }` — un objet. Le premier `.filter()` du rendu échouait alors
 * avec « x.filter is not a function » et le module entier basculait sur la page
 * d'erreur. Le défaut ne se manifeste que lorsque le serveur répond autre chose
 * qu'un succès : ni le build, ni le lint, ni les règles des hooks ne le voient.
 *
 *   node scripts/check-fetch-guards.cjs
 *
 * Une affectation est considérée comme sûre si, sur la ligne ou dans les trois
 * lignes qui précèdent, figure un contrôle du statut (`res.ok`) ou de la forme
 * (`Array.isArray`, `listeSure`).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const GARDES = ['.ok', 'Array.isArray', 'listeSure'];

function fichiers(dossier) {
    const trouves = [];
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
        const complet = path.join(dossier, entree.name);
        if (entree.isDirectory()) trouves.push(...fichiers(complet));
        else if (/\.jsx?$/.test(entree.name)) trouves.push(complet);
    }
    return trouves;
}

const anomalies = [];
let analysees = 0;

for (const chemin of fichiers(SRC)) {
    const lignes = fs.readFileSync(chemin, 'utf8').split('\n');
    for (let i = 0; i < lignes.length; i++) {
        // Les commentaires citent le motif pour l'expliquer : les ignorer, sinon
        // la documentation du défaut déclencherait l'alerte qu'elle décrit.
        const nu = lignes[i].trim();
        if (nu.startsWith('//') || nu.startsWith('*') || nu.startsWith('/*')) continue;

        // set<Etat>( await <reponse>.json() )
        if (!/set[A-Z]\w*\(\s*await\s+[\w.]+\.json\(\)/.test(lignes[i])) continue;
        analysees++;
        const contexte = lignes.slice(Math.max(0, i - 3), i + 1).join(' ');
        if (!GARDES.some(g => contexte.includes(g))) {
            anomalies.push({
                fichier: path.relative(ROOT, chemin),
                ligne: i + 1,
                extrait: lignes[i].trim().slice(0, 90)
            });
        }
    }
}

console.log(`Affectations depuis une réponse fetch analysées : ${analysees}`);

if (anomalies.length === 0) {
    console.log('\n✅ Toutes contrôlent le statut ou la forme de la réponse.');
    process.exit(0);
}

console.log(`\n❌ ${anomalies.length} affectation(s) sans contrôle :\n`);
for (const a of anomalies) {
    console.log(`   ${a.fichier}:${a.ligne}`);
    console.log(`      ${a.extrait}`);
}
console.log('\nUne réponse d\'erreur est un objet : placée dans un état de liste, elle');
console.log('fait échouer le premier .filter() du rendu. Vérifier `res.ok`, ou passer');
console.log('la valeur par `listeSure()` de src/lib/api.js.');
process.exit(1);
