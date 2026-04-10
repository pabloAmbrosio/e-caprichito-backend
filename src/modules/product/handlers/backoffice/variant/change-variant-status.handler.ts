import { RouteHandler } from "fastify";
import { changeVariantStatusService } from "../../../services/backoffice/variant/change-variant-status.service";
import { handleProductError } from "../../../errors";
import { ChangeVariantStatusRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<ChangeVariantStatusRouteSpec> {}

export const changeVariantStatusHandler: Handler = async (request, reply) => {
    try {
        const { id, variantId } = request.params;
        const { status } = request.body;
        const { msg, data } = await changeVariantStatusService(id, variantId, status);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "cambiar status de variante");
    }
};
