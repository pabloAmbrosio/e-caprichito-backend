import { db } from "../../../lib/prisma";
import { Prisma } from "../../../lib/prisma";
import { StockOperationInput } from "../schemas";
import { ProductNotFoundError, InventoryNotFoundError, InsufficientStockError } from "../errors";
import { PRODUCT_INCLUDE, withAvailableStock } from "../constants";

export const reserveStockService = async ({ productId, quantity }: StockOperationInput) => {

    const result = await db.$transaction(async (tx) => {

        const product = await tx.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new ProductNotFoundError(productId);
        }

        const inventory = await tx.inventory.findUnique({
            where: { productId },
            include: PRODUCT_INCLUDE
        });

        if (!inventory) {
            throw new InventoryNotFoundError(productId);
        }

        const availableStock = inventory.physicalStock - inventory.reservedStock;

        if (quantity > availableStock) {
            throw new InsufficientStockError(productId, quantity, availableStock);
        }

        const updated = await tx.inventory.update({
            where: { productId },
            data: {
                reservedStock: { increment: quantity }
            },
            include: PRODUCT_INCLUDE
        });

        return withAvailableStock(updated);

    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

    return { msg: "Stock reservado exitosamente", data: result };
};
