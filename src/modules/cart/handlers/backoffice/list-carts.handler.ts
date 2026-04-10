import { RouteHandler } from "fastify";
import { listCartsService } from "../../services";
import { ListCartsInput } from "../../schemas";
import { handleCartError } from "../../errors/handle-cart.errors";

interface Handler extends RouteHandler<{
    Querystring: ListCartsInput
}> {}

export const listCartsHandler: Handler = async (request, reply) => {
    try {
        const result = await listCartsService(request.query);

        return reply.send({
            success: true,
            msg: "Carritos listados",
            data: result,
        });
    } catch (error) {
        return handleCartError(error, reply, request, "listar carritos");
    }
};
