import { RouteHandler } from "fastify";
import type { TrackingOrderIdInput } from "../../schemas";
import { getTrackingService } from "../../services/shop";
import { handleShipmentError } from "../../errors";

interface Handler extends RouteHandler<{
    Params: TrackingOrderIdInput;
}> {}

export const getTrackingHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { orderId } = request.params;
        const { msg, data } = await getTrackingService(userId, orderId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleShipmentError(error, reply, request, "obtener tracking del envio");
    }
};
