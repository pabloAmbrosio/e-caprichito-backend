import { FastifyInstance } from "fastify";
import addProductLikeRoute from "./add-product-like.route";
import removeProductLikeRoute from "./remove-product-like.route";
import getLikedProductsRoute from "./get-liked-products.route";
import getLikedProductIdsRoute from "./get-liked-product-ids.route";

export const shopProductLikeRoutes = async (app: FastifyInstance) => {
    app.register(addProductLikeRoute);
    app.register(removeProductLikeRoute);
    app.register(getLikedProductsRoute);
    app.register(getLikedProductIdsRoute);
};
