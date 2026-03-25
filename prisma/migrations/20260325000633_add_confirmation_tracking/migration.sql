-- AlterEnum
ALTER TYPE "DeliveryStatus" ADD VALUE 'CONFIRMED';

-- AlterTable
ALTER TABLE "announcement_recipients" ADD COLUMN     "confirmed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "requires_confirmation" BOOLEAN NOT NULL DEFAULT false;
