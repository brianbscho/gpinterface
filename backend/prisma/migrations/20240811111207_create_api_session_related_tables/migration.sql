/*
  Warnings:

  - You are about to drop the column `api_key_hash_id` on the `histories` table. All the data in the column will be lost.
  - Added the required column `config` to the `apis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model_hash_id` to the `apis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "histories" DROP CONSTRAINT "histories_api_key_hash_id_fkey";

-- AlterTable
ALTER TABLE "apis" ADD COLUMN     "config" JSONB NOT NULL,
ADD COLUMN     "model_hash_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "histories" DROP COLUMN "api_key_hash_id",
ADD COLUMN     "api_hash_id" TEXT,
ADD COLUMN     "session_hash_id" TEXT;

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiHashId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_messages" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sessionHashId" TEXT NOT NULL,

    CONSTRAINT "session_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_hash_id_key" ON "sessions"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_messages_hash_id_key" ON "session_messages"("hash_id");

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_model_hash_id_fkey" FOREIGN KEY ("model_hash_id") REFERENCES "models"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_apiHashId_fkey" FOREIGN KEY ("apiHashId") REFERENCES "apis"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_sessionHashId_fkey" FOREIGN KEY ("sessionHashId") REFERENCES "sessions"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_api_hash_id_fkey" FOREIGN KEY ("api_hash_id") REFERENCES "apis"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_session_hash_id_fkey" FOREIGN KEY ("session_hash_id") REFERENCES "sessions"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
