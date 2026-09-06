import unittest

from agent_comptable.plan_comptable import (
    PLAN_COMPTABLE,
    compte_existe,
    libelle_compte,
    suggerer_compte,
)


class TestPlanComptable(unittest.TestCase):
    def test_comptes_essentiels_presents(self):
        for compte in ("401", "411", "4452", "4431", "521", "571", "7061", "754", "71"):
            self.assertTrue(compte_existe(compte), f"compte {compte} manquant")

    def test_libelle(self):
        self.assertEqual(libelle_compte("401"), "Fournisseurs")
        self.assertEqual(libelle_compte("9999"), "")

    def test_suggestion_charge(self):
        self.assertEqual(suggerer_compte("Achat de 20 maillots", "charge"), "6041")
        self.assertEqual(suggerer_compte("Transport bus équipe Abidjan", "charge"), "614")
        self.assertEqual(suggerer_compte("Honoraires arbitres match", "charge"), "6324")

    def test_suggestion_produit(self):
        self.assertEqual(suggerer_compte("Cotisation annuelle club", "produit"), "7061")
        self.assertEqual(suggerer_compte("Contrat de sponsoring", "produit"), "754")

    def test_repli_par_defaut(self):
        self.assertEqual(suggerer_compte("Libellé inconnu xyz", "charge"), "605")
        self.assertEqual(suggerer_compte("Libellé inconnu xyz", "produit"), "758")

    def test_suggestion_respecte_le_sens(self):
        # "cotisation" est un produit : en sens charge, on ne doit pas retourner un compte 7
        compte = suggerer_compte("cotisation fédération internationale", "charge")
        self.assertFalse(compte.startswith("7"))


if __name__ == "__main__":
    unittest.main()
