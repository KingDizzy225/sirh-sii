-- Historisation datée des situations.
--
-- L'application ne connaissait que le présent : qui occupe quel poste
-- aujourd'hui, jamais qui l'occupait au 1er janvier, ni sous quel responsable.
-- Impossible dès lors de reconstituer un organigramme passé, ou de savoir quel
-- poste occupait un salarié le jour d'un accident.
--
-- Additif : la fiche du salarié reste la situation courante, et les requêtes
-- existantes ne changent pas. Cette table ajoute la profondeur de temps.

CREATE TABLE "situations_employe" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "position_title" TEXT,
    "department" TEXT,
    "manager_id" TEXT,
    "contract_type" TEXT,
    "status" TEXT,
    "motif" TEXT,
    "source" TEXT NOT NULL DEFAULT 'OBSERVEE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "situations_employe_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "situations_employe_employee_id_effective_from_idx"
    ON "situations_employe"("employee_id", "effective_from");
CREATE INDEX "situations_employe_effective_from_effective_to_idx"
    ON "situations_employe"("effective_from", "effective_to");

ALTER TABLE "situations_employe" ADD CONSTRAINT "situations_employe_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
