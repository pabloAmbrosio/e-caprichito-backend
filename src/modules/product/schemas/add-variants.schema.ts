import * as v from 'valibot';
import { JsonValueSchema } from './json-value.schema';
import { ProductImageInputSchema } from './product-image.schema';

const VariantSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(255)),
  sku: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
  priceInCents: v.pipe(v.number(), v.integer(), v.minValue(0)),
  compareAtPriceInCents: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  details: JsonValueSchema,
  images: v.optional(v.array(ProductImageInputSchema)),
  stock: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
});

export const AddVariantsSchema = v.object({
  variants: v.pipe(
    v.array(VariantSchema, 'variants debe ser un arreglo'),
    v.minLength(1, 'Debe incluir al menos una variante'),
    v.maxLength(50, 'Máximo 50 variantes por operación'),
  ),
});

export type AddVariantsInput = v.InferOutput<typeof AddVariantsSchema>;
