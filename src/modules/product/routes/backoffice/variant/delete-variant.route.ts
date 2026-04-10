import { FastifyInstance } from "fastify";
import { deleteVariantHandler } from "../../../handlers/backoffice";
import { VariantParamsSchema } from "../../../schemas/product-params.schema";
import { DeleteVariantRouteSpec } from "../../../product-route-specs";
import { BO_VARIANT_URL } from "../../../constants";

const schema = { params: VariantParamsSchema };

export default (app: FastifyInstance) => {
    app.delete<DeleteVariantRouteSpec>(BO_VARIANT_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, deleteVariantHandler);
};
