import { FastifyInstance } from "fastify";
import { changeVariantStatusHandler } from "../../../handlers/backoffice";
import { VariantParamsSchema } from "../../../schemas/product-params.schema";
import { ChangeProductStatusSchema } from "../../../schemas/change-status.schema";
import { ChangeVariantStatusRouteSpec } from "../../../product-route-specs";
import { BO_VARIANT_STATUS_URL } from "../../../constants";

const schema = { params: VariantParamsSchema, body: ChangeProductStatusSchema };

export default (app: FastifyInstance) => {
    app.patch<ChangeVariantStatusRouteSpec>(BO_VARIANT_STATUS_URL, { preHandler: [app.authenticate, app.requireRoles(["OWNER", "ADMIN"])], schema }, changeVariantStatusHandler);
};
