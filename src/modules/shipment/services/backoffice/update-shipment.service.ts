import { db } from "../../../../lib/prisma";
import { shipmentDetailSelect } from "../../shipment.selects";
import type { UpdateShipmentBody } from "../../schemas";
import { ShipmentNotFoundError } from "../../errors";

export async function updateShipmentService(shipmentId: string, input: UpdateShipmentBody) {
    const shipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        select: { id: true },
    });

    if (!shipment) throw new ShipmentNotFoundError();

    const updateData: Record<string, unknown> = {};
    if (input.carrier) updateData.carrier = input.carrier;
    if (input.trackingCode) updateData.trackingCode = input.trackingCode;
    if (input.estimatedAt) updateData.estimatedAt = new Date(input.estimatedAt);

    const updated = await db.shipment.update({
        where: { id: shipmentId },
        data: updateData,
        select: shipmentDetailSelect,
    });

    return { msg: "Datos del envio actualizados", data: updated };
}
