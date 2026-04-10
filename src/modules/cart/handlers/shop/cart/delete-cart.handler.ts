import { RouteHandler } from "fastify";
import { emptyCartService } from "../../../services";
import { handleCartError } from "../../../errors/handle-cart.errors";

interface Handler extends RouteHandler {}


export const deleteCartHandler : Handler = async (request, reply) => {
    try {
        const { userId } = request.user;

        const { message } = await emptyCartService(userId);

        return reply.send({ success: true, msg: message });
    } catch (error) {
        return handleCartError(error, reply, request, "eliminar carrito");
    }
}
