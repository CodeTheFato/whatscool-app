/*
  Warnings:

  - The values [IMPORTANT,GENERAL,FINANCIAL,AGENDA,INDIVIDUAL] on the enum `AnnouncementCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AnnouncementCategory_new" AS ENUM ('COMUNICADOS', 'BOLETOS', 'ATRASO_BOLETOS', 'AVISOS');
ALTER TABLE "announcements" ALTER COLUMN "category" TYPE "AnnouncementCategory_new" USING ("category"::text::"AnnouncementCategory_new");
ALTER TYPE "AnnouncementCategory" RENAME TO "AnnouncementCategory_old";
ALTER TYPE "AnnouncementCategory_new" RENAME TO "AnnouncementCategory";
DROP TYPE "public"."AnnouncementCategory_old";
COMMIT;
