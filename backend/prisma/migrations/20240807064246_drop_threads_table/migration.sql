/*
  Warnings:

  - You are about to drop the column `thread_hash_id` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the `threads` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_thread_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "threads" DROP CONSTRAINT "threads_user_hash_id_fkey";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "thread_hash_id";

-- DropTable
DROP TABLE "threads";
