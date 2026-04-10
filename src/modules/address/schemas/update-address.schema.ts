import * as v from 'valibot';
import { CreateAddressSchema } from './create-address.schema';

export const UpdateAddressSchema = v.partial(CreateAddressSchema);

export type UpdateAddressInput = v.InferInput<typeof UpdateAddressSchema>;
