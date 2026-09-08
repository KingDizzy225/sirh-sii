-- Décompte de fin de contrat arrêté.
--
-- Les courriers de rupture produits par l'application annonçaient au salarié
-- son solde de tout compte, son certificat de travail et son attestation.
-- Aucun des trois n'était produit. Le décompte n'existait que comme écran,
-- recalculé à chaque affichage.
--
-- Un reçu que le salarié signe ne peut pas reposer sur un calcul mouvant :
-- deux impressions à un mois d'écart auraient porté des montants différents.
-- Cette table fige le décompte au jour où la RH l'arrête ; le reçu est produit
-- depuis ce détail conservé.

CREATE TABLE "solde_tout_compte" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "arrete_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "arrete_par" TEXT,
    "date_sortie" TIMESTAMP(3) NOT NULL,
    "net_arrete" DOUBLE PRECISION NOT NULL,
    "detail" TEXT NOT NULL,
    "observations" TEXT,
    "remis_le" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solde_tout_compte_pkey" PRIMARY KEY ("id")
);

-- Un seul arrêté par salarié : un départ n'a qu'un solde.
CREATE UNIQUE INDEX "solde_tout_compte_employee_id_key" ON "solde_tout_compte"("employee_id");

ALTER TABLE "solde_tout_compte" ADD CONSTRAINT "solde_tout_compte_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
