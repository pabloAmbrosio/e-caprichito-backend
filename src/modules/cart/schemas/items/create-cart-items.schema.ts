import * as v from 'valibot';
import { MAX_ITEMS_PER_CART } from '../../cart.config';
import { CreateCartItemSchema } from './create-cart-item.schema';

export const CreateCartItemsSchema = v.strictObject({
    items: v.pipe(
        v.array(CreateCartItemSchema),
        v.minLength(1),
        v.maxLength(MAX_ITEMS_PER_CART),
    ),
});

export type CreateCartItemsInput = v.InferInput<typeof CreateCartItemsSchema>;
