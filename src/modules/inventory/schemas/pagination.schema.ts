import * as v from 'valibot';
import { coerceInteger, coerceBoolean } from '../../shared/schemas/coerce';

export const ListInventoryQuerySchema = v.pipe(
    v.strictObject({
        page: v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1)), 1),
        limit: v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(1), v.maxValue(100)), 20),
        search: v.optional(v.string()),
        minStock: v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(0))),
        maxStock: v.optional(v.pipe(coerceInteger, v.integer(), v.minValue(0))),
        outOfStock: v.optional(v.pipe(coerceBoolean, v.boolean()))
    }),
    v.check(
        (data) => {
            if (data.minStock !== undefined && data.maxStock !== undefined) {
                return data.maxStock >= data.minStock;
            }
            return true;
        },
        "maxStock debe ser mayor o igual a minStock"
    )
);

export type ListInventoryQueryInput = v.InferOutput<typeof ListInventoryQuerySchema>;
