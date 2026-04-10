import * as v from 'valibot';

export const CreateCategorySchema = v.object({
  name: v.pipe(
    v.string('El nombre debe ser texto'),
    v.minLength(1, 'El nombre no puede estar vacío'),
    v.maxLength(100, 'El nombre no puede exceder 100 caracteres'),
  ),
  slug: v.optional(
    v.pipe(
      v.string('El slug debe ser texto'),
      v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug debe ser alfanumérico con guiones'),
    ),
  ),
  description: v.optional(
    v.pipe(v.string('La descripción debe ser texto'), v.maxLength(500, 'Máximo 500 caracteres')),
  ),
  image: v.optional(v.pipe(v.string('La imagen debe ser texto'), v.url('Debe ser una URL válida'))),
  emoticon: v.optional(
    v.pipe(v.string('El emoticon debe ser texto'), v.maxLength(20, 'Máximo 20 caracteres')),
  ),
  parentId: v.optional(
    v.pipe(v.string('El parentId debe ser texto'), v.uuid('Debe ser un UUID válido')),
  ),
  sortOrder: v.optional(
    v.pipe(v.number('El orden debe ser un número'), v.integer('Debe ser un entero'), v.minValue(0, 'Mínimo 0')),
  ),
});

export type CreateCategoryInput = v.InferOutput<typeof CreateCategorySchema>;
