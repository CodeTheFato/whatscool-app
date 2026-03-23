/*
  Warnings:

  - Made the column `class_id` on table `activities` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('HOMEWORK', 'NOTE', 'EVENT');

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_class_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_subject_id_fkey";

-- AlterTable
ALTER TABLE "academic_years" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "ai_generated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notify_whatsapp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "send_to_parents" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "ActivityType" NOT NULL DEFAULT 'HOMEWORK',
ALTER COLUMN "subject_id" DROP NOT NULL,
ALTER COLUMN "due_date" DROP NOT NULL,
ALTER COLUMN "max_score" DROP NOT NULL,
ALTER COLUMN "max_score" DROP DEFAULT,
ALTER COLUMN "class_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "student_parents" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "activity_recipients" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "DeliveryProvider" NOT NULL DEFAULT 'PLATFORM',
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_recipients_user_id_status_idx" ON "activity_recipients"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "activity_recipients_activity_id_user_id_provider_key" ON "activity_recipients"("activity_id", "user_id", "provider");

-- CreateIndex
CREATE INDEX "activities_school_id_type_idx" ON "activities"("school_id", "type");

-- CreateIndex
CREATE INDEX "activities_school_id_class_id_idx" ON "activities"("school_id", "class_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_recipients" ADD CONSTRAINT "activity_recipients_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_recipients" ADD CONSTRAINT "activity_recipients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
