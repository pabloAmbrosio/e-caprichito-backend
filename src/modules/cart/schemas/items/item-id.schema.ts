import * as v from 'valibot';

export const CartItemSchema = v.strictObject({
    productId : v.pipe(v.string(), v.uuid() )
})

export type CartItemInput = v.InferInput<typeof CartItemSchema>
