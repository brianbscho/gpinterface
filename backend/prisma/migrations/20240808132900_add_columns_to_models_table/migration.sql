/*
  Warnings:

  - Added the required column `available` to the `models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_free` to the `models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_login_required` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "models" ADD COLUMN     "available" BOOLEAN NOT NULL,
ADD COLUMN     "is_free" BOOLEAN NOT NULL,
ADD COLUMN     "is_login_required" BOOLEAN NOT NULL;
