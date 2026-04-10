import * as v from 'valibot';

export const GetProductDetailSchema = v.object({
  idOrSlug: v.pipe(
    v.string('El identificador debe ser texto'),
    v.minLength(1, 'El identificador no puede estar vacío'),
    v.maxLength(255, 'El identificador no puede exceder 255 caracteres'),
  ),
});

export type GetProductDetailInput = v.InferOutput<typeof GetProductDetailSchema>;
