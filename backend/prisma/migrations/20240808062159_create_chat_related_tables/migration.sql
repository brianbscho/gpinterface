-- CreateTable
CREATE TABLE "provider_types" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,

    CONSTRAINT "provider_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "provider_type_hash_id" TEXT NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "provider_hash_id" TEXT NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configs" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default" TEXT NOT NULL,
    "model_hash_id" TEXT NOT NULL,

    CONSTRAINT "configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config_options" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT NOT NULL,
    "config_hash_id" TEXT NOT NULL,

    CONSTRAINT "config_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_hash_id" TEXT NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "hash_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "chat_hash_id" TEXT NOT NULL,
    "model_hash_id" TEXT NOT NULL,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provider_types_hash_id_key" ON "provider_types"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "providers_hash_id_key" ON "providers"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "models_hash_id_key" ON "models"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "configs_hash_id_key" ON "configs"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "config_options_hash_id_key" ON "config_options"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "chats_hash_id_key" ON "chats"("hash_id");

-- CreateIndex
CREATE UNIQUE INDEX "contents_hash_id_key" ON "contents"("hash_id");

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_provider_type_hash_id_fkey" FOREIGN KEY ("provider_type_hash_id") REFERENCES "provider_types"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_provider_hash_id_fkey" FOREIGN KEY ("provider_hash_id") REFERENCES "providers"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configs" ADD CONSTRAINT "configs_model_hash_id_fkey" FOREIGN KEY ("model_hash_id") REFERENCES "models"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "config_options" ADD CONSTRAINT "config_options_config_hash_id_fkey" FOREIGN KEY ("config_hash_id") REFERENCES "configs"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_hash_id_fkey" FOREIGN KEY ("user_hash_id") REFERENCES "users"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_chat_hash_id_fkey" FOREIGN KEY ("chat_hash_id") REFERENCES "chats"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_model_hash_id_fkey" FOREIGN KEY ("model_hash_id") REFERENCES "models"("hash_id") ON DELETE RESTRICT ON UPDATE CASCADE;
