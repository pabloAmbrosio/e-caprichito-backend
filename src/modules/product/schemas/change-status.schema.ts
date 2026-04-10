import * as v from 'valibot';

const ProductStatusSchema = v.picklist(
  ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  'El status debe ser DRAFT, PUBLISHED o ARCHIVED',
);

export const ChangeProductStatusSchema = v.object({
  status: ProductStatusSchema,
});

export const ChangeVariantStatusSchema = v.object({
  variantId: v.pipe(v.string('El id de variante debe ser texto'), v.uuid('Debe ser UUID')),
  status: ProductStatusSchema,
});

export type ChangeProductStatusInput = v.InferOutput<typeof ChangeProductStatusSchema>;
export type ChangeVariantStatusInput = v.InferOutput<typeof ChangeVariantStatusSchema>;
