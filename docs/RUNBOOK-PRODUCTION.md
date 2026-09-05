# Mise en production — déroulé

Document opératoire pour la bascule du SIRH en production. Chaque étape est
suivie d'une vérification : si elle échoue, ne pas passer à la suivante.

Durée réaliste : **1 h 30**, dont une bonne moitié d'attente de redéploiement.
Prévoir un créneau où personne n'utilise l'application.

---

## Avant le jour J

### Deux décisions à arrêter

**1. Nouvelle base de données, ou la base actuelle ?**

Cela change tout le reste du déroulé.

| | Base neuve | Base actuelle conservée |
|---|---|---|
| Migration Prisma | s'applique proprement | refusée (P3005), repli sur `db push` — comportement inchangé |
| Comptes de démonstration | absents dès le départ | présents, à purger (étape 6) |
| Données fictives | aucune | à trier manuellement |
| Historique | perdu | conservé |

La base neuve est nettement plus simple et donne un point de départ propre.
La base actuelle ne se justifie que si des données réelles y ont déjà été
saisies et doivent être conservées.

**2. Garder une instance de démonstration ?**

L'application sert aussi à la formation et à la vente, ce qui suppose des
données fictives et un accès sans identifiants — exactement ce que la mise en
production supprime. Les deux usages ne peuvent pas cohabiter sur la même
instance. Voir [Instance de démonstration](#instance-de-démonstration) en fin
de document.

### Préparer les valeurs

Générer le secret de session (48 octets, largement au-dessus du minimum de 32
caractères) :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Choisir l'adresse et le mot de passe de l'administrateur nominatif : 12
caractères minimum, mêlant minuscules, majuscules et chiffres. Ce compte
remplace `admin@sirh.com` ; sans lui, l'étape 6 verrouille tout le monde
dehors.

Noter les variables actuellement définies sur Render, pour pouvoir revenir en
arrière.

---

## Le jour J

### Étape 1 — Hébergement

Passer le service web Render au plan payant. Si vous provisionnez une nouvelle
base, la créer maintenant et relever ses deux URL : l'**interne** (pour le
service web) et l'**externe** (pour vous connecter depuis votre poste).

> Le plan payant supprime la mise en veille. Les traitements planifiés
> (acquisition des congés, alertes, relances) n'ont plus besoin du rattrapage
> au démarrage qui compensait les extinctions.

**Vérification** — le service ne s'endort plus : deux appels espacés de dix
minutes doivent répondre aussi vite l'un que l'autre.

```bash
curl -s -o /dev/null -w "%{time_total}s\n" https://sirh-backend-dbtv.onrender.com/api/health
```

### Étape 2 — Variables d'environnement du serveur

Dans Render → service web → *Environment* :

| Variable | Valeur | Pourquoi |
|---|---|---|
| `DATABASE_URL` | URL **interne** de la base | — |
| `JWT_SECRET` | la valeur générée plus haut | En dessous de 32 caractères, le serveur refuse de démarrer en production |
| `FRONTEND_URL` | `https://sirh-sii.vercel.app` | Sans elle, l'API accepte **toutes** les origines et les QR codes de pointage pointent vers l'adresse de repli |
| `NODE_ENV` | `production` | Active les contrôles qui ne s'appliquent qu'en production |
| `ANTHROPIC_API_KEY` | votre clé | Déjà en place |
| `BOOTSTRAP_ADMIN_EMAIL` | l'adresse choisie | Crée l'administrateur au démarrage |
| `BOOTSTRAP_ADMIN_PASSWORD` | le mot de passe choisi | À retirer à l'étape 6 |
| `BOOTSTRAP_ADMIN_NAME` | `Diop Ibrahim` | Nom affiché |

**Ne pas encore poser `DISABLE_TEST_ACCOUNTS`.** Les comptes de démonstration
restent le filet de sécurité tant que la connexion nominative n'a pas été
essayée pour de bon.

### Étape 3 — Déploiement

Déclencher un déploiement manuel (*Manual Deploy → Deploy latest commit*).

**Vérification** — dans les journaux, sur une base neuve :

```
Applying migration `20260905000000_initial`
🚀 SIRH Backend Server running on port 3000
✅ Connexion à la base de données PostgreSQL établie avec succès.
[BOOTSTRAP] Compte ... créé.
```

Sur la base conservée, `migrate deploy` échoue avec **P3005** (« la base n'est
pas vide ») et le démarrage se poursuit par `db push` : c'est le comportement
attendu, identique à aujourd'hui.

Ce qui doit **arrêter** le déroulé : toute autre erreur de migration, ou un
serveur qui redémarre en boucle.

### Étape 4 — État de la base

Depuis votre poste, avec l'URL **externe** :

```bash
cd server
DATABASE_URL="<url-externe>" npm run migrate:status
```

Attendu sur base neuve : `Database schema is up to date!`

### Étape 5 — Connexion nominative

Ouvrir l'application et se connecter avec l'adresse et le mot de passe de
l'étape 2. Vérifier l'accès à trois pages qui touchent des données sensibles :
**Paie**, **Dossiers médicaux**, **Employés**.

> C'est la vérification décisive. Tant qu'elle n'est pas passée, ne pas
> désactiver les comptes de démonstration.

### Étape 6 — Fermeture des accès de démonstration

Une fois seulement l'étape 5 réussie.

1. Poser `DISABLE_TEST_ACCOUNTS=true` sur Render.
2. Retirer `BOOTSTRAP_ADMIN_PASSWORD` (le compte existe, la variable n'a plus
   d'utilité et laisse un mot de passe en clair dans la configuration).
3. Redéployer.
4. Sur la base conservée uniquement, supprimer les comptes déjà créés :

```bash
cd server
DATABASE_URL="<url-externe>" npm run purge-demo            # simulation
DATABASE_URL="<url-externe>" DISABLE_TEST_ACCOUNTS=true \
  npm run purge-demo -- --confirm
```

Le script ne supprime que les identifiants de connexion, pas les fiches
employés : celles-ci n'ouvrent aucun accès, et les supprimer entraînerait la
disparition de leurs subordonnés hiérarchiques.

**Vérification** — `admin@sirh.com` / `SIIRH` doit être refusé.

### Étape 7 — Frontend

Dans Vercel → *Settings → Environment Variables* :

| Variable | Valeur |
|---|---|
| `VITE_API_URL` | l'URL du service Render |
| `VITE_DEMO_MODE` | `false` |

Puis redéployer. Vite fige ces valeurs **à la compilation** : les modifier sans
redéployer ne change rien.

**Vérification** — sur l'écran de connexion, le bouton d'accès en démonstration
a disparu, et les pages n'affichent plus de données lorsque l'API ne répond
pas (au lieu de basculer silencieusement sur les jeux fictifs).

### Étape 8 — Contrôle final

Depuis le shell Render du service web, ou depuis votre poste avec l'URL
externe :

```bash
cd server && npm run preflight
```

Le script s'arrête en erreur s'il subsiste un point bloquant : secret trop
court, `FRONTEND_URL` absente, comptes @sirh.com actifs, ou aucun compte
nominatif. Les avertissements (SMTP, IA) ne bloquent pas la mise en service
mais indiquent des fonctions qui resteront muettes.

---

## Revenir en arrière

Aucune étape n'est irréversible avant l'étape 6.

| Symptôme | Retour |
|---|---|
| Le serveur ne démarre pas | Rétablir les anciennes variables, redéployer depuis *Deploys → Rollback* |
| Connexion nominative impossible (avant l'étape 6) | Les comptes de démonstration fonctionnent encore : se connecter avec, corriger, recommencer |
| Connexion impossible **après** l'étape 6 | `ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run create-admin -- --reset-password` avec l'URL externe |
| Frontend cassé | Vercel conserve les déploiements précédents : *Promote to Production* sur le précédent |
| Migration appliquée sur la mauvaise base | Ne rien forcer. `npm run migrate:status` d'abord — `migrate deploy` n'efface jamais de données, contrairement à `db push --accept-data-loss` |

---

## Instance de démonstration

Formation et démonstration commerciale demandent l'inverse de la production :
données fictives et accès immédiat. Deux instances séparées règlent la
question sans compromis.

- **Frontend** : un second projet Vercel sur le même dépôt, avec
  `VITE_DEMO_MODE="true"` et `VITE_API_URL` pointant vers le backend de
  démonstration.
- **Backend** : le service Render actuel en plan gratuit, sur sa propre base.

Sur cette instance, poser `DISABLE_SCHEDULED_JOBS=true` et
`DISABLE_NOTIFICATION_EMAILS=true`. Sans cela, une démonstration peut déclencher
de vraies relances par email, et deux instances branchées sur la même base
enverraient les mêmes notifications en double.

---

## Ce qui reste ouvert

Deux sujets connus, sans incidence sur la bascule mais à trancher ensuite.

**Multi-entreprise.** Le schéma ne comporte aucune notion d'entreprise :
tous les salariés vivent dans le même espace. Pour héberger plusieurs clients,
il faudra soit une base par client (simple, coûteux à exploiter), soit un
`tenantId` sur une trentaine de modèles et sur chaque requête (invasif, à faire
avant que les données réelles ne s'accumulent). Décision structurante :
elle ne peut pas être prise à la place du métier.

**Envoi d'emails.** Sans configuration SMTP, les notifications partent vers une
boîte de test jetable. Les salariés ne reçoivent rien, et rien ne le signale
dans l'interface. À régler avant d'annoncer la fonctionnalité.
