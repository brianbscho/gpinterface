-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notification_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
