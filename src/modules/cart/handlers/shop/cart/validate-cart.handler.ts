import { RouteHandler } from "fastify";
import { validateCartService } from "../../../services";
import { handleCartError } from "../../../errors/handle-cart.errors";

interface Handler extends RouteHandler {}

export const validateCartHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;

        const { message, data } = await validateCartService(userId);

        return reply.send({ success: true, msg: message, data });
    } catch (error) {
        return handleCartError(error, reply, request, "validar carrito");
    }
};
