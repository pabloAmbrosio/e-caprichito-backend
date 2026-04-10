import { RouteHandler } from "fastify";
import { createCategoryService } from "../../../services/backoffice/category/create-category.service";
import { handleProductError } from "../../../errors";
import { CreateCategoryRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<CreateCategoryRouteSpec> {}

export const createCategoryHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await createCategoryService(request.body);
        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "crear categoría");
    }
};
