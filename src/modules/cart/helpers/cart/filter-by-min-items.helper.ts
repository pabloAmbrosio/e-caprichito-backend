// Prisma doesn't support count filtering in where clauses
export function filterByMinItems<T extends { _count: { items: number } }>(
  carts: T[],
  minItems: number,
): T[] {
  return minItems > 1 ? carts.filter((c) => c._count.items >= minItems) : carts;
}
