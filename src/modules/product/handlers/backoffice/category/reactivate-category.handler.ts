import { RouteHandler } from "fastify";
import { reactivateCategoryService } from "../../../services/backoffice/category/reactivate-category.service";
import { handleProductError } from "../../../errors";
import { ReactivateCategoryRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<ReactivateCategoryRouteSpec> {}

export const reactivateCategoryHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await reactivateCategoryService(id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "reactivar categoría");
    }
};
