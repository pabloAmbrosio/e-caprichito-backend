import { Prisma } from "../../../../lib/prisma";

type SortableField = "createdAt" | "status" | "discountTotalInCents";
type SortDirection = "asc" | "desc";

// Whitelist: evita Prisma.raw con strings de usuario
const SORT_FIELD_SQL: Record<SortableField, Prisma.Sql> = {
  createdAt: Prisma.sql`o."createdAt"`,
  status: Prisma.sql`o.status`,
  discountTotalInCents: Prisma.sql`o."discountTotalInCents"`,
};

const SORT_DIR_SQL: Record<SortDirection, Prisma.Sql> = {
  asc: Prisma.sql`ASC`,
  desc: Prisma.sql`DESC`,
};

export const buildOrderBy = (
  sortBy?: SortableField,
  sortOrder?: SortDirection,
): Prisma.Sql => {
  const field = SORT_FIELD_SQL[sortBy ?? "createdAt"];
  const dir = SORT_DIR_SQL[sortOrder ?? "desc"];
  return Prisma.sql`ORDER BY ${field} ${dir}`;
};
