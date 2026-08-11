# Agent Comptable IA — Fédération de Football Américain de Côte d'Ivoire

Agent IA comptable propulsé par Claude (Anthropic) pour la gestion comptable d'une
fédération sportive en Côte d'Ivoire :

- **Boîte e-mail comptable** : relève automatiquement une boîte e-mail (IMAP) et récupère
  les pièces jointes (factures PDF, reçus, images de justificatifs).
- **Extraction intelligente** : Claude lit chaque pièce (PDF ou image) et en extrait les
  données structurées (fournisseur, montants HT/TVA/TTC, lignes, dates, échéances) et
  suggère les comptes du plan **SYSCOHADA révisé** (simplifié).
- **Comptabilisation** : génération d'écritures comptables équilibrées (journal des
  achats, ventes, banque, opérations diverses), en **FCFA (XOF)**, TVA 18 %.
- **Échéanciers de paiement** : création et suivi d'échéanciers (mensualités, dates,
  statut payé / à payer / en retard).
- **Rapports** : journal, balance des comptes, liste des échéances, export CSV.
- **Agent conversationnel** : discutez avec le comptable IA en français — il consulte les
  pièces, la balance, crée des échéanciers, marque des paiements, via des outils connectés
  à la base de données.

> ⚠️ **Avertissement** : cet agent *propose* des écritures et des analyses ; il ne remplace
> pas un expert-comptable. Toute écriture doit être validée par un humain avant usage
> officiel (déclarations fiscales, bilan OHADA, etc.).

---

## Architecture

```
Boîte e-mail (IMAP)                    ┌──────────────────────────┐
  factures / reçus  ──── ingestion ──▶ │  data/pieces/  +  SQLite │
                                       │  (pieces, écritures,     │
Claude API (claude-opus-5)             │   échéanciers, tiers)    │
  extraction structurée  ◀──────────── └──────────────────────────┘
  + suggestion de comptes                          │
        │                                          ▼
        ▼                              CLI / Agent conversationnel
  écritures équilibrées                journal · balance · échéanciers
  (générées en code, pas par l'IA)     rapports CSV · chat comptable
```

Principe clé : **l'IA lit et suggère, le code calcule**. Les montants, l'équilibre
débit/crédit et les échéanciers sont calculés de façon déterministe en Python ; Claude
n'est utilisé que pour la lecture des documents et le choix des comptes.

## Installation

```bash
cd agent-comptable-football
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # puis renseigner vos identifiants
```

### Configuration (`.env`)

| Variable            | Description                                          |
|---------------------|------------------------------------------------------|
| `ANTHROPIC_API_KEY` | Clé API Anthropic (https://platform.claude.com)      |
| `CLAUDE_MODEL`      | Modèle (défaut : `claude-opus-5`)                    |
| `IMAP_HOST`         | Serveur IMAP (ex. `imap.gmail.com`)                  |
| `IMAP_USER`         | Adresse de la boîte comptable                        |
| `IMAP_PASSWORD`     | Mot de passe (Gmail : *mot de passe d'application*)  |
| `IMAP_FOLDER`       | Dossier relevé (défaut : `INBOX`)                    |
| `DB_PATH`           | Base SQLite (défaut : `data/comptabilite.db`)        |
| `PIECES_DIR`        | Stockage des pièces (défaut : `data/pieces`)         |

> **Gmail** : activez la validation en deux étapes puis créez un « mot de passe
> d'application » — le mot de passe du compte ne fonctionnera pas en IMAP.

## Utilisation

```bash
# 1. Initialiser la base
python -m agent_comptable init

# 2. Relever la boîte e-mail (récupère les pièces jointes non lues)
python -m agent_comptable ingerer-emails

# 3. Extraire les données des pièces avec Claude
python -m agent_comptable extraire

# 4. Générer et enregistrer les écritures proposées
python -m agent_comptable comptabiliser

# Rapports
python -m agent_comptable journal
python -m agent_comptable balance
python -m agent_comptable export-csv rapports/

# Échéanciers
python -m agent_comptable echeancier creer --montant 1500000 --nb 3 \
    --beneficiaire "Equipementier ABC" --debut 2026-09-01
python -m agent_comptable echeancier lister
python -m agent_comptable echeancier payer 2   # marque l'échéance n°2 payée

# Agent conversationnel (chat en français)
python -m agent_comptable chat
```

Exemples de questions pour le chat : *« Quelles pièces restent à traiter ? »*,
*« Montre-moi la balance »*, *« Crée un échéancier de 3 mensualités pour la facture 5 »*,
*« Quelles échéances sont en retard ? »*.

### Automatisation

Relevé de la boîte toutes les heures (cron) :

```cron
0 * * * * cd /chemin/agent-comptable-football && .venv/bin/python -m agent_comptable ingerer-emails && .venv/bin/python -m agent_comptable extraire
```

## Plan comptable

Plan **SYSCOHADA révisé simplifié**, adapté à une fédération sportive (cotisations et
licences des clubs, subventions, sponsoring, achats d'équipements, transport, arbitrage,
organisation de matchs…). Voir `agent_comptable/plan_comptable.py` — à ajuster avec votre
expert-comptable.

## Tests

```bash
python -m pytest tests/ -v      # ou : python -m unittest discover tests
```

Les tests couvrent la logique déterministe (échéanciers, équilibre des écritures, plan
comptable) et ne nécessitent pas de clé API.

## Extraire ce projet vers son propre dépôt

Ce projet vit temporairement dans un sous-dossier de `sirh-sii` (l'intégration GitHub de
la session n'avait pas le droit de créer un dépôt). Une fois le dépôt
`agent-comptable-football` créé sur GitHub :

```bash
git clone https://github.com/KingDizzy225/sirh-sii --branch claude/agent-comptable-football-76r2mg tmp
cp -r tmp/agent-comptable-football/* nouveau-depot/
cd nouveau-depot && git init && git add . && git commit -m "Import initial" && \
  git remote add origin https://github.com/KingDizzy225/agent-comptable-football && git push -u origin main
```
