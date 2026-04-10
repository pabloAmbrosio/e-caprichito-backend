import * as v from 'valibot';

export const RestoreCartSchema = v.object({
    cartId : v.pipe(v.string(), v.uuid())
})

export type RestoreCartInput = v.InferInput<typeof RestoreCartSchema>
