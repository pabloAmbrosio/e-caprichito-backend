import { RouteHandler } from "fastify";
import { getActiveCartService } from "../../../services";
import { buildCartWithPromotions } from "../../../services/shared";
import { handleCartError } from "../../../errors/handle-cart.errors";

interface Handler extends RouteHandler {}

export const getMyCartHandler: Handler = async (request, reply) => {
    try {
        const { userId, customerRole } = request.user;

        const { message, data: cart } = await getActiveCartService(userId);

        const data = cart
            ? await buildCartWithPromotions(cart, userId, customerRole)
            : null;

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "obtener carrito");
    }
};
