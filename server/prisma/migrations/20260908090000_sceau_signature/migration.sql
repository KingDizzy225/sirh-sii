-- Signature de l'employeur sur les documents émis.
--
-- Les documents produits par l'application sortaient sans signature : ils
-- étaient imprimés, signés à la main, puis rescannés. La signature est
-- désormais enregistrée une fois et apposée à l'émission.
--
-- Ce qui remplace l'autorité de la signature manuscrite n'est pas l'image du
-- trait, qui se copie : c'est le sceau cryptographique, qui permet à un tiers
-- de vérifier l'origine du document et son intégrité.

CREATE TABLE "signataires" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,
    "signature_image" TEXT NOT NULL,
    "cachet_image" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "par_defaut" BOOLEAN NOT NULL DEFAULT false,
    "cree_par" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signataires_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "signataires_actif_idx" ON "signataires"("actif");

ALTER TABLE "issued_document" ADD COLUMN "signataire_nom" TEXT;
ALTER TABLE "issued_document" ADD COLUMN "signataire_fonction" TEXT;
ALTER TABLE "issued_document" ADD COLUMN "manifeste" TEXT;
ALTER TABLE "issued_document" ADD COLUMN "sceau" TEXT;
ALTER TABLE "issued_document" ADD COLUMN "sceau_key_id" TEXT;

-- Clé de scellement. Sans clé stable, un sceau ne survivrait pas à un
-- redémarrage et deviendrait invérifiable — ce qui vaudrait moins que pas de
-- sceau, un certificat invérifiable se présentant néanmoins comme une preuve.
CREATE TABLE "signing_keys" (
    "id" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "public_key_pem" TEXT NOT NULL,
    "private_key_pem" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'ed25519',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signing_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "signing_keys_key_id_key" ON "signing_keys"("key_id");
