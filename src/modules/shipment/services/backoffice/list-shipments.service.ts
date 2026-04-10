import { db } from "../../../../lib/prisma";
import { Prisma } from "../../../../lib/prisma";
import { shipmentSelect } from "../../shipment.selects";
import type { ListShipmentsQuery } from "../../schemas";

function buildShipmentWhereClause(query: ListShipmentsQuery): Prisma.ShipmentWhereInput {
    const conditions: Prisma.ShipmentWhereInput[] = [];

    if (query.status) conditions.push({ status: query.status });
    if (query.type) conditions.push({ type: query.type });
    if (query.dateFrom) conditions.push({ createdAt: { gte: new Date(query.dateFrom) } });
    if (query.dateTo) conditions.push({ createdAt: { lte: new Date(query.dateTo) } });

    return conditions.length > 0 ? { AND: conditions } : {};
}

export async function listShipmentsService(query: ListShipmentsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = buildShipmentWhereClause(query);

    const [items, totalItems] = await Promise.all([
        db.shipment.findMany({
            where,
            select: {
                ...shipmentSelect,
                order: {
                    select: {
                        id: true,
                        status: true,
                        customer: {
                            select: { id: true, username: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" as const },
            skip,
            take: limit,
        }),
        db.shipment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
        msg: "Listado de envios",
        data: {
            items,
            pagination: { page, limit, totalItems, totalPages },
        },
    };
}
