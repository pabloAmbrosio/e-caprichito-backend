import * as v from 'valibot';
import { MAX_PAGINATION_LIMIT, PAGINATION_DEFAULTS } from '../constants';
import { coerceInteger } from '../../shared/schemas/coerce';

export const ShopOrderPaginationSchema = v.strictObject({
    page: v.optional(
        v.pipe(coerceInteger, v.integer(), v.minValue(1)),
        PAGINATION_DEFAULTS.page
    ),
    limit: v.optional(
        v.pipe(coerceInteger, v.integer(), v.minValue(1), v.maxValue(MAX_PAGINATION_LIMIT)),
        PAGINATION_DEFAULTS.limit
    ),
});

export type ShopOrderPaginationInput = v.InferOutput<typeof ShopOrderPaginationSchema>;
