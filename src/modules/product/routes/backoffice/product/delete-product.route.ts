import { FastifyInstance } from "fastify";
import { deleteProductHandler } from "../../../handlers/backoffice";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { DeleteProductRouteSpec } from "../../../product-route-specs";
import { BO_PRODUCT_URL } from "../../../constants";

const schema = { params: ProductIdSchema };

export default (app: FastifyInstance) => {
    app.delete<DeleteProductRouteSpec>(
        BO_PRODUCT_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, deleteProductHandler);
};
