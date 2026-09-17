-- Écrans d'agence, badges numériques et rétrospectives annuelles.
--
-- Trois accès sans session, ouverts par jeton : un écran de boutique, la carte
-- professionnelle d'un salarié, et le bilan de son année.

CREATE TABLE "ecran_agence" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "work_site_id" TEXT,
    "visible_clientele" BOOLEAN NOT NULL DEFAULT true,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    "derniere_consultation" TIMESTAMP(3),
    "revoque_le" TIMESTAMP(3),

    CONSTRAINT "ecran_agence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ecran_agence_token_key" ON "ecran_agence"("token");

ALTER TABLE "ecran_agence" ADD CONSTRAINT "ecran_agence_work_site_id_fkey"
    FOREIGN KEY ("work_site_id") REFERENCES "WorkSite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "badge_salarie" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "jeton_porteur" TEXT NOT NULL,
    "jeton_verification" TEXT NOT NULL,
    "photo_path" TEXT,
    "emis_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emis_par" TEXT,
    "expire_le" TIMESTAMP(3) NOT NULL,
    "revoque_le" TIMESTAMP(3),
    "revoque_motif" TEXT,
    "verifications" INTEGER NOT NULL DEFAULT 0,
    "derniere_verification" TIMESTAMP(3),

    CONSTRAINT "badge_salarie_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "badge_salarie_jeton_porteur_key" ON "badge_salarie"("jeton_porteur");
CREATE UNIQUE INDEX "badge_salarie_jeton_verification_key" ON "badge_salarie"("jeton_verification");
CREATE INDEX "badge_salarie_employee_id_emis_le_idx" ON "badge_salarie"("employee_id", "emis_le");

ALTER TABLE "badge_salarie" ADD CONSTRAINT "badge_salarie_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "retrospective_annuelle" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cree_par" TEXT,
    "expire_le" TIMESTAMP(3) NOT NULL,
    "ouvert_le" TIMESTAMP(3),
    "ouvertures" INTEGER NOT NULL DEFAULT 0,
    "echecs" INTEGER NOT NULL DEFAULT 0,
    "revoquee_le" TIMESTAMP(3),

    CONSTRAINT "retrospective_annuelle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "retrospective_annuelle_token_key" ON "retrospective_annuelle"("token");
CREATE UNIQUE INDEX "retrospective_annuelle_employee_id_annee_key" ON "retrospective_annuelle"("employee_id", "annee");

ALTER TABLE "retrospective_annuelle" ADD CONSTRAINT "retrospective_annuelle_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
