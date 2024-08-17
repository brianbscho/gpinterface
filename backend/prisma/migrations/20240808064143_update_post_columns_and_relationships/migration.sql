/*
  Warnings:

  - You are about to drop the column `post_hash_id` on the `image_prompts` table. All the data in the column will be lost.
  - You are about to drop the column `post_hash_id` on the `text_prompts` table. All the data in the column will be lost.
  - Added the required column `chat_hash_id` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "image_prompts" DROP CONSTRAINT "image_prompts_post_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "text_prompts" DROP CONSTRAINT "text_prompts_post_hash_id_fkey";

-- AlterTable
ALTER TABLE "image_prompts" DROP COLUMN "post_hash_id";

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "chat_hash_id" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "text_prompts" DROP COLUMN "post_hash_id";

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_chat_hash_id_fkey" FOREIGN KEY ("chat_hash_id") REFERENCES "chats"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
