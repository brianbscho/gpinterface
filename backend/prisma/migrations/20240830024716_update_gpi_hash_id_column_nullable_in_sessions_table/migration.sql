-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_gpi_hash_id_fkey";

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "gpi_hash_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_gpi_hash_id_fkey" FOREIGN KEY ("gpi_hash_id") REFERENCES "gpis"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
