import { RouteHandler } from "fastify";
import { initializeProductService } from "../../../services/backoffice/product/initialize-product.service";
import { handleProductError } from "../../../errors";
import { InitializeProductRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<InitializeProductRouteSpec> {}

export const initializeProductHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await initializeProductService(request.body, userId);
        return reply.status(201).send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "inicializar producto");
    }
};
