import * as v from 'valibot';
import { JsonValueSchema } from './json-value.schema';

export const CreateAbstractProductSchema = v.strictObject({
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
  isFeatured: v.optional(
    v.boolean('isFeatured debe ser un booleano')
  ),
  seoMetadata: v.optional(JsonValueSchema)
});

export type CreateAbstractProductInput = v.InferInput<typeof CreateAbstractProductSchema>;
