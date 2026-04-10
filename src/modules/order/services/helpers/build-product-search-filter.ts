import { Prisma } from "../../../../lib/prisma";

export function buildProductSearchFilter(search: string): Prisma.OrderWhereInput {
  return {
    items: {
      some: {
        product: {
          title: { contains: search, mode: "insensitive" },
        },
      },
    },
  };
}
