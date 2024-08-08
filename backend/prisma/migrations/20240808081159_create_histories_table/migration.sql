-- CreateTable
CREATE TABLE "histories" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "messages" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "api_key_hash_id" TEXT,
    "chat_hash_id" TEXT,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "histories_hash_id_key" ON "histories"("hash_id");

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_api_key_hash_id_fkey" FOREIGN KEY ("api_key_hash_id") REFERENCES "api_keys"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_chat_hash_id_fkey" FOREIGN KEY ("chat_hash_id") REFERENCES "chats"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histories" ADD CONSTRAINT "histories_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
