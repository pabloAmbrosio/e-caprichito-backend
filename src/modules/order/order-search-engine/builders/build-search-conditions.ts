import { Prisma } from "../../../../lib/prisma";
import { SIMILARITY_THRESHOLD } from "../constants";

// rawSearch (sin escape) para similarity(), likeSearch (escapado) para ILIKE
export const buildSearchConditions = (
  rawSearch?: string,
  likeSearch?: string,
): Prisma.Sql => {
  if (!rawSearch || !likeSearch) return Prisma.empty;

  const ilikeTerm = `%${likeSearch}%`;

  return Prisma.sql`AND (
    similarity(u.username, ${rawSearch}) > ${SIMILARITY_THRESHOLD}
    OR u.email ILIKE ${ilikeTerm}
    OR u.phone ILIKE ${ilikeTerm}
    OR o.id::text ILIKE ${ilikeTerm}
    OR p.sku ILIKE ${ilikeTerm}
    OR similarity(c.name, ${rawSearch}) > ${SIMILARITY_THRESHOLD}
  )`;
};
