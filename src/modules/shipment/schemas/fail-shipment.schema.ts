import * as v from "valibot";

export const FailShipmentSchema = v.strictObject({
    note: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
});

export type FailShipmentBody = v.InferInput<typeof FailShipmentSchema>;
