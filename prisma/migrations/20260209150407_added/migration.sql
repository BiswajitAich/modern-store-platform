-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REVIEW_CREATED', 'LOW_STOCK', 'NEW_ORDER');

-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" SERIAL NOT NULL,
    "adminId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "entityId" INTEGER,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminNotification_adminId_isRead_idx" ON "AdminNotification"("adminId", "isRead");

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;
