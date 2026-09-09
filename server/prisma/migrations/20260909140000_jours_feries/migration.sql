-- Jours fériés.
--
-- L'application créditait les congés en jours ouvrables — 2,2 par mois, la
-- règle applicable — et les débitait en jours calendaires. Un congé du
-- vendredi au lundi retirait quatre jours au lieu de deux, et aucun jour férié
-- n'était connu : le 7 août se décomptait comme un jour de congé ordinaire.
--
-- Le solde surconsommé alimentait ensuite le solde de tout compte : le salarié
-- partait avec moins d'indemnité compensatrice qu'il ne lui était dû.

CREATE TABLE "jour_ferie" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'DECRET',
    "chome" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "jour_ferie_pkey" PRIMARY KEY ("id")
);

-- Un même jour ne peut être férié deux fois.
CREATE UNIQUE INDEX "jour_ferie_date_key" ON "jour_ferie"("date");
CREATE INDEX "jour_ferie_date_idx" ON "jour_ferie"("date");
