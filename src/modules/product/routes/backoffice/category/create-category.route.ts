import { FastifyInstance } from "fastify";
import { createCategoryHandler } from "../../../handlers/backoffice";
import { CreateCategorySchema } from "../../../schemas/create-category.schema";
import { CreateCategoryRouteSpec } from "../../../product-route-specs";
import { BO_CATEGORIES_URL } from "../../../constants";

const schema = { body: CreateCategorySchema };

export default (app: FastifyInstance) => {
    app.post<CreateCategoryRouteSpec>(BO_CATEGORIES_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, createCategoryHandler);
};
