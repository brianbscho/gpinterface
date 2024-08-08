-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comment" TEXT NOT NULL,
    "post_hash_id" TEXT NOT NULL,
    "user_hash_id" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comments_hash_id_key" ON "comments"("hash_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_hash_id_fkey" FOREIGN KEY ("post_hash_id") REFERENCES "posts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;
