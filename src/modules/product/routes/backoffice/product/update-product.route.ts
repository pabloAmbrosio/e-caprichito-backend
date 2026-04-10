import { FastifyInstance } from "fastify";
import { updateProductHandler } from "../../../handlers/backoffice";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { UpdateProductSchema } from "../../../schemas/update-product.schema";
import { UpdateProductRouteSpec } from "../../../product-route-specs";
import { BO_PRODUCT_URL } from "../../../constants";

const schema = { params: ProductIdSchema, body: UpdateProductSchema };

export default (app: FastifyInstance) => {
    app.patch<UpdateProductRouteSpec>(BO_PRODUCT_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, updateProductHandler);
};
