import * as v from 'valibot';
import { MAX_QUANTITY_PER_ITEM } from '../../cart.config';

export const CreateCartItemSchema = v.strictObject({
    productId : v.pipe(v.string(), v.uuid()),
    quantity : v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_QUANTITY_PER_ITEM))
})

export type CreateCartItemInput = v.InferInput<typeof CreateCartItemSchema>
