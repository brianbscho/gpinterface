/*
  Warnings:

  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `notification_checked_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_hash_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "bio",
DROP COLUMN "notification_checked_at";

-- DropTable
DROP TABLE "notifications";
