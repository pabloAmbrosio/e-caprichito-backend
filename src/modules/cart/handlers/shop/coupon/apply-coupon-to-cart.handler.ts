import { RouteHandler } from "fastify";
import type { ApplyCouponToCartInput } from "../../../schemas";
import { handleCartError } from "../../../errors/handle-cart.errors";
import { applyCouponService } from "../../../services/shop/coupon/apply-coupon.service";

interface Handler extends RouteHandler<{ Body: ApplyCouponToCartInput }> {}

export const applyCouponToCartHandler: Handler = async (request, reply) => {
    try {
        const { userId, customerRole } = request.user;
        const { couponCode } = request.body;

        const { message, data } = await applyCouponService(
            userId,
            customerRole ?? null,
            couponCode,
        );

        return reply.send({
            success: true,
            msg: message,
            data,
        });
    } catch (error) {
        return handleCartError(error, reply, request, "aplicar cupon al carrito");
    }
};
