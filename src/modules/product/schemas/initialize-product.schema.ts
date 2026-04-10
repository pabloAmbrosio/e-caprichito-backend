import * as v from 'valibot';
import { JsonValueSchema } from './json-value.schema';
import { ProductImageInputSchema } from './product-image.schema';

export const InitializeProductSchema = v.strictObject({
  title: v.pipe(
    v.string('El titulo debe ser texto'),
    v.minLength(1, 'El titulo es obligatorio'),
    v.maxLength(255, 'El titulo no puede superar los 255 caracteres')
  ),
  slug: v.optional(
    v.pipe(
      v.string('El slug debe ser texto'),
      v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minusculas, numeros y guiones')
    )
  ),
  description: v.pipe(
    v.string('La descripcion debe ser texto'),
    v.minLength(1, 'La descripcion es obligatoria')
  ),
  categoryId: v.pipe(
    v.string('El categoryId debe ser texto'),
    v.uuid('El categoryId debe ser un UUID valido')
  ),
  tags: v.array(
    v.pipe(
      v.string('Cada tag debe ser texto'),
      v.minLength(1, 'El tag no puede estar vacio')
    ),
    'Los tags deben ser un arreglo'
  ),
  isFeatured: v.optional(v.boolean('isFeatured debe ser un booleano')),
  seoMetadata: v.optional(JsonValueSchema),

  variants: v.pipe(
    v.array(
      v.strictObject({
        title: v.pipe(
          v.string('El titulo de la variante debe ser texto'),
          v.minLength(1, 'El titulo de la variante es obligatorio'),
          v.maxLength(255, 'El titulo de la variante no puede superar los 255 caracteres')
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
          v.array(ProductImageInputSchema, 'Las imagenes de la variante deben ser un arreglo')
        ),
        stock: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
      }),
      'Las variantes deben ser un arreglo'
    ),
    v.minLength(1, 'Se requiere al menos una variante')
  ),
});

export type InitializeProductInput = v.InferInput<typeof InitializeProductSchema>;
