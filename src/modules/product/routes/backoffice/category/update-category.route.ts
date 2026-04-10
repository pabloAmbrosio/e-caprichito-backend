import { FastifyInstance } from "fastify";
import { updateCategoryHandler } from "../../../handlers/backoffice";
import { CategoryIdSchema } from "../../../schemas/product-params.schema";
import { UpdateCategorySchema } from "../../../schemas/update-category.schema";
import { UpdateCategoryRouteSpec } from "../../../product-route-specs";
import { BO_CATEGORY_URL } from "../../../constants";

const schema = { params: CategoryIdSchema, body: UpdateCategorySchema };

export default (app: FastifyInstance) => {
    app.patch<UpdateCategoryRouteSpec>(BO_CATEGORY_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, updateCategoryHandler);
};
