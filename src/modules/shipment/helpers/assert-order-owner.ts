import { ShipmentNotFoundError } from "../errors";

// Lanza NotFound (no 403) para no filtrar existencia de órdenes ajenas
export function assertOrderOwner(userId: string, customerId: string) {
    if (userId !== customerId) {
        throw new ShipmentNotFoundError();
    }
}
