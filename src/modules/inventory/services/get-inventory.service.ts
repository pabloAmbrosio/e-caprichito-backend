import { db } from "../../../lib/prisma";
import { InventoryNotFoundError } from "../errors";
import { PRODUCT_INCLUDE, withAvailableStock } from "../constants";

export const getInventoryService = async (productId: string) => {

    const inventory = await db.inventory.findUnique({
        where: { productId },
        include: PRODUCT_INCLUDE
    });

    if (!inventory) {
        throw new InventoryNotFoundError(productId);
    }

    return { msg: "Inventario encontrado", data: withAvailableStock(inventory) };
};
