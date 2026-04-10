import { FastifyInstance } from "fastify";
import { reactivateCategoryHandler } from "../../../handlers/backoffice";
import { CategoryIdSchema } from "../../../schemas/product-params.schema";
import { ReactivateCategoryRouteSpec } from "../../../product-route-specs";
import { BO_CATEGORY_REACTIVATE_URL } from "../../../constants";

const schema = { params: CategoryIdSchema };

export default (app: FastifyInstance) => {
    app.post<ReactivateCategoryRouteSpec>(BO_CATEGORY_REACTIVATE_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, reactivateCategoryHandler);
};
