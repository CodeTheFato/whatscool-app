-- CreateEnum
CREATE TYPE "ClassTeacherRole" AS ENUM ('MAIN', 'SUBJECT', 'ASSISTANT');

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_class_id_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_teacher_id_fkey";

-- DropIndex
DROP INDEX "attendances_student_id_class_id_date_key";

-- DropIndex
DROP INDEX "subjects_school_id_name_class_id_key";

-- DropIndex
DROP INDEX "subjects_school_id_teacher_id_idx";

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "class_id" TEXT;

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "subject_id" TEXT;

-- AlterTable
ALTER TABLE "classes" DROP COLUMN "teacher_id";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "class_id",
DROP COLUMN "teacher_id";

-- CreateTable
CREATE TABLE "class_teachers" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject_id" TEXT,
    "role" "ClassTeacherRole" NOT NULL DEFAULT 'SUBJECT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_teachers_school_id_class_id_idx" ON "class_teachers"("school_id", "class_id");

-- CreateIndex
CREATE INDEX "class_teachers_school_id_teacher_id_idx" ON "class_teachers"("school_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "class_teachers_class_id_teacher_id_subject_id_key" ON "class_teachers"("class_id", "teacher_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_student_id_class_id_subject_id_date_key" ON "attendances"("student_id", "class_id", "subject_id", "date");

-- CreateIndex
CREATE INDEX "subjects_school_id_idx" ON "subjects"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_id_name_key" ON "subjects"("school_id", "name");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_teachers" ADD CONSTRAINT "class_teachers_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
