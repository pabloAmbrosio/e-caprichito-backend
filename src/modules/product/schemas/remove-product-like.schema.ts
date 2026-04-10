import * as v from 'valibot';

export const RemoveProductLikeSchema = v.object({
  abstractProductId: v.pipe(
    v.string('El id del producto debe ser texto'),
    v.uuid('El id del producto debe ser un UUID válido'),
  ),
});

export type RemoveProductLikeInput = v.InferOutput<typeof RemoveProductLikeSchema>;
