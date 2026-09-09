-- Remise d'un document à un salarié, par lien.
--
-- Les salariés n'ouvrant plus de session dans l'application, un bulletin de
-- paie ou une attestation n'avait plus aucun moyen de leur parvenir : le PDF
-- restait dans l'application. La remise du bulletin est pourtant une
-- obligation de l'employeur.
--
-- Le jeton vaut autorisation de télécharger. Il expire, peut exiger une
-- vérification, et chaque ouverture est datée — un lien circule, il se
-- transfère, il s'oublie dans une conversation.

CREATE TABLE "remise_document" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "remis_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remis_par" TEXT,
    "expire_le" TIMESTAMP(3) NOT NULL,
    "verification" TEXT NOT NULL DEFAULT 'NAISSANCE',
    "ouvert_le" TIMESTAMP(3),
    "telecharge_le" TIMESTAMP(3),
    "telechargements" INTEGER NOT NULL DEFAULT 0,
    "derniere_ip" TEXT,
    "echecs" INTEGER NOT NULL DEFAULT 0,
    "revoquee_le" TIMESTAMP(3),
    "revoquee_motif" TEXT,

    CONSTRAINT "remise_document_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "remise_document_token_key" ON "remise_document"("token");
CREATE INDEX "remise_document_employee_id_remis_le_idx" ON "remise_document"("employee_id", "remis_le");
CREATE INDEX "remise_document_source_type_source_id_idx" ON "remise_document"("source_type", "source_id");

ALTER TABLE "remise_document" ADD CONSTRAINT "remise_document_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
