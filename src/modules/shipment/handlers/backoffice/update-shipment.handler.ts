import { RouteHandler } from "fastify";
import type { ShipmentIdInput, UpdateShipmentBody } from "../../schemas";
import { updateShipmentService } from "../../services/backoffice";
import { handleShipmentError } from "../../errors";

interface Handler extends RouteHandler<{
    Params: ShipmentIdInput;
    Body: UpdateShipmentBody;
}> {}

export const updateShipmentHandler: Handler = async (request, reply) => {
    try {
        const { shipmentId } = request.params;
        const { msg, data } = await updateShipmentService(shipmentId, request.body);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleShipmentError(error, reply, request, "actualizar datos del envio");
    }
};
