import { RouteHandler } from "fastify";
import { changeProductStatusService } from "../../../services/backoffice/product/change-product-status.service";
import { handleProductError } from "../../../errors";
import { ChangeProductStatusRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<ChangeProductStatusRouteSpec> {}

export const changeProductStatusHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { status } = request.body;
        const { msg, data } = await changeProductStatusService(id, status);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "cambiar status de producto");
    }
};
