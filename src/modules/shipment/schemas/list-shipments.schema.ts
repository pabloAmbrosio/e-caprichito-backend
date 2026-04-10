import * as v from "valibot";
import { coerceInteger } from "../../shared/schemas/coerce";

export const ListShipmentsSchema = v.object({
    page: v.optional(coerceInteger, 1),
    limit: v.optional(coerceInteger, 20),
    status: v.optional(v.picklist([
        "PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT",
        "OUT_FOR_DELIVERY", "DELIVERED", "FAILED",
    ])),
    type: v.optional(v.picklist(["PICKUP", "HOME_DELIVERY", "SHIPPING"])),
    dateFrom: v.optional(v.string()),
    dateTo: v.optional(v.string()),
});

export type ListShipmentsQuery = v.InferOutput<typeof ListShipmentsSchema>;
