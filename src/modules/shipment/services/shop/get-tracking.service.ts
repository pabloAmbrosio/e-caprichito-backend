import { db } from "../../../../lib/prisma";
import { shipmentSelect, shipmentEventSelect } from "../../shipment.selects";
import { assertOrderOwner } from "../../helpers";
import { ShipmentNotFoundError } from "../../errors";

export async function getTrackingService(userId: string, orderId: string) {
    const shipment = await db.shipment.findUnique({
        where: { orderId },
        select: {
            ...shipmentSelect,
            address: {
                select: {
                    id: true,
                    label: true,
                    formattedAddress: true,
                    lat: true,
                    lng: true,
                },
            },
            events: {
                select: shipmentEventSelect,
                orderBy: { createdAt: "asc" as const },
            },
            order: {
                select: {
                    customerId: true,
                },
            },
        },
    });

    if (!shipment) throw new ShipmentNotFoundError();

    assertOrderOwner(userId, shipment.order.customerId);

    const { order: _order, ...data } = shipment;

    return { msg: "Tracking del envio", data };
}
