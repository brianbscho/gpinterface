-- CreateTable
CREATE TABLE "deposits" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "user_hash_id" TEXT,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deposits_hash_id_key" ON "deposits"("hash_id");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
