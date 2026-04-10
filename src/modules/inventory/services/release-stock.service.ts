import { db } from "../../../lib/prisma";
import { StockOperationInput } from "../schemas";
import { InventoryNotFoundError, NegativeStockError } from "../errors";
import { PRODUCT_INCLUDE, withAvailableStock } from "../constants";

export const releaseStockService = async ({ productId, quantity }: StockOperationInput) => {

    const inventory = await db.inventory.findUnique({
        where: { productId },
        include: PRODUCT_INCLUDE
    });

    if (!inventory) {
        throw new InventoryNotFoundError(productId);
    }

    if (quantity > inventory.reservedStock) {
        throw new NegativeStockError(productId);
    }

    const updated = await db.inventory.update({
        where: { productId },
        data: {
            reservedStock: { decrement: quantity }
        },
        include: PRODUCT_INCLUDE
    });

    return { msg: "Stock liberado exitosamente", data: withAvailableStock(updated) };
};
