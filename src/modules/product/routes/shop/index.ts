import { FastifyInstance } from "fastify";
import { shopProductProductRoutes } from "./product";
import { shopProductLikeRoutes } from "./like";
import { shopProductCategoryRoutes } from "./category";

export const shopProductRoutes = async (app: FastifyInstance) => {
    app.register(shopProductProductRoutes);
    app.register(shopProductLikeRoutes);
    app.register(shopProductCategoryRoutes);
};
