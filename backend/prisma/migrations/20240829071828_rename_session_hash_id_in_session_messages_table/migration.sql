-- DropForeignKey
ALTER TABLE "session_messages" DROP CONSTRAINT "session_messages_sessionHashId_fkey";

-- RenameColumn
ALTER TABLE "session_messages" RENAME COLUMN "sessionHashId" to "session_hash_id";

-- AddForeignKey
ALTER TABLE "session_messages" ADD CONSTRAINT "session_messages_session_hash_id_fkey" FOREIGN KEY ("session_hash_id") REFERENCES "sessions"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
