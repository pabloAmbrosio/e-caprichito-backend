import { db } from "../../../lib/prisma";
import { Prisma } from "../../../lib/prisma";
import { ListInventoryQueryInput } from "../schemas";
import { PRODUCT_INCLUDE, withAvailableStock } from "../constants";

export const listInventoryService = async (query: ListInventoryQueryInput) => {

    const { page = 1, limit = 20, search, minStock, maxStock, outOfStock } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};

    if (search) {
        where.product = { title: { contains: search, mode: "insensitive" } };
    }

    const inventories = await db.inventory.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" }
    });

    // Filtros de availableStock en memoria: Prisma no soporta comparar columnas entre si en WHERE
    let enriched = inventories.map(withAvailableStock);

    if (outOfStock === true) {
        enriched = enriched.filter(inv => inv.availableStock === 0);
    }

    if (minStock !== undefined) {
        enriched = enriched.filter(inv => inv.availableStock >= minStock);
    }

    if (maxStock !== undefined) {
        enriched = enriched.filter(inv => inv.availableStock <= maxStock);
    }

    const totalItems = enriched.length;
    const totalPages = Math.ceil(totalItems / limit);
    const items = enriched.slice(skip, skip + limit);

    return {
        msg: "Inventario listado",
        data: {
            items,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            }
        }
    };
};
