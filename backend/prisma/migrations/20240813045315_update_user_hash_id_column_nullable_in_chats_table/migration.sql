-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_user_hash_id_fkey";

-- AlterTable
ALTER TABLE "chats" ALTER COLUMN "user_hash_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
