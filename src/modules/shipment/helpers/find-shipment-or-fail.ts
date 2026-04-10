import type { DbClientOrTx } from "../../../lib/prisma";
import { shipmentDetailSelect } from "../shipment.selects";
import { ShipmentNotFoundError } from "../errors";

export async function findShipmentOrFail(db: DbClientOrTx, shipmentId: string) {
    const shipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        select: shipmentDetailSelect,
    });

    if (!shipment) throw new ShipmentNotFoundError();

    return shipment;
}
