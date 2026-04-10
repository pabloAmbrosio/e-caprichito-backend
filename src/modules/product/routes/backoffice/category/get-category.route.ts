import { FastifyInstance } from "fastify";
import { getCategoryHandler } from "../../../handlers/backoffice";
import { CategoryIdSchema } from "../../../schemas/product-params.schema";
import { GetCategoryRouteSpec } from "../../../product-route-specs";
import { BO_CATEGORY_URL } from "../../../constants";

const schema = { params: CategoryIdSchema };

export default (app: FastifyInstance) => {
    app.get<GetCategoryRouteSpec>(BO_CATEGORY_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, getCategoryHandler);
};
