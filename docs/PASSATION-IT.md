# Passation au service informatique

Document de reprise du SIRH-SII par l'équipe informatique de l'entreprise.
Il dit ce que vous recevez, ce que vous devez réclamer avant de commencer, et
ce qui se casse si l'on va trop vite. L'installation elle-même est décrite dans
[INSTALLATION-WINDOWS.md](INSTALLATION-WINDOWS.md) ; l'exploitation courante
dans [RUNBOOK-PRODUCTION.md](RUNBOOK-PRODUCTION.md).

---

## 1. Ce qu'est le service

Un SIRH complet, en production depuis le **9 septembre 2026** : dossiers du
personnel, paie ivoirienne (CNPS, CMU, ITS), congés, pointage géolocalisé,
documents scellés vérifiables par QR, écrans d'agence, badges numériques,
guichet WhatsApp.

- **Utilisateurs avec compte** : la direction des ressources humaines, les
  administrateurs, et les responsables sur neuf écrans.
- **Sans compte** : tous les salariés. Ils passent par le portail public, par
  des liens à jeton (bulletins, badges, bilans, pré-accueil) et par WhatsApp.
  **Toute coupure d'accès extérieur les prive de tout**, pas seulement la RH.

Hébergement au moment de la passation : API sur Render, interface sur Vercel,
base PostgreSQL gérée. La reprise consiste à porter cet ensemble sur un serveur
de l'entreprise, ou à en reprendre l'exploitation là où il est.

## 2. Ce que vous recevez

| Élément | Où |
|---|---|
| Le code, l'historique, les migrations | dépôt GitHub `KingDizzy225/sirh-sii` (public) |
| L'installation sur serveur Windows | `docs/INSTALLATION-WINDOWS.md` |
| L'exploitation, et ~130 réglages documentés | `docs/RUNBOOK-PRODUCTION.md` |
| Le modèle de configuration serveur | `server/.env.example` |

## 3. Ce que le dépôt ne contient pas — à réclamer

Rien de ce qui suit n'est versionné, et **rien ne doit l'être** : le dépôt est
public. Demandez-le par un gestionnaire de mots de passe ou de la main à la
main, jamais par courriel ni message.

- [ ] `JWT_SECRET` (ou décision d'en produire un nouveau — déconnecte tout le monde)
- [ ] `SIGNATURE_SEAL_PRIVATE_KEY` et `SIGNATURE_SEAL_KEY_ID` — **critique** :
      sans la clé existante, les documents déjà remis ne se vérifient plus.
      Voir la section 8 de l'installation.
- [ ] Accès à la base de production (sauvegarde `pg_dump` récente)
- [ ] Le dossier `server/uploads/` de l'installation en service : pièces,
      photos de badges, certificats de signature, logos. Il n'est pas dans le
      dépôt et ne se reconstitue pas.
- [ ] Identifiants SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)
- [ ] Clé Anthropic (`ANTHROPIC_API_KEY`) et, le cas échéant, le service de
      transcription des notes vocales
- [ ] Jetons WhatsApp Business (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
      `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`)
- [ ] Accès aux comptes Render, Vercel et au registrar du nom de domaine

## 4. Ordre de reprise conseillé

1. **Monter l'environnement à blanc** : PostgreSQL 16, Node 22, dépôt cloné,
   `.env` renseigné à partir du modèle, `npx prisma migrate deploy`. Vérifier
   que l'application démarre sur une base vide.
2. **Restaurer une copie de la production** sur cet environnement, et refaire
   tourner les vérifications. Ne pas travailler directement sur la base en
   service.
3. **Reprendre la clé de scellement**, puis vérifier un document déjà remis :
   scanner son QR doit répondre « valide ».
4. **Rebrancher les dépendances extérieures** une par une — SMTP, Anthropic,
   WhatsApp — et contrôler l'écran *Paramètres → état des services*, qui dit ce
   qui est réellement raccordé.
5. **Basculer les adresses publiques** (`PUBLIC_APP_URL`, `FRONTEND_URL`,
   `PUBLIC_API_URL`) et l'adresse du webhook WhatsApp dans la console Meta.
6. **Sauvegardes et redémarrage automatique** avant d'annoncer la reprise :
   sections 4 et 7 de l'installation. Une restauration doit avoir été essayée
   au moins une fois.

## 5. Ce qui casse, et comment ne pas le casser

- **`server/seed.js` vide les tables** avant d'insérer des données de
  démonstration. Il ne s'exécute que sur une base jetable. Jamais en production.
- **Les suites de tests écrivent en base.** Elles refusent toute base dont le
  nom ne contient pas « test » ou « essai » — ne contournez pas ce garde-fou.
- **La clé de scellement est irremplaçable.** En produire une nouvelle
  n'invalide pas les documents passés, mais plus rien ne permet de les
  vérifier : le QR d'une attestation déjà remise à une banque répond alors
  comme un faux.
- **La désactivation des comptes de démonstration**
  (`DISABLE_TEST_ACCOUNTS`, `VITE_DEMO_MODE=false`, `npm run purge-demo`) est
  une décision de la direction, à sa date. Ne l'anticipez pas.
- **Le dossier `uploads/` doit être sur un disque persistant et sauvegardé.**
  Sur un hébergement sans volume, il disparaît à chaque redéploiement.
- **Les migrations s'appliquent au démarrage** (`npm start` enchaîne
  `prisma migrate deploy`). Une sauvegarde doit précéder toute mise à jour.

## 6. Ce qui attend encore une décision

Ces points ne sont pas des défauts d'installation : ils attendent une réponse
de la direction ou du cabinet comptable.

- **Paiement des salaires** : aucun ordre de virement n'est produit. Le format
  de fichier doit être demandé à la banque — dépendance externe de plusieurs
  semaines.
- **Gabarits de dépôt CNPS et DGI** : l'état annuel produit est un état de
  contrôle, pas un formulaire officiel. Même réserve pour l'émargement des
  formations vis-à-vis du FDFP.
- **Taux et durées à confirmer** : majorations d'heures supplémentaires
  (décret 96-203 supposé), durée de préavis par catégorie, nombre de
  renouvellements de CDD admis.
- **Registre des traitements et durées de conservation** (loi n° 2013-450,
  ARTCI) : à constituer. Deux traitements sortent des données de l'entreprise —
  les appels à Claude, et la transcription des notes vocales si elle est
  activée.
- **Chiffrement des numéros de compte bancaire** : ils sont en clair en base.
  Le chiffrement du disque (section 5 de l'installation) est aujourd'hui la
  seule protection au repos.

## 7. Vérifier que la reprise est réussie

- [ ] Ouvrir une session RH, afficher la liste des salariés
- [ ] *Paramètres → état des services* : aucune ligne en rouge inattendue
- [ ] Scanner le QR d'un document remis avant la reprise : « valide »
- [ ] Ouvrir un lien de badge sur un téléphone, puis scanner l'écran d'agence
- [ ] Envoyer `!solde` au guichet WhatsApp depuis un numéro de salarié
- [ ] Recevoir un courriel de notification
- [ ] Une sauvegarde automatique a tourné, et **une restauration a été essayée**
