import * as v from 'valibot';

// thumbnailUrl not accepted from client — derived by backend via deriveThumbnails
export const ProductImageInputSchema = v.strictObject({
  imageUrl: v.pipe(
    v.string('La URL de la imagen debe ser texto'),
    v.url('La URL de la imagen debe ser una URL valida')
  ),
  alt: v.optional(
    v.pipe(
      v.string('El alt de la imagen debe ser texto'),
      v.maxLength(255, 'El alt no puede superar los 255 caracteres')
    )
  ),
  order: v.optional(
    v.pipe(
      v.number('El orden debe ser un numero'),
      v.integer('El orden debe ser un entero'),
      v.minValue(0, 'El orden no puede ser negativo')
    )
  ),
});

export type ProductImageInput = v.InferInput<typeof ProductImageInputSchema>;
