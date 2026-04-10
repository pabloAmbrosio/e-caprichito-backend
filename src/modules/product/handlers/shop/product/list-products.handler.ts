import { RouteHandler } from "fastify";
import { listProductsService } from "../../../services/shop/product/list-products.service";
import { handleProductError } from "../../../errors";
import { ListProductsRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<ListProductsRouteSpec> {}

export const listProductsHandler: Handler = async (request, reply) => {
    try {
        const filters = {
            ...request.query,
            ...(request.user ? { userId: request.user.userId } : {}),
        };
        const userContext = request.user
            ? { userId: request.user.userId, customerRole: request.user.customerRole }
            : null;
        const { msg, data } = await listProductsService(filters, userContext);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "listar productos");
    }
};
