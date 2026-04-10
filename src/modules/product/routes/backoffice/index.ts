import { FastifyInstance } from "fastify";
import { backofficeProductProductRoutes } from "./product";
import { backofficeProductVariantRoutes } from "./variant";
import { backofficeProductCategoryRoutes } from "./category";

export const backofficeProductRoutes = async (app: FastifyInstance) => {
    app.register(backofficeProductProductRoutes);
    app.register(backofficeProductVariantRoutes);
    app.register(backofficeProductCategoryRoutes);
};
