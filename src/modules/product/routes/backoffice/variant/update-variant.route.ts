import { FastifyInstance } from "fastify";
import { updateVariantHandler } from "../../../handlers/backoffice";
import { VariantParamsSchema } from "../../../schemas/product-params.schema";
import { UpdateVariantSchema } from "../../../schemas/update-variant.schema";
import { UpdateVariantRouteSpec } from "../../../product-route-specs";
import { BO_VARIANT_URL } from "../../../constants";

const schema = { params: VariantParamsSchema, body: UpdateVariantSchema };

export default (app: FastifyInstance) => {
    app.patch<UpdateVariantRouteSpec>(BO_VARIANT_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, updateVariantHandler);
};
