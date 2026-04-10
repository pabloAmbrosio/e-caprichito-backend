import { RouteHandler } from "fastify";
import { updateVariantService } from "../../../services/backoffice/variant/update-variant.service";
import { handleProductError } from "../../../errors";
import { UpdateVariantRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<UpdateVariantRouteSpec> {}

export const updateVariantHandler: Handler = async (request, reply) => {
    try {
        const { id, variantId } = request.params;
        const { msg, data } = await updateVariantService(id, variantId, request.body);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "actualizar variante");
    }
};
