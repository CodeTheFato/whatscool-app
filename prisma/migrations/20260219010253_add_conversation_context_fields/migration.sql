-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "audience_type" TEXT,
ADD COLUMN     "class_id" TEXT,
ADD COLUMN     "student_id" TEXT,
ADD COLUMN     "subject" TEXT;

-- CreateIndex
CREATE INDEX "conversations_class_id_idx" ON "conversations"("class_id");

-- CreateIndex
CREATE INDEX "conversations_student_id_idx" ON "conversations"("student_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
