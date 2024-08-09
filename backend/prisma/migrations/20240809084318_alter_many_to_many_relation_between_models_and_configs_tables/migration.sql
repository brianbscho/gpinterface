/*
  Warnings:

  - You are about to drop the column `model_hash_id` on the `configs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "configs" DROP CONSTRAINT "configs_model_hash_id_fkey";

-- AlterTable
ALTER TABLE "configs" DROP COLUMN "model_hash_id";

-- CreateTable
CREATE TABLE "configs_on_models" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "config_hash_id" TEXT NOT NULL,
    "model_hash_id" TEXT NOT NULL,

    CONSTRAINT "configs_on_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configs_on_models_hash_id_key" ON "configs_on_models"("hash_id");

-- AddForeignKey
ALTER TABLE "configs_on_models" ADD CONSTRAINT "configs_on_models_config_hash_id_fkey" FOREIGN KEY ("config_hash_id") REFERENCES "configs"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configs_on_models" ADD CONSTRAINT "configs_on_models_model_hash_id_fkey" FOREIGN KEY ("model_hash_id") REFERENCES "models"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
