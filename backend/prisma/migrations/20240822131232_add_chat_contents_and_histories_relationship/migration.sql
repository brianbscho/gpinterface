-- AlterTable
ALTER TABLE "histories" ADD COLUMN     "chat_content_hash_id" TEXT;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_chat_content_hash_id_fkey" FOREIGN KEY ("chat_content_hash_id") REFERENCES "chat_contents"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
