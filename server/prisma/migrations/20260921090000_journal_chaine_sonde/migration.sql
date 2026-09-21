-- Chaînage du journal d'audit, ancrages, et journal de la sonde.

ALTER TABLE "AuditLog" ADD COLUMN "numero" INTEGER;
ALTER TABLE "AuditLog" ADD COLUMN "empreinte" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "empreinte_precedente" TEXT;

CREATE UNIQUE INDEX "AuditLog_numero_key" ON "AuditLog"("numero");

CREATE TABLE "ancrage_audit" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "empreinte" TEXT NOT NULL,
    "ancre_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ancre_par" TEXT,
    CONSTRAINT "ancrage_audit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ancrage_audit_ancre_le_idx" ON "ancrage_audit"("ancre_le");

CREATE TABLE "execution_sonde" (
    "id" TEXT NOT NULL,
    "lancee_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duree_ms" INTEGER NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "echecs" INTEGER NOT NULL DEFAULT 0,
    "resultats" JSONB NOT NULL,
    "declenche_par" TEXT,
    CONSTRAINT "execution_sonde_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "execution_sonde_lancee_le_idx" ON "execution_sonde"("lancee_le");
