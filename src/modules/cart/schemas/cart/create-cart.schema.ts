import * as v from 'valibot';
import { CartItemSchema } from '../items/item-id.schema';

export const AddCartSchema = v.array(CartItemSchema)

export type CreateCartInput = v.InferInput<typeof AddCartSchema>
