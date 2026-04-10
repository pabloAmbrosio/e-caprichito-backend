/*
  Warnings:

  - You are about to drop the column `activeForId` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `promotionIds` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `maxDiscount` on the `PromotionAction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AbstractProduct_slug_idx";

-- DropIndex
DROP INDEX "Cart_activeForId_key";

-- DropIndex
DROP INDEX "Category_slug_idx";

-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "activeForId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "promotionIds";

-- AlterTable
ALTER TABLE "PromotionAction" DROP COLUMN "maxDiscount",
ADD COLUMN     "maxDiscountInCents" INTEGER;

-- CreateTable
CREATE TABLE "ProductLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "abstractProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductLike_abstractProductId_idx" ON "ProductLike"("abstractProductId");

-- CreateIndex
CREATE INDEX "ProductLike_userId_idx" ON "ProductLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLike_userId_abstractProductId_key" ON "ProductLike"("userId", "abstractProductId");

-- AddForeignKey
ALTER TABLE "ProductLike" ADD CONSTRAINT "ProductLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductLike" ADD CONSTRAINT "ProductLike_abstractProductId_fkey" FOREIGN KEY ("abstractProductId") REFERENCES "AbstractProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusAuditLog" ADD CONSTRAINT "OrderStatusAuditLog_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionUsage" ADD CONSTRAINT "PromotionUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionUsage" ADD CONSTRAINT "PromotionUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
