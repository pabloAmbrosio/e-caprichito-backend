import { FastifyInstance } from "fastify";
import addItemToCartRoute from "./add-item-to-cart.route";
import addItemsToCartRoute from "./add-items-to-cart.route";
import updateCartItemRoute from "./update-cart-item.route";
import deleteCartItemRoute from "./delete-cart-item.route";

export const itemsRoutes = async (app: FastifyInstance) => {
    app.register(addItemToCartRoute);
    app.register(addItemsToCartRoute);
    app.register(updateCartItemRoute);
    app.register(deleteCartItemRoute);
};
