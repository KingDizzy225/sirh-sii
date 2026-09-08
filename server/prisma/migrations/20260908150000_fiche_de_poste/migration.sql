-- Fiche de poste : la trame en usage dans l'entreprise.
--
-- L'application produisait un bloc de texte libre, sans structure, sans PDF et
-- sans rattachement au salarié : les fiches continuaient d'être écrites dans un
-- traitement de texte, puis imprimées et signées à la main.

ALTER TABLE "JobDescription" ADD COLUMN "employee_id" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "salarie_nom" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "direction" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "lieu" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "categorie" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "superieur_hierarchique" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "date_debut" TIMESTAMP(3);
ALTER TABLE "JobDescription" ADD COLUMN "mission" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "taches" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "relations_interne" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "relations_externe" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "rapports_destinataires" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "rapports_frequences" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "moyens_techniques" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "savoir" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "savoir_faire" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "savoir_etre" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "formation" TEXT;
ALTER TABLE "JobDescription" ADD COLUMN "risques_poste" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "risques_materiel" JSONB;
ALTER TABLE "JobDescription" ADD COLUMN "visas" JSONB;

CREATE INDEX "JobDescription_employee_id_idx" ON "JobDescription"("employee_id");

ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
