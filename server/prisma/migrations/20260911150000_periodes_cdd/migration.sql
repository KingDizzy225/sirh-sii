-- Périodes des contrats à durée déterminée : contrat initial et renouvellements.
--
-- L'application ne connaissait que la date de fin d'un CDD. Rien ne disait
-- depuis quand le salarié enchaînait les contrats, ni qu'un renouvellement
-- ferait dépasser la durée maximale.

CREATE TABLE "periode_cdd" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "nature" TEXT NOT NULL,
    "motif" TEXT,
    "cree_par" TEXT,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periode_cdd_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "periode_cdd_employee_id_debut_idx" ON "periode_cdd"("employee_id", "debut");

ALTER TABLE "periode_cdd" ADD CONSTRAINT "periode_cdd_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
