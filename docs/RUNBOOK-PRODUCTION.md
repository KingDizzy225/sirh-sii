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
