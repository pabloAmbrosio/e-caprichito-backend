import { RouteHandler } from "fastify"
import { RestoreCartInput } from "../../../schemas"
import { restoreCart } from "../../../services"
import { handleCartError } from "../../../errors/handle-cart.errors";

interface Handler extends RouteHandler<{
    Body : RestoreCartInput
}> {}


export const restoreCartHandler : Handler = async (request, reply) => {
    try {
        const { userId, customerRole } = request.user;
        const { cartId } = request.body;

        const { message, data } = await restoreCart(userId, customerRole ?? null, cartId);

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "restaurar carrito");
    }
}
