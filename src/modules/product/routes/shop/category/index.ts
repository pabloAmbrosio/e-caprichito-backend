import { FastifyInstance } from "fastify";
import listCategoriesRoute from "./list-categories.route";

export const shopProductCategoryRoutes = async (app: FastifyInstance) => {
    app.register(listCategoriesRoute);
};
