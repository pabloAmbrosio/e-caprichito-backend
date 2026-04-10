import { sql, empty } from '../../../../lib/prisma';
import type { AggregatesSqlParts } from '../types';
// dsd
export const buildAggregatesSqlParts = (
  needsSales: boolean,
  needsLikes: boolean,
  userId?: string,
): AggregatesSqlParts => ({
  
  salesCte: needsSales
    ? sql`
      sales_agg AS (
        SELECT
          p_s."abstractProductId",
          COALESCE(SUM(oi.quantity), 0)::int AS "totalSales"
        FROM "OrderItem" oi
        INNER JOIN "Product" p_s ON p_s.id = oi."productId"
        INNER JOIN "Order" o ON o.id = oi."orderId"
          AND o.status NOT IN ('CANCELLED')
        WHERE p_s."deletedAt" IS NULL
        GROUP BY p_s."abstractProductId"
      )`
    : empty,

  likesCte: needsLikes
    ? sql`
      likes_agg AS (
        SELECT
          "abstractProductId",
          COUNT(*)::int AS "totalLikes"
        FROM "ProductLike"
        GROUP BY "abstractProductId"
      )`
    : empty,

  salesJoin: needsSales
    ? sql`LEFT JOIN sales_agg ON sales_agg."abstractProductId" = ap.id`
    : empty,

  likesJoin: needsLikes
    ? sql`LEFT JOIN likes_agg ON likes_agg."abstractProductId" = ap.id`
    : empty,

  salesSelect: needsSales
    ? sql`,COALESCE(sales_agg."totalSales", 0) AS "totalSales"`
    : sql`,0 AS "totalSales"`,

  likesSelect: needsLikes
    ? sql`,COALESCE(likes_agg."totalLikes", 0) AS "totalLikes"`
    : sql`,0 AS "totalLikes"`,

  salesGroupBy: needsSales ? sql`, sales_agg."totalSales"` : empty,
  likesGroupBy: needsLikes ? sql`, likes_agg."totalLikes"` : empty,

  isLikedJoin: userId !== undefined
    ? sql`LEFT JOIN "ProductLike" pl_user ON pl_user."abstractProductId" = ap.id AND pl_user."userId" = ${userId}`
    : empty,

  isLikedSelect: userId !== undefined
    ? sql`,COALESCE(BOOL_OR(pl_user.id IS NOT NULL), false) AS "isLiked"`
    : sql`,false AS "isLiked"`,

  // BOOL_OR is an aggregate — no extra GROUP BY column needed
  isLikedGroupBy: empty,
});
