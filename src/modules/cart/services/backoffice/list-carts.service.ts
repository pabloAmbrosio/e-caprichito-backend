import { db } from "../../../../lib/prisma";
import { Prisma } from "../../../../lib/prisma";
import { cartBackofficeSelect } from "../../cart.selects";
import type { ListCartsInput } from "../../schemas";

// ── Filter builders ────────────────────────

function buildSearchFilter(search: string): Prisma.CartWhereInput {
  return {
    customer: { username: { contains: search, mode: "insensitive" } },
  };
}

function buildUserFilter(userIds: string[]): Prisma.CartWhereInput {
  return { customerId: { in: userIds } };
}

function buildProductFilter(productIds: string[]): Prisma.CartWhereInput {
  return {
    items: { some: { productId: { in: productIds } } },
  };
}

function buildCategoryFilter(categoryIds: string[]): Prisma.CartWhereInput {
  return {
    items: {
      some: {
        product: { abstractProduct: { categoryId: { in: categoryIds } } },
      },
    },
  };
}

function buildTagFilter(tags: string[]): Prisma.CartWhereInput {
  return {
    items: {
      some: {
        product: { abstractProduct: { tags: { hasSome: tags } } },
      },
    },
  };
}

function buildWhereClause(query: ListCartsInput): Prisma.CartWhereInput {
  const conditions: Prisma.CartWhereInput[] = [];

  if (query.search)      conditions.push(buildSearchFilter(query.search));
  if (query.userIds?.length)    conditions.push(buildUserFilter(query.userIds));
  if (query.productIds?.length) conditions.push(buildProductFilter(query.productIds));
  if (query.categoryIds?.length) conditions.push(buildCategoryFilter(query.categoryIds));
  if (query.tags?.length)       conditions.push(buildTagFilter(query.tags));

  return conditions.length > 0 ? { AND: conditions } : {};
}

// ── Service ────────────────────────────────────────────────

export async function listCartsService(query: ListCartsInput) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const where = buildWhereClause(query);

  const [items, totalItems] = await Promise.all([
    db.cart.findMany({
      where,
      select: cartBackofficeSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.cart.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    pagination: { page, limit, totalItems, totalPages },
  };
}