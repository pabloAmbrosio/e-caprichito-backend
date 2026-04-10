import { sql } from '../../../../lib/prisma';

// --- CTEs fijos ---

// IDs de categorías que tienen al menos un producto publicado
export const usedCategoriesCte = sql`
  used_categories AS (
    SELECT DISTINCT "categoryId" AS id
    FROM "AbstractProduct"
    WHERE "deletedAt" IS NULL
      AND status = 'PUBLISHED'
  )`;

// Recorre el árbol de categorías hacia arriba para armar breadcrumbs
export const pathRowsCte = sql`
  path_rows AS (
    SELECT c.id AS "originId", c.id, c.name, c.slug, c."parentId", 1 AS depth
    FROM "Category" c
    INNER JOIN used_categories uc ON uc.id = c.id

    UNION ALL

    SELECT pr."originId", cat.id, cat.name, cat.slug, cat."parentId", pr.depth + 1
    FROM "Category" cat
    JOIN path_rows pr ON cat.id = pr."parentId"
  )`;

// Agrupa los breadcrumbs en un JSON array por categoría [root, ..., hoja]
export const pathAggCte = sql`
  path_agg AS (
    SELECT
      "originId",
      JSON_AGG(
        JSON_BUILD_OBJECT('id', id, 'name', name, 'slug', slug)
        ORDER BY depth DESC
      )::text AS categorias
    FROM path_rows
    GROUP BY "originId"
  )`;

// --- JOINs fijos ---

export const breadcrumbJoin = sql`LEFT JOIN path_agg pa ON pa."originId" = ap."categoryId"`;
export const categoryJoin = sql`LEFT JOIN "Category" cat ON cat.id = ap."categoryId"`;
export const variantsJoin = sql`LEFT JOIN "Product" p
  ON p."abstractProductId" = ap.id
  AND p."deletedAt" IS NULL
  AND p.status = 'PUBLISHED'`;
export const inventoryJoin = sql`LEFT JOIN "Inventory" inv ON inv."productId" = p.id`;

// --- SELECT base ---

// Campos del abstract product + stock + variantes como JSON array
export const baseSelect = sql`
    ap.id,
    ap.title,
    ap.slug,
    ap.description,
    ap."categoryId",
    COALESCE(pa.categorias, '[]')::json AS categorias,
    ap.tags,
    ap.status,
    ap."isFeatured",
    COALESCE(
      BOOL_OR(
        (COALESCE(inv."physicalStock", 0) - COALESCE(inv."reservedStock", 0)) > 0
      ),
      false
    ) AS "inStock",
    ap."publishedAt",
    ap."createdAt",
    ap."updatedAt",
    COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id',           p.id,
          'sku',          p.sku,
          'title',        p.title,
          'priceInCents', p."priceInCents",
          'images',       p.images,
          'details',      p.details,
          'inStock',      (COALESCE(inv."physicalStock", 0)
                          - COALESCE(inv."reservedStock", 0)) > 0
        )
        ORDER BY p.id
      ) FILTER (WHERE p.id IS NOT NULL),
      '[]'::json
    ) AS variantes`;

// --- GROUP BY base ---

export const baseGroupBy = sql`GROUP BY ap.id, pa.categorias, cat."name"`;
