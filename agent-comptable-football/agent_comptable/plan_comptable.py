"""Plan comptable SYSCOHADA révisé — version simplifiée pour une fédération sportive.

Ce plan est volontairement réduit aux comptes utiles à une fédération de football
américain en Côte d'Ivoire. Il doit être validé et ajusté par l'expert-comptable
de la fédération.
"""

from __future__ import annotations

TAUX_TVA_CI = 0.18  # TVA Côte d'Ivoire : 18 %

PLAN_COMPTABLE: dict[str, str] = {
    # Classe 2 — Immobilisations
    "244": "Matériel et mobilier",
    "2441": "Matériel de bureau et informatique",
    "245": "Matériel de transport",
    # Classe 4 — Tiers
    "401": "Fournisseurs",
    "411": "Clients et clubs affiliés",
    "421": "Personnel, avances et acomptes",
    "422": "Personnel, rémunérations dues",
    "4431": "État, TVA facturée sur ventes",
    "4452": "État, TVA récupérable sur achats",
    "447": "État, impôts retenus à la source",
    # Classe 5 — Trésorerie
    "521": "Banques",
    "531": "Chèques postaux",
    "571": "Caisse",
    # Classe 6 — Charges
    "601": "Achats de marchandises",
    "604": "Achats stockés de matières et fournitures",
    "6041": "Équipements sportifs (maillots, casques, ballons)",
    "605": "Autres achats (eau, électricité, fournitures non stockées)",
    "611": "Transports sur achats",
    "614": "Transports du personnel et des équipes",
    "622": "Locations et charges locatives (stades, salles)",
    "624": "Entretien, réparations et maintenance",
    "625": "Primes d'assurance",
    "626": "Études, recherches et documentation",
    "627": "Publicité, publications, relations publiques",
    "628": "Frais de télécommunications",
    "6324": "Honoraires (arbitres, médecins, prestataires)",
    "6325": "Frais de formation et stages",
    "633": "Frais de mission et de réception",
    "641": "Impôts et taxes directs",
    "658": "Charges diverses (cotisations fédérations internationales)",
    "661": "Rémunérations directes versées au personnel",
    "664": "Charges sociales",
    "671": "Intérêts des emprunts",
    # Classe 7 — Produits
    "7061": "Cotisations et licences des clubs",
    "7062": "Recettes de matchs et compétitions",
    "7063": "Prestations de formation",
    "707": "Produits accessoires",
    "7078": "Autres produits d'activité (merchandising)",
    "71": "Subventions d'exploitation (État, ministères)",
    "754": "Produits de sponsoring et partenariats",
    "758": "Produits divers",
    "771": "Intérêts de prêts et produits financiers",
}

# Journaux comptables
JOURNAUX: dict[str, str] = {
    "ACH": "Journal des achats",
    "VE": "Journal des ventes et produits",
    "BQ": "Journal de banque",
    "CA": "Journal de caisse",
    "OD": "Opérations diverses",
}

# Mots-clés → compte de charge/produit (repli hors-ligne si l'IA n'a rien suggéré)
MOTS_CLES_COMPTES: list[tuple[str, str]] = [
    ("maillot", "6041"),
    ("casque", "6041"),
    ("ballon", "6041"),
    ("équipement", "6041"),
    ("equipement", "6041"),
    ("transport", "614"),
    ("bus", "614"),
    ("carburant", "614"),
    ("location", "622"),
    ("stade", "622"),
    ("arbitre", "6324"),
    ("honoraire", "6324"),
    ("médecin", "6324"),
    ("formation", "6325"),
    ("stage", "6325"),
    ("mission", "633"),
    ("hôtel", "633"),
    ("hotel", "633"),
    ("restauration", "633"),
    ("assurance", "625"),
    ("publicité", "627"),
    ("communication", "627"),
    ("téléphone", "628"),
    ("internet", "628"),
    ("électricité", "605"),
    ("electricite", "605"),
    ("eau", "605"),
    ("fourniture", "604"),
    ("cotisation", "7061"),
    ("licence", "7061"),
    ("sponsoring", "754"),
    ("sponsor", "754"),
    ("subvention", "71"),
    ("billetterie", "7062"),
    ("recette", "7062"),
]

COMPTE_CHARGE_DEFAUT = "605"
COMPTE_PRODUIT_DEFAUT = "758"


def libelle_compte(numero: str) -> str:
    """Retourne le libellé d'un compte, ou une chaîne vide s'il est inconnu."""
    return PLAN_COMPTABLE.get(numero, "")


def compte_existe(numero: str) -> bool:
    return numero in PLAN_COMPTABLE


def suggerer_compte(libelle: str, sens: str = "charge") -> str:
    """Suggestion de compte par mots-clés (repli déterministe, sans IA).

    ``sens`` vaut "charge" (facture fournisseur) ou "produit" (recette).
    """
    texte = libelle.lower()
    for mot, compte in MOTS_CLES_COMPTES:
        if mot in texte:
            est_produit = compte.startswith("7")
            if (sens == "produit") == est_produit:
                return compte
    return COMPTE_PRODUIT_DEFAUT if sens == "produit" else COMPTE_CHARGE_DEFAUT


def plan_pour_prompt() -> str:
    """Le plan comptable sous forme de texte, à insérer dans un prompt Claude."""
    return "\n".join(f"{num} — {lib}" for num, lib in sorted(PLAN_COMPTABLE.items()))
