/*
  Warnings:

  - Made the column `user_hash_id` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "apis" DROP CONSTRAINT "apis_user_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "contents" DROP CONSTRAINT "contents_chat_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_user_hash_id_fkey";

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "user_hash_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_chat_hash_id_fkey" FOREIGN KEY ("chat_hash_id") REFERENCES "chats"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;
