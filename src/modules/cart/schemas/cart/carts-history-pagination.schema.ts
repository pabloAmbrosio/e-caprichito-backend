import * as v from 'valibot';
import { coerceInteger } from '../../../shared/schemas/coerce';

export const CartsHistoryPaginationSchema = v.strictObject({
    page:  v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1)), 1),
    limit: v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1), v.maxValue(100)), 20),
});

export type CartsHistoryPaginationInput = v.InferOutput<typeof CartsHistoryPaginationSchema>;
