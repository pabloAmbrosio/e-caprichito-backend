import { FastifyInstance } from "fastify";
import autocompleteRoute from "./autocomplete.route";
import listProductsRoute from "./list-products.route";
import getProductDetailRoute from "./get-product-detail.route";

export const shopProductProductRoutes = async (app: FastifyInstance) => {
    app.register(autocompleteRoute);
    app.register(listProductsRoute);
    app.register(getProductDetailRoute);
};
