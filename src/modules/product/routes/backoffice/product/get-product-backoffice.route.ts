import { FastifyInstance } from "fastify";
import { getProductBackofficeHandler } from "../../../handlers/backoffice";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { GetProductBackofficeRouteSpec } from "../../../product-route-specs";
import { BO_PRODUCT_URL } from "../../../constants";

const schema = { params: ProductIdSchema };

export default (app: FastifyInstance) => {
    app.get<GetProductBackofficeRouteSpec>(BO_PRODUCT_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, getProductBackofficeHandler);
};
