import { db } from "../../../../lib/prisma";
import { cartSelect } from "../../cart.selects";

interface PaginationInput {
  page?: number;
  limit?: number;
}

export async function getCartHistory(customerId: string, pagination?: PaginationInput) {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 20;

  return db.cart.findMany({
    where: {
      customerId,
      deletedAt: { not: null },
    },
    select: {
      ...cartSelect,
      deletedAt: true,
    },
    orderBy: { deletedAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });
}
