import * as v from 'valibot';
import { MAX_PAGINATION_LIMIT, PAGINATION_DEFAULTS } from '../constants';
import { coerceInteger } from '../../shared/schemas/coerce';

export const OrderSearchSchema = v.strictObject({
    page: v.optional(
        v.pipe(coerceInteger, v.integer(), v.minValue(1)),
        PAGINATION_DEFAULTS.page
    ),
    limit: v.optional(
        v.pipe(coerceInteger, v.integer(), v.minValue(1), v.maxValue(MAX_PAGINATION_LIMIT)),
        PAGINATION_DEFAULTS.limit
    ),
    // Busca en: username, email, phone, order ID, SKU, categoría
    search: v.optional(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(255))),
    status: v.optional(
        v.picklist(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"])
    ),
    paymentStatus: v.optional(
        v.picklist(["PENDING", "AWAITING_REVIEW", "APPROVED", "REJECTED", "REFUNDED", "EXPIRED"])
    ),
    shipmentStatus: v.optional(
        v.picklist(["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"])
    ),
    // ISO 8601
    dateFrom: v.optional(v.pipe(v.string(), v.isoTimestamp())),
    dateTo: v.optional(v.pipe(v.string(), v.isoTimestamp())),
    sortBy: v.optional(
        v.picklist(["createdAt", "status", "discountTotalInCents"]),
        "createdAt"
    ),
    sortOrder: v.optional(v.picklist(["asc", "desc"]), "desc"),
});

export type OrderSearchInput = v.InferOutput<typeof OrderSearchSchema>;
