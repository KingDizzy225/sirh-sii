-- Heures supplémentaires ventilées par majoration.
--
-- La paie appliquait un taux unique de 15 % à toutes les heures
-- supplémentaires, y compris de nuit, du dimanche, des jours fériés et
-- au-delà de la 46e heure de la semaine. Nulle sur les bulletins antérieurs,
-- qui gardent leur calcul d'origine.

ALTER TABLE "Payroll" ADD COLUMN "heures_sup_detail" JSONB;
