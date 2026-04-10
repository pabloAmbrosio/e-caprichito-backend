-- AlterTable
ALTER TABLE "AbstractProduct" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "seoMetadata" JSONB,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compareAtPriceInCents" INTEGER,
ADD COLUMN     "sku" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AbstractProduct_slug_key" ON "AbstractProduct"("slug");

-- CreateIndex
CREATE INDEX "AbstractProduct_slug_idx" ON "AbstractProduct"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
