-- AlterTable
ALTER TABLE "AbstractProduct" DROP COLUMN "imageUrl",
DROP COLUMN "images",
DROP COLUMN "thumbnailUrl";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
DROP COLUMN "thumbnailUrl";
