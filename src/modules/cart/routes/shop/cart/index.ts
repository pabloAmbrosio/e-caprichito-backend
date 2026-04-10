import { FastifyInstance } from "fastify";
import getMyCartRoute from "./get-my-cart.route";
import getCartSummaryRoute from "./get-cart-summary.route";
import deleteCartRoute from "./delete-cart.route";
import getCartsHistoryRoute from "./get-carts-history.route";
import restoreCartRoute from "./restore-cart.route";
import validateCartRoute from "./validate-cart.route";

export const cartRoutes = async (app: FastifyInstance) => {
    app.register(getMyCartRoute);
    app.register(getCartSummaryRoute);
    app.register(deleteCartRoute);
    app.register(getCartsHistoryRoute);
    app.register(restoreCartRoute);
    app.register(validateCartRoute);
};
