import * as v from "valibot";

export const UpdateShipmentSchema = v.strictObject({
    carrier: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(100))),
    trackingCode: v.optional(v.pipe(v.string(), v.minLength(1), v.maxLength(200))),
    estimatedAt: v.optional(v.pipe(v.string(), v.isoTimestamp())),
});

export type UpdateShipmentBody = v.InferInput<typeof UpdateShipmentSchema>;
