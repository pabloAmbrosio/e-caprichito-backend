import * as v from "valibot";

export const AdvanceShipmentSchema = v.strictObject({
    note: v.optional(v.pipe(v.string(), v.maxLength(500))),
});

export type AdvanceShipmentBody = v.InferInput<typeof AdvanceShipmentSchema>;
