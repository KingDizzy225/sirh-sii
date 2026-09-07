-- Conformité des prestataires. Le donneur d'ordre répond financièrement des
-- salariés qu'un sous-traitant n'a pas déclarés ; l'application ne connaissait
-- aucune pièce justificative, et l'exposition n'apparaissait qu'au contrôle.

ALTER TABLE "Subcontractor" ADD COLUMN "cnps_number" TEXT;
ALTER TABLE "Subcontractor" ADD COLUMN "tax_id" TEXT;
ALTER TABLE "Subcontractor" ADD COLUMN "contact_email" TEXT;
ALTER TABLE "Subcontractor" ADD COLUMN "contact_phone" TEXT;

CREATE TABLE "subcontractor_documents" (
    "id" TEXT NOT NULL,
    "subcontractor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "issued_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "file_path" TEXT,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subcontractor_documents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "subcontractor_documents_subcontractor_id_type_idx"
    ON "subcontractor_documents"("subcontractor_id", "type");

ALTER TABLE "subcontractor_documents" ADD CONSTRAINT "subcontractor_documents_subcontractor_id_fkey"
    FOREIGN KEY ("subcontractor_id") REFERENCES "Subcontractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
