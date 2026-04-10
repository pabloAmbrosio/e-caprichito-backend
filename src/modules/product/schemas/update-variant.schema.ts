import * as v from 'valibot';
import { JsonValueSchema } from './json-value.schema';
import { ProductImageInputSchema } from './product-image.schema';

export const UpdateVariantSchema = v.object({
  title: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(255))),
  sku: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
  priceInCents: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  compareAtPriceInCents: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
  details: v.optional(JsonValueSchema),
  images: v.optional(v.array(ProductImageInputSchema)),
});

export type UpdateVariantInput = v.InferOutput<typeof UpdateVariantSchema>;
