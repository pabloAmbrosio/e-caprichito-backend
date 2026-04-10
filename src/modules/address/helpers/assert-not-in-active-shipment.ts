import type { DbClientOrTx } from "../../../lib/prisma";
import { hasActiveShipment } from "../adapters/shipment.adapter";
import { AddressInUseError } from "../errors";
export async function assertNotInActiveShipment(db: DbClientOrTx, addressId: string) {
    const inUse = await hasActiveShipment(db, addressId);
    if (inUse) {
        throw new AddressInUseError();
    }
}
