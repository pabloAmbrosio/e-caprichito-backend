import type { TxClient } from '../../order/services/types';
import { OrderExpirationHandler, ExpiredOrderData } from '../registry/expiration-handler.interface';

export class FailShipmentHandler implements OrderExpirationHandler {
    name = 'FailShipmentHandler';

    async execute(order: ExpiredOrderData, tx?: TxClient): Promise<void> {
        if (!tx) {
            throw new Error(`[FailShipmentHandler] Se requiere cliente transaccional para orden ${order.id}`);
        }

        const shipment = await (tx as any).shipment.findUnique({
            where: { orderId: order.id },
            select: { id: true, status: true },
        });

        if (!shipment) return;
        if (shipment.status === "FAILED" || shipment.status === "DELIVERED") return;

        await (tx as any).shipment.update({
            where: { id: shipment.id },
            data: { status: "FAILED" },
        });

        await (tx as any).shipmentEvent.create({
            data: {
                shipmentId: shipment.id,
                status: "FAILED",
                note: "Orden expirada",
            },
        });
    }
}
