import { RouteHandler } from "fastify";
import { deleteVariantService } from "../../../services/backoffice/variant/delete-variant.service";
import { handleProductError } from "../../../errors";
import { DeleteVariantRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<DeleteVariantRouteSpec> {}

export const deleteVariantHandler: Handler = async (request, reply) => {
    try {
        const { id, variantId } = request.params;
        const { msg, data } = await deleteVariantService(id, variantId);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "eliminar variante");
    }
};
