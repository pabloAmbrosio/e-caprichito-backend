import { FastifyInstance } from "fastify";
import initializeProductRoute from "./initialize-product.route";
import getProductBackofficeRoute from "./get-product-backoffice.route";
import updateProductRoute from "./update-product.route";
import deleteProductRoute from "./delete-product.route";
import changeProductStatusRoute from "./change-product-status.route";

export const backofficeProductProductRoutes = async (app: FastifyInstance) => {
    app.register(initializeProductRoute);
    app.register(getProductBackofficeRoute);
    app.register(updateProductRoute);
    app.register(deleteProductRoute);
    app.register(changeProductStatusRoute);
};
