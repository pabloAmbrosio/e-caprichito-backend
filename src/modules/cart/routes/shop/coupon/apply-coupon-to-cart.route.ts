import { FastifyInstance } from "fastify";
import { applyCouponToCartHandler } from "../../../handlers";
import { ApplyCouponToCartInput, ApplyCouponToCartSchema } from "../../../schemas";
import { CART_COUPON_URL } from "../../../constants";

const schema = { body: ApplyCouponToCartSchema };

// Rate limit to prevent coupon brute-force
const config = {
    rateLimit: {
        max: parseInt(process.env.COUPON_RATE_LIMIT_MAX || '10'),
        timeWindow: parseInt(process.env.COUPON_RATE_LIMIT_WINDOW || '60000'),
    },
};

export default (app: FastifyInstance) => {
    app.post<{ Body: ApplyCouponToCartInput }>(
        CART_COUPON_URL,
        { preHandler: [app.authenticate], schema, config },
        applyCouponToCartHandler
    );
};
