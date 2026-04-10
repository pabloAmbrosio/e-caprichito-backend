import { RouteHandler } from "fastify";
import type { ShipmentIdInput, AdvanceShipmentBody } from "../../schemas";
import { advanceShipmentService } from "../../services/backoffice";
import { emitShipmentUpdate } from "../../notifications";
import { handleShipmentError } from "../../errors";

interface Handler extends RouteHandler<{
    Params: ShipmentIdInput;
    Body: AdvanceShipmentBody;
}> {}

export const advanceShipmentHandler: Handler = async (request, reply) => {
    try {
        const { shipmentId } = request.params;
        const { userId } = request.user;
        const { msg, data, notification } = await advanceShipmentService(shipmentId, userId, request.body);

        emitShipmentUpdate(request.server.io, notification.userId, {
            orderId: notification.orderId,
            shipmentId: notification.shipmentId,
            status: notification.status,
            note: notification.note,
        });

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleShipmentError(error, reply, request, "avanzar estado del envio");
    }
};
