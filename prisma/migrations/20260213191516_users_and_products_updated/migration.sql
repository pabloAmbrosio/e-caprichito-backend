/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `abstractProductId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SELLER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "CustomerRole" AS ENUM ('MEMBER', 'VIP_FAN', 'VIP_LOVER', 'VIP_LEGEND');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('ROPA', 'ACCESORIOS', 'CALZADO', 'OTROS');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "abstractProductId" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "images" JSONB,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "adminRole" "AdminRole" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "customerRole" "CustomerRole";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "AbstractProduct" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "tags" TEXT[],
    "images" JSONB NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbstractProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AbstractProduct_category_idx" ON "AbstractProduct"("category");

-- CreateIndex
CREATE INDEX "AbstractProduct_status_idx" ON "AbstractProduct"("status");

-- CreateIndex
CREATE INDEX "AbstractProduct_createdBy_idx" ON "AbstractProduct"("createdBy");

-- CreateIndex
CREATE INDEX "Product_abstractProductId_idx" ON "Product"("abstractProductId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_createdBy_idx" ON "Product"("createdBy");

-- CreateIndex
CREATE INDEX "User_adminRole_idx" ON "User"("adminRole");

-- AddForeignKey
ALTER TABLE "AbstractProduct" ADD CONSTRAINT "AbstractProduct_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_abstractProductId_fkey" FOREIGN KEY ("abstractProductId") REFERENCES "AbstractProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
