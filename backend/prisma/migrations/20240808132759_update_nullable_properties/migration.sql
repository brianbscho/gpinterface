/*
  Warnings:

  - Made the column `user_hash_id` on table `apis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model_hash_id` on table `contents` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "apis" DROP CONSTRAINT "apis_user_hash_id_fkey";

-- AlterTable
ALTER TABLE "apis" ALTER COLUMN "user_hash_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "contents" ALTER COLUMN "model_hash_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;
