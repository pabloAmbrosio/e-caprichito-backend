import { RouteHandler } from "fastify";
import { deleteCartService } from "../../services";
import { handleCartError } from "../../errors/handle-cart.errors";

interface Handler extends RouteHandler<{
    Params: { cartId: string }
}> {}

export const deleteCartByIdHandler: Handler = async (request, reply) => {
    try {
        const { cartId } = request.params;

        const { message, data } = await deleteCartService(cartId);

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "eliminar carrito");
    }
};
