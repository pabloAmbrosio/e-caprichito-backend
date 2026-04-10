import * as v from 'valibot';
import { JsonValueSchema } from './json-value.schema';
import { ProductImageInputSchema } from './product-image.schema';

const UpdateVariantSchema = v.object({
  id: v.pipe(v.string('El id de variante debe ser texto'), v.uuid('Debe ser un UUID válido')),
  title: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
  sku: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  priceInCents: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  compareAtPriceInCents: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  details: v.optional(JsonValueSchema),
  images: v.optional(v.array(ProductImageInputSchema)),
});

export const UpdateProductSchema = v.object({
  title: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
  slug: v.optional(
    v.pipe(v.string(), v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug alfanumérico con guiones')),
  ),
  description: v.optional(v.pipe(v.string(), v.minLength(1))),
  categoryId: v.optional(v.pipe(v.string(), v.uuid())),
  tags: v.optional(v.array(v.pipe(v.string(), v.minLength(1)))),
  isFeatured: v.optional(v.boolean()),
  seoMetadata: v.optional(JsonValueSchema),
  variants: v.optional(
    v.pipe(
      v.array(UpdateVariantSchema),
      v.maxLength(50, 'No se pueden actualizar más de 50 variantes a la vez'),
    ),
  ),
});

export type UpdateProductInput = v.InferOutput<typeof UpdateProductSchema>;
export type UpdateVariantInput = v.InferOutput<typeof UpdateVariantSchema>;
