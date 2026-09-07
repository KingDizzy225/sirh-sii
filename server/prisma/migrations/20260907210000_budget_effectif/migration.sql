-- Budget d'effectif et de masse salariale. L'application savait dire ce qui
-- avait été payé, jamais ce qui avait été prévu : le point de comparaison
-- manquait, et sans lui un écart ne se voit pas.

CREATE TABLE "budgets_effectif" (
    "id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "departement" TEXT NOT NULL,
    "effectif_budgete" INTEGER NOT NULL DEFAULT 0,
    "masse_salariale_budgetee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commentaire" TEXT,
    "maj_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_effectif_pkey" PRIMARY KEY ("id")
);

-- Un service n'a qu'un budget par exercice : deux lignes rendraient tout écart
-- indéterminé.
CREATE UNIQUE INDEX "budgets_effectif_annee_departement_key" ON "budgets_effectif"("annee", "departement");
CREATE INDEX "budgets_effectif_annee_idx" ON "budgets_effectif"("annee");
