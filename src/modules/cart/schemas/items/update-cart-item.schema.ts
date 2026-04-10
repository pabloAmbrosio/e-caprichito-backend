import * as v from 'valibot';
import { MAX_QUANTITY_PER_ITEM } from '../../cart.config';

export const UpdateCartItemSchema = v.strictObject({
    // 0 = remove item
    quantity: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(MAX_QUANTITY_PER_ITEM))
});

export type UpdateCartItemInput = v.InferInput<typeof UpdateCartItemSchema>;
