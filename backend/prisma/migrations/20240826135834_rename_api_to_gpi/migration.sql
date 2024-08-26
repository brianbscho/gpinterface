-- RenameTable
ALTER TABLE "apis" RENAME TO "gpis";

-- RenameColumn
ALTER TABLE "histories" RENAME COLUMN "api_hash_id" to "gpi_hash_id";

-- RenameColumn
ALTER TABLE "sessions" RENAME COLUMN "apiHashId" to "gpi_hash_id";

-- DropForeignKey
ALTER TABLE "gpis" DROP CONSTRAINT "apis_chat_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "gpis" DROP CONSTRAINT "apis_model_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "gpis" DROP CONSTRAINT "apis_user_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "histories" DROP CONSTRAINT "histories_api_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_apiHashId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "gpis_hash_id_key" ON "gpis"("hash_id");

-- AddForeignKey
ALTER TABLE "gpis" ADD CONSTRAINT "gpis_chat_hash_id_fkey" FOREIGN KEY ("chat_hash_id") REFERENCES "chats"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpis" ADD CONSTRAINT "gpis_model_hash_id_fkey" FOREIGN KEY ("model_hash_id") REFERENCES "models"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gpis" ADD CONSTRAINT "gpis_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_gpi_hash_id_fkey" FOREIGN KEY ("gpi_hash_id") REFERENCES "gpis"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_gpi_hash_id_fkey" FOREIGN KEY ("gpi_hash_id") REFERENCES "gpis"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
