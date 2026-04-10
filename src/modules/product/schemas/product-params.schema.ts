import * as v from 'valibot';

export const ProductIdOrSlugSchema = v.object({
  idOrSlug: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
});
export type ProductIdOrSlugInput = v.InferOutput<typeof ProductIdOrSlugSchema>;

export const ProductIdSchema = v.object({
  id: v.pipe(v.string(), v.uuid('Debe ser un UUID válido')),
});
export type ProductIdInput = v.InferOutput<typeof ProductIdSchema>;

export const VariantParamsSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  variantId: v.pipe(v.string(), v.uuid()),
});
export type VariantParamsInput = v.InferOutput<typeof VariantParamsSchema>;

export const CategoryIdSchema = v.object({
  id: v.pipe(v.string(), v.uuid('Debe ser un UUID válido')),
});
export type CategoryIdInput = v.InferOutput<typeof CategoryIdSchema>;
