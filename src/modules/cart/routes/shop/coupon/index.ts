import { FastifyInstance } from "fastify";
import applyCouponToCartRoute from "./apply-coupon-to-cart.route";
import removeCouponFromCartRoute from "./remove-coupon-from-cart.route";

export const couponRoutes = async (app: FastifyInstance) => {
    app.register(applyCouponToCartRoute);
    app.register(removeCouponFromCartRoute);
};
