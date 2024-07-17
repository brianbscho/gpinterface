-- CreateTable
CREATE TABLE "bookmarks" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_bookmarked" BOOLEAN NOT NULL,
    "post_hash_id" TEXT NOT NULL,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_liked" BOOLEAN NOT NULL,
    "post_hash_id" TEXT NOT NULL,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post" TEXT NOT NULL,
    "thread_hash_id" TEXT NOT NULL,
    "user_hash_id" TEXT,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "threads" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "user_hash_id" TEXT,

    CONSTRAINT "threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_examples" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "input" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image_prompt_hash_id" TEXT NOT NULL,

    CONSTRAINT "image_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_prompts" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "post_hash_id" TEXT NOT NULL,

    CONSTRAINT "image_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_prompt_histories" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "input" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image_prompt_hash_id" TEXT,
    "api_key_hash_id" TEXT,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "image_prompt_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_examples" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "input" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "text_prompt_hash_id" TEXT NOT NULL,

    CONSTRAINT "text_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_messages" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "text_prompt_hash_id" TEXT NOT NULL,

    CONSTRAINT "text_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_prompts" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "system_message" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "post_hash_id" TEXT NOT NULL,

    CONSTRAINT "text_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "text_prompt_histories" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "system_message" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "input" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "input_tokens" INTEGER NOT NULL,
    "output_tokens" INTEGER NOT NULL,
    "messages" JSONB NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "text_prompt_hash_id" TEXT,
    "api_key_hash_id" TEXT,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "text_prompt_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "key" TEXT NOT NULL,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_hash_id_key" ON "bookmarks"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_hash_id_key" ON "likes"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_hash_id_key" ON "posts"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "threads_hash_id_key" ON "threads"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_examples_hash_id_key" ON "image_examples"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_prompts_hash_id_key" ON "image_prompts"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "image_prompt_histories_hash_id_key" ON "image_prompt_histories"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "text_examples_hash_id_key" ON "text_examples"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "text_messages_hash_id_key" ON "text_messages"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "text_prompts_hash_id_key" ON "text_prompts"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "text_prompt_histories_hash_id_key" ON "text_prompt_histories"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_hash_id_key" ON "api_keys"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_hash_id_key" ON "users"("hash_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_post_hash_id_fkey" FOREIGN KEY ("post_hash_id") REFERENCES "posts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_post_hash_id_fkey" FOREIGN KEY ("post_hash_id") REFERENCES "posts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_thread_hash_id_fkey" FOREIGN KEY ("thread_hash_id") REFERENCES "threads"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_examples" ADD CONSTRAINT "image_examples_image_prompt_hash_id_fkey" FOREIGN KEY ("image_prompt_hash_id") REFERENCES "image_prompts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_prompts" ADD CONSTRAINT "image_prompts_post_hash_id_fkey" FOREIGN KEY ("post_hash_id") REFERENCES "posts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_prompt_histories" ADD CONSTRAINT "image_prompt_histories_image_prompt_hash_id_fkey" FOREIGN KEY ("image_prompt_hash_id") REFERENCES "image_prompts"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_prompt_histories" ADD CONSTRAINT "image_prompt_histories_api_key_hash_id_fkey" FOREIGN KEY ("api_key_hash_id") REFERENCES "api_keys"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_prompt_histories" ADD CONSTRAINT "image_prompt_histories_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_examples" ADD CONSTRAINT "text_examples_text_prompt_hash_id_fkey" FOREIGN KEY ("text_prompt_hash_id") REFERENCES "text_prompts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_messages" ADD CONSTRAINT "text_messages_text_prompt_hash_id_fkey" FOREIGN KEY ("text_prompt_hash_id") REFERENCES "text_prompts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_prompts" ADD CONSTRAINT "text_prompts_post_hash_id_fkey" FOREIGN KEY ("post_hash_id") REFERENCES "posts"("hash_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_prompt_histories" ADD CONSTRAINT "text_prompt_histories_text_prompt_hash_id_fkey" FOREIGN KEY ("text_prompt_hash_id") REFERENCES "text_prompts"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_prompt_histories" ADD CONSTRAINT "text_prompt_histories_api_key_hash_id_fkey" FOREIGN KEY ("api_key_hash_id") REFERENCES "api_keys"("hash_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "text_prompt_histories" ADD CONSTRAINT "text_prompt_histories_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
