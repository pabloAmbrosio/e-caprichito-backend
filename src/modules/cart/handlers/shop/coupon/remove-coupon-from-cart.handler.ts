import { RouteHandler } from "fastify";
import { handleCartError } from "../../../errors/handle-cart.errors";
import { removeCouponService } from "../../../services/shop/coupon/remove-coupon.service";

interface Handler extends RouteHandler {}

export const removeCouponFromCartHandler: Handler = async (request, reply) => {
    try {
        const { userId, customerRole } = request.user;

        const { message, data } = await removeCouponService(
            userId,
            customerRole ?? null,
        );

        return reply.send({
            success: true,
            msg: message,
            data,
        });
    } catch (error) {
        return handleCartError(error, reply, request, "remover cupon del carrito");
    }
};
