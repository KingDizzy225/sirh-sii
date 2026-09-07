-- Idempotence du pointage différé. Hors connexion, l'appareil conserve le
-- pointage et le renvoie au retour du réseau ; une réponse perdue en route lui
-- fait renvoyer une requête déjà traitée. La clé d'unicité fait que le second
-- envoi retrouve le pointage existant au lieu d'en créer un second.
ALTER TABLE "TimeLog" ADD COLUMN "client_ref" TEXT;
CREATE UNIQUE INDEX "TimeLog_client_ref_key" ON "TimeLog"("client_ref");
