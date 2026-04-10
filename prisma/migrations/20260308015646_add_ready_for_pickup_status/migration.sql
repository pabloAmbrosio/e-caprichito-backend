-- AlterEnum
ALTER TYPE "ShipmentStatus" ADD VALUE 'READY_FOR_PICKUP';

-- DropIndex
DROP INDEX "idx_abstract_product_title_trgm";

-- DropIndex
DROP INDEX "idx_category_name_trgm";
