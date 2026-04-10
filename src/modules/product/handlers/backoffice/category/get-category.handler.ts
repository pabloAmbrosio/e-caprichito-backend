import { RouteHandler } from "fastify";
import { getCategoryService } from "../../../services/backoffice/category/get-category.service";
import { handleProductError } from "../../../errors";
import { GetCategoryRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<GetCategoryRouteSpec> {}

export const getCategoryHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await getCategoryService(id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "obtener categoría");
    }
};
