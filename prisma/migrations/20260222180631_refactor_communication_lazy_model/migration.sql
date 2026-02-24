/*
  Warnings:

  - You are about to drop the column `audience_type` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `class_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `conversations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[announcement_id,parent_user_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeliveryProvider" AS ENUM ('PLATFORM', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_class_id_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_student_id_fkey";

-- DropIndex
DROP INDEX "announcement_recipients_user_id_read_at_idx";

-- DropIndex
DROP INDEX "conversations_announcement_id_key";

-- DropIndex
DROP INDEX "conversations_class_id_idx";

-- DropIndex
DROP INDEX "conversations_school_id_type_idx";

-- DropIndex
DROP INDEX "conversations_student_id_idx";

-- AlterTable
ALTER TABLE "announcement_recipients" ADD COLUMN     "error_code" TEXT,
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "provider" "DeliveryProvider" NOT NULL DEFAULT 'PLATFORM',
ADD COLUMN     "provider_message_id" TEXT,
ADD COLUMN     "sent_at" TIMESTAMP(3),
ADD COLUMN     "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "audience_type",
DROP COLUMN "class_id",
DROP COLUMN "student_id",
DROP COLUMN "type",
ADD COLUMN     "parent_user_id" TEXT;

-- DropEnum
DROP TYPE "ConversationType";

-- CreateIndex
CREATE INDEX "announcement_recipients_user_id_status_idx" ON "announcement_recipients"("user_id", "status");

-- CreateIndex
CREATE INDEX "announcement_recipients_provider_status_idx" ON "announcement_recipients"("provider", "status");

-- CreateIndex
CREATE INDEX "conversations_parent_user_id_idx" ON "conversations"("parent_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_announcement_id_parent_user_id_key" ON "conversations"("announcement_id", "parent_user_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
