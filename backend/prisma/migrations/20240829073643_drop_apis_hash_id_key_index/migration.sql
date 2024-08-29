-- DropIndex
DROP INDEX "apis_hash_id_key" CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_gpi_hash_id_fkey" FOREIGN KEY ("gpi_hash_id") REFERENCES "gpis"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_gpi_hash_id_fkey" FOREIGN KEY ("gpi_hash_id") REFERENCES "gpis"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
