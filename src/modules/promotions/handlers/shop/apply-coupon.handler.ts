import { RouteHandler } from 'fastify';
import { applyCouponService } from '../../services';
import { handlePromotionError } from '../../errors';
import type { ApplyCouponInput } from '../../schemas';

interface Handler extends RouteHandler<{ Body: ApplyCouponInput }> {}

export const applyCouponHandler: Handler = async (request, reply) => {
    try {
        const { userId, customerRole } = request.user;
        const { msg, data } = await applyCouponService(request.body.couponCode, userId, customerRole ?? null);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handlePromotionError(error, reply, request, "aplicar cupon");
    }
};
