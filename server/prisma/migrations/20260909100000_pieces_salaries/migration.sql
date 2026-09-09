-- Titres et habilitations à échéance des salariés.
--
-- Les prestataires disposaient depuis le 7 septembre d'un dossier de pièces
-- daté et relancé avant expiration. Les salariés n'avaient rien : ni permis de
-- conduire, ni aptitude médicale, ni habilitation, ni titre de séjour.
--
-- Ce sont pourtant les mêmes échéances, avec les mêmes conséquences. Un permis
-- expiré au volant d'un véhicule de service engage l'entreprise, et
-- l'application ne savait pas répondre à « qui roule sans permis valide ? ».

CREATE TABLE "piece_salarie" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "delivree_le" TIMESTAMP(3),
    "expire_le" TIMESTAMP(3),
    "file_path" TEXT,
    "note" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'A_CONTROLER',
    "deposee_par" TEXT,
    "controlee_par" TEXT,
    "controlee_le" TIMESTAMP(3),
    "motif_refus" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piece_salarie_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "piece_salarie_employee_id_type_idx" ON "piece_salarie"("employee_id", "type");
-- L'écran des échéances balaie cette colonne : sans index, il ferait un
-- parcours complet à chaque ouverture.
CREATE INDEX "piece_salarie_expire_le_idx" ON "piece_salarie"("expire_le");

ALTER TABLE "piece_salarie" ADD CONSTRAINT "piece_salarie_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
