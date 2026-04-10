import { FastifyInstance } from "fastify";
import { cartRoutes } from "./cart";
import { itemsRoutes } from "./items";
import { couponRoutes } from "./coupon";

export const shopCartRoutes = async (app: FastifyInstance) => {
    app.register(cartRoutes);
    app.register(itemsRoutes);
    app.register(couponRoutes);
};
