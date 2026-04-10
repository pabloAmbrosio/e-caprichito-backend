-- Extensión pg_trgm para fuzzy matching con similarity()
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice trigram en título de AbstractProduct (fuzzy + substring)
CREATE INDEX idx_abstract_product_title_trgm
  ON "AbstractProduct" USING GIN (title gin_trgm_ops);

-- Índice trigram en nombre de categoría (fuzzy + substring)
CREATE INDEX idx_category_name_trgm
  ON "Category" USING GIN (name gin_trgm_ops);
