-- Habilitar extensión trigram para búsqueda fuzzy y substring eficiente
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índices GIN trigram en User (fuzzy para username, substring para email/phone)
CREATE INDEX idx_user_username_trgm ON "User" USING GIN (username gin_trgm_ops);
CREATE INDEX idx_user_email_trgm ON "User" USING GIN (email gin_trgm_ops);
CREATE INDEX idx_user_phone_trgm ON "User" USING GIN (phone gin_trgm_ops);

-- Índice GIN trigram en Product (substring para SKU)
CREATE INDEX idx_product_sku_trgm ON "Product" USING GIN (sku gin_trgm_ops);

-- Índice GIN trigram en Category (fuzzy para nombre)
CREATE INDEX idx_category_name_trgm ON "Category" USING GIN (name gin_trgm_ops);

-- Índice B-tree para ordenamiento por fecha de creación
CREATE INDEX idx_order_created_at_desc ON "Order" ("createdAt" DESC);
