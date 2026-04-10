import { db } from "../../../../lib/prisma";
import { ShipmentStatus, DeliveryType, OrderStatus } from "../../../../lib/prisma";
import { shipmentDetailSelect } from "../../shipment.selects";
import type { AdvanceShipmentBody } from "../../schemas";
import { getNextStatus } from "../../helpers";
import { ShipmentNotFoundError } from "../../errors";
import { logStatusChange } from "../../../order/services/helpers/log-status-change";

// El primer status de movimiento físico por tipo dispara Order → SHIPPED
const FIRST_MOVEMENT_STATUSES: Record<DeliveryType, ShipmentStatus> = {
    PICKUP: "READY_FOR_PICKUP",
    HOME_DELIVERY: "OUT_FOR_DELIVERY",
    SHIPPING: "SHIPPED",
};

export async function advanceShipmentService(shipmentId: string, staffId: string, input: AdvanceShipmentBody) {
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

        const nextStatus = getNextStatus(shipment.type, shipment.status);

        const updateData: Record<string, unknown> = { status: nextStatus };
        if (nextStatus === "DELIVERED") updateData.deliveredAt = new Date();

        const updated = await tx.shipment.update({
            where: { id: shipmentId },
            data: updateData,
            select: shipmentDetailSelect,
        });

        await tx.shipmentEvent.create({
            data: {
                shipmentId,
                staffId,
                status: nextStatus,
                note: input.note ?? null,
            },
        });

        // ── Order → SHIPPED ──
        const firstMovement = FIRST_MOVEMENT_STATUSES[shipment.type];
        if (nextStatus === firstMovement && shipment.order.status === "CONFIRMED") {
            await tx.order.update({
                where: { id: shipment.orderId },
                data: { status: "SHIPPED" as OrderStatus },
            });
            await logStatusChange(tx, shipment.orderId, staffId, "CONFIRMED", "SHIPPED", true);
        }

        // ── Order → DELIVERED ──
        if (nextStatus === "DELIVERED" && shipment.order.status !== "DELIVERED") {
            const previousOrderStatus = shipment.order.status === "CONFIRMED"
                ? "CONFIRMED" as OrderStatus
                : "SHIPPED" as OrderStatus;

            await tx.order.update({
                where: { id: shipment.orderId },
                data: { status: "DELIVERED" as OrderStatus },
            });
            await logStatusChange(tx, shipment.orderId, staffId, previousOrderStatus, "DELIVERED", true);
        }

        // ── COD → APPROVED al DELIVERED ──
        let codConfirmed = false;
        if (nextStatus === "DELIVERED") {
            const codPayment = shipment.order.payments[0];
            if (codPayment) {
                await tx.payment.update({
                    where: { id: codPayment.id },
                    data: {
                        status: 'APPROVED',
                        reviewedBy: staffId,
                        reviewedAt: new Date(),
                        reviewNote: 'Cobrado al entregar',
                    },
                });

                for (const item of shipment.order.items) {
                    await tx.inventory.update({
                        where: { productId: item.productId },
                        data: {
                            physicalStock: { decrement: item.quantity },
                            reservedStock: { decrement: item.quantity },
                        },
                    });
                }

                codConfirmed = true;
            }
        }

        return {
            data: updated,
            notification: {
                orderId: shipment.orderId,
                shipmentId: shipment.id,
                status: nextStatus,
                note: input.note,
                userId: shipment.order.customerId,
                codConfirmed,
            },
        };
    });

    return { msg: "Envio avanzado al siguiente estado", data: result.data, notification: result.notification };
}
