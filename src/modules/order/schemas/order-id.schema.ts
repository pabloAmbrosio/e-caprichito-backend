import * as v from 'valibot';

export const OrderIdSchema = v.strictObject({
    orderId: v.pipe(v.string(), v.uuid()),
})

export type OrderIdInput = v.InferInput<typeof OrderIdSchema>
