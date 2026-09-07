-- Signature électronique des documents.
--
-- La route publique de signature ne vérifiait aucun jeton : quiconque
-- disposait de l'identifiant d'un document pouvait le signer au nom du
-- salarié, et le certificat produit annonçait un « lien magique unique » qui
-- n'existait pas. Le jeton ci-dessous est ce mécanisme.
--
-- L'empreinte relie la signature au contenu signé, et le certificat devient un
-- fichier distinct : la signature écrasait jusqu'ici le document par sa seule
-- page de certificat.

ALTER TABLE "EmployeeDocument" ADD COLUMN "signature_token" TEXT;
ALTER TABLE "EmployeeDocument" ADD COLUMN "token_expires_at" TIMESTAMP(3);
ALTER TABLE "EmployeeDocument" ADD COLUMN "signature_requested_by" TEXT;
ALTER TABLE "EmployeeDocument" ADD COLUMN "signed_at" TIMESTAMP(3);
ALTER TABLE "EmployeeDocument" ADD COLUMN "signed_by" TEXT;
ALTER TABLE "EmployeeDocument" ADD COLUMN "signed_ip" TEXT;
ALTER TABLE "EmployeeDocument" ADD COLUMN "signature_hash" TEXT;
ALTER TABLE "EmployeeDocument" ADD COLUMN "certificate_path" TEXT;

CREATE UNIQUE INDEX "EmployeeDocument_signature_token_key" ON "EmployeeDocument"("signature_token");
