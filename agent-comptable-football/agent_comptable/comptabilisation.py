"""Construction déterministe des écritures comptables à partir des données extraites.

L'IA (extraction.py) lit la pièce et suggère les comptes ; ce module construit
l'écriture équilibrée en pur Python — aucun montant n'est calculé par le modèle.
"""

from __future__ import annotations

import datetime as dt
import json
from decimal import Decimal

from .db import EcritureComptable, LigneEcriture, PieceComptable, get_session
from .plan_comptable import (
    COMPTE_CHARGE_DEFAUT,
    COMPTE_PRODUIT_DEFAUT,
    compte_existe,
    suggerer_compte,
)

COMPTE_FOURNISSEURS = "401"
COMPTE_CLIENTS = "411"
COMPTE_TVA_RECUPERABLE = "4452"
COMPTE_TVA_FACTUREE = "4431"


def _dec(valeur) -> Decimal:
    if valeur is None:
        return Decimal("0")
    return Decimal(str(valeur)).quantize(Decimal("0.01"))


def construire_lignes(donnees: dict) -> list[dict]:
    """Construit les lignes (dictionnaires compte/libelle/debit/credit) équilibrées.

    ``donnees`` est le JSON produit par l'extraction. Fonction pure : aucune base,
    aucune IA — testable hors ligne.
    """
    type_piece = donnees.get("type_piece", "facture_fournisseur")
    sens = "produit" if type_piece == "facture_client" else "charge"
    ttc = _dec(donnees.get("montant_ttc"))
    tva = _dec(donnees.get("montant_tva"))
    if ttc <= 0:
        raise ValueError("montant_ttc manquant ou nul — écriture impossible")

    base = ttc - tva  # HT reconstitué depuis TTC et TVA (source de vérité : le TTC)
    emetteur = donnees.get("emetteur") or "Tiers inconnu"

    # Répartition de la base HT sur les lignes suggérées par l'IA
    lignes_source = donnees.get("lignes") or []
    lignes_valides = []
    total_source = Decimal("0")
    for ligne in lignes_source:
        montant = _dec(ligne.get("montant"))
        if montant > 0:
            lignes_valides.append((ligne, montant))
            total_source += montant

    repartition: list[tuple[str, str, Decimal]] = []  # (compte, libelle, montant)
    if lignes_valides and total_source > 0:
        cumule = Decimal("0")
        for index, (ligne, montant) in enumerate(lignes_valides):
            compte = str(ligne.get("compte_suggere") or "")
            if not compte_existe(compte):
                compte = suggerer_compte(ligne.get("libelle", ""), sens)
            if index == len(lignes_valides) - 1:
                part = base - cumule  # le reliquat d'arrondi va sur la dernière ligne
            else:
                part = (base * montant / total_source).quantize(Decimal("0.01"))
                cumule += part
            repartition.append((compte, ligne.get("libelle", emetteur), part))
    else:
        compte_defaut = COMPTE_PRODUIT_DEFAUT if sens == "produit" else COMPTE_CHARGE_DEFAUT
        compte = suggerer_compte(donnees.get("commentaire") or emetteur, sens)
        repartition.append((compte or compte_defaut, emetteur, base))

    lignes: list[dict] = []
    if sens == "charge":
        for compte, libelle, montant in repartition:
            lignes.append({"compte": compte, "libelle": libelle, "debit": montant, "credit": Decimal("0")})
        if tva > 0:
            lignes.append({"compte": COMPTE_TVA_RECUPERABLE, "libelle": "TVA récupérable 18%", "debit": tva, "credit": Decimal("0")})
        lignes.append({"compte": COMPTE_FOURNISSEURS, "libelle": f"Fournisseur {emetteur}", "debit": Decimal("0"), "credit": ttc})
    else:
        lignes.append({"compte": COMPTE_CLIENTS, "libelle": f"Client {emetteur}", "debit": ttc, "credit": Decimal("0")})
        for compte, libelle, montant in repartition:
            lignes.append({"compte": compte, "libelle": libelle, "debit": Decimal("0"), "credit": montant})
        if tva > 0:
            lignes.append({"compte": COMPTE_TVA_FACTUREE, "libelle": "TVA facturée 18%", "debit": Decimal("0"), "credit": tva})

    verifier_equilibre(lignes)
    return lignes


def verifier_equilibre(lignes: list[dict]) -> None:
    total_debit = sum((l["debit"] for l in lignes), Decimal("0"))
    total_credit = sum((l["credit"] for l in lignes), Decimal("0"))
    if total_debit != total_credit:
        raise ValueError(f"Écriture déséquilibrée : débit {total_debit} ≠ crédit {total_credit}")


def comptabiliser_piece(piece_id: int) -> int:
    """Génère et enregistre l'écriture d'une pièce extraite. Retourne l'id de l'écriture."""
    with get_session() as session:
        piece = session.get(PieceComptable, piece_id)
        if piece is None:
            raise ValueError(f"Pièce {piece_id} introuvable")
        if piece.statut != "extraite" or not piece.donnees_extraites:
            raise ValueError(f"Pièce {piece_id} non extraite (statut : {piece.statut})")

        donnees = json.loads(piece.donnees_extraites)
        lignes = construire_lignes(donnees)

        type_piece = donnees.get("type_piece", "facture_fournisseur")
        journal = "VE" if type_piece == "facture_client" else "ACH"
        date_piece = donnees.get("date_piece")
        try:
            date_ecriture = dt.date.fromisoformat(date_piece) if date_piece else dt.date.today()
        except ValueError:
            date_ecriture = dt.date.today()

        libelle = f"{donnees.get('emetteur', 'Pièce')} — {donnees.get('numero_piece') or f'pièce #{piece.id}'}"
        ecriture = EcritureComptable(
            piece_id=piece.id,
            journal=journal,
            date_ecriture=date_ecriture,
            libelle=libelle[:300],
        )
        for ligne in lignes:
            ecriture.lignes.append(
                LigneEcriture(
                    compte=ligne["compte"],
                    libelle=str(ligne["libelle"])[:300],
                    debit=ligne["debit"],
                    credit=ligne["credit"],
                )
            )
        session.add(ecriture)
        piece.statut = "comptabilisee"
        session.commit()
        return ecriture.id


def comptabiliser_pieces_extraites() -> list[int]:
    """Comptabilise toutes les pièces au statut ``extraite``."""
    with get_session() as session:
        ids = [
            p.id
            for p in session.query(PieceComptable).filter(PieceComptable.statut == "extraite")
        ]
    ecritures = []
    for piece_id in ids:
        try:
            ecritures.append(comptabiliser_piece(piece_id))
        except ValueError:
            continue  # pièce incomplète — reste en statut "extraite" pour revue manuelle
    return ecritures
