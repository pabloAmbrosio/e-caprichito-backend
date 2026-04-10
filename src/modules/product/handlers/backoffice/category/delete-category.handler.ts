import { RouteHandler } from "fastify";
import { deleteCategoryService } from "../../../services/backoffice/category/delete-category.service";
import { handleProductError } from "../../../errors";
import { DeleteCategoryRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<DeleteCategoryRouteSpec> {}

export const deleteCategoryHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await deleteCategoryService(id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "eliminar categoría");
    }
};
