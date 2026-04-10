import { FastifyInstance } from "fastify";
import { changeProductStatusHandler } from "../../../handlers/backoffice";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { ChangeProductStatusSchema } from "../../../schemas/change-status.schema";
import { ChangeProductStatusRouteSpec } from "../../../product-route-specs";
import { BO_PRODUCT_STATUS_URL } from "../../../constants";

const schema = { params: ProductIdSchema, body: ChangeProductStatusSchema };

export default (app: FastifyInstance) => {
    app.patch<ChangeProductStatusRouteSpec>(BO_PRODUCT_STATUS_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, changeProductStatusHandler);
};
