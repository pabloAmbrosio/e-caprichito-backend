import * as v from "valibot";

export const CalculateFeeSchema = v.strictObject({
    addressId: v.pipe(v.string(), v.uuid()),
});

export type CalculateFeeBody = v.InferInput<typeof CalculateFeeSchema>;
