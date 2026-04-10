import * as v from 'valibot';

export const AddressIdSchema = v.strictObject({
    addressId: v.pipe(v.string(), v.uuid()),
});

export type AddressIdInput = v.InferInput<typeof AddressIdSchema>;
