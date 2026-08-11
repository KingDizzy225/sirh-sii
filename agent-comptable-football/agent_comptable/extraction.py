"""Extraction des données d'une pièce comptable (PDF ou image) avec Claude.

Claude lit le document et retourne un JSON structuré (garanti conforme au schéma
grâce aux structured outputs), incluant une suggestion de compte SYSCOHADA par ligne.
Les calculs comptables (équilibre débit/crédit) restent ensuite en Python.
"""

from __future__ import annotations

import base64
import json
from pathlib import Path

from anthropic import Anthropic

from .config import settings
from .db import PieceComptable, get_session
from .plan_comptable import plan_pour_prompt

MEDIA_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
}

# Schéma des données extraites — structured outputs (additionalProperties: false partout)
SCHEMA_PIECE = {
    "type": "object",
    "additionalProperties": False,
    "required": [
        "type_piece",
        "emetteur",
        "numero_piece",
        "date_piece",
        "devise",
        "montant_ht",
        "montant_tva",
        "montant_ttc",
        "date_echeance",
        "lignes",
        "commentaire",
    ],
    "properties": {
        "type_piece": {
            "type": "string",
            "enum": ["facture_fournisseur", "recu_paiement", "facture_client", "autre"],
            "description": "Nature de la pièce du point de vue de la fédération",
        },
        "emetteur": {"type": "string", "description": "Nom du fournisseur ou de l'émetteur"},
        "numero_piece": {"type": ["string", "null"]},
        "date_piece": {"type": ["string", "null"], "description": "Date au format AAAA-MM-JJ"},
        "devise": {"type": "string", "description": "Code devise, ex. XOF"},
        "montant_ht": {"type": ["number", "null"]},
        "montant_tva": {"type": ["number", "null"]},
        "montant_ttc": {"type": "number"},
        "date_echeance": {
            "type": ["string", "null"],
            "description": "Date limite de paiement AAAA-MM-JJ si mentionnée",
        },
        "lignes": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["libelle", "montant", "compte_suggere"],
                "properties": {
                    "libelle": {"type": "string"},
                    "montant": {"type": "number", "description": "Montant HT de la ligne"},
                    "compte_suggere": {
                        "type": "string",
                        "description": "Numéro de compte SYSCOHADA choisi dans le plan fourni",
                    },
                },
            },
        },
        "commentaire": {
            "type": ["string", "null"],
            "description": "Anomalies ou incertitudes relevées (montants illisibles, etc.)",
        },
    },
}

PROMPT_SYSTEME = f"""Tu es le comptable d'une fédération de football américain en Côte d'Ivoire.
Tu lis des pièces comptables (factures, reçus) et tu en extrais les données.

Règles :
- La devise habituelle est le franc CFA (XOF) ; la TVA ivoirienne est de 18 %.
- Les montants sont des nombres, sans séparateurs de milliers.
- Pour chaque ligne, choisis le compte le plus adapté dans ce plan comptable SYSCOHADA
  simplifié (réponds uniquement avec un numéro de ce plan) :

{plan_pour_prompt()}

- Une facture reçue d'un prestataire ou fournisseur est une "facture_fournisseur".
- Une facture émise par la fédération (cotisation, licence, sponsoring facturé) est une
  "facture_client".
- Si une information est absente ou illisible, mets null et signale-le en commentaire."""


def _bloc_document(chemin: Path) -> dict:
    donnees = base64.standard_b64encode(chemin.read_bytes()).decode()
    if chemin.suffix.lower() == ".pdf":
        return {
            "type": "document",
            "source": {"type": "base64", "media_type": "application/pdf", "data": donnees},
        }
    media_type = MEDIA_TYPES.get(chemin.suffix.lower())
    if not media_type:
        raise ValueError(f"Format non pris en charge : {chemin.suffix}")
    return {
        "type": "image",
        "source": {"type": "base64", "media_type": media_type, "data": donnees},
    }


def extraire_fichier(chemin_fichier: str, client: Anthropic | None = None) -> dict:
    """Extrait les données structurées d'un fichier de pièce comptable."""
    client = client or Anthropic()
    chemin = Path(chemin_fichier)

    reponse = client.messages.create(
        model=settings.claude_model,
        max_tokens=16000,
        system=PROMPT_SYSTEME,
        output_config={"format": {"type": "json_schema", "schema": SCHEMA_PIECE}},
        messages=[
            {
                "role": "user",
                "content": [
                    _bloc_document(chemin),
                    {
                        "type": "text",
                        "text": "Extrais les données de cette pièce comptable au format demandé.",
                    },
                ],
            }
        ],
    )

    if reponse.stop_reason == "refusal":
        raise RuntimeError("Claude a refusé de traiter cette pièce (stop_reason=refusal)")
    if reponse.stop_reason == "max_tokens":
        raise RuntimeError("Réponse tronquée (max_tokens) — réessayer avec une limite plus haute")

    texte = "".join(bloc.text for bloc in reponse.content if bloc.type == "text")
    return json.loads(texte)


def extraire_pieces_en_attente(client: Anthropic | None = None) -> list[int]:
    """Extrait toutes les pièces au statut ``a_traiter``. Retourne les ids traités."""
    client = client or Anthropic()
    traitees: list[int] = []

    with get_session() as session:
        pieces = (
            session.query(PieceComptable).filter(PieceComptable.statut == "a_traiter").all()
        )
        for piece in pieces:
            try:
                donnees = extraire_fichier(piece.fichier, client)
            except Exception as erreur:  # pièce illisible, refus, fichier manquant…
                piece.statut = "rejetee"
                piece.donnees_extraites = json.dumps(
                    {"erreur": str(erreur)}, ensure_ascii=False
                )
                session.commit()
                continue
            piece.donnees_extraites = json.dumps(donnees, ensure_ascii=False)
            piece.statut = "extraite"
            session.commit()
            traitees.append(piece.id)

    return traitees
