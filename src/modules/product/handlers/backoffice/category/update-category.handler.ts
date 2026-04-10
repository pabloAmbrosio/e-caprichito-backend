import { RouteHandler } from "fastify";
import { updateCategoryService } from "../../../services/backoffice/category/update-category.service";
import { handleProductError } from "../../../errors";
import { UpdateCategoryRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<UpdateCategoryRouteSpec> {}

export const updateCategoryHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await updateCategoryService(id, request.body);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "actualizar categoría");
    }
};
