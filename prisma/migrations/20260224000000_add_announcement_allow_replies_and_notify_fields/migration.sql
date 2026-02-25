-- AlterTable: Add allowReplies and notifyViaWhatsapp to announcements
ALTER TABLE "announcements" ADD COLUMN "allow_replies" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "announcements" ADD COLUMN "notify_via_whatsapp" BOOLEAN NOT NULL DEFAULT false;

-- DropIndex: old unique constraint (announcement_id, user_id)
DROP INDEX IF EXISTS "announcement_recipients_announcement_id_user_id_key";

-- CreateIndex: new unique constraint including provider
CREATE UNIQUE INDEX "announcement_recipients_announcement_id_user_id_provider_key" ON "announcement_recipients"("announcement_id", "user_id", "provider");
