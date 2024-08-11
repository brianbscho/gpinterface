/*
  Warnings:

  - You are about to drop the `contents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contents" DROP CONSTRAINT "contents_chat_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "contents" DROP CONSTRAINT "contents_model_hash_id_fkey";

-- DropTable
DROP TABLE "contents";

-- CreateTable
CREATE TABLE "chat_contents" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "config" JSONB,
    "chat_hash_id" TEXT NOT NULL,
    "model_hash_id" TEXT NOT NULL,

    CONSTRAINT "chat_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_contents_hash_id_key" ON "chat_contents"("hash_id");

-- AddForeignKey
ALTER TABLE "chat_contents" ADD CONSTRAINT "chat_contents_chat_hash_id_fkey" FOREIGN KEY ("chat_hash_id") REFERENCES "chats"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_contents" ADD CONSTRAINT "chat_contents_model_hash_id_fkey" FOREIGN KEY ("model_hash_id") REFERENCES "models"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
