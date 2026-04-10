import { FastifyInstance } from "fastify";
import { deleteCategoryHandler } from "../../../handlers/backoffice";
import { CategoryIdSchema } from "../../../schemas/product-params.schema";
import { DeleteCategoryRouteSpec } from "../../../product-route-specs";
import { BO_CATEGORY_URL } from "../../../constants";

const schema = { params: CategoryIdSchema };

export default (app: FastifyInstance) => {
    app.delete<DeleteCategoryRouteSpec>(BO_CATEGORY_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, deleteCategoryHandler);
};
