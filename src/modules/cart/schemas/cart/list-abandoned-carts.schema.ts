import * as v from 'valibot';
import { coerceInteger } from '../../../shared/schemas/coerce';

export const ListAbandonedCartsSchema = v.strictObject({
    page:           v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1)), 1),
    limit:          v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1), v.maxValue(100)), 20),
    inactiveDays:   v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1)), 7),
    minItems:       v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1)), 1),
});

export type ListAbandonedCartsInput = v.InferOutput<typeof ListAbandonedCartsSchema>;
