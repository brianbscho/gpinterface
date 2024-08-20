-- DropForeignKey
ALTER TABLE "apis" DROP CONSTRAINT "apis_user_hash_id_fkey";

-- AlterTable
ALTER TABLE "apis" ALTER COLUMN "user_hash_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "apis" ADD CONSTRAINT "apis_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
