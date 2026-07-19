CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "SearchDocumentType" AS ENUM ('PRODUCT', 'CATEGORY');

-- CreateTable
CREATE TABLE "search_documents" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "entityType" "SearchDocumentType" NOT NULL,
    "admin_id" TEXT NOT NULL,
    "searchable_text" TEXT NOT NULL,
    "embedding" vector(384) NOT NULL,
    "embedding_model" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "indexed_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" INTEGER,

    CONSTRAINT "search_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_documents_admin_id_idx" ON "search_documents"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "search_documents_entityType_entity_id_key" ON "search_documents"("entityType", "entity_id");

-- AddForeignKey
ALTER TABLE "search_documents" ADD CONSTRAINT "search_documents_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_documents" ADD CONSTRAINT "search_documents_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
