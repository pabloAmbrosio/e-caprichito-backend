import { RouteHandler } from "fastify";
import { getProductDetailService } from "../../../services/shop/product/get-product-detail.service";
import { handleProductError } from "../../../errors";
import { GetProductDetailRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<GetProductDetailRouteSpec> {}

export const getProductDetailHandler: Handler = async (request, reply) => {
    try {
        const { idOrSlug } = request.params;
        const userContext = request.user
            ? { userId: request.user.userId, customerRole: request.user.customerRole ?? null }
            : null;
        const { msg, data } = await getProductDetailService(idOrSlug, userContext);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "obtener producto");
    }
};
