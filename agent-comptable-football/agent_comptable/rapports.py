"""Rapports comptables : journal, balance, exports CSV."""

from __future__ import annotations

import csv
from decimal import Decimal
from pathlib import Path

from .db import EcritureComptable, LigneEcriture, get_session
from .plan_comptable import libelle_compte


def journal(limite: int | None = None) -> list[dict]:
    """Les écritures du journal, de la plus récente à la plus ancienne."""
    with get_session() as session:
        requete = session.query(EcritureComptable).order_by(
            EcritureComptable.date_ecriture.desc(), EcritureComptable.id.desc()
        )
        if limite:
            requete = requete.limit(limite)
        resultat = []
        for ecriture in requete.all():
            resultat.append(
                {
                    "id": ecriture.id,
                    "date": ecriture.date_ecriture.isoformat(),
                    "journal": ecriture.journal,
                    "libelle": ecriture.libelle,
                    "lignes": [
                        {
                            "compte": ligne.compte,
                            "intitule": libelle_compte(ligne.compte),
                            "libelle": ligne.libelle,
                            "debit": str(ligne.debit),
                            "credit": str(ligne.credit),
                        }
                        for ligne in ecriture.lignes
                    ],
                }
            )
        return resultat


def balance() -> list[dict]:
    """Balance des comptes : total débit, total crédit et solde par compte."""
    comptes: dict[str, dict[str, Decimal]] = {}
    with get_session() as session:
        for ligne in session.query(LigneEcriture).all():
            entree = comptes.setdefault(
                ligne.compte, {"debit": Decimal("0"), "credit": Decimal("0")}
            )
            entree["debit"] += ligne.debit
            entree["credit"] += ligne.credit

    resultat = []
    for compte in sorted(comptes):
        totaux = comptes[compte]
        solde = totaux["debit"] - totaux["credit"]
        resultat.append(
            {
                "compte": compte,
                "intitule": libelle_compte(compte),
                "total_debit": str(totaux["debit"]),
                "total_credit": str(totaux["credit"]),
                "solde": str(solde),
                "sens": "débiteur" if solde > 0 else ("créditeur" if solde < 0 else "soldé"),
            }
        )
    return resultat


def exporter_csv(dossier: str) -> list[str]:
    """Exporte journal et balance en CSV. Retourne les chemins créés."""
    destination = Path(dossier)
    destination.mkdir(parents=True, exist_ok=True)
    fichiers = []

    chemin_journal = destination / "journal.csv"
    with chemin_journal.open("w", newline="", encoding="utf-8") as flux:
        auteur = csv.writer(flux)
        auteur.writerow(["ecriture", "date", "journal", "libelle_ecriture", "compte", "intitule", "libelle_ligne", "debit", "credit"])
        for ecriture in journal():
            for ligne in ecriture["lignes"]:
                auteur.writerow(
                    [
                        ecriture["id"],
                        ecriture["date"],
                        ecriture["journal"],
                        ecriture["libelle"],
                        ligne["compte"],
                        ligne["intitule"],
                        ligne["libelle"],
                        ligne["debit"],
                        ligne["credit"],
                    ]
                )
    fichiers.append(str(chemin_journal))

    chemin_balance = destination / "balance.csv"
    with chemin_balance.open("w", newline="", encoding="utf-8") as flux:
        auteur = csv.writer(flux)
        auteur.writerow(["compte", "intitule", "total_debit", "total_credit", "solde", "sens"])
        for ligne in balance():
            auteur.writerow(
                [
                    ligne["compte"],
                    ligne["intitule"],
                    ligne["total_debit"],
                    ligne["total_credit"],
                    ligne["solde"],
                    ligne["sens"],
                ]
            )
    fichiers.append(str(chemin_balance))

    return fichiers
