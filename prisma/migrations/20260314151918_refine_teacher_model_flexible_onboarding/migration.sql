-- AlterTable: Make userId optional on teachers
ALTER TABLE "teachers" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable: Make cpf optional and remove global unique
DROP INDEX IF EXISTS "teachers_cpf_key";
ALTER TABLE "teachers" ALTER COLUMN "cpf" DROP NOT NULL;

-- AlterTable: Make date_of_birth optional
ALTER TABLE "teachers" ALTER COLUMN "date_of_birth" DROP NOT NULL;

-- AlterTable: Add internal_notes column
ALTER TABLE "teachers" ADD COLUMN "internal_notes" TEXT;

-- CreateIndex: Unique constraint on cpf per school (multi-tenant)
CREATE UNIQUE INDEX "teachers_school_id_cpf_key" ON "teachers"("school_id", "cpf");
