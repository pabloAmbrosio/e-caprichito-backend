import { FastifyInstance } from "fastify";
import createCategoryRoute from "./create-category.route";
import listCategoriesBackofficeRoute from "./list-categories-backoffice.route";
import getCategoryRoute from "./get-category.route";
import updateCategoryRoute from "./update-category.route";
import deleteCategoryRoute from "./delete-category.route";
import reactivateCategoryRoute from "./reactivate-category.route";

export const backofficeProductCategoryRoutes = async (app: FastifyInstance) => {
    app.register(createCategoryRoute);
    app.register(listCategoriesBackofficeRoute);
    app.register(getCategoryRoute);
    app.register(updateCategoryRoute);
    app.register(deleteCategoryRoute);
    app.register(reactivateCategoryRoute);
};
