import { sql, join, type Sql } from '../../../../lib/prisma';
import type { WhereFilters } from '../types/filters.types';

export const buildWhereConditions = (filters: WhereFilters): Sql[] => {
  
  const {
    categoryIds, title, tags, isFeatured,
    minPriceInCents, maxPriceInCents,
    createdFrom, createdTo,
  } = filters;

  const conditions: Sql[] = [
    sql`ap."deletedAt" IS NULL`,
    sql`ap.status = 'PUBLISHED'`,
  ];

  if (categoryIds?.length) {
    conditions.push(
      sql`ap."categoryId" IN (SELECT id FROM category_descendants)`
    );
  }

  if (title) {
    conditions.push(sql`ap.title ILIKE ${'%' + title + '%'}`);
  }

  if (isFeatured !== undefined) {
    conditions.push(sql`ap."isFeatured" = ${isFeatured}`);
  }

  if (tags?.length) {
    // ['ropa', 'mujer'] → [sql'ropa', sql'mujer'] (parametrizado, safe contra injection)
    const safeTags = tags.map((t) => sql`${t}`);
    // [sql'ropa', sql'mujer'] → sql'ropa','mujer'
    const tagsList = join(safeTags, ',');
    // @> = "contiene todos": el producto debe tener TODOS los tags pedidos
    conditions.push(sql`ap.tags @> ARRAY[${tagsList}]::text[]`);
  }

  if (minPriceInCents !== undefined || maxPriceInCents !== undefined) {
    // Optimal with index: ("abstractProductId", "deletedAt", "priceInCents") WHERE "deletedAt" IS NULL
    const priceConditions: Sql[] = [
      sql`pf."abstractProductId" = ap.id`,
      sql`pf."deletedAt" IS NULL`,
    ];
    if (minPriceInCents !== undefined) {
      priceConditions.push(sql`pf."priceInCents" >= ${minPriceInCents}`);
    }
    if (maxPriceInCents !== undefined) {
      priceConditions.push(sql`pf."priceInCents" <= ${maxPriceInCents}`);
    }
    conditions.push(sql`EXISTS (
      SELECT 1 FROM "Product" pf
      WHERE ${join(priceConditions, ' AND ')}
    )`);
  }

  if (createdFrom) conditions.push(sql`ap."createdAt" >= ${createdFrom}`);
  if (createdTo)   conditions.push(sql`ap."createdAt" <= ${createdTo}`);

  return conditions;
};
