import { FastifyInstance } from "fastify";
import { addVariantsHandler } from "../../../handlers/backoffice";
import { ProductIdSchema } from "../../../schemas/product-params.schema";
import { AddVariantsSchema } from "../../../schemas/add-variants.schema";
import { AddVariantsRouteSpec } from "../../../product-route-specs";
import { BO_PRODUCT_VARIANTS_URL } from "../../../constants";

const schema = { params: ProductIdSchema, body: AddVariantsSchema };

export default (app: FastifyInstance) => {
    app.post<AddVariantsRouteSpec>(BO_PRODUCT_VARIANTS_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, addVariantsHandler);
};
