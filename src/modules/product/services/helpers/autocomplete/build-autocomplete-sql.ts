import { Prisma } from '../../../../../lib/prisma';
import { sanitizeAutocomplete } from './sanitize-autocomplete';

const SIMILARITY_THRESHOLD = 0.3;
const STATEMENT_TIMEOUT_MS = 3_000;

export { STATEMENT_TIMEOUT_MS };

export const buildAutocompleteSql = (rawTerm: string, limit: number): Prisma.Sql => {
  const escaped = sanitizeAutocomplete(rawTerm);
  const ilikeTerm = `%${escaped}%`;

  return Prisma.sql`
    WITH ranked AS (
      SELECT
        ap.id,
        ap.title,
        ap.slug,
        GREATEST(
          similarity(ap.title, ${rawTerm}),
          similarity(cat.name, ${rawTerm})
        ) AS rank
      FROM "AbstractProduct" ap
      LEFT JOIN "Category" cat ON cat.id = ap."categoryId"
      WHERE ap."deletedAt" IS NULL
        AND ap.status = 'PUBLISHED'
        AND (
          ap.title ILIKE ${ilikeTerm}
          OR similarity(ap.title, ${rawTerm}) > ${SIMILARITY_THRESHOLD}
          OR cat.name ILIKE ${ilikeTerm}
          OR ap.tags::text ILIKE ${ilikeTerm}
        )
      ORDER BY rank DESC
      LIMIT ${limit}
    )
    SELECT
      r.id,
      r.title,
      r.slug,
      (
        SELECT p.images
        FROM "Product" p
        WHERE p."abstractProductId" = r.id
          AND p."deletedAt" IS NULL
          AND p.status = 'PUBLISHED'
        ORDER BY p."createdAt" ASC
        LIMIT 1
      ) AS images
    FROM ranked r
    ORDER BY r.rank DESC
  `;
};
