# SIRH-SII

Système d'information des ressources humaines de SII, partenaire de
distribution Orange Côte d'Ivoire. En production depuis le 9 septembre 2026.

L'application est **réservée au service des ressources humaines** et aux
responsables. Les salariés n'ouvrent pas de session : ils passent par le
portail public, par leur badge numérique et par le guichet WhatsApp.

## Par où commencer

| Vous voulez… | Lisez |
|---|---|
| **installer l'application** sur un serveur de l'entreprise | [docs/INSTALLATION-WINDOWS.md](docs/INSTALLATION-WINDOWS.md) |
| **l'exploiter au quotidien** : paie, congés, écrans, réglages | [docs/RUNBOOK-PRODUCTION.md](docs/RUNBOOK-PRODUCTION.md) |
| **reprendre le service** en tant qu'équipe informatique | [docs/PASSATION-IT.md](docs/PASSATION-IT.md) |
| **configurer le serveur** | [server/.env.example](server/.env.example) |

## Ce que c'est, techniquement

- **API** : Node.js 22, Express 5, Prisma, PostgreSQL 16 (`server/`)
- **Interface** : React 18, Vite, Tailwind (`src/`)
- **Traitements planifiés** : node-cron, dans le même processus que l'API
- **Tests** : quatre suites d'intégration, exécutées par la CI GitHub Actions

## Développement

```bash
npm install            # interface
npm run dev            # interface, sur http://localhost:5173

cd server
npm install
cp .env.example .env   # puis renseigner DATABASE_URL et JWT_SECRET
npx prisma migrate deploy
npm run dev            # API, sur http://localhost:3000
```

## Vérifications avant de pousser

```bash
npx eslint src --config eslint.hooks.config.js
node scripts/check-routes.cjs          # les appels de l'interface visent des routes réelles
node scripts/check-fetch-guards.cjs    # aucune réponse réseau utilisée sans contrôle
node scripts/check-schema-usage.cjs    # les champs écrits existent au schéma
npm run build
```

Les suites d'intégration écrivent en base et **refusent toute base dont le nom
ne contient pas « test » ou « essai »** :

```bash
cd server
DATABASE_URL="postgresql://…/sirh_essai" npm run test:exploitation
```

## Deux gestes à ne jamais faire sur la production

- **`server/seed.js`** vide les tables avant d'insérer des données de
  démonstration. Il ne s'exécute que sur une base jetable.
- **`npm run purge-demo -- --confirm`** et `DISABLE_TEST_ACCOUNTS` ferment les
  accès de démonstration : c'est la direction qui en décide le moment, pas
  l'exploitant.
