import { FastifyInstance } from "fastify";
import addVariantsRoute from "./add-variants.route";
import updateVariantRoute from "./update-variant.route";
import deleteVariantRoute from "./delete-variant.route";
import changeVariantStatusRoute from "./change-variant-status.route";

export const backofficeProductVariantRoutes = async (app: FastifyInstance) => {
    app.register(addVariantsRoute);
    app.register(updateVariantRoute);
    app.register(deleteVariantRoute);
    app.register(changeVariantStatusRoute);
};
