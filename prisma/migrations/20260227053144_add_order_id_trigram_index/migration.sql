-- Índice funcional GIN trigram sobre Order.id::text
-- Permite que ILIKE '%uuid_parcial%' use el índice en vez de scan secuencial
CREATE INDEX idx_order_id_text_trgm ON "Order" USING GIN ((id::text) gin_trgm_ops);
