# Installation sur un serveur Windows de l'entreprise

Cette procédure décrit une installation du SIRH sur une machine Windows que
vous exploitez vous-même, en remplacement de l'hébergement en nuage.

Ce que l'hébergeur assurait devient votre charge : le chiffrement, les
sauvegardes, le redémarrage après coupure et l'accès depuis l'extérieur.
Ce document traite ces quatre points autant que l'installation elle-même —
ce sont eux qui font la différence entre un service et un incident.

En contrepartie, deux choses s'améliorent. Les fichiers cessent d'être
éphémères : attestations, certificats de signature et pièces des prestataires
survivent aux redémarrages, ce qui n'était pas le cas sur un disque de nuage
sans volume persistant. Et la base est chez vous.

---

## 1. Ce qu'il faut installer

| Composant | Version | Remarque |
|---|---|---|
| Windows Server 2019+ ou Windows 10/11 Pro | — | Une machine qui ne s'éteint pas la nuit. |
| PostgreSQL | 16 | Cocher « pgAdmin » et « Command Line Tools ». |
| Node.js | 22 LTS | Le service s'exécute avec. |
| Git | récent | Pour récupérer et mettre à jour le dépôt. |
| NSSM | 2.24 | Installe Node en service Windows. |

Fixez le fuseau horaire de la machine sur **UTC+0 (Abidjan)**. Les traitements
planifiés — acquisition des congés, alertes, purges — s'appuient dessus.

---

## 2. Base de données

Dans pgAdmin ou en ligne de commande :

```sql
CREATE USER sirh WITH PASSWORD 'un-mot-de-passe-long-et-unique';
CREATE DATABASE sirh_production OWNER sirh;
```

N'utilisez pas le compte `postgres` pour l'application : un compte dédié limite
ce qu'une erreur ou une intrusion peut atteindre.

---

## 3. L'application

```powershell
cd C:\
git clone https://github.com/KingDizzy225/sirh-sii.git SIRH
cd C:\SIRH
npm ci
npm run build          # construit l'interface dans C:\SIRH\dist
cd server
npm ci
```

Créez `C:\SIRH\server\.env` à partir de `.env.example`. Les valeurs qui changent
par rapport au nuage :

```ini
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://sirh:mot-de-passe@localhost:5432/sirh_production"

# L'application sert elle-même l'interface : un seul processus, un seul port,
# et plus aucune question d'origines croisées.
SERVE_FRONTEND=true

# Adresse par laquelle les utilisateurs et les services extérieurs atteignent
# le SIRH. En HTTPS — voir la section 5.
FRONTEND_URL="https://sirh.votre-domaine.ci"
PUBLIC_API_URL="https://sirh.votre-domaine.ci"

# Clé de scellement des documents signés. À produire une fois, et à conserver
# ailleurs qu'ici : les documents déjà émis ne se vérifient qu'avec elle.
#   cd server && npm run cle-scellement -- --produire
SIGNATURE_SEAL_PRIVATE_KEY="..."

# Destination des sauvegardes, contrôlée par le préflight.
SAUVEGARDE_DESTINATION="D:\Sauvegardes\SIRH"
```

Puis appliquez le schéma :

```powershell
cd C:\SIRH\server
npx prisma migrate deploy
npm run preflight
```

Le préflight vérifie ce qui vous concerne : chiffrement, dossier des fichiers
accessible en écriture, interface construite, sauvegardes récentes, comptes de
démonstration, compteurs de congés.

---

## 4. Node en service Windows

Sans cela, l'application ne se relance pas après une coupure de courant ni après
une mise à jour Windows — et personne ne s'en aperçoit avant le lendemain matin.

```powershell
nssm install SIRH "C:\Program Files\nodejs\node.exe" "C:\SIRH\server\index.js"
nssm set SIRH AppDirectory C:\SIRH\server
nssm set SIRH AppStdout C:\SIRH\logs\sortie.log
nssm set SIRH AppStderr C:\SIRH\logs\erreurs.log
nssm set SIRH AppRotateFiles 1
nssm set SIRH Start SERVICE_AUTO_START
nssm start SIRH
```

Vérifiez que le service redémarre : arrêtez-le, redémarrez la machine, et
confirmez qu'il est reparti seul.

---

## 5. Chiffrement

**Sans HTTPS, les mots de passe et les jetons de session circulent en clair sur
votre réseau.** Un réseau interne n'y change rien : il suffit d'un poste
compromis ou d'un point d'accès sans fil mal configuré.

Le plus simple est de placer un serveur intermédiaire devant l'application.
Avec Caddy, le fichier de configuration tient en trois lignes :

```
sirh.votre-domaine.ci {
    reverse_proxy localhost:3000
}
```

Caddy obtient et renouvelle le certificat tout seul, à condition que le nom de
domaine pointe vers votre adresse publique. IIS avec le module de réécriture
convient aussi, mais le certificat sera à renouveler à la main.

Un certificat auto-signé fonctionne techniquement, mais chaque navigateur
affichera un avertissement — et les salariés apprendront à passer outre, ce qui
est exactement ce qu'il ne faut pas leur enseigner.

---

## 6. Accès depuis l'extérieur

Plusieurs fonctions ne marchent que si le serveur est joignable depuis
Internet :

| Fonction | Ce qui échoue sans accès extérieur |
|---|---|
| Guichet WhatsApp | Meta ne peut pas remettre les messages des salariés. |
| Liens de signature | Le signataire ne peut pas ouvrir le document. |
| Vérification par QR | Une banque ne peut pas contrôler une attestation. |
| Portail carrières | Les candidatures n'arrivent pas. |
| Portail salarié hors bureau | Aucun accès depuis un chantier ou depuis chez soi. |

Il faut donc : une adresse IP publique fixe (ou un service de nom dynamique),
une redirection des ports 80 et 443 vers la machine, et un nom de domaine.

Si vous préférez ne rien exposer, ces fonctions resteront inutilisables — c'est
un choix défendable, mais il doit être fait en connaissance de cause, et non
découvert après la bascule.

---

## 7. Sauvegardes

Personne ne sauvegarde à votre place. La base contient les dossiers du
personnel, les paies et l'historique des rémunérations ; le dossier `uploads`
contient les pièces jointes, les attestations et les certificats de signature.
**Il faut les deux** : une base sans ses fichiers laisse des dossiers dont les
pièces ont disparu.

Le script fourni fait les deux et conserve trente jours :

```powershell
cd C:\SIRH\server\scripts
.\sauvegarde.ps1 -Destination D:\Sauvegardes\SIRH -Base sirh_production -Utilisateur sirh
```

Planifiez-le tous les jours à 2 h dans le Planificateur de tâches, avec un
compte disposant des droits, et **hors du disque système** : une sauvegarde sur
le même disque que la base ne protège que des erreurs humaines, pas d'une panne
matérielle. Un disque externe ou un partage réseau, au minimum.

Une sauvegarde jamais restaurée n'est pas une sauvegarde. Éprouvez-la une fois,
sur une base jetable :

```powershell
createdb -U postgres sirh_essai_restauration
pg_restore -U postgres -d sirh_essai_restauration D:\Sauvegardes\SIRH\2026-09-08_0200\base.dump
```

---

## 8. Reprendre la clé de scellement d'une installation existante

Les documents émis portent un sceau. Sans la clé qui l'a produit, ils restent
lisibles mais plus personne ne peut confirmer qu'ils viennent de l'entreprise.

Avant toute migration, faites l'état des lieux sur l'installation d'origine :

```bash
cd server
DATABASE_URL="<url-de-l-ancienne-base>" npm run cle-scellement
```

La commande ne crée rien : elle lit. Deux cas.

**Aucun document n'est encore scellé.** Rien à reprendre. Produisez une clé,
posez-la dans l'environnement du nouveau serveur, et vous n'aurez plus jamais
à vous en soucier.

```bash
npm run cle-scellement -- --produire
```

**Des documents sont déjà scellés.** Exportez la clé existante et posez-la
telle quelle sur le nouveau serveur, avec son identifiant : c'est par lui que
les documents déjà émis retrouvent leur clé de vérification.

```bash
DATABASE_URL="<url-de-l-ancienne-base>" npm run cle-scellement -- --exporter
```

---

## 9. Mise à jour

```powershell
cd C:\SIRH
git pull
npm ci
npm run build
cd server
npm ci
npx prisma migrate deploy
npm run preflight
nssm restart SIRH
```

Faites une sauvegarde avant toute mise à jour comportant une migration. Une
migration s'applique, elle ne se défait pas.

---

## 10. Ce qui reste à décider

**L'authentification Google Workspace** est en place. Dans la console Google
Cloud, créez un identifiant OAuth de type « Application Web », autorisez
l'origine `https://sirh.votre-domaine.ci`, puis renseignez :

```ini
GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
GOOGLE_WORKSPACE_DOMAIN="votre-domaine.ci"
```

Le domaine n'est pas facultatif : sans lui, n'importe quel compte Google — un
compte Gmail créé en trente secondes — pourrait ouvrir une session dès lors
qu'une adresse correspondante figure au fichier du personnel.

**Le multi-société.** Si SII exploite plusieurs entités juridiques distinctes,
cela se décide avant de saisir les données : la séparation touche une trentaine
de tables et ne se rattrape pas facilement une fois la base peuplée.
