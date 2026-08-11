import unittest
from decimal import Decimal

from agent_comptable.comptabilisation import construire_lignes, verifier_equilibre


def total(lignes, cle):
    return sum((ligne[cle] for ligne in lignes), Decimal("0"))


class TestConstruireLignes(unittest.TestCase):
    def test_facture_fournisseur_avec_tva(self):
        donnees = {
            "type_piece": "facture_fournisseur",
            "emetteur": "Equipementier ABC",
            "montant_ht": 1000000,
            "montant_tva": 180000,
            "montant_ttc": 1180000,
            "lignes": [
                {"libelle": "Maillots", "montant": 600000, "compte_suggere": "6041"},
                {"libelle": "Casques", "montant": 400000, "compte_suggere": "6041"},
            ],
        }
        lignes = construire_lignes(donnees)
        self.assertEqual(total(lignes, "debit"), total(lignes, "credit"))
        self.assertEqual(total(lignes, "credit"), Decimal("1180000.00"))
        credit_fournisseur = [l for l in lignes if l["compte"] == "401"]
        self.assertEqual(len(credit_fournisseur), 1)
        self.assertEqual(credit_fournisseur[0]["credit"], Decimal("1180000.00"))
        tva = [l for l in lignes if l["compte"] == "4452"]
        self.assertEqual(tva[0]["debit"], Decimal("180000.00"))

    def test_facture_client_cotisation(self):
        donnees = {
            "type_piece": "facture_client",
            "emetteur": "Club des Lions",
            "montant_tva": 0,
            "montant_ttc": 250000,
            "lignes": [
                {"libelle": "Cotisation annuelle", "montant": 250000, "compte_suggere": "7061"},
            ],
        }
        lignes = construire_lignes(donnees)
        self.assertEqual(total(lignes, "debit"), total(lignes, "credit"))
        client = [l for l in lignes if l["compte"] == "411"][0]
        self.assertEqual(client["debit"], Decimal("250000.00"))
        produit = [l for l in lignes if l["compte"] == "7061"][0]
        self.assertEqual(produit["credit"], Decimal("250000.00"))

    def test_compte_inconnu_remplace_par_suggestion(self):
        donnees = {
            "type_piece": "facture_fournisseur",
            "emetteur": "Transporteur",
            "montant_tva": 0,
            "montant_ttc": 90000,
            "lignes": [
                {"libelle": "Transport bus équipe", "montant": 90000, "compte_suggere": "0000"},
            ],
        }
        lignes = construire_lignes(donnees)
        self.assertEqual(lignes[0]["compte"], "614")

    def test_arrondis_repartis(self):
        donnees = {
            "type_piece": "facture_fournisseur",
            "emetteur": "Divers",
            "montant_tva": 0,
            "montant_ttc": 100,
            "lignes": [
                {"libelle": "A", "montant": 1, "compte_suggere": "605"},
                {"libelle": "B", "montant": 1, "compte_suggere": "605"},
                {"libelle": "C", "montant": 1, "compte_suggere": "605"},
            ],
        }
        lignes = construire_lignes(donnees)
        self.assertEqual(total(lignes, "debit"), Decimal("100.00"))

    def test_sans_lignes(self):
        donnees = {
            "type_piece": "facture_fournisseur",
            "emetteur": "Hotel Ivoire",
            "montant_tva": None,
            "montant_ttc": 45000,
            "lignes": [],
        }
        lignes = construire_lignes(donnees)
        self.assertEqual(total(lignes, "debit"), total(lignes, "credit"))
        self.assertEqual(lignes[0]["compte"], "633")  # "hotel" → frais de mission

    def test_ttc_manquant(self):
        with self.assertRaises(ValueError):
            construire_lignes({"type_piece": "facture_fournisseur", "montant_ttc": 0})

    def test_verifier_equilibre(self):
        with self.assertRaises(ValueError):
            verifier_equilibre(
                [
                    {"compte": "605", "libelle": "x", "debit": Decimal("10"), "credit": Decimal("0")},
                    {"compte": "401", "libelle": "x", "debit": Decimal("0"), "credit": Decimal("9")},
                ]
            )


if __name__ == "__main__":
    unittest.main()
