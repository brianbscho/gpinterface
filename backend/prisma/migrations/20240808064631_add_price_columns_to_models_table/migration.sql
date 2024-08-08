/*
  Warnings:

  - Added the required column `input_price_per_million` to the `models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `output_price_per_million` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "models" ADD COLUMN     "input_price_per_million" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "output_price_per_million" DOUBLE PRECISION NOT NULL;
