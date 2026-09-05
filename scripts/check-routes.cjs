#!/usr/bin/env node
/**
 * Vérifie que chaque appel d'API du frontend correspond à une route réellement
 * exposée par le serveur.
 *
 * Motivation : plusieurs fonctionnalités étaient inopérantes sans le moindre
 * signe visible — dossiers disciplinaires jamais montés, validation des notes
 * de frais envoyée en PATCH sur une route PUT, scan OCR adressé à /scan quand
 * le serveur écoute /ocr. Le frontend enveloppant souvent ses appels d'un
 * `.catch(() => ({ data: null }))`, l'échec se traduisait par une liste vide
 * indiscernable d'une absence de données.
 *
 *   node scripts/check-routes.js
 *
 * Sort en erreur si un appel ne trouve pas de route correspondante.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// --- Routes exposées par le serveur ---------------------------------------
function collectServerEndpoints() {
    const indexSrc = fs.readFileSync(path.join(ROOT, 'server/index.js'), 'utf8');

    const varToFile = {};
    for (const m of indexSrc.matchAll(/const\s+(\w+)\s*=\s*require\(['"]\.\/routes\/(\w+)['"]\)/g)) {
        varToFile[m[1]] = m[2];
    }

    const endpoints = new Set();
    const mountedFiles = new Set();

    for (const m of indexSrc.matchAll(/app\.use\(\s*['"](\/api\/[\w\-/]+)['"]\s*,([^\n]*)/g)) {
        const prefix = m[1].replace(/\/+$/, '');
        const rest = m[2];

        let file = null;
        const inline = rest.match(/require\(['"]\.\/routes\/(\w+)['"]\)/);
        if (inline) file = inline[1];
        else {
            for (const v of Object.keys(varToFile)) {
                if (new RegExp('\\b' + v + '\\b').test(rest)) { file = varToFile[v]; break; }
            }
        }
        if (!file) continue;

        const routeFile = path.join(ROOT, 'server/routes', file + '.js');
        if (!fs.existsSync(routeFile)) continue;
        mountedFiles.add(file + '.js');

        const src = fs.readFileSync(routeFile, 'utf8');
        for (const r of src.matchAll(/router\.(get|post|put|patch|delete)\(\s*['"]([^'"]*)['"]/g)) {
            let full = r[2] === '/' ? prefix : prefix + r[2];
            full = normalize(full);
            endpoints.add(`${r[1].toUpperCase()} ${full}`);
        }
    }

    const allFiles = fs.readdirSync(path.join(ROOT, 'server/routes')).filter(f => f.endsWith('.js'));
    return { endpoints, orphans: allFiles.filter(f => !mountedFiles.has(f)) };
}

function normalize(p) {
    return p
        .split('?')[0]
        .replace(/:[A-Za-z_]\w*/g, ':p')
        .replace(/\/+$/, '') || '/';
}

// --- Appels émis par le frontend ------------------------------------------
function collectFrontendCalls() {
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d =>
        d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);

    const files = walk(path.join(ROOT, 'src')).filter(f => /\.(js|jsx)$/.test(f));
    const calls = new Map(); // clé -> Set(fichiers)

    const add = (key, file) => {
        if (!calls.has(key)) calls.set(key, new Set());
        calls.get(key).add(path.relative(ROOT, file));
    };

    for (const file of files) {
        const src = fs.readFileSync(file, 'utf8');

        // Client interne : api.get('/x'), api.post(`/x/${id}`)…
        for (const m of src.matchAll(/\bapi\.(get|post|put|patch|delete)\(\s*[`'"]([^`'"]+)/g)) {
            const raw = m[2].startsWith('/') ? m[2] : '/' + m[2];
            add(`${m[1].toUpperCase()} ${normalize('/api' + substitute(raw))}`, file);
        }

        // fetch direct : fetch(`${API_URL}/api/x`, { method: 'POST', headers: {…} })
        // L'objet d'options contient des accolades imbriquées (headers) : plutôt
        // que de tenter de les équilibrer, on cherche `method:` dans la fenêtre
        // qui suit immédiatement l'appel.
        for (const m of src.matchAll(/fetch\(\s*`\$\{API_URL\}(\/api[^`]*)`/g)) {
            const window = src.slice(m.index + m[0].length, m.index + m[0].length + 400);
            const declared = window.match(/^\s*,\s*\{[\s\S]*?method:\s*['"](\w+)['"]/);
            const method = (declared ? declared[1] : 'GET').toUpperCase();
            add(`${method} ${normalize(substitute(m[1]))}`, file);
        }
    }
    return calls;
}

// Les interpolations deviennent un paramètre générique
const substitute = (p) => p.replace(/\$\{[^}]*\}/g, ':p');

// --- Comparaison -----------------------------------------------------------
const { endpoints, orphans } = collectServerEndpoints();
const calls = collectFrontendCalls();

const problems = [];
for (const [key, files] of calls) {
    if (endpoints.has(key)) continue;

    const [method, p] = key.split(' ');

    // Tolérance : une interpolation finale peut être une chaîne de requête
    // (`/catalog${query}`) plutôt qu'un segment de chemin. Elle apparaît soit
    // collée au segment (`/catalog:p`), soit après un séparateur (`/path/:p:p`).
    if (p.endsWith(':p')) {
        const sansQuery = p.replace(/:p$/, '').replace(/\/$/, '');
        if (endpoints.has(`${method} ${sansQuery}`)) continue;
    }

    const sameRouteOtherMethod = [...endpoints].filter(e => e.endsWith(' ' + p));
    problems.push({ key, files: [...files], sameRouteOtherMethod });
}

console.log(`Routes serveur : ${endpoints.size} · Appels frontend : ${calls.size}`);

if (orphans.length) {
    console.log(`\n⚠️  Fichiers de routes jamais montés dans server/index.js :`);
    orphans.forEach(o => console.log(`   ${o}`));
}

if (!problems.length && !orphans.length) {
    console.log('\n✅ Tous les appels du frontend correspondent à une route existante.');
    process.exit(0);
}

if (problems.length) {
    console.log(`\n❌ ${problems.length} appel(s) sans route correspondante :\n`);
    for (const p of problems.sort((a, b) => a.key.localeCompare(b.key))) {
        console.log(`   ${p.key}`);
        console.log(`      appelé par : ${p.files.join(', ')}`);
        if (p.sameRouteOtherMethod.length) {
            console.log(`      le serveur expose : ${p.sameRouteOtherMethod.join(', ')} → méthode HTTP divergente`);
        }
        console.log('');
    }
}

process.exit(problems.length ? 1 : 0);
