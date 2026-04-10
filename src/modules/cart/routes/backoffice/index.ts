import { FastifyInstance } from "fastify";
import listCartsRoute from "./list-carts.route";
import getCartByIdRoute from "./get-cart-by-id.route";
import deleteCartRoute from "./delete-cart.route";
import listAbandonedCartsRoute from "./list-abandoned-carts.route";

export const backofficeCartRoutes = async (app: FastifyInstance) => {
    app.register(listCartsRoute);
    app.register(getCartByIdRoute);
    app.register(deleteCartRoute);
    app.register(listAbandonedCartsRoute);
};
