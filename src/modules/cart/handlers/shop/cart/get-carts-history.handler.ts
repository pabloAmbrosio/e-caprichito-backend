import { RouteHandler } from "fastify";
import { handleCartError } from "../../../errors/handle-cart.errors";
import { getCartsHistoryService } from "../../../services/shop/cart/get-carts-history.service";
import { CartsHistoryPaginationInput } from "../../../schemas/cart/carts-history-pagination.schema";

interface Handler extends RouteHandler<{
    Querystring: CartsHistoryPaginationInput
}> {}

export const getCartsHistoryHandler: Handler = async (request, reply) => {
    try {
        const { userId, customerRole } = request.user;
        const { page, limit } = request.query;

        const { message, data } = await getCartsHistoryService(
            userId,
            customerRole ?? null,
            { page, limit },
        );

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "obtener historial de carritos");
    }
}
