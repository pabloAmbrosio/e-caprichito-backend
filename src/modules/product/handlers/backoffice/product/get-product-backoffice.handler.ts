import { RouteHandler } from "fastify";
import { getProductBackofficeService } from "../../../services/backoffice/product/get-product-backoffice.service";
import { handleProductError } from "../../../errors";
import { GetProductBackofficeRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<GetProductBackofficeRouteSpec> {}

export const getProductBackofficeHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await getProductBackofficeService(id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "obtener producto");
    }
};
