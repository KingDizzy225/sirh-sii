"""Agent conversationnel : le comptable IA de la fédération, connecté à la base.

Boucle d'agent manuelle (Messages API + tool use) : Claude décide quels outils
appeler ; les outils exécutent des requêtes sur la base SQLite locale.
"""

from __future__ import annotations

import datetime as dt
import json

from anthropic import Anthropic

from . import comptabilisation, echeancier, rapports
from .config import settings
from .db import PieceComptable, get_session
from .plan_comptable import plan_pour_prompt

PROMPT_SYSTEME = f"""Tu es le comptable IA de la fédération de football américain de Côte d'Ivoire.
Tu réponds en français, avec rigueur et concision. La devise est le franc CFA (XOF),
la TVA ivoirienne est de 18 %, et le référentiel est le SYSCOHADA révisé (plan simplifié
ci-dessous). Utilise les outils pour consulter les pièces, le journal, la balance et les
échéanciers plutôt que de deviner. Les montants que tu annonces viennent toujours d'un
résultat d'outil. Pour toute opération qui modifie les données (créer un échéancier,
marquer un paiement, comptabiliser une pièce), reformule d'abord ce que tu vas faire,
puis fais-le, puis confirme le résultat.

Plan comptable :
{plan_pour_prompt()}"""

OUTILS = [
    {
        "name": "lister_pieces",
        "description": (
            "Liste les pièces comptables reçues (factures, reçus). Filtre optionnel par "
            "statut : a_traiter (reçue, pas encore lue par l'IA), extraite (données lues, "
            "pas encore comptabilisée), comptabilisee, rejetee."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "statut": {
                    "type": "string",
                    "enum": ["a_traiter", "extraite", "comptabilisee", "rejetee"],
                    "description": "Statut à filtrer ; omettre pour tout lister",
                }
            },
        },
    },
    {
        "name": "consulter_piece",
        "description": "Détail d'une pièce : métadonnées e-mail et données extraites par l'IA.",
        "input_schema": {
            "type": "object",
            "properties": {"piece_id": {"type": "integer"}},
            "required": ["piece_id"],
        },
    },
    {
        "name": "comptabiliser_piece",
        "description": (
            "Génère et enregistre l'écriture comptable équilibrée d'une pièce déjà extraite "
            "(débit charges + TVA, crédit fournisseur — ou l'inverse pour une facture client)."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"piece_id": {"type": "integer"}},
            "required": ["piece_id"],
        },
    },
    {
        "name": "consulter_journal",
        "description": "Les dernières écritures comptables enregistrées, avec leurs lignes débit/crédit.",
        "input_schema": {
            "type": "object",
            "properties": {
                "limite": {"type": "integer", "description": "Nombre d'écritures (défaut 20)"}
            },
        },
    },
    {
        "name": "consulter_balance",
        "description": "Balance des comptes : totaux débit/crédit et solde par compte SYSCOHADA.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "creer_echeancier",
        "description": (
            "Crée un échéancier de paiement : le montant total est réparti en n échéances "
            "égales (le reliquat d'arrondi sur la dernière), espacées d'un intervalle en jours."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "beneficiaire": {"type": "string"},
                "montant_total": {"type": "number"},
                "nb_echeances": {"type": "integer"},
                "date_debut": {"type": "string", "description": "Première échéance, AAAA-MM-JJ"},
                "intervalle_jours": {"type": "integer", "description": "Défaut : 30 (mensuel)"},
                "piece_id": {"type": "integer", "description": "Pièce liée, si applicable"},
            },
            "required": ["beneficiaire", "montant_total", "nb_echeances", "date_debut"],
        },
    },
    {
        "name": "lister_echeances",
        "description": "Liste les échéances de paiement, avec statut (a_payer, payee, en_retard).",
        "input_schema": {
            "type": "object",
            "properties": {
                "statut": {"type": "string", "enum": ["a_payer", "payee"]},
                "en_retard_seulement": {"type": "boolean"},
            },
        },
    },
    {
        "name": "marquer_echeance_payee",
        "description": "Marque une échéance comme payée (aujourd'hui, ou à la date fournie).",
        "input_schema": {
            "type": "object",
            "properties": {
                "echeance_id": {"type": "integer"},
                "date_paiement": {"type": "string", "description": "AAAA-MM-JJ, défaut aujourd'hui"},
            },
            "required": ["echeance_id"],
        },
    },
]


def _outil_lister_pieces(params: dict) -> list[dict]:
    with get_session() as session:
        requete = session.query(PieceComptable).order_by(PieceComptable.id.desc())
        if params.get("statut"):
            requete = requete.filter(PieceComptable.statut == params["statut"])
        return [
            {
                "id": piece.id,
                "statut": piece.statut,
                "source": piece.source,
                "expediteur": piece.email_expediteur,
                "sujet": piece.email_sujet,
                "fichier": piece.fichier,
                "recu_le": piece.recu_le.isoformat(),
            }
            for piece in requete.all()
        ]


def _outil_consulter_piece(params: dict) -> dict:
    with get_session() as session:
        piece = session.get(PieceComptable, params["piece_id"])
        if piece is None:
            return {"erreur": f"Pièce {params['piece_id']} introuvable"}
        return {
            "id": piece.id,
            "statut": piece.statut,
            "expediteur": piece.email_expediteur,
            "sujet": piece.email_sujet,
            "fichier": piece.fichier,
            "donnees_extraites": json.loads(piece.donnees_extraites)
            if piece.donnees_extraites
            else None,
        }


def _executer_outil(nom: str, params: dict):
    if nom == "lister_pieces":
        return _outil_lister_pieces(params)
    if nom == "consulter_piece":
        return _outil_consulter_piece(params)
    if nom == "comptabiliser_piece":
        ecriture_id = comptabilisation.comptabiliser_piece(params["piece_id"])
        return {"ecriture_id": ecriture_id, "message": "Écriture enregistrée"}
    if nom == "consulter_journal":
        return rapports.journal(limite=params.get("limite", 20))
    if nom == "consulter_balance":
        return rapports.balance()
    if nom == "creer_echeancier":
        echeancier_id = echeancier.creer_echeancier(
            beneficiaire=params["beneficiaire"],
            montant_total=params["montant_total"],
            nb_echeances=params["nb_echeances"],
            date_debut=dt.date.fromisoformat(params["date_debut"]),
            intervalle_jours=params.get("intervalle_jours", 30),
            piece_id=params.get("piece_id"),
        )
        return {"echeancier_id": echeancier_id, "message": "Échéancier créé"}
    if nom == "lister_echeances":
        return echeancier.lister_echeances(
            statut=params.get("statut"),
            en_retard_seulement=params.get("en_retard_seulement", False),
        )
    if nom == "marquer_echeance_payee":
        date_paiement = (
            dt.date.fromisoformat(params["date_paiement"])
            if params.get("date_paiement")
            else None
        )
        echeancier.marquer_payee(params["echeance_id"], date_paiement)
        return {"message": f"Échéance {params['echeance_id']} marquée payée"}
    return {"erreur": f"Outil inconnu : {nom}"}


def repondre(messages: list[dict], client: Anthropic | None = None) -> tuple[str, list[dict]]:
    """Un tour de conversation complet (boucle d'outils incluse).

    Prend l'historique ``messages`` (mutable, mis à jour en place) et retourne
    (texte_final, messages).
    """
    client = client or Anthropic()

    while True:
        reponse = client.messages.create(
            model=settings.claude_model,
            max_tokens=16000,
            system=PROMPT_SYSTEME,
            tools=OUTILS,
            messages=messages,
        )

        if reponse.stop_reason == "refusal":
            return "Je ne peux pas traiter cette demande.", messages

        if reponse.stop_reason != "tool_use":
            texte = "".join(bloc.text for bloc in reponse.content if bloc.type == "text")
            messages.append({"role": "assistant", "content": reponse.content})
            return texte, messages

        messages.append({"role": "assistant", "content": reponse.content})
        resultats = []
        for bloc in reponse.content:
            if bloc.type != "tool_use":
                continue
            try:
                resultat = _executer_outil(bloc.name, dict(bloc.input))
                contenu = json.dumps(resultat, ensure_ascii=False, default=str)
                erreur = False
            except Exception as exception:
                contenu = f"Erreur : {exception}"
                erreur = True
            resultats.append(
                {
                    "type": "tool_result",
                    "tool_use_id": bloc.id,
                    "content": contenu,
                    "is_error": erreur,
                }
            )
        messages.append({"role": "user", "content": resultats})


def boucle_chat() -> None:
    """Chat interactif dans le terminal."""
    client = Anthropic()
    messages: list[dict] = []
    print("Comptable IA de la fédération — tapez votre question (« quitter » pour sortir).\n")
    while True:
        try:
            question = input("Vous > ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not question:
            continue
        if question.lower() in {"quitter", "exit", "q"}:
            break
        messages.append({"role": "user", "content": question})
        texte, messages = repondre(messages, client)
        print(f"\nComptable > {texte}\n")
