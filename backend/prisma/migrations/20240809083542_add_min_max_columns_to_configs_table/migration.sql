-- AlterTable
ALTER TABLE "configs" ADD COLUMN     "max" DOUBLE PRECISION,
ADD COLUMN     "min" DOUBLE PRECISION,
ALTER COLUMN "default" DROP NOT NULL;