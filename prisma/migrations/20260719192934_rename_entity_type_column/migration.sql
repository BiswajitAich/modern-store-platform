/*
  Warnings:

  - You are about to drop the column `entityType` on the `search_documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[entity_type,entity_id]` on the table `search_documents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `entity_type` to the `search_documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "search_documents_embedding_idx";

-- DropIndex
DROP INDEX "search_documents_entityType_entity_id_key";

-- AlterTable
ALTER TABLE "search_documents" DROP COLUMN "entityType",
ADD COLUMN     "entity_type" "SearchDocumentType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "search_documents_entity_type_entity_id_key" ON "search_documents"("entity_type", "entity_id");
