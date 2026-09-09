-- Date d'aboutissement d'une candidature.
--
-- Le délai de recrutement s'affichait au tableau de bord sous la forme de six
-- valeurs écrites en dur — « 24, 22, 28, 21, 19, 18 jours » — parce qu'il
-- n'était pas calculable : la candidature portait sa date de dépôt et son
-- statut, jamais la date à laquelle elle avait abouti.
--
-- L'indicateur restera vide jusqu'au premier recrutement conclu dans
-- l'application. C'est la réponse exacte, là où six nombres inventés ne
-- l'étaient pas.

ALTER TABLE "Applicant" ADD COLUMN "hired_at" TIMESTAMP(3);
