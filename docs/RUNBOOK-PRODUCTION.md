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
