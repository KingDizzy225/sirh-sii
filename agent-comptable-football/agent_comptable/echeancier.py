"""Échéanciers de paiement — calculs déterministes (aucune IA).

Les montants sont répartis équitablement ; le reliquat d'arrondi est porté par la
dernière échéance, de sorte que la somme des échéances égale toujours le total.
"""

from __future__ import annotations

import datetime as dt
from decimal import Decimal

from .db import Echeance, Echeancier, get_session


def calculer_echeances(
    montant_total: Decimal | int | float | str,
    nb_echeances: int,
    date_debut: dt.date,
    intervalle_jours: int = 30,
) -> list[tuple[dt.date, Decimal]]:
    """Calcule les (date, montant) de chaque échéance. Fonction pure et testable."""
    total = Decimal(str(montant_total)).quantize(Decimal("0.01"))
    if total <= 0:
        raise ValueError("Le montant total doit être positif")
    if nb_echeances < 1:
        raise ValueError("Il faut au moins une échéance")

    part = (total / nb_echeances).quantize(Decimal("0.01"))
    echeances: list[tuple[dt.date, Decimal]] = []
    cumule = Decimal("0")
    for numero in range(nb_echeances):
        date_echeance = date_debut + dt.timedelta(days=intervalle_jours * numero)
        if numero == nb_echeances - 1:
            montant = total - cumule
        else:
            montant = part
            cumule += part
        echeances.append((date_echeance, montant))
    return echeances


def creer_echeancier(
    beneficiaire: str,
    montant_total,
    nb_echeances: int,
    date_debut: dt.date,
    intervalle_jours: int = 30,
    piece_id: int | None = None,
) -> int:
    """Crée et enregistre un échéancier. Retourne son id."""
    lignes = calculer_echeances(montant_total, nb_echeances, date_debut, intervalle_jours)

    with get_session() as session:
        echeancier = Echeancier(
            piece_id=piece_id,
            beneficiaire=beneficiaire,
            montant_total=Decimal(str(montant_total)).quantize(Decimal("0.01")),
            nb_echeances=nb_echeances,
        )
        for numero, (date_echeance, montant) in enumerate(lignes, start=1):
            echeancier.echeances.append(
                Echeance(numero=numero, date_echeance=date_echeance, montant=montant)
            )
        session.add(echeancier)
        session.commit()
        return echeancier.id


def marquer_payee(echeance_id: int, date_paiement: dt.date | None = None) -> None:
    with get_session() as session:
        echeance = session.get(Echeance, echeance_id)
        if echeance is None:
            raise ValueError(f"Échéance {echeance_id} introuvable")
        echeance.statut = "payee"
        echeance.payee_le = date_paiement or dt.date.today()
        session.commit()


def lister_echeances(statut: str | None = None, en_retard_seulement: bool = False) -> list[dict]:
    """Liste les échéances (dictionnaires sérialisables, utilisés par le CLI et l'agent)."""
    aujourd_hui = dt.date.today()
    with get_session() as session:
        requete = session.query(Echeance).join(Echeancier).order_by(Echeance.date_echeance)
        if statut:
            requete = requete.filter(Echeance.statut == statut)
        resultat = []
        for echeance in requete.all():
            en_retard = echeance.statut == "a_payer" and echeance.date_echeance < aujourd_hui
            if en_retard_seulement and not en_retard:
                continue
            resultat.append(
                {
                    "id": echeance.id,
                    "echeancier_id": echeance.echeancier_id,
                    "beneficiaire": echeance.echeancier.beneficiaire,
                    "numero": f"{echeance.numero}/{echeance.echeancier.nb_echeances}",
                    "date": echeance.date_echeance.isoformat(),
                    "montant": str(echeance.montant),
                    "statut": "en_retard" if en_retard else echeance.statut,
                }
            )
        return resultat
