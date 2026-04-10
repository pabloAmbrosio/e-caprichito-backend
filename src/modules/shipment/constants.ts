import { DeliveryType, ShipmentStatus } from "../../lib/prisma";

export const SHIPMENT_URL = "/shipments";
export const BACKOFFICE_SHIPMENT_URL = "/shipments";

// Cadena ordenada: advance() avanza al siguiente elemento
export const DELIVERY_TYPE_STEPS: Record<DeliveryType, ShipmentStatus[]> = {
    PICKUP: ["PENDING", "PREPARING", "READY_FOR_PICKUP", "DELIVERED"],
    HOME_DELIVERY: ["PENDING", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"],
    SHIPPING: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"],
};

export const TERMINAL_STATUSES: ShipmentStatus[] = ["DELIVERED", "FAILED"];
