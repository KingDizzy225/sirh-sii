# Mise en production — déroulé

Document opératoire pour la bascule du SIRH en production. Chaque étape est
suivie d'une vérification : si elle échoue, ne pas passer à la suivante.

Durée réaliste : **1 h 30**, dont une bonne moitié d'attente de redéploiement.
Prévoir un créneau où personne n'utilise l'application.

---

> **Vous reprenez l'exploitation ?** Commencez par
> [PASSATION-IT.md](PASSATION-IT.md) : ce qu'il faut réclamer avant de
> toucher à quoi que ce soit, et dans quel ordre reprendre le service.

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

#### Guichet WhatsApp *(facultatif)*

Permet aux salariés sans poste ni adresse professionnelle d'interroger le SIRH
depuis WhatsApp. Quatre variables, toutes issues de l'application Meta :
`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`,
`WHATSAPP_APP_SECRET`.

Les poser **toutes les quatre ou aucune**. Un raccordement à moitié fait est le
cas le plus trompeur : le guichet enregistre les demandes de congé sans jamais
répondre, et le salarié attend une confirmation qui ne viendra pas. Le contrôle
de préparation bloque sur cette situation.

L'adresse à déclarer comme webhook chez Meta s'affiche sur la page
**Guichet WhatsApp**, prête à copier. Elle vise l'API, non le site : sur Render
elle est déduite de `RENDER_EXTERNAL_URL`, à défaut de `PUBLIC_API_URL`.

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

> Les deux chemins ont été éprouvés sur des bases PostgreSQL jetables avant
> d'être livrés. Sur base vierge : migration appliquée, 60 tables et 51 clés
> étrangères créées, `migrate status` conforme. Sur une base montée par
> `db push` : P3005, repli, 60 tables inchangées, serveur démarré. Le
> point-virgule devant `node index.js` garantit que le serveur démarre même si
> les deux commandes échouent — l'application peut être dégradée, jamais
> absente.

### Étape 4 — État de la base

Depuis votre poste, avec l'URL **externe** :

```bash
cd server
DATABASE_URL="<url-externe>" npm run migrate:status
```

Attendu sur base neuve : `Database schema is up to date!`

### Étape 4 bis — Rattacher la base conservée aux migrations *(facultatif)*

À faire uniquement si vous conservez la base actuelle, et seulement après une
sauvegarde.

Une base construite par `db push` n'a pas de table `_prisma_migrations` : c'est
la raison du P3005. Elle restera donc sur `db push` à chaque démarrage, avec le
`--accept-data-loss` que cela suppose. La déclarer conforme à la migration
initiale la fait basculer sur le régime normal :

```bash
cd server
DATABASE_URL="<url-externe>" \
  npx prisma migrate resolve --applied 20260905000000_initial
DATABASE_URL="<url-externe>" npm run migrate:status   # doit dire : up to date
```

Cette commande n'exécute aucun SQL : elle inscrit la migration comme déjà
appliquée. Elle n'est légitime que parce que la migration a été engendrée à
partir du schéma qui a lui-même produit cette base — les deux décrivent la même
structure. Au prochain démarrage, `migrate deploy` réussira et `db push` ne sera
plus jamais atteint.

### Étape 4 ter — Reprise des bulletins de paie *(base conservée uniquement)*

Les fiches enregistrées avant la correction du calcul portent un net erroné :
il retranchait la part patronale au lieu des retenues du salarié, et leur
décomposition (brut, CNPS, CMU, ITS) n'était stockée nulle part.

```bash
cd server
DATABASE_URL="<url-externe>" npm run repair-payrolls            # simulation
DATABASE_URL="<url-externe>" npm run repair-payrolls -- --confirm
```

La simulation affiche l'écart fiche par fiche et le total sur la masse nette.
Le recalcul rapproche la base des bulletins PDF déjà remis aux salariés : c'est
le PDF qui portait le bon montant. Sans cette reprise, les déclarations
sociales du mois sortiraient avec des cotisations à zéro sur ces fiches — le
récapitulatif de l'onglet **Déclarations Sociales** le signale avant tout dépôt.

### Étape 4 quater — Reprise des compteurs de congés *(obligatoire)*

Le schéma posait `annualLeaveBalance` à 30 jours par défaut, et ni la création
manuelle ni l'import en masse ne renseignaient ce champ : **tout salarié
démarrait avec une année entière de congés acquis**, quelle que soit sa date
d'embauche. Un salarié arrivé il y a trois mois affichait 30 jours là où il en
avait acquis 6,6 ; un ancien de dix ans affichait 30 lui aussi, en perdant tout
report.

Ce compteur n'est pas d'affichage : il est valorisé en francs au départ du
salarié (indemnité compensatrice de congés payés), et il est énoncé au salarié
par l'assistant RH et par le guichet WhatsApp.

```bash
cd server
DATABASE_URL="<url-externe>" npm run repair-leave-balances            # simulation
DATABASE_URL="<url-externe>" npm run repair-leave-balances -- --confirm
```

La simulation affiche l'écart salarié par salarié, avec le détail du calcul
(mois acquis, majoration d'ancienneté, congés déjà pris).

**À faire avant, si vous disposez des compteurs de l'ancien système.** Un solde
saisi sur la fiche du salarié — ou fourni à l'import dans une colonne
« solde congés » — fait foi : il engage l'entreprise vis-à-vis du salarié, et un
calcul, si juste soit-il, ne peut pas le contredire. Le script ne touche que les
compteurs dont l'origine n'est pas encore établie ; il ne revient jamais sur un
solde repris.

Le contrôle de préparation (`npm run preflight`) bloque tant qu'il reste des
compteurs sans origine établie.

### Étape 4 quinquies — Dossiers administratifs

Le registre unique du personnel s'imprimait sans matricule ni numéro CNPS :
la base ne connaissait pas ces mentions. Elles existent désormais, et
conditionnent l'export déclaratif, qui refuse de produire un fichier tant qu'un
salarié en manque.

Ouvrir **Employés › Dossiers & corbeille** et compléter ce qui est signalé en
rouge. À l'import en masse, les colonnes reconnues sont `matricule`, `cnps`,
`banque`, `compte`, `enfants`, `solde congés` et `congés pris`.

### Étape 4 sexies — Reprise de l'historique des situations *(facultatif)*

L'historisation ne connaît que ce qu'elle a vu passer. Les salariés déjà
présents n'ont donc aucun segment : ils sont absents de tout effectif daté, et
l'écran conclurait à un effectif nul avant aujourd'hui.

```bash
cd server
DATABASE_URL="<url-externe>" npm run reprise-situations            # simulation
DATABASE_URL="<url-externe>" npm run reprise-situations -- --confirm
```

La reprise pose, pour chacun, une situation courant depuis son embauche à partir
de sa fiche actuelle. C'est une hypothèse — « rien n'a changé depuis
l'embauche » — fausse pour quiconque a été promu ou muté. Elle est marquée
**reconstituée**, et l'application le signale partout où elle l'emploie : un
organigramme reconstitué ne vaut pas un organigramme observé.

Les mouvements réels que vous connaissez se saisissent ensuite, salarié par
salarié, et prennent le pas sur la reprise.

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

## Qui accède à l'application

**L'application est réservée au service des ressources humaines et à
l'encadrement.** Les salariés n'y ouvrent plus de session : ils passent par le
**portail public** (`/portal`, également accessible depuis l'écran de
connexion), qui ne demande aucun mot de passe.

Ce que cela ferme : l'application créait un compte à chaque recrutement, avec
un mot de passe par défaut. Ces comptes dormants ouvraient sur des écrans qui
montrent les rémunérations de tout le monde.

**Le portail public n'affiche aucune donnée personnelle.** C'est ce qui le rend
sûr sans mot de passe : il reçoit des demandes — congé, avance, question,
signalement — et ne restitue rien. Un salarié qui veut consulter son bulletin
s'adresse à la RH, ou reçoit son PDF signé par le canal habituel.

### Deux conséquences à peser

1. **Les responsables se connectent, mais ne voient que huit écrans.** Ils
   valident les congés de leur équipe, d'où leur admission. Leur menu est une
   **liste explicite** — congés & absences, retards & demandes, plannings,
   relevé des pointages, entretiens, absentéisme, analyses, risque de départ —
   calquée sur ce que les routes leur autorisent réellement.

   Ils ne voient ni le répertoire complet, ni la paie, ni les prêts, ni les
   procédures disciplinaires, ni les départs, ni le matériel. Auparavant leur
   menu proposait « tout sauf la paie », y compris des écrans que le serveur
   leur refuse : ils n'y auraient trouvé qu'une erreur. Un menu qui promet ce
   que l'API refuse est pire qu'un menu court.

   `ROLES_AUTORISES_CONNEXION=ADMIN,HR` referme l'accès des responsables, sans
   reprise de code.

2. **Les écrans de libre-service deviennent sans usage.** Le portail salarié
   connecté (`/my-space`), les kudos, le mentorat, l'explorateur de carrière,
   l'assistance sociale et les avantages ne sont plus proposés au menu. Leurs
   routes existent toujours : rien n'est perdu si vous rouvrez les comptes
   salariés un jour.

Un refus de connexion pour cause de rôle renvoie un **403 explicite**, distinct
du 401 d'un mauvais mot de passe : le compte existe et le mot de passe était
bon. L'écran de connexion propose alors d'ouvrir le portail plutôt que de
laisser recommencer.



---

## Savoir ce qui est raccordé

Écran *Paramètres → État des services*. Il répond à la question qu'on se pose
tout le temps : **qu'est-ce qui marche, et qu'est-ce qui ne marche pas ?**

Sept services y figurent — IA, courriel, adresse publique, clé de scellement,
signataire, connexion Google, guichet WhatsApp — chacun avec sa conséquence en
clair. « SMTP non configuré » n'apprend rien ; « les envois aboutissent dans une
boîte de test et personne ne les reçoit » dit ce qui ne marche pas, et pour qui.

**Aucune clé n'est affichée** : seulement « défini » ou « absent ». Un écran de
diagnostic qui recopie les secrets est un écran de fuite.

Le bouton **Tester l'IA** interroge réellement le service. Il consomme un appel,
et n'est donc pas déclenché à chaque ouverture de l'écran : tant qu'il n'a pas
été pressé, « configurée » ne veut pas dire « vérifiée », et l'écran le dit.

Ce panneau ne remplace pas `npm run preflight`, qui reste l'audit de fond avant
une bascule — compteurs de congés, dossiers incomplets, comptes de
démonstration. Il répond à une autre question, à tout moment, sans shell.

*Note : le diagnostic existait déjà derrière `GET /api/jobs/ia`, mais cette
adresse exige un jeton que le navigateur n'envoie pas — la coller dans la barre
d'adresse répond « Token non fourni ». Elle reste utilisable depuis un appel
authentifié.*

---

## Remettre un document à un salarié

Les salariés n'ouvrant plus de session, un bulletin de paie n'avait plus aucun
moyen de leur parvenir : le PDF restait dans l'application, alors que sa remise
est une obligation.

Depuis le registre de paie, le bouton **Remettre** produit un lien à
transmettre par le canal de votre choix — WhatsApp, message, main propre.

**Le lien est la clé**, et c'est un choix : exiger un mot de passe reviendrait à
rouvrir les comptes qu'on vient de fermer. Trois garde-fous l'encadrent, parce
qu'un lien circule :

- **il expire** (`REMISE_VALIDITE_JOURS`, 90 jours par défaut) ;
- **il demande la date de naissance** à l'ouverture. Ce n'est pas un secret
  fort et ce n'en est pas l'objet : il s'agit d'écarter le destinataire par
  erreur. Cinq échecs bloquent le lien (`REMISE_ECHECS_MAX`) ;
- **chaque ouverture et chaque téléchargement sont datés.** Vous pouvez dire
  quand le document a été retiré — ou qu'il ne l'a pas été.

Ce que la page publique refuse de dire compte autant : **avant vérification, ni
le nom du destinataire ni l'intitulé du document.** Un lien transféré par
erreur ne révèle pas de qui il s'agit. Et un jeton inconnu se répond comme un
jeton expiré : les distinguer dirait qu'un lien a existé.

Deux refus à connaître :

- **sans date de naissance au dossier**, la remise contrôlée est refusée — le
  salarié serait bloqué devant une vérification impossible. Renseignez la date,
  ou produisez le lien sans contrôle en sachant que quiconque l'ouvrira pourra
  télécharger ;
- **sans PDF enregistré**, aucun lien n'est produit : un lien qui mène à une
  erreur est pire que pas de lien.

Un lien transmis par erreur s'annule. L'annulation ne rattrape évidemment pas
un téléchargement déjà fait, et l'application le dit.

---

## Le portail des salariés

C'est désormais leur seul accès. Il compte six onglets :

**Déposer** — requête générale, avance sur salaire, demande d'absence. Comme
avant, mais la **référence rendue après le dépôt est maintenant entière et
copiable** : elle était tronquée à ses huit premiers caractères, donc
inutilisable.

**Suivre une demande** — la référence donne l'état d'avancement : reçue,
validée par le responsable, approuvée, refusée. Le salarié déposait sa demande
et n'en entendait plus jamais parler ; c'était son seul lien avec
l'application, et il ne menait nulle part.

**Mes documents** — pour coller un lien de remise reçu.

**Informations** — les jours fériés de l'année, qui conditionnent le décompte
des congés.

Aucune donnée personnelle n'est accessible sans référence ou sans lien : ce
sont eux qui tiennent lieu d'autorisation, et ils sont assez longs pour n'être
ni devinables ni énumérables.

---

## Le menu

Il comptait **61 entrées**, dont trois écrans présentés sous deux noms
différents et cinq entrées portant le mot « absences » pour deux écrans
distincts — personne ne pouvait deviner où poser un congé. Il en compte **51**,
sans aucun doublon, et deux principes le tiennent :

- **Un écran, une entrée.** Une page qui s'adapte au rôle ne se dédouble pas
  dans le menu.
- **Le nom dit ce que l'écran fait**, en français. « Flex-Workforce » est
  devenu « Prestataires & sous-traitance », « Automatisations » et « Parcours
  d'intégration » — deux outils réellement distincts dont les noms suggéraient
  les deux moitiés d'un même — sont devenus « Traitements planifiés » et
  « Modèles de tâches ».

Sept routes accessibles par URL mais absentes du menu, qui doublaient un
composant déjà servi ailleurs, ont été retirées : `/succession-planning`,
`/gpec`, `/talent-management`, `/trainings`, `/compensation`,
`/request-center`, `/qr-pointage`. Et `/ethics`, déclarée deux fois, ne l'est
plus qu'une.

L'écran « Qualité de vie (QVT) » a été absorbé par « Baromètre social » : il ne
faisait que lire la même liste d'enquêtes, sans permettre d'en créer ni d'y
répondre.

---

## Décompte des congés, jours fériés

**Un défaut corrigé, et il coûtait de l'argent aux salariés.** Le compteur se
créditait en **jours ouvrables** — 2,2 par mois de travail effectif, la règle —
et se débitait en **jours calendaires**. Un congé du vendredi au lundi retirait
quatre jours au lieu de deux ; deux semaines en coûtaient quatorze au lieu de
douze. Aucun jour férié n'était connu : le 7 août se décomptait comme un jour
ordinaire. Le solde ainsi surconsommé alimentait le solde de tout compte, où
l'indemnité compensatrice se calcule dessus — le salarié partait avec moins que
son dû.

Le décompte se fait désormais en jours ouvrables, dimanches et fériés déduits.
`CONGES_CONVENTION` vaut `LUNDI_SAMEDI` par défaut ; `LUNDI_VENDREDI` pour une
entreprise qui ne travaille pas le samedi. **Ce choix doit suivre celui qui a
servi à fixer l'acquisition**, faute de quoi le compteur redeviendrait
incohérent avec lui-même.

**Les congés déjà validés ne sont pas repris.** Ils conservent la durée arrêtée
au moment de leur validation : recalculer des soldes après coup changerait ce
que les gens croient avoir, sans que personne l'ait demandé. Si vous voulez
reprendre l'historique, c'est une décision à prendre explicitement.

### Ce que vous devez saisir

Écran *Jours fériés*, sous Pilotage RH. « Engendrer » pose les fêtes fixes et
les fêtes chrétiennes mobiles d'une année — calculables.

**Les fêtes musulmanes ne sont pas engendrées.** Elles suivent le calendrier
lunaire et sont arrêtées par décret peu de temps avant : aucune formule ne les
donne de façon fiable, et un férié inventé fausserait chaque congé qui le
traverse. L'écran signale celles qui manquent — Aïd el-Fitr, Tabaski, Maouloud,
Nuit du Destin — pour que vous les saisissiez dès parution du décret.

---

## Couverture de l'équipe

La validation d'un congé regardait le solde, jamais la présence des autres. Le
formulaire de demande affiche désormais qui, dans la même équipe, est déjà
absent sur ces dates, et quelle part de l'effectif serait absente.

**C'est un avertissement, jamais un blocage.** Un chevauchement peut être voulu,
et une règle qui refuserait serait contournée en une semaine. L'équipe est celle
des personnes rattachées au même responsable ; à défaut de responsable
renseigné, le service.

---

## Prime d'ancienneté

Due par la convention collective interprofessionnelle au-delà de deux ans, elle
était **absente du calcul de paie** alors que l'application connaît toutes les
dates d'embauche. Elle était donc retapée à la main dans le champ « prime »
chaque mois, ou pas versée du tout — la dette s'accumulant en silence.

**Elle est désactivée par défaut, et ce n'est pas une position sur le droit.**
`runPayroll` inscrit les bulletins directement comme approuvés, sans étape de
relecture : l'activer d'office changerait dès la prochaine paie ce que touchent
les salariés, sans que personne l'ait décidé.

L'onglet *Préparation de la Paie* affiche ce qu'elle ajouterait — nombre de
bénéficiaires, coût mensuel, charge patronale induite — pour que la décision se
prenne sur un montant connu. Poser `PRIME_ANCIENNETE_ACTIVE=true` l'inclut à la
paie suivante ; **les bulletins déjà émis ne sont pas repris.**

Barème réglable : `PRIME_ANCIENNETE_TAUX` (1 %), `PRIME_ANCIENNETE_SEUIL_ANNEES`
(2), `PRIME_ANCIENNETE_PLAFOND_ANNEES` (25). L'ancienneté se compte en années
révolues **à la période de paie traitée**, non à la date du jour.

---

## Prêts au personnel

Écran *Prêts au personnel*, sous Pilotage RH. Une avance ne se remboursait qu'en
une fois : un salarié empruntant 500 000 F voyait tout retenu sur un seul
bulletin, ou la RH créait cinq avances fictives dont plus rien ne disait
qu'elles n'en formaient qu'une.

- **L'échéancier est arrêté à l'accord** et ne bouge plus. Les mensualités sont
  égales, la dernière absorbant l'arrondi pour que leur somme retombe
  exactement sur le capital.
- **Les retenues tombent automatiquement** sur la paie du mois correspondant.
  Aucune saisie mensuelle. Relancer une paie ne prélève pas deux fois.
- **La quotité est plafonnée** à `PRET_QUOTITE_MAX` (33 % du net), encours des
  autres prêts compris. Une retenue qui ne laisserait rien au salarié n'est pas
  un remboursement. Sans net connu, le prêt est refusé plutôt qu'accordé à
  l'aveugle.
- **Le restant dû est la somme des échéances non retenues**, jamais un compteur
  tenu à part qui se désynchroniserait.
- **Annuler abandonne le restant dû** et n'annule que les échéances à venir :
  ce qui a été retenu sur des bulletins remis n'est pas défait. L'annulation
  doit être motivée.

---

## Préparer, clôturer et rectifier la paie

Écran *Paie & bulletins*, onglet *Préparation de la paie*.

**Ce qui est proposé.** La saisie des éléments variables reprend ce que
l'application sait déjà :

| Case | Proposé d'après | À savoir |
|---|---|---|
| Salaire de base | La fiche, ou la décision de rémunération en vigueur à la période | Laisser **vide**. Un montant saisi remplace la référence pour ce bulletin, et l'écart s'affiche au lancement |
| Heures sup. | Les pointages du mois, ventilés par majoration | Un relevé comportant des anomalies (sortie oubliée…) n'est **pas repris** : le total relevé s'affiche sous la case, à vérifier |
| Jours d'absence | Les congés **sans solde** validés, en jours ouvrables du seul mois | Les absences non justifiées sont signalées, **jamais déduites d'office** |
| Retenues | Rien | L'échéance de prêt s'ajoute toute seule et s'affiche sous la case : **ne pas la saisir** |

Un salarié sans aucun salaire connu n'est pas payé d'un montant quelconque : il
est écarté et signalé. L'écran envoyait auparavant 350 000 F par défaut.

**Relancer un mois ouvert** remplace ses bulletins, mais ne les efface plus :
chaque bulletin remplacé est conservé avec son PDF et sa date de signature. Un
lien déjà transmis au salarié continue de mener au document qu'il a reçu, et
lui indique qu'une version rectifiée existe. Le QR du bulletin remplacé cesse
de le certifier.

**Clôturer le mois** une fois les bulletins remis. Deux contrôles :

- **bloquants** — aucun bulletin, ou des bulletins sans décomposition des
  cotisations (ils seraient déclarés à zéro) ;
- **à confirmer** — salariés actifs sans bulletin, bulletins sans PDF. Cocher
  « J'ai vérifié ces points » : ils peuvent être voulus, ils doivent être vus.

Un mois clôturé ne se relance plus. **Pour rectifier**, un administrateur rouvre
le mois en motivant la réouverture (15 caractères au moins), la paie est
relancée, puis le mois est clôturé de nouveau. L'historique garde chaque
passage et chaque motif.

### Heures supplémentaires

La paie appliquait un taux unique de 15 % à toutes les heures supplémentaires.
Elles sont désormais ventilées :

| Catégorie | Majoration par défaut | Variable |
|---|---|---|
| De la 41e à la 46e heure de la semaine, de jour | 15 % | `MAJORATION_HS_PREMIERES` |
| Au-delà de la 46e heure, de jour | 50 % | `MAJORATION_HS_SUIVANTES` |
| De nuit, ou de jour un dimanche ou un férié | 75 % | `MAJORATION_HS_NUIT_OU_REPOS` |
| De nuit un dimanche ou un férié | 100 % | `MAJORATION_HS_NUIT_DE_REPOS` |

Valeurs du décret n° 96-203 du 7 mars 1996 : **à faire confirmer par le cabinet**,
comme les autres taux. La nuit court de `TRAVAIL_NUIT_DEBUT` (21) à
`TRAVAIL_NUIT_FIN` (5) heures ; la durée hebdomadaire est
`TEMPS_HEURES_HEBDOMADAIRES` (40). Une heure n'est supplémentaire qu'au-delà de
cette durée : c'est la nature des heures qui la dépassent qui fixe leur taux.

Le bulletin porte une ligne par majoration. Un total **retouché à la main** ne
correspond plus aux pointages : il garde le taux unique
(`MAJORATION_HEURE_SUP`), et l'écran l'indique.

---

## Contrôles qui relisent la paie et l'effectif

### Vraisemblance des bulletins

Chaque bulletin du mois est comparé au passé du salarié — la **médiane** de ses
six derniers nets, pour qu'un seul mois atypique ne déplace pas la référence —
et à lui-même. Le contrôle s'exécute à l'ouverture de la clôture.

**Bloquant** (la clôture est refusée) : net nul ou négatif, net supérieur au
brut, deux bulletins sur le même mois, salarié payé après sa sortie ou avant son
embauche, net multiplié par trois ou plus.

**À viser** (la clôture reste possible en cochant « J'ai vérifié ces points ») :
net en hausse de plus de 50 % ou en baisse de plus de 40 %, retenues dépassant
la moitié du brut, plus de 60 heures supplémentaires, prime supérieure au
salaire de base, salarié payé sans aucun pointage ni congé alors qu'il pointait
les mois précédents.

Seuils réglables : `VRAISEMBLANCE_HAUSSE_NET`, `VRAISEMBLANCE_BAISSE_NET`,
`VRAISEMBLANCE_HAUSSE_BLOQUANTE`, `VRAISEMBLANCE_PART_RETENUES`,
`VRAISEMBLANCE_HEURES_SUP`, `VRAISEMBLANCE_PRIME_SUR_BASE`,
`VRAISEMBLANCE_MOIS_COMPARES`. Ce sont des repères, jamais des règles de droit.

### Cohérence entre dossiers

Écran *Dossiers administratifs*, carte « Cohérence entre dossiers ». La
conformité ne regarde qu'un dossier à la fois ; ce contrôle regarde les dossiers
**entre eux** :

- même compte bancaire, même numéro CNPS, même matricule ou même téléphone chez
  deux salariés — la comparaison ignore espaces et ponctuation, « CI93 0001 » et
  « ci93-0001 » sont le même compte ;
- date de sortie passée sur un dossier resté actif, donc encore payable ;
- salarié payé sans aucune trace d'activité — ni pointage, ni congé, ni absence,
  ni document — sur `SINCERITE_MOIS_SANS_ACTIVITE` mois (3 par défaut) ;
- salarié payé sans coordonnées bancaires au dossier.

Aucun de ces constats n'est une accusation : un ménage partage un compte, un
sédentaire ne pointe jamais. Ils désignent ce qui mérite un regard.

### Recoupement des pointages

Ajouté au contrôle quotidien, qui ne voyait que la sortie oubliée et le hors-zone :

| Constat | Ce qu'il signifie |
|---|---|
| Trajet impossible | Deux pointages qui supposeraient plus de `POINTAGE_VITESSE_MAX_KMH` (120 km/h). La précision GPS annoncée est retranchée avant de conclure |
| Pointages jumelés | Deux salariés à moins de 3 m et 30 s l'un de l'autre : deux téléphones ne donnent pas la même position à ce point |
| Position figée | Coordonnées rigoureusement identiques, quatre fois sur deux jours au moins. Cherché une fois par semaine, le lundi, pour ne pas répéter l'alerte |

### Heures supplémentaires de la semaine en cours

Deux passages par semaine, **mercredi et vendredi à 16 h** : qui a déjà dépassé
la durée hebdomadaire, avec le détail par majoration et le coût déjà engagé.
Seuil `HS_ALERTE_SEUIL_HEURES` (40 h par défaut). Arbitrer avant la fin du mois,
plutôt que de constater la dépense à la préparation de la paie.

### Lecture d'une pièce photographiée

Écran *Titres & habilitations*, bouton **Lire la pièce** dans le formulaire
d'enregistrement. Le fichier joint est lu par Claude, qui propose le type, la
référence et les dates ; rien n'est enregistré, tout reste modifiable, et le
fichier envoyé pour lecture est effacé aussitôt. Une date mal formée ou une
nature hors catalogue n'est jamais devinée : le champ reste vide et l'écran le
dit. Sans clé d'IA active, le bouton répond que la saisie reste manuelle.

### Simulation de départ

Écran *Départs*, bouton **Comparer les scénarios**. Pour un même salarié à une
même date : démission, licenciement, rupture négociée, fin de CDD — indemnité
compensatrice de congés, préavis, indemnité de licenciement, avances à déduire,
et le coût employeur correspondant.

Rien n'est enregistré : le décompte qui fait foi reste celui arrêté au départ.
La durée de préavis (`PREAVIS_MOIS_DEFAUT`, 1 mois) varie selon la catégorie
professionnelle et la convention applicable : **à confirmer avant de s'en servir
dans une négociation**. Aucune prime de fin de CDD n'est appliquée par défaut
(`CDD_PRIME_PRECARITE_TAUX`).

---

## Écrans d'agence, badges, bilans annuels, carte, vocal

Cinq fonctions tournées vers le terrain. Trois s'ouvrent **sans session, par
un lien à jeton** : l'écran d'une TV, la carte professionnelle d'un salarié et
son bilan annuel. Un lien se révoque d'un clic ; aucun ne donne accès à
l'application.

### Écrans d'agence (Accueil → Écrans d'agence)

Créer un écran, choisir le site et le mode, puis ouvrir le lien sur la TV et
passer le navigateur en plein écran (F11). La page se rafraîchit seule chaque
minute et garde son contenu si le réseau tombe.

| Mode | Affiche |
|---|---|
| Salle du personnel | prénoms et initiale des présents, anniversaires de la semaine (sans l'année), remerciements, annonces, prochaine paie |
| Visible de la clientèle | nombre de présents, annonces de catégorie « Événement » — aucun nom |

- Les présents d'un site sont ceux dont le dernier pointage du jour est une
  arrivée sur ce site. Un salarié qui ne pointe pas n'apparaît pas.
- La prochaine paie ne s'affiche que si `JOUR_PAIE` (1 à 31) est défini.
  Sans lui, aucun compte à rebours.
- La colonne « Dernier affichage » dit si la TV est encore allumée (point vert :
  moins de dix minutes).
- TV volée ou lien divulgué : **Désactiver**, puis créer un nouvel écran.

Réglages : `ECRAN_JOURS_ANNONCES` (30), `ECRAN_JOURS_KUDOS` (14).

### Badges numériques (Employés → Badges numériques)

**Émettre** avec une photo d'identité, puis envoyer le lien au salarié
(bouton WhatsApp, qui ouvre WhatsApp sur le poste de la RH — aucune
configuration WhatsApp n'est requise). Le salarié ajoute la page à l'écran
d'accueil de son téléphone.

- La carte se retourne : le verso porte un QR qui mène à une **vérification
  servie en direct** par le serveur, avec la photo enregistrée et l'heure. Une
  capture d'écran de la carte ne remplace pas ce scan.
- Le vérificateur voit nom, fonction et photo, rien d'autre. Un badge qui n'est
  plus valide ne dit pas pourquoi.
- Le badge **s'éteint seul** au départ du salarié (statut sorti ou date de
  sortie échue) ; sa photo cesse aussi d'être servie.
- Renouveler annule l'ancien badge. Perte ou vol : **Annuler** avec un motif.
- Validité : `BADGE_VALIDITE_MOIS` (12).
- Les photos sont stockées dans `server/uploads/badges` : elles relèvent du
  même disque persistant que les autres pièces téléversées.

### « Mon année » (Accueil → Mon année)

**Produire les liens manquants** crée un lien par salarié actif, puis
**WhatsApp** l'envoie. Le salarié saisit sa date de naissance et découvre son
année en diapositives, puis une carte résumé à partager.

- Rien n'est figé : le bilan est recalculé à chaque ouverture. Produits en
  décembre, les liens montrent l'année complète s'ils sont ouverts en janvier.
- Rubriques : jours pointés, congés accordés (comptés l'année où ils
  commencent), formations terminées, remerciements reçus et envoyés, points,
  ancienneté et cap franchi. **Une rubrique sans donnée n'apparaît pas.**
- L'évolution de la rémunération est masquée tant que le salarié ne la demande
  pas, et ne figure jamais sur l'image partagée.
- Pas de date de naissance au dossier, pas de lien : on ne saurait pas qui
  l'ouvre. Cinq dates fausses bloquent le lien (`REMISE_ECHECS_MAX`).
- Validité : jusqu'au 30 juin de l'année suivante. Annuler un lien permet d'en
  produire un nouveau.

### Carte des agences (Pilotage RH → Carte des agences)

Chaque site actif, coloré selon son état : **ouvert** (quelqu'un est pointé),
**personne sur place** (on y pointe d'habitude, personne n'est arrivé), **aucun
pointage récent** (rien depuis trente jours). La taille de la pastille suit le
nombre de présents. Cliquer un site affiche qui est sur place et depuis quand.

- Les sites sans coordonnées ne peuvent pas figurer : les déclarer avec leur
  latitude et longitude.
- Les postes vacants ne sont pas sur la carte : une offre d'emploi n'est
  rattachée à aucun site.
- Les fonds de carte viennent d'OpenStreetMap (attribution affichée).

### Notes vocales et langage courant sur WhatsApp

**Langage courant.** Avec `ANTHROPIC_API_KEY`, un salarié peut écrire
« combien de congés il me reste ? » ou « je veux poser du 5 au 9 octobre ».
Claude traduit la phrase en commande (`!solde`, `!paie`, `!conge`), et la
commande s'exécute avec ses contrôles habituels : solde suffisant, demande
laissée en attente de validation. Claude ne valide rien.

**Notes vocales. Claude n'écoute pas l'audio** : il faut un service de
transcription en amont. L'adaptateur parle le format `POST /audio/transcriptions`
(multipart, réponse `{ "text": … }`), proposé par plusieurs fournisseurs
hébergés et par les serveurs Whisper auto-hébergés.

| Variable | Rôle |
|---|---|
| `TRANSCRIPTION_URL` | adresse complète du point d'entrée |
| `TRANSCRIPTION_API_KEY` | clé du service |
| `TRANSCRIPTION_MODEL` | modèle chez ce fournisseur (défaut `whisper-1`) |
| `TRANSCRIPTION_LANGUE` | défaut `fr` |
| `VOCAL_TAILLE_MAX_OCTETS` | défaut 5 Mo |

- Le numéro est identifié **avant** la transcription : un inconnu ne coûte rien
  et sa voix ne sort pas.
- La réponse commence par « 🎙️ J'ai compris : « … » » : une date mal entendue
  se voit tout de suite. Le journal du guichet garde la transcription.
- Sans service configuré, le salarié est invité à écrire. L'écran « Guichet
  WhatsApp » affiche l'état des deux fonctions.
- **Donnée personnelle** : la voix quitte l'entreprise vers ce fournisseur. Le
  choix du service et de son lieu d'hébergement est à mentionner dans la
  déclaration à l'ARTCI.

## Borne de pointage, remplacements, pré-accueil, livres d'or

### Pointer sur l'écran d'agence

Dans **Écrans d'agence**, colonne « Borne », cliquer **Activer** sur un écran
rattaché à un site. La TV affiche en permanence un QR qui change toutes les
30 secondes. Le salarié le scanne avec l'appareil photo de son téléphone : la
première fois de la journée, c'est une arrivée ; la suivante, un départ.

- **Préalable : le badge numérique.** Le téléphone est reconnu parce que le
  salarié y a ouvert le lien de son badge au moins une fois. Sans badge, la page
  lui demande de l'ouvrir d'abord. Navigation privée ou données effacées : il
  suffit de rouvrir le lien du badge.
- Un code est admis pendant sa fenêtre et la précédente (60 s au plus). Un
  second scan dans les 2 minutes est ignoré (`POINTAGE_ECRAN_DOUBLON_MIN`).
- La position du téléphone est demandée sans être exigée. Loin du site, le
  pointage est **enregistré mais marqué hors périmètre**, et remonte dans les
  anomalies de pointage.
- **Limite connue** : une photo du QR relayée aussitôt par WhatsApp reste
  possible dans la minute ; la position la trahit si le téléphone la donne. Et
  quiconque détient le lien de l'écran peut lire le code à distance : ne pas
  diffuser ce lien. En cas de doute, **Désactiver** puis **Activer** tire un
  nouveau secret.

### Bourse aux remplacements (Pilotage RH → Remplacements)

Sous sa carte, le badge du salarié affiche ses créneaux des 14 prochains jours
(`ESPACE_JOURS_CRENEAUX`) et ceux que ses collègues du **même service**
cherchent à céder.

1. Le titulaire touche **Me faire remplacer**.
2. Le premier collègue du service qui touche **Je prends** l'emporte ; la RH
   reçoit une notification.
3. Un responsable **valide** : c'est seulement là que le créneau change de
   titulaire. Il peut aussi **refuser**, avec un motif transmis aux deux.

Garde-fous : on ne cède que son propre créneau, pas encore commencé, une seule
demande à la fois ; le remplaçant ne doit pas travailler le même jour ; à la
validation, tout est revérifié. Une demande non validée à l'heure du créneau
est échue. Cet écran est ouvert aux responsables (neuvième écran de leur menu).

### Pré-accueil (Employés → Pré-accueil)

Tout salarié créé avec une date d'embauche à venir apparaît. **Préparer** : qui
l'accueille, lieu, heure, programme (une ligne par étape), mot d'accueil, pièces
à déposer. Puis envoyer le lien par WhatsApp.

- La page affiche le compte à rebours, le responsable (avec sa photo si son
  badge est valide et en porte une), la carte et l'itinéraire, le programme.
- Les pièces déposées rejoignent les **documents du dossier** (déposant
  « Pré-accueil ») ; le lien ne les renvoie jamais, il les coche comme reçues.
- Le lien reste identique quand on modifie la préparation, et ferme 30 jours
  après l'embauche.

### Livres d'or (Accueil → Livres d'or)

**Ouvrir** un livre (personne, occasion, titre, jour de remise), puis
**Inviter** : le lien d'écriture part dans le groupe WhatsApp de l'équipe.

- Qui écrit ne voit pas les autres mots. La personne les lit tous à partir du
  jour de remise, par le lien **Remettre**.
- On écrit jusqu'à la fin du jour de remise, ou jusqu'à **Clore**.
- **Lire les mots** permet d'en masquer un avant la remise.
- Limites : 600 caractères par mot, 5 mots par appareil
  (`LIVRE_DOR_ENVOIS_PAR_ADRESSE`), 500 par livre (`LIVRE_DOR_MOTS_MAX`).
  L'adresse n'est pas conservée, seulement une empreinte.
- Case « écrans » cochée : les écrans **de salle du personnel** invitent à
  écrire, avec trois extraits signés du prénom, dans les 14 jours précédant la
  remise. Jamais en vitrine.

## Passations, émargement, identité de l'entreprise, prévision des absences

### Passations d'équipe (Pilotage RH → Passations d'équipe)

Depuis son badge, rubrique **Passation**, le salarié écrit à la relève : un ou
plusieurs points classés *incident*, *client à rappeler*, *consigne* ou
*matériel*. L'équipe suivante touche **J'ai lu**, et coche chaque point réglé.

- On écrit et on lit pour les agences où l'on a pointé ces 30 derniers jours.
- La relève voit les passations des 36 dernières heures (`PASSATION_HEURES`),
  plus les points restés ouverts jusqu'à 7 jours (`PASSATION_JOURS_REPORT`).
- Les écrans **de salle du personnel** rattachés au site affichent les points
  encore ouverts des 24 dernières heures. Jamais en vitrine.
- L'écran RH compte, par agence et par catégorie, ce qui a été signalé et ce
  qui reste ouvert. Il ne détecte pas qu'un même incident revient : il le montre.

### Émargement des formations (Pilotage RH → Émargement des formations)

1. **Ouvrir l'émargement** d'une session : l'écran à projeter s'ouvre.
2. Les participants scannent le QR avec leur téléphone (badge ouvert au moins
   une fois) : le premier scan vaut arrivée, un scan au moins 10 minutes plus
   tard vaut départ (`EMARGEMENT_MINUTES_AVANT_DEPART`) ; le dernier fait foi.
3. **Fermer** en fin de séance : le QR ne vaut plus rien.
4. **Feuille** et **export CSV** : présents, absents, départs non émargés,
   présents non inscrits, heures suivies (plafonnées à la durée prévue).

**L'export est un état de contrôle, pas le formulaire du FDFP.** Le format de
dépôt pour un remboursement reste à confirmer avec le cabinet ou le FDFP.

### Identité de l'entreprise (Paramètres → onglet Profil de l'entreprise)

Nom affiché, raison sociale, RCCM, coordonnées, logo (PNG, JPEG ou WebP, 2 Mo),
couleur principale et secondaire. Repris par les écrans d'agence, badges,
pré-accueil, bilans annuels, écran d'émargement, et le logo par les bulletins.

- Cet onglet remplace un formulaire factice : logo perdu au rechargement,
  raison sociale, RCCM et adresse pré-remplis d'exemples, rien d'enregistré.
- Le nom saisi prime sur `ORGANISATION_NAME`, qui reste la valeur de repli.
- Une couleur trop claire pour un texte blanc est signalée à l'enregistrement.
- La lecture publique ne livre que nom, slogan, couleurs, logo et contacts ;
  ni raison sociale ni RCCM.
- Le logo est stocké dans `server/uploads/identite` (même disque persistant
  que les autres fichiers). Les SVG sont refusés : servis publiquement, ils
  pourraient porter du script.

### Prévision des absences (Intelligence RH → Prévision des absences)

Pour chaque site et chaque jour à venir : part de l'effectif habituel (salariés
ayant pointé sur le site en 30 jours) disponible.

- **Connu** : congés validés, fériés enregistrés, ponts signalés. Toujours
  calculé.
- **Estimé** : taux de présence médian observé par jour de semaine, seulement
  après `PREVISION_SEMAINES_MIN` semaines (8) de pointages. Avant, la case
  « estimation » reste vide et l'écran le dit : les chiffres sont un plancher.
- Un site sans aucun pointage le dimanche est considéré fermé ce jour-là.
- Seuils : tendu sous 70 % (`PREVISION_SEUIL_TENDU`), critique sous 50 %
  (`PREVISION_SEUIL_CRITIQUE`).
- **Alerte du lundi 07 h 30** : une notification RH par site ayant une journée
  critique dans les 14 jours.

## Journal chaîné, droit d'accès, sonde, base école

### Le journal d'audit se contrôle lui-même (Paramètres → Journal d'audit)

Chaque écriture porte l'empreinte de la précédente. Un bandeau annonce
« chaîne intacte sur N écritures », ou nomme la ligne où elle rompt.

- **Ce que ça protège** : une ligne effacée ou modifiée directement en base se
  voit. Sur un serveur administré en interne, c'est ce qui distingue un journal
  d'une commodité.
- **Ce que ça ne protège pas** : qui détient la base peut recalculer toute la
  chaîne. D'où **l'ancrage** : « Ancrer maintenant » fige le dernier rang et
  son empreinte. **Recopiez-les hors de l'application** — registre papier,
  courriel d'archive. Un ancrage qui ne vit que dans la base ne prouve rien.
- Un ancrage automatique a lieu **chaque lundi à 02 h 30**, avec contrôle de la
  chaîne ; une rupture déclenche une alerte RH.
- Les lignes antérieures à la mise en place du chaînage ne portent pas
  d'empreinte : elles sont comptées à part, ni vérifiables ni suspectes.
- Correctif inclus : les traces des congés et des talents n'étaient **jamais
  enregistrées** — le code employait des noms de colonnes que Prisma refuse, et
  l'erreur était avalée.

### Droit d'accès (Employés → Droit d'accès)

Choisir la personne, puis **PDF** (à lui remettre) ou **JSON** (le détail).
L'export rassemble dossier, contrat, rémunération, bulletins, congés, absences,
pointages, formations, documents, pièces, badges, prêts, avances,
remerciements, carrière, procédures, dates de visites médicales, notifications,
et la liste des consultations de son dossier.

- Les **fichiers** ne sont pas incorporés : seule leur liste figure, et ils se
  remettent par lien.
- Les **conclusions du médecin du travail** en sont exclues : seules les dates
  et l'aptitude figurent, leur communication relevant de lui.
- L'extraction est elle-même tracée dans le journal (`EXPORT_DOSSIER`).
- Fondement : loi ivoirienne n° 2013-450. Le délai de réponse court dès la
  demande : produire le dossier prend désormais une minute.

### Sonde de bout en bout (Paramètres → État des services)

Chaque nuit à 03 h, l'application s'éprouve elle-même : base, migrations
appliquées, scellement (elle scelle puis vérifie un document jetable), dernier
document réellement émis, chaîne du journal, écriture sur le disque des dépôts,
âge et taille de la dernière sauvegarde, IA, WhatsApp, courriel.

| Variable | Effet |
|---|---|
| `SAUVEGARDE_DESTINATION` | sans elle, la sauvegarde n'est pas jugée |
| `SONDE_SAUVEGARDE_AGE_MAX_H` | âge admis, 30 h par défaut |
| `SONDE_EMAIL_DESTINATAIRE` | boîte de contrôle ; sans elle, l'envoi n'est pas éprouvé |

Un défaut déclenche une alerte RH. « Lancer maintenant » (administrateur) coûte
un appel d'IA et un courriel : à utiliser après une intervention, pas en boucle.
Un service non configuré est dit **absent**, jamais en panne — la distinction
évite de chercher une panne là où il n'y a qu'un réglage manquant.

### Base école anonymisée

Pour former la RH et laisser l'équipe informatique éprouver une mise à jour,
sans copier les salaires réels sur des postes de travail.

```bash
# 1. restaurer une sauvegarde dans une base nommée « ecole »
# 2. l'anonymiser
DATABASE_URL="postgresql://…/sirh_ecole" npm run anonymiser -- --confirmer --mot-de-passe="Ecole2026!"
```

- Le script **refuse toute base** dont le nom ne comporte pas « ecole »,
  « test », « essai », « demo » ou « anonym », et ne fait rien sans
  `--confirmer`.
- Anonymisés : identités, contacts, adresses, dates de naissance (décalées),
  matricules, numéros CNPS, coordonnées bancaires, salaires (bruités à ±10 %,
  ordre de grandeur conservé), messages libres.
- Supprimés : journal d'audit, documents scellés, liens de remise, journal
  WhatsApp, notifications.
- **Ne copiez pas `uploads/`** : les fichiers, eux, ne sont pas anonymisés.

## Transport, avantages, virements, stages

### Prime de transport et avantages en nature (Pilotage RH → Transport & avantages)

Le bulletin ne connaissait qu'une ligne « primes », fourre-tout.

| Élément | Traitement |
|---|---|
| Prime de transport | exonérée jusqu'à `TRANSPORT_PLAFOND_EXONERE` (30 000 par défaut) ; l'excédent entre dans le brut |
| Avantages en nature | entrent entièrement dans le brut, puis **se retranchent du net à payer** — reçus en nature, pas en argent |

- La prime se saisit une fois par salarié ; les avantages ont une date de début
  et, le cas échéant, de fin. La paie les reprend d'elle-même chaque mois.
- **À faire confirmer par le cabinet** : le plafond d'exonération et la valeur
  retenue pour chaque avantage. L'application n'inscrit aucun barème : les
  montants sont ceux que l'employeur retient, sous sa responsabilité.
- Le bulletin explique désormais ces deux lignes au salarié.

### Virements des salaires (Pilotage RH → Virements des salaires)

1. Choisir la période : l'écran annonce les virements et les salariés écartés
   (sans compte bancaire, net nul, bulletin déjà payé), et signale deux
   salariés sur un même compte.
2. **Préparer le lot**, puis **Fichier** : le fichier est produit et son
   empreinte figée — de quoi prouver que ce qui a été remis à la banque est
   bien ce que l'application a produit.
3. **Marquer émis** : c'est **le seul endroit** où un bulletin passe à « payé ».
4. **Annuler** (avec motif) rend les bulletins à l'état approuvé. Prévenez la
   banque si le fichier lui a déjà été remis.

**Le format n'est pas codé, il est décrit** : colonnes, ordre, séparateur,
largeurs, en-tête, pied. À défaut, un CSV générique sort. Le jour où la banque
remet sa spécification, elle se saisit — le programme ne change pas.

### Stagiaires et apprentis (Employés → Stagiaires & apprentis)

Convention (école, niveau, tuteur, dates, gratification) rattachée à un
salarié déjà créé. Le type de contrat devient `STAGE` ou `APPRENTISSAGE`, le
terme alimente les alertes d'échéance, et l'intéressé sort de l'effectif des
délégués.

**Ce que l'application ne tranche pas** : le régime social et fiscal de la
gratification. Elle la traite comme une rémunération ordinaire — cotisations et
impôt — et l'écran le dit. Si votre cabinet retient une exonération, ajustez
en conséquence.

## Retraite, missions, travailleurs handicapés

### Départs à la retraite (Employés → Départs à la retraite)

L'application connaissait toutes les dates de naissance et n'en tirait rien.
L'écran annonce les départs à venir sur 12, 24 ou 60 mois, et signale en rouge
ceux dont l'âge est **déjà dépassé** — ce n'est pas une erreur de saisie, c'est
un départ qui aurait dû être préparé. `RETRAITE_AGE` porte l'âge retenu.

Le point le plus lourd est ailleurs : un salarié partant à la retraite
ressortait du décompte de départ avec **zéro** indemnité, puisque seul le
licenciement en ouvrait une. L'allocation de fin de carrière a son propre
barème (`RETRAITE_BAREME_ALLOCATION`, même forme que celui du licenciement) et
figure désormais sur sa propre ligne du décompte. **Sans barème déclaré, le
reçu pour solde de tout compte est bloqué** : mieux vaut pas de reçu qu'un reçu
signé amputé de son poste le plus lourd.

### Ordres de mission (Employés → Ordres de mission)

Les notes de frais remboursaient après coup ; rien ne consignait qui avait
autorisé le déplacement. Un ordre de mission se demande, s'autorise ou se
refuse avec motif — les deux décisions sont journalisées —, puis se constate et
se solde au retour. Les responsables demandent pour leur équipe ; autoriser et
solder restent aux RH.

`MISSION_PER_DIEM` porte les forfaits par zone (LOCALE, INTERIEUR, ETRANGER).
Sans paramétrage, l'ordre vaut quand même : l'autorisation écrite est déjà
l'essentiel, et le montant se saisit.

**Le per diem n'est pas un remboursement** : il couvre le séjour au forfait,
les frais réels justifiés restent des notes de frais. L'écran met en tête les
avances des missions effectuées et non soldées — de l'argent sorti que personne
ne réclame.

### Travailleurs handicapés

La fiche salarié porte la reconnaissance, sa date et l'aménagement de poste.
C'est une donnée sensible : elle sert au décompte et à l'aménagement, pas aux
écrans ordinaires.

Le bilan social en tire le taux d'emploi. Cet indicateur existait auparavant sur
le tableau de bord de diversité sous forme d'un pourcentage écrit en dur, sans
aucune donnée derrière — il avait été retiré, il revient sur une base réelle.
`QUOTA_TRAVAILLEURS_HANDICAPES` déclare le quota applicable ; sans lui,
l'application rend le taux constaté et **ne prononce aucun verdict de
conformité**.

## Ce que le salarié voit de son dossier

Les salariés n'ont pas de compte : leur badge numérique les identifie. La page
du badge (`/badge/<jeton>`) porte donc, sous la carte, ce qu'ils peuvent
consulter d'eux-mêmes. Les blocs sont repliés par défaut — le badge s'ouvre sur
un téléphone, souvent en 3G.

**Mes droits** — solde de congés opposable (celui que la paie décompte), sa
décomposition (acquis, majorations d'ancienneté et pour enfants, jours pris),
la valeur d'une journée, l'ancienneté, la prime de fin d'année acquise à ce
jour et les rappels à venir. Le salarié remplissait jusqu'ici une demande de
congés sans connaître son solde.

**Mes bulletins** — les trois derniers, expliqués ligne par ligne.
L'explication existait, réservée aux comptes RH : le salarié recevait le PDF et
l'explication restait de l'autre côté du guichet. Elle compte d'autant plus
depuis que le bulletin porte le rappel, le transport, les avantages en nature,
l'astreinte et le treizième mois.

**Mes échéances** — terme du contrat, validité de la visite médicale,
échéances de prêt restantes. **L'avis du médecin du travail n'en fait pas
partie** : seule la date de validité sort, jamais la conclusion ni les
restrictions.

**Mes astreintes** — les périodes à venir, avec leur compensation.

**Mes attestations** — attestation de travail et attestation de salaire,
émises immédiatement par l'intéressé, signées et scellées comme celles des RH,
avec le QR de vérification. Le registre garde qui les a émises :
`PORTAIL_SALARIE`. L'attestation de salaire reprend les bulletins enregistrés
mois par mois et dit combien elle en a trouvés — elle n'extrapole pas une
moyenne sur des mois absents, ce qui ferait certifier un revenu que la paie
n'a pas versé. Le nombre de mois repris se règle par
`ATTESTATION_SALAIRE_MOIS`.

Corrigé au passage : l'attestation portait « Nous soussignés, la direction de
SIRH-SII » — le nom du logiciel, sur un document remis à une banque. Le nom
vient désormais de l'identité de l'entreprise (onglet *Paramètres → Identité*).

## Rappels, treizième mois, provisions, astreintes, bilan social

### Rappels de salaire (Pilotage RH → Rappels de salaire)

Une décision rétroactive — augmentation signée en juin avec effet au 1er mars —
ne produisait rien : l'écart des mois écoulés se saisissait à la main dans le
champ « prime », sans période ni détail.

L'écran calcule avant d'enregistrer. Pour chaque mois couvert, il reprend le
bulletin, remplace le seul salaire de base par celui qui aurait dû s'appliquer
et refait le brut — heures supplémentaires et prime d'ancienneté comprises,
puisqu'elles en dépendent. **Simulez d'abord** : le bouton « Calculer sans
enregistrer » montre le détail mois par mois.

Le rappel part automatiquement sur la prochaine paie du salarié, sur sa propre
ligne du bulletin. Un mois sans bulletin enregistré ne produit pas un rappel de
zéro : il est signalé, parce qu'il n'y a rien à rattraper — il y a une paie à
faire.

**Ce qui reste à trancher** : le rappel est cotisé au taux du mois où il est
versé. Si votre cabinet impose un rattachement aux mois d'origine, le montant
reste juste mais sa ventilation fiscale devra être revue.

### Prime de fin d'année (Pilotage RH → Prime de fin d'année)

`PRIME_FIN_ANNEE_FRACTION` porte la règle : `1` pour un treizième mois entier,
`0.5` pour un demi. **Tant qu'elle n'est pas posée, rien n'est calculé** — le
treizième mois n'est pas une obligation légale générale en Côte d'Ivoire, il
tient à votre convention collective ou à un usage de l'entreprise.

Deux choses sur le même écran, à ne pas confondre :

- La **provision** se recalcule à chaque consultation et dit ce que l'exercice
  a déjà engagé. Elle existe pour que décembre ne surprenne pas la trésorerie.
- L'**arrêté** fige les montants dus, au prorata des mois de présence, et c'est
  lui qui part sur la paie du mois configuré (`PRIME_FIN_ANNEE_MOIS`, décembre
  par défaut). Ré-arrêter un exercice met à jour les primes non versées et
  laisse les autres intactes.

### Provision pour congés payés (Pilotage RH → Provision congés)

Ce que l'entreprise devrait si tout le monde partait demain. Les soldes étaient
tenus en jours et jamais valorisés ; c'est pourtant une dette exigible, payée
au départ dans le solde de tout compte.

**Méthode** : brut moyen des douze derniers bulletins ÷ jours ouvrés du mois,
multiplié par le solde, charges patronales comprises. Une convention peut
retenir une autre assiette — le chiffre porte sa méthode pour qu'un comptable
puisse la discuter plutôt que la deviner.

Le bouton « Arrêter » fige le détail par salarié à une date. C'est ce détail
figé qui fait foi ensuite, pas le calcul du jour.

### Astreintes (Employés → Astreintes)

Planning ouvert aux responsables, compensation réservée aux RH. Deux choses
s'affichent avant le planning, parce qu'elles sont le vrai sujet : les **jours
sans aucune couverture**, et les **enchaînements** — chevauchements et repos
trop courts entre deux astreintes d'un même salarié (`ASTREINTE_REPOS_JOURS`).

Les forfaits viennent de `ASTREINTE_FORFAITS` ; sans paramétrage, le montant se
saisit période par période. Une astreinte constatée part sur la paie du mois,
sur sa propre ligne.

**Une intervention n'est pas une astreinte.** Être appelé et travailler est du
temps de travail effectif : cela relève des heures supplémentaires, avec leurs
majorations, **en plus** de l'indemnité. Les interventions sont comptées ici
pour ce qu'elles disent de la charge, jamais payées au forfait.

### Bilan social (Pilotage RH → Bilan social)

Effectifs, mouvements, absentéisme, formation, sécurité, rémunérations : toutes
ces données existaient, aucune n'était rassemblée. Chaque indicateur porte sa
définition, parce qu'un effectif « moyen » et un effectif « à fin d'exercice »
ne donnent pas le même nombre, et qu'un taux d'absentéisme change du simple au
double selon qu'on y compte les congés payés.

**Ce n'est pas un formulaire réglementaire** : aucun gabarit de branche n'est
reproduit. Les réserves affichées en tête disent ce qui empêche de lire
certains chiffres — un écart de rémunération demande des salaires connus dans
les deux groupes, une masse salariale demande des bulletins.

## Récapitulatif annuel des salaires (DISA, ITS)

Onglet *Déclarations sociales*, sous la déclaration du mois. Cumuls de l'année
par salarié — brut, CNPS salarié et employeur, CMU, assiette et retenue d'ITS,
net —, lus sur les bulletins enregistrés.

L'ancien bouton « Export DISA » produisait un fichier **mensuel**, reprenant
toutes les périodes à la suite, avec l'identifiant technique du salarié dans la
colonne du numéro CNPS. Il a été retiré.

L'état annuel **n'est pas exporté** tant qu'un point bloquant subsiste
(bulletin sans décomposition, dossier sans matricule ou numéro CNPS). Il
signale aussi les mois non clôturés et les mois sans aucun bulletin.

> **Le fichier ne reproduit pas le gabarit de dépôt de la CNPS ni celui de la
> DGI**, que l'application ne connaît pas. C'est un état de contrôle et de
> saisie : reporter les montants dans le format demandé par chaque organisme.

---

## Suivi des CDD

Écran *Suivi des CDD*, sous Employés. L'application ne connaissait d'un CDD
que sa date de fin. Elle classe désormais les contrats du plus exposé au moins
exposé :

| Situation | Signification |
|---|---|
| Plafond dépassé | Le terme dépasse `CDD_DUREE_MAX_MOIS` (24) renouvellements compris |
| Terme échu, en poste | Le salarié travaille après le terme |
| Sans terme | CDD sans date de fin |
| Plafond atteint | Le terme approche et ne peut plus être repoussé |
| Échéance proche | Terme dans moins de `CDD_HORIZON_JOURS` (60) jours, renouvellement possible |

Les quatre premières exposent à une requalification en CDI ; elles font l'objet
d'une alerte quotidienne à la RH.

**Renouveler** exige un motif et refuse toute date au-delà du plafond ; le
refus donne la date limite. Chaque renouvellement est consigné. Pour un contrat
antérieur à ce suivi, la période est reconstituée depuis la fiche (embauche →
terme), et l'écran le signale : les renouvellements plus anciens ne sont pas
connus. Le nombre de renouvellements admis n'est pas imposé : le renseigner
dans `CDD_RENOUVELLEMENTS_MAX` **après avis du conseil** de l'entreprise.

---

## Événements sortants (webhooks)

*Paramètres › Intégrations*. L'écran proposait trois événements ; un seul était
émis. Seuls les événements réellement émis sont désormais proposés :

| Événement | Émis quand |
|---|---|
| `EMPLOYEE_CREATED` | Un dossier salarié est créé |
| `LEAVE_REQUESTED` | Une demande de congé est déposée (application ou portail) |
| `LEAVE_DECIDED` | Un congé est validé ou refusé |
| `PAYROLL_CLOSED` | Un mois de paie est clôturé (reçu aussi par les webhooks enregistrés sous l'ancien `PAYROLL_APPROVED`) |
| `CONTRACT_RENEWED` | Un CDD est renouvelé |
| `DOCUMENT_REMIS` | Un document est remis par lien — **le lien lui-même n'est jamais transmis** |

- **Aucune rémunération ne sort.** La création d'un salarié transmettait sa
  fiche entière — salaire, compte bancaire, numéro CNPS. Les événements ne
  portent plus que de quoi reconnaître le salarié : nom, service, poste.
- **Les appels sont signés.** Le « secret » était envoyé en clair dans un
  en-tête, et ne prouvait rien. Il ne quitte plus le serveur : chaque appel
  porte `X-SIRH-Signature: sha256=<HMAC-SHA256 du corps brut>`. Le destinataire
  recalcule et compare.
- **L'adresse doit être en https.**
- **Un refus du destinataire n'est plus compté comme un succès**, et un
  destinataire lent (au-delà de `WEBHOOK_DELAI_MS`, 5 s) ne bloque jamais
  l'action RH.

---

## L'absentéisme

Écran *Absentéisme*, sous Intelligence RH. Lecture seule : aucune table
nouvelle, rien n'est écrit.

Trois décisions font la validité du chiffre, et il faut les connaître avant de
le citer :

- **Un congé payé n'est pas de l'absentéisme.** Sont retenus les arrêts
  maladie, les congés sans solde et les absences non justifiées. Les congés
  annuels sont exclus — les inclure ferait culminer le taux en août pour la
  meilleure des raisons — et la maternité aussi, pour ne pas pénaliser les
  services qui emploient des femmes. Les retards sont comptés à part : arriver
  en retard n'est pas s'absenter.
- **Les arrêts longs et les absences courtes répétées ne se mélangent pas.**
  Un service à 4 % fait de trois arrêts longs et un service à 4 % fait de vingt
  absences d'un jour n'appellent pas la même conversation : le premier relève
  de la santé au travail, le second de l'encadrement. L'écran est bâti sur
  cette distinction, pas sur le taux global.
- **Un arrêt à cheval sur deux mois compte dans les deux**, au prorata des
  jours. L'imputer entièrement à son mois de début produirait des pics là où
  il n'y en a pas.

Ce que l'écran dit de lui-même, et qu'il faut lire :

- La **formule et le périmètre** accompagnent le taux. Un taux dont on ignore
  le dénominateur ne se défend pas en réunion, et c'est en réunion qu'il sera
  cité.
- **Aucune tendance n'est affichée sous trois mois d'historique.**
- **Un type de congé non classé est signalé**, ni compté ni écarté en silence :
  si vous ajoutez un type, il apparaîtra dans l'avertissement jusqu'à ce qu'on
  tranche.
- **Le dénominateur utilise l'effectif d'aujourd'hui**, faute d'effectif daté
  mois par mois. Sur une période où l'effectif a beaucoup varié, les taux des
  mois anciens sont à lire avec prudence. La réserve est portée à l'écran.

Réglages : `ABSENTEISME_SEUIL_COURT_JOURS` (3), `ABSENTEISME_SEUIL_REPETITION`
(3), `ABSENTEISME_MOIS_MIN_TENDANCE` (3), et `JOURS_OUVRES_MOIS` (26), déjà
utilisé par la paie pour le prorata d'une absence.

---

## Le bulletin expliqué

Sur le portail, la carte *Ma Paie* dit désormais **pourquoi** le net a changé
depuis le mois précédent : c'est la première question posée à une RH, et le
bulletin porte les lignes sans jamais porter les raisons.

Rien n'est recalculé ni deviné. Le serveur compare deux bulletins enregistrés
et rend l'écart en français courant, avec une distinction qui fait tout :

- **Les causes** agissent sur le brut — salaire de base, prime, heures
  supplémentaires, absences, retenues.
- **Les conséquences** en découlent : CNPS, CMU et ITS suivent le brut. Une
  augmentation de 50 000 F n'ajoute pas 50 000 F au net, et c'est précisément
  l'incompréhension que l'écran lève.

Deux garde-fous, qui expliquent ce que vous verrez sur des dossiers anciens :

- **Ce qui ne s'explique pas est affiché comme tel.** Les bulletins antérieurs
  à l'enregistrement du détail des cotisations ne se décomposent pas ; l'écart
  est alors mesuré sur le net réellement versé — celui que le salarié a sous
  les yeux — et le reste inexpliqué est annoncé, avec un renvoi vers la RH.
- **Aucun « motif principal » n'est désigné** lorsque l'essentiel de l'écart
  échappe au calcul. Nommer un coupable au hasard serait pire que se taire.

Aucune IA n'intervient : c'est de l'arithmétique déjà faite, rendue lisible.
La fonction marche donc même sans `ANTHROPIC_WORKSPACE_ID`.

---

## Titres et habilitations des salariés

Écran *Titres & habilitations*. Permis de conduire, visite médicale d'aptitude,
habilitation technique, carte professionnelle, titre de séjour : les mêmes
échéances que le dossier des prestataires, avec les mêmes conséquences. Un
permis expiré au volant d'un véhicule de service engage l'entreprise.

Ce qu'il faut savoir pour l'exploiter :

- **Le salarié dépose depuis son portail**, la RH valide ou refuse. Ce qu'il
  dépose vaut « à contrôler », jamais « valide » : sans cette règle, la
  conformité se déclarerait elle-même. Un refus doit être motivé — sans motif,
  l'intéressé n'a rien à corriger.
- **Une échéance laissée vide est déduite** de la date de délivrance et de la
  durée de validité du type. Une pièce sans échéance ne serait jamais relancée
  et paraîtrait valide indéfiniment.
- **L'aptitude médicale et le titre de séjour sont des pièces personnelles.**
  Un responsable voit qu'une échéance approche — c'est ce dont il a besoin pour
  organiser un remplacement — mais ni la référence, ni le fichier, ni le motif
  d'un refus. La restriction est appliquée à la source, pour chaque pièce, et
  non laissée à la discipline de chacun.
- **L'écran ne dit pas ce qui manque au dossier.** L'application ignore quelles
  pièces tel poste exige ; elle sait seulement que celles qui figurent au
  dossier sont valides ou non. « À jour » ne veut pas dire « complet ».

Réglages, tous surchargeables sans redéploiement : `PIECES_PREAVIS_JOURS`
(60 jours par défaut, plus large que les 30 jours des prestataires — un permis
ou une visite médicale demandent des rendez-vous, pas un courrier), et
`PIECES_VALIDITE_<TYPE>_MOIS` pour chaque durée de validité.

Comme pour les attestations de prestataires, **les fichiers déposés supposent
un disque persistant**. Sur un hébergement au disque éphémère, la ligne
subsiste et le fichier disparaît à chaque redéploiement ; l'application le dit
alors explicitement au lieu d'échouer en silence.

---

## Chiffres affichés et chiffres mesurés

Le tableau de bord analytique remplaçait par des valeurs écrites en dur toute
série qu'il ne pouvait pas calculer — et quatre d'entre elles s'affichaient
ainsi **en toutes circonstances**, mesurées ou non : l'écart salarial
femmes/hommes, le délai de recrutement, le turnover mensuel et la part de
mobilité interne. Rien ne distinguait à l'écran un chiffre mesuré d'un chiffre
inventé. La zone de question en langage naturel fabriquait de son côté des
analyses complètes — « risque de départ de 25 % », « enveloppe de rattrapage
de 1,2 million » — dès que l'assistant ne répondait pas.

Tout cela est retiré. Ce qui le remplace :

- **Une série vide s'affiche vide**, accompagnée de la phrase qui dit ce qui
  manque (`indisponibles` dans la réponse de `/api/analytics/dashboard`).
- **L'écart salarial est calculé**, mais publié seulement au-dessus d'un seuil
  d'effectif par genre et par service (`EFFECTIF_MIN_EQUITE`, 3 par défaut).
  En deçà, la moyenne d'un groupe revient à divulguer une rémunération
  individuelle : dans un service comptant une seule femme, « salaire moyen des
  femmes du service » est son salaire, nommément. Le nombre de services écartés
  est indiqué à l'écran.
- **Le délai de recrutement** se mesure depuis la date d'aboutissement d'une
  candidature (`Applicant.hiredAt`), posée au passage au statut « recrutée ».
  L'indicateur reste vide jusqu'au premier recrutement conclu dans
  l'application — ce qui est la réponse exacte.
- **L'assistant indisponible le dit** au lieu d'inventer une réponse. Poser
  `ANTHROPIC_WORKSPACE_ID` le remet en service, avec dix autres fonctions.

Conséquence pratique à la bascule : **les écrans d'analyse seront largement
vides les premières semaines**, et c'est voulu. Un tableau de bord qui se
remplit tout seul le premier jour ne décrit pas l'entreprise.

---

## Documents de fin de contrat

Les lettres de rupture annoncent au salarié son **solde de tout compte**, son
**certificat de travail** et son **attestation**. L'application produit
désormais les trois, depuis *Départs & Offboarding*. Deux conditions, sans
lesquelles rien ne sort — et le refus dit laquelle manque :

1. **La date de sortie doit être renseignée** sur la fiche du salarié. Aucune
   des trois pièces n'est produite sans elle : elles attestent de la fin d'un
   contrat, et la produire sans cette date reviendrait à certifier un fait
   inconnu.
2. **Le décompte doit être arrêté** avant d'éditer le reçu. L'arrêté fige les
   montants ; le reçu porte cet arrêté, jamais un calcul refait à l'impression.
   Sans cela, deux tirages du même reçu auraient pu montrer des montants
   différents.

Reprendre un arrêté est possible — une erreur se corrige — mais **révoque les
reçus déjà émis** : leur QR les signalera comme invalides. C'est voulu : deux
reçus valides portant des montants différents seraient pires qu'un reçu faux.

Le **certificat de travail** ne porte ni motif ni appréciation : c'est la pièce
que le salarié présentera à son prochain employeur. La cause de la rupture
figure sur l'**attestation de cessation d'emploi**, qui sert les démarches
administratives — avec le matricule et le numéro CNPS, à renseigner au dossier
sous peine de mentions vides.

Les trois pièces sortent signées et scellées, comme les attestations et les
bulletins : elles supposent donc **un signataire enregistré** (écran
*Signataires*) et **la clé de scellement** en place (`npm run cle-scellement`).
Sans signataire, le document sort avec la mention « émis sans signataire
désigné » ; sans clé, une clé est produite et conservée en base au premier
document — mais poser `SIGNATURE_SEAL_PRIVATE_KEY` dans l'environnement reste
préférable, la clé survivant alors à une recréation de la base.

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

**Multi-entreprise — écarté.** SII n'exploite qu'une entité juridique ; le
schéma reste donc sans notion d'entreprise. Porter un `tenantId` sur une
trentaine de modèles et sur chaque requête coûterait une complexité permanente
contre un besoin inexistant. À rouvrir si une seconde société est créée — et
alors **avant** de saisir ses données, jamais après.

**Envoi d'emails.** Sans configuration SMTP, les notifications partent vers une
boîte de test jetable. Les salariés ne reçoivent rien, et rien ne le signale
dans l'interface. À régler avant d'annoncer la fonctionnalité.

## Fonctions retirées le 23 septembre 2026

Quatre sujets étaient traités deux fois : une maquette de démonstration d'un
côté, une fonction enregistrant en base de l'autre. Sur décision d'Ibrahim
Diop, les secondes ont été retirées pour ne garder qu'un écran par sujet.

| Retiré | Ce qui reste |
|---|---|
| Attestations en libre-service depuis le badge | *Kiosque Attestations Express* |
| Indemnités journalières CNPS (créances, encaissements) | *Sécurité, CSST & Accidents CNPS* |
| Mandats et scrutins des délégués | *Délégués & Doléances Salariés* |
| Grille conventionnelle et contrôle du minimum | *Simulateur Brut/Net & Grille CCNI* |

**Ce qui disparaît avec elles**, et qu'il faut savoir : la paie ne signale plus
un salaire inférieur au minimum de sa catégorie ; les créances d'indemnités
journalières ne sont plus suivies jusqu'à leur encaissement ; les échéances de
mandat ne remontent plus dans les alertes RH ; un salarié ne peut plus éditer
lui-même une attestation scellée depuis son badge.

**Aucune donnée n'a été supprimée.** Les tables `grille_convention`,
`indemnite_journaliere`, `scrutin`, `mandat_delegue` et `reunion_delegues`
restent en place, simplement plus alimentées. Les faire tomber demandera une
migration explicite, à décider séparément.

## Avant la bascule chez SII — ce qui a été fait, ce qui reste

Lot de mise en production livré le 24 septembre 2026.

### Corrigé

| Point | Avant | Après |
|---|---|---|
| Langue du document | `lang="en"` | `lang="fr"` — les lecteurs d'écran lisent le français correctement |
| Adresse du visiteur | celle du proxy, pour tout le monde | `trust proxy` : le limiteur de débit distingue les clients, les traces d'audit portent la bonne adresse |
| Table des rôles | une par côté, divergentes | une seule (`src/lib/roles.js`), alignée sur le serveur |
| Assistant social | refusé sur ses propres écrans | reconnu |
| `RequirePermission` | ignorait la permission demandée | applique ce qu'il annonce |
| Premier chargement | 128 écrans importés au démarrage | chargés à la demande, avec écran d'attente |
| Fiches en double | rien ne les empêchait | une correspondance certaine (CNPS ou matricule) arrête la création |

### Ce qui reste à faire, et par qui

**Par Ibrahim, avant d'ouvrir aux salariés** — ces trois-là ne sont pas dans le
code, et personne d'autre ne doit les déclencher :

1. `DISABLE_TEST_ACCOUNTS=true` sur Render — le mot de passe des comptes de
   démonstration est affiché sur l'écran de connexion.
2. `VITE_DEMO_MODE=false` sur Vercel — mais créer un compte réel **avant**,
   sinon plus personne n'entre.
3. `npm run purge-demo -- --confirm` une fois les vraies données chargées.

**Par le service informatique** : voir `docs/PASSATION-IT.md`.

**Par le cabinet comptable** : les valeurs que l'application refuse d'inventer
et sans lesquelles certaines fonctions restent muettes — SMIG, barème de
l'allocation de fin de carrière, plafond d'exonération du transport, forfaits
de per diem, taux d'indemnisation CNPS, quota de travailleurs handicapés.

**Par la banque** : le format de fichier de virement. Tant qu'il n'est pas
connu, le fichier produit reste un CSV générique.

### Contrôle du doublon à la création

Une fiche dont le numéro CNPS ou le matricule correspond à une fiche existante
est refusée avec un code 409 et le nom de la fiche concernée. S'il s'agit bien
d'une autre personne — homonymie, réembauche —, renvoyer la demande avec
`confirmerDoublon: true`.

La contrainte d'unicité sur le numéro CNPS **n'a pas été posée en base** : elle
échouerait sur les doublons déjà présents. L'inventaire se lit par
`lib/doublon.js` → `inventaire()`, à passer avant d'ajouter la contrainte.
