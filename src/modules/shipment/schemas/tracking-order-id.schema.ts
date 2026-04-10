import * as v from "valibot";

export const TrackingOrderIdSchema = v.strictObject({
    orderId: v.pipe(v.string(), v.uuid()),
});

export type TrackingOrderIdInput = v.InferInput<typeof TrackingOrderIdSchema>;
