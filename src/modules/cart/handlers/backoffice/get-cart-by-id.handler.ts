import { RouteHandler } from "fastify";
import { getCartByIdService } from "../../services";
import { handleCartError } from "../../errors/handle-cart.errors";

const ALLOWED_ROLES = ["OWNER", "ADMIN", "MANAGER", "SELLER"] as const;

interface Handler extends RouteHandler<{
    Params: { cartId: string }
}> {}

export const getCartByIdHandler: Handler = async (request, reply) => {
    try {

        const { cartId } = request.params;
        
        const cart = await getCartByIdService(cartId);

        return reply.send({
            success: true,
            msg: "Carrito encontrado",
            data: cart,
        });
    } catch (error) {
        return handleCartError(error, reply, request, "obtener carrito");
    }
};
