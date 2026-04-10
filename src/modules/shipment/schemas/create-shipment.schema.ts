import type { DeliveryType } from "../../../lib/prisma";

// Interfaz interna, no es schema HTTP
export interface CreateShipmentInput {
    orderId: string;
    addressId?: string;
    type: DeliveryType;
    deliveryFee: number;
}
