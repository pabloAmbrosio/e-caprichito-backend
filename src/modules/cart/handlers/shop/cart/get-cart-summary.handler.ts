import { RouteHandler } from "fastify";
import { getCartSummaryService } from "../../../services";
import { handleCartError } from "../../../errors/handle-cart.errors";

interface Handler extends RouteHandler {}

export const getCartSummaryHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;

        const { message, data } = await getCartSummaryService(userId);

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "obtener resumen del carrito");
    }
};
