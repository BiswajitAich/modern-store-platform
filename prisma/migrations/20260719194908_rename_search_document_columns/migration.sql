/*
  Warnings:

  - You are about to drop the column `createdAt` on the `search_documents` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `search_documents` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `search_documents` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `search_documents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "search_documents" DROP CONSTRAINT "search_documents_productId_fkey";

-- AlterTable
ALTER TABLE "search_documents" DROP COLUMN "createdAt",
DROP COLUMN "productId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
