/*
  Warnings:

  - You are about to drop the column `available` on the `models` table. All the data in the column will be lost.
  - Added the required column `is_available` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "models" DROP COLUMN "available",
ADD COLUMN     "is_available" BOOLEAN NOT NULL;
