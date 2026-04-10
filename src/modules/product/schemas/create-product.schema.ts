import * as v from 'valibot';
import { JsonValueSchema } from './json-value.schema';
import { ProductImageInputSchema } from './product-image.schema';

export const CreateProductSchema = v.strictObject({
  abstractProductId: v.pipe(
    v.string('El abstractProductId debe ser texto'),
    v.uuid('El abstractProductId debe ser un UUID valido')
  ),
  title: v.pipe(
    v.string('El titulo debe ser texto'),
    v.minLength(1, 'El titulo es obligatorio'),
    v.maxLength(255, 'El titulo no puede superar los 255 caracteres')
  ),
  sku: v.pipe(
    v.string('El SKU debe ser texto'),
    v.minLength(1, 'El SKU es obligatorio'),
    v.maxLength(100, 'El SKU no puede superar los 100 caracteres')
  ),
  priceInCents: v.pipe(
    v.number('El precio debe ser un numero'),
    v.integer('El precio debe ser un entero'),
    v.minValue(0, 'El precio no puede ser negativo')
  ),
  compareAtPriceInCents: v.optional(
    v.pipe(
      v.number('El precio de comparacion debe ser un numero'),
      v.integer('El precio de comparacion debe ser un entero'),
      v.minValue(0, 'El precio de comparacion no puede ser negativo')
    )
  ),
  details: JsonValueSchema,
  images: v.optional(
    v.array(ProductImageInputSchema, 'Las imagenes deben ser un arreglo')
  ),
  stock: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
});

export type CreateProductInput = v.InferInput<typeof CreateProductSchema>;
