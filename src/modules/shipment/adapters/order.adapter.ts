import type { DbClientOrTx } from "../../../lib/prisma";
import type { CreateShipmentInput } from "../schemas";

export async function createShipmentForOrder(tx: DbClientOrTx, input: CreateShipmentInput) {
    const shipment = await tx.shipment.create({
        data: {
            orderId: input.orderId,
            addressId: input.addressId ?? null,
            type: input.type,
            deliveryFee: input.deliveryFee,
            status: "PENDING",
        },
    });

    await tx.shipmentEvent.create({
        data: {
            shipmentId: shipment.id,
            status: "PENDING",
            note: "Pedido recibido",
        },
    });

    return shipment;
}
