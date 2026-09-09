-- Prime d'ancienneté.
--
-- Due au-delà de deux ans par la convention collective interprofessionnelle,
-- elle était absente du calcul de paie alors que l'application connaît toutes
-- les dates d'embauche. Elle était donc soit retapée à la main dans le champ
-- « prime » chaque mois, soit pas versée du tout — la dette s'accumulant en
-- silence jusqu'au départ du salarié ou jusqu'à un contrôle.
--
-- Colonne distincte, non fondue dans `bonus` : la prime d'ancienneté doit
-- figurer sur son propre poste au bulletin.

ALTER TABLE "Payroll" ADD COLUMN "prime_anciennete" DOUBLE PRECISION;
