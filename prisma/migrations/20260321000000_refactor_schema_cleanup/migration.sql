-- ============================================================
-- Migration: refactor_schema_cleanup
-- Removes: FinancialRecord, Grade, ActivitySubmission
-- Adds: AcademicYear, StudentParent junction, Parent-School FK
-- Changes: Class.academicYear Int → FK, Schedule times Int,
--          Parent.kinship → StudentParent.kinship
-- ============================================================

-- 1. Create new tables first (needed for data migration)

CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academic_years_school_id_year_key" ON "academic_years"("school_id", "year");

ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "student_parents" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "kinship" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "can_pickup" BOOLEAN NOT NULL DEFAULT true,
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_parents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "student_parents_parent_id_idx" ON "student_parents"("parent_id");
CREATE UNIQUE INDEX "student_parents_student_id_parent_id_key" ON "student_parents"("student_id", "parent_id");

ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Data migration: AcademicYear from existing classes

INSERT INTO "academic_years" ("id", "school_id", "year", "is_current", "updated_at")
SELECT
    gen_random_uuid(),
    "school_id",
    "academic_year",
    true,
    CURRENT_TIMESTAMP
FROM "classes"
GROUP BY "school_id", "academic_year";

-- 3. Add academic_year_id column (nullable first for data migration)

ALTER TABLE "classes" ADD COLUMN "academic_year_id" TEXT;

UPDATE "classes" c
SET "academic_year_id" = ay."id"
FROM "academic_years" ay
WHERE ay."school_id" = c."school_id" AND ay."year" = c."academic_year";

ALTER TABLE "classes" ALTER COLUMN "academic_year_id" SET NOT NULL;

-- 4. Data migration: StudentParent from _ParentToStudent + Parent.kinship

INSERT INTO "student_parents" ("id", "student_id", "parent_id", "kinship", "is_primary", "updated_at")
SELECT
    gen_random_uuid(),
    ps."B",  -- student_id (B column in implicit M:M)
    ps."A",  -- parent_id (A column in implicit M:M)
    COALESCE(p."kinship", 'Responsável'),
    -- First parent linked to each student gets isPrimary=true
    ROW_NUMBER() OVER (PARTITION BY ps."B" ORDER BY p."created_at") = 1,
    CURRENT_TIMESTAMP
FROM "_ParentToStudent" ps
JOIN "parents" p ON p."id" = ps."A";

-- 5. Drop old structures

-- Drop old indexes on classes
DROP INDEX "classes_school_id_academic_year_idx";
DROP INDEX "classes_school_id_name_academic_year_key";

-- Drop old column
ALTER TABLE "classes" DROP COLUMN "academic_year";

-- Drop kinship from parents (now on student_parents)
ALTER TABLE "parents" DROP COLUMN "kinship";

-- Drop implicit M:M junction
ALTER TABLE "_ParentToStudent" DROP CONSTRAINT "_ParentToStudent_A_fkey";
ALTER TABLE "_ParentToStudent" DROP CONSTRAINT "_ParentToStudent_B_fkey";
DROP TABLE "_ParentToStudent";

-- 6. Drop removed models

ALTER TABLE "activity_submissions" DROP CONSTRAINT "activity_submissions_activity_id_fkey";
ALTER TABLE "activity_submissions" DROP CONSTRAINT "activity_submissions_student_id_fkey";
DROP TABLE "activity_submissions";

ALTER TABLE "financial_records" DROP CONSTRAINT "financial_records_school_id_fkey";
DROP TABLE "financial_records";

ALTER TABLE "grades" DROP CONSTRAINT "grades_school_id_fkey";
ALTER TABLE "grades" DROP CONSTRAINT "grades_student_id_fkey";
ALTER TABLE "grades" DROP CONSTRAINT "grades_subject_id_fkey";
ALTER TABLE "grades" DROP CONSTRAINT "grades_teacher_id_fkey";
DROP TABLE "grades";

DROP TYPE "ActivityStatus";
DROP TYPE "PaymentStatus";
DROP TYPE "TransactionType";

-- 7. Schedule times: String → Int (minutes since midnight)

ALTER TABLE "schedules" DROP COLUMN "start_time";
ALTER TABLE "schedules" ADD COLUMN "start_time" INTEGER NOT NULL DEFAULT 480;
ALTER TABLE "schedules" DROP COLUMN "end_time";
ALTER TABLE "schedules" ADD COLUMN "end_time" INTEGER NOT NULL DEFAULT 540;
ALTER TABLE "schedules" ALTER COLUMN "start_time" DROP DEFAULT;
ALTER TABLE "schedules" ALTER COLUMN "end_time" DROP DEFAULT;

-- 8. Create new indexes and FKs

CREATE INDEX "classes_school_id_academic_year_id_idx" ON "classes"("school_id", "academic_year_id");
CREATE UNIQUE INDEX "classes_school_id_name_academic_year_id_key" ON "classes"("school_id", "name", "academic_year_id");

ALTER TABLE "classes" ADD CONSTRAINT "classes_academic_year_id_fkey"
    FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Parent-School FK (column already exists, just adding the constraint)
CREATE INDEX "parents_school_id_idx" ON "parents"("school_id");
ALTER TABLE "parents" ADD CONSTRAINT "parents_school_id_fkey"
    FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Schedule unique constraint (recreate with Int type)
CREATE UNIQUE INDEX "schedules_class_id_day_of_week_start_time_key" ON "schedules"("class_id", "day_of_week", "start_time");
