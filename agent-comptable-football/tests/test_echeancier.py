import datetime as dt
import unittest
from decimal import Decimal

from agent_comptable.echeancier import calculer_echeances


class TestCalculEcheances(unittest.TestCase):
    def test_somme_egale_total(self):
        echeances = calculer_echeances("1000000", 3, dt.date(2026, 9, 1))
        self.assertEqual(len(echeances), 3)
        total = sum(montant for _, montant in echeances)
        self.assertEqual(total, Decimal("1000000.00"))

    def test_reliquat_sur_derniere(self):
        echeances = calculer_echeances("100", 3, dt.date(2026, 1, 1))
        self.assertEqual(echeances[0][1], Decimal("33.33"))
        self.assertEqual(echeances[1][1], Decimal("33.33"))
        self.assertEqual(echeances[2][1], Decimal("33.34"))

    def test_dates_espacees(self):
        echeances = calculer_echeances("300", 3, dt.date(2026, 1, 1), intervalle_jours=30)
        self.assertEqual(echeances[0][0], dt.date(2026, 1, 1))
        self.assertEqual(echeances[1][0], dt.date(2026, 1, 31))
        self.assertEqual(echeances[2][0], dt.date(2026, 3, 2))

    def test_une_seule_echeance(self):
        echeances = calculer_echeances(1500000, 1, dt.date(2026, 5, 15))
        self.assertEqual(echeances, [(dt.date(2026, 5, 15), Decimal("1500000.00"))])

    def test_montant_invalide(self):
        with self.assertRaises(ValueError):
            calculer_echeances(0, 3, dt.date(2026, 1, 1))
        with self.assertRaises(ValueError):
            calculer_echeances(100, 0, dt.date(2026, 1, 1))


if __name__ == "__main__":
    unittest.main()
