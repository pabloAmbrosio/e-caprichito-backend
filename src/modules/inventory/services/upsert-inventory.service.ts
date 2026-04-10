import { db } from "../../../lib/prisma";
import { CreateInventoryInput } from "../schemas";
import { ProductNotFoundError, NegativeStockError, InvalidStockError } from "../errors";
import { withAvailableStock } from "../constants";

export const upsertInventoryService = async ({ productId, physicalStock }: CreateInventoryInput) => {

    // Defensa en profundidad: el schema ya valida >= 0
    if (physicalStock < 0) {
        throw new InvalidStockError(productId, physicalStock);
    }

    const product = await db.product.findUnique({
        where: { id: productId }
    });

    if (!product) {
        throw new ProductNotFoundError(productId);
    }

    // Evita que physicalStock quede por debajo de reservedStock (availableStock negativo)
    const existing = await db.inventory.findUnique({
        where: { productId }
    });

    if (existing && physicalStock < existing.reservedStock) {
        throw new NegativeStockError(productId);
    }

    const inventory = await db.inventory.upsert({
        where: { productId },
        create: {
            productId,
            physicalStock,
            reservedStock: 0
        },
        update: {
            physicalStock
        }
    });

    return { msg: "Inventario actualizado", data: withAvailableStock(inventory) };
};
