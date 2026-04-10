import * as v from 'valibot';
import { coerceInteger, coerceStringArray } from '../../../shared/schemas/coerce';

export const ListCartsSchema = v.strictObject({
    page:        v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1)), 1),
    limit:       v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1), v.maxValue(100)), 20),
    search:      v.optional(v.string()),
    userIds:     v.optional(v.pipe(coerceStringArray, v.array(v.pipe(v.string(), v.uuid())))),
    productIds:  v.optional(v.pipe(coerceStringArray, v.array(v.pipe(v.string(), v.uuid())))),
    categoryIds: v.optional(v.pipe(coerceStringArray, v.array(v.pipe(v.string(), v.uuid())))),
    tags:        v.optional(v.pipe(coerceStringArray, v.array(v.pipe(v.string(), v.minLength(1))))),
});

export type ListCartsInput = v.InferOutput<typeof ListCartsSchema>;
