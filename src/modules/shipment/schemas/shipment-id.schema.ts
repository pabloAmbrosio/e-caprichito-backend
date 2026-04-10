import * as v from "valibot";

export const ShipmentIdSchema = v.strictObject({
    shipmentId: v.pipe(v.string(), v.uuid()),
});

export type ShipmentIdInput = v.InferInput<typeof ShipmentIdSchema>;
