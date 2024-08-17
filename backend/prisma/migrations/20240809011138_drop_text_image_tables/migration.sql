/*
  Warnings:

  - You are about to drop the `image_examples` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `image_prompt_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `image_prompts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `text_examples` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `text_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `text_prompt_histories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `text_prompts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "image_examples" DROP CONSTRAINT "image_examples_image_prompt_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "image_prompt_histories" DROP CONSTRAINT "image_prompt_histories_api_key_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "image_prompt_histories" DROP CONSTRAINT "image_prompt_histories_image_prompt_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "image_prompt_histories" DROP CONSTRAINT "image_prompt_histories_user_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "text_examples" DROP CONSTRAINT "text_examples_text_prompt_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "text_messages" DROP CONSTRAINT "text_messages_text_prompt_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "text_prompt_histories" DROP CONSTRAINT "text_prompt_histories_api_key_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "text_prompt_histories" DROP CONSTRAINT "text_prompt_histories_text_prompt_hash_id_fkey";

-- DropForeignKey
ALTER TABLE "text_prompt_histories" DROP CONSTRAINT "text_prompt_histories_user_hash_id_fkey";

-- DropTable
DROP TABLE "image_examples";

-- DropTable
DROP TABLE "image_prompt_histories";

-- DropTable
DROP TABLE "image_prompts";

-- DropTable
DROP TABLE "text_examples";

-- DropTable
DROP TABLE "text_messages";

-- DropTable
DROP TABLE "text_prompt_histories";

-- DropTable
DROP TABLE "text_prompts";
