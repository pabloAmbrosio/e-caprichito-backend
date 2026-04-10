import * as v from 'valibot';

export const OrderSummarySchema = v.strictObject({
  // ISO 8601
  dateFrom: v.optional(v.pipe(v.string(), v.isoTimestamp())),
  dateTo: v.optional(v.pipe(v.string(), v.isoTimestamp())),
});

export type OrderSummaryInput = v.InferOutput<typeof OrderSummarySchema>;
