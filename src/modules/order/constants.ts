import { OrderStatus } from "../../lib/prisma";

export const ORDER_URL = "/order";

export const MAX_PAGINATION_LIMIT = 100;

export const ORDER_EXPIRATION_MINUTES = 120;

export const PAGINATION_DEFAULTS = {
    page: 1,
    limit: 20,
} as const;

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPED", "CANCELLED"],
    SHIPPED: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
} satisfies Record<OrderStatus, OrderStatus[]>;
