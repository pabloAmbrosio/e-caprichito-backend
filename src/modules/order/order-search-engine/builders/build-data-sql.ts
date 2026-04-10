import { Prisma } from "../../../../lib/prisma";
import type { DataSqlParts } from "../types";

// JOINs solo para búsqueda/filtros; datos via subqueries para integridad del GROUP BY
export const buildDataSql = ({
  searchClause,
  filterClause,
  orderBy,
  pagination,
}: DataSqlParts): Prisma.Sql => {
  return Prisma.sql`
    SELECT
      o.id,
      o.status,
      o."discountTotalInCents",
      o."expiresAt",
      o."createdAt",

      JSON_BUILD_OBJECT(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'customerRole', u."customerRole"
      ) AS customer,

      (
        SELECT COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', oi2.id,
            'quantity', oi2.quantity,
            'product', JSON_BUILD_OBJECT(
              'id', p2.id,
              'title', p2.title,
              'sku', p2.sku,
              'priceInCents', p2."priceInCents",
              'images', p2.images
            )
          )
        ), '[]'::json)
        FROM "OrderItem" oi2
        JOIN "Product" p2 ON p2.id = oi2."productId"
        WHERE oi2."orderId" = o.id
      ) AS items,

      (
        SELECT COALESCE(JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', pay2.id,
            'status', pay2.status,
            'amount', pay2.amount,
            'method', pay2.method,
            'createdAt', pay2."createdAt"
          )
        ), '[]'::json)
        FROM "Payment" pay2
        WHERE pay2."orderId" = o.id
      ) AS payments,

      (
        SELECT CASE WHEN s2.id IS NOT NULL THEN
          JSON_BUILD_OBJECT(
            'id', s2.id,
            'status', s2.status,
            'type', s2.type,
            'carrier', s2.carrier,
            'trackingCode', s2."trackingCode",
            'deliveryFee', s2."deliveryFee",
            'estimatedAt', s2."estimatedAt",
            'deliveredAt', s2."deliveredAt",
            'address', CASE WHEN addr2.id IS NOT NULL THEN
              JSON_BUILD_OBJECT(
                'id', addr2.id,
                'label', addr2.label,
                'formattedAddress', addr2."formattedAddress",
                'details', addr2.details,
                'lat', addr2.lat,
                'lng', addr2.lng
              )
            ELSE NULL END
          )
        ELSE NULL END
        FROM "Shipment" s2
        LEFT JOIN "Address" addr2 ON addr2.id = s2."addressId"
        WHERE s2."orderId" = o.id
        LIMIT 1
      ) AS shipment,

      (
        SELECT COUNT(*)::int
        FROM "OrderItem"
        WHERE "orderId" = o.id
      ) AS "_count_items"

    FROM "Order" o
    JOIN "User" u ON u.id = o."customerId"
    LEFT JOIN "OrderItem" oi ON oi."orderId" = o.id
    LEFT JOIN "Product" p ON p.id = oi."productId"
    LEFT JOIN "AbstractProduct" ap ON ap.id = p."abstractProductId"
    LEFT JOIN "Category" c ON c.id = ap."categoryId"
    WHERE 1=1
    ${searchClause}
    ${filterClause}
    GROUP BY o.id, u.id
    ${orderBy}
    ${pagination}
  `;
};
