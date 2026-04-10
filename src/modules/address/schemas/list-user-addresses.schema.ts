import * as v from 'valibot';

export const ListUserAddressesSchema = v.strictObject({
    userId: v.pipe(v.string(), v.uuid()),
});

export type ListUserAddressesInput = v.InferInput<typeof ListUserAddressesSchema>;
