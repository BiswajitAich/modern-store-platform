/*
  Warnings:

  - The values [LOW_STOCK,NEW_ORDER] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('ORDER_INITIATED', 'ORDER_CANCELLED', 'ORDER_CONFIRMED', 'REVIEW_CREATED');
ALTER TABLE "AdminNotification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "WhatsAppOrderStatus" ADD VALUE 'SHIPPED';
