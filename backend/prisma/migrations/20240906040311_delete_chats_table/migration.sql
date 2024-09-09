-- AlterTable
ALTER TABLE "gpis" ADD COLUMN "system_message" TEXT NOT NULL DEFAULT '';

-- UpdateTable
UPDATE "gpis" SET "system_message" = (
    SELECT "system_message"
    FROM "chats"
    WHERE "chats"."hash_id" = "gpis"."chat_hash_id"
);

-- AlterTable
ALTER TABLE "chat_contents" ADD COLUMN "gpi_hash_id" TEXT;

-- UpdateTable
UPDATE "chat_contents"
SET "gpi_hash_id" = (
    SELECT "hash_id"
    FROM "gpis"
    WHERE "gpis"."chat_hash_id" = "chat_contents"."chat_hash_id"
);

DELETE FROM "chat_contents" WHERE "gpi_hash_id" IS NULL;

-- AlterTable
ALTER TABLE "chat_contents" ALTER COLUMN "gpi_hash_id" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "chat_contents" DROP CONSTRAINT "chat_contents_chat_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_user_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "gpis" DROP CONSTRAINT "gpis_chat_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "histories" DROP CONSTRAINT "histories_chat_hash_id_fkey";

-- AlterTable
ALTER TABLE "chat_contents" DROP COLUMN "chat_hash_id";

-- AlterTable
ALTER TABLE "gpis" DROP COLUMN "chat_hash_id";

-- AlterTable
ALTER TABLE "histories" DROP COLUMN "chat_hash_id";

-- DropTable
DROP TABLE "chats";

-- AddForeignKey
ALTER TABLE "chat_contents" ADD CONSTRAINT "chat_contents_gpi_hash_id_fkey" FOREIGN KEY ("gpi_hash_id") REFERENCES "gpis"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;
