import * as v from 'valibot';

export const CancelOrderBackofficeSchema = v.strictObject({
  reason: v.optional(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(500))),
});

export type CancelOrderBackofficeInput = v.InferInput<typeof CancelOrderBackofficeSchema>;
