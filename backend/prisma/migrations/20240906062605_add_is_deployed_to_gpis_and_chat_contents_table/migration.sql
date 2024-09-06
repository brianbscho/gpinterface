-- AlterTable
ALTER TABLE "chat_contents" ADD COLUMN     "is_deployed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "gpis" ADD COLUMN     "is_deployed" BOOLEAN NOT NULL DEFAULT false;

-- UpdateTable
UPDATE "chat_contents" SET "is_deployed"=true;

-- UpdateTable
UPDATE "gpis" SET "is_deployed"=true;
