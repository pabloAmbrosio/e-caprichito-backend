import { RouteHandler } from "fastify";
import { listAbandonedCartsService } from "../../services";
import { ListAbandonedCartsInput } from "../../schemas";
import { handleCartError } from "../../errors/handle-cart.errors";

interface Handler extends RouteHandler<{
    Querystring: ListAbandonedCartsInput
}> {}

export const listAbandonedCartsHandler: Handler = async (request, reply) => {
    try {
        const { message, data } = await listAbandonedCartsService(request.query);

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "listar carritos abandonados");
    }
};
