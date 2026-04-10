import { db } from "../../../../lib/prisma";
import { shipmentDetailSelect } from "../../shipment.selects";
import type { FailShipmentBody } from "../../schemas";
import { assertCanFail } from "../../helpers";
import { ShipmentNotFoundError } from "../../errors";
import { logStatusChange } from "../../../order/services/helpers/log-status-change";

export async function failShipmentService(shipmentId: string, staffId: string, input: FailShipmentBody) {
    const result = await db.$transaction(async (tx) => {
        const shipment = await tx.shipment.findUnique({
            where: { id: shipmentId },
            select: {
                id: true, status: true, type: true, orderId: true,
                order: {
                    select: {
                        status: true,
                        customerId: true,
                        items: {
                            select: {
                                quantity: true,
                                productId: true,
                            },
                        },
                        payments: {
                            where: { method: 'CASH_ON_DELIVERY', status: 'PENDING' },
                            select: { id: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!shipment) throw new ShipmentNotFoundError();

        assertCanFail(shipment.status);

        const updated = await tx.shipment.update({
            where: { id: shipmentId },
            data: { status: "FAILED" },
            select: shipmentDetailSelect,
        });

        await tx.shipmentEvent.create({
            data: {
                shipmentId,
                staffId,
                status: "FAILED",
                note: input.note,
            },
        });

        // ── COD: cancelar pago + liberar stock + cancelar orden ──
        const codPayment = shipment.order.payments[0];
        if (codPayment) {
            await tx.payment.update({
                where: { id: codPayment.id },
                data: {
                    status: 'CANCELLED',
                    reviewedBy: staffId,
                    reviewedAt: new Date(),
                    reviewNote: input.note ?? 'Envío fallido — pago contra entrega cancelado',
                },
            });

            for (const item of shipment.order.items) {
                await tx.inventory.update({
                    where: { productId: item.productId },
                    data: {
                        reservedStock: { decrement: item.quantity },
                    },
                });
            }

            const previousOrderStatus = shipment.order.status;
            await tx.order.update({
                where: { id: shipment.orderId },
                data: { status: 'CANCELLED' },
            });
            await logStatusChange(tx, shipment.orderId, staffId, previousOrderStatus, 'CANCELLED', true);
        }

        return {
            data: updated,
            notification: {
                orderId: shipment.orderId,
                shipmentId: shipment.id,
                status: "FAILED" as const,
                note: input.note,
                userId: shipment.order.customerId,
            },
        };
    });

    return { msg: "Envio marcado como fallido", data: result.data, notification: result.notification };
}
