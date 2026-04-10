import { RouteHandler } from "fastify";
import { getLikedProductsService } from "../../../services/shop/like/get-liked-products.service";
import { handleProductError } from "../../../errors";
import { GetLikedProductsRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<GetLikedProductsRouteSpec> {}

export const getLikedProductsHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { limit, offset } = request.query;
        const { msg, data } = await getLikedProductsService(userId, limit, offset);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "obtener favoritos");
    }
};
