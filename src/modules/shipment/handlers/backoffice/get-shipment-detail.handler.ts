import { RouteHandler } from "fastify";
import type { ShipmentIdInput } from "../../schemas";
import { getShipmentDetailService } from "../../services/backoffice";
import { handleShipmentError } from "../../errors";

interface Handler extends RouteHandler<{
    Params: ShipmentIdInput;
}> {}

export const getShipmentDetailHandler: Handler = async (request, reply) => {
    try {
        const { shipmentId } = request.params;
        const { msg, data } = await getShipmentDetailService(shipmentId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleShipmentError(error, reply, request, "obtener detalle del envio");
    }
};
