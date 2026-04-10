import { db } from "../../../../lib/prisma";
import { abandonedCartSelect } from "../../cart.selects";
import { buildAbandonedCartsWhere, filterByMinItems } from "../../helpers/cart";
import type { ListAbandonedCartsInput } from "../../schemas";

export async function listAbandonedCartsService(query: ListAbandonedCartsInput) {
  const { page = 1, limit = 20, inactiveDays = 7, minItems = 1 } = query;
  const skip = (page - 1) * limit;

  const where = buildAbandonedCartsWhere(inactiveDays);

  const [carts, totalItems] = await Promise.all([
    db.cart.findMany({ where, select: abandonedCartSelect, orderBy: { updatedAt: "asc" }, skip, take: limit }),
    db.cart.count({ where }),
  ]);

  const items = filterByMinItems(carts, minItems);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    message: "carritos abandonados obtenidos correctamente",
    data: { items, pagination: { page, limit, totalItems, totalPages } },
  };
}
