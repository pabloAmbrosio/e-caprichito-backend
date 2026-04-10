/*
  Warnings:

  - A unique constraint covering the columns `[activeForId]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "activeForId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_activeForId_key" ON "Cart"("activeForId");
