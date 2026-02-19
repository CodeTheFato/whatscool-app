-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'BROADCAST');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "type" "ConversationType" NOT NULL DEFAULT 'DIRECT';

-- CreateIndex
CREATE INDEX "conversations_school_id_type_idx" ON "conversations"("school_id", "type");
