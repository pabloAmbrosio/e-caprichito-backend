import { FastifyInstance } from "fastify";
import { removeCouponFromCartHandler } from "../../../handlers";
import { CART_COUPON_URL } from "../../../constants";

export default (app: FastifyInstance) => {
    app.delete(
        CART_COUPON_URL,
        { preHandler: [app.authenticate] },
        removeCouponFromCartHandler
    );
};
