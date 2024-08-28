-- AlterTable
ALTER TABLE "chat_contents" ADD COLUMN     "is_modified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "gpis" RENAME CONSTRAINT "apis_pkey" TO "gpis_pkey";
