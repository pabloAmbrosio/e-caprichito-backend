-- Aplicado despues de `prisma migrate reset` / `migrate deploy`.
-- Prisma 7 marca las migraciones SQL puras como aplicadas pero a veces
-- no ejecuta CREATE INDEX ... USING GIN ni indices funcionales/DESC.
-- Todo aqui es idempotente (IF NOT EXISTS).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Autocompletado (similarity + ILIKE) sobre titulo de producto y categoria
CREATE INDEX IF NOT EXISTS idx_abstract_product_title_trgm
  ON "AbstractProduct" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_category_name_trgm
  ON "Category" USING GIN (name gin_trgm_ops);
