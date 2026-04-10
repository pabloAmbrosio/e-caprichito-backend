import { RouteHandler } from "fastify";
import { getLikedProductIdsService } from "../../../services/shop/like/get-liked-product-ids.service";
import { handleProductError } from "../../../errors";
import { GetLikedProductIdsRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<GetLikedProductIdsRouteSpec> {}

export const getLikedProductIdsHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await getLikedProductIdsService(userId);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "obtener IDs de favoritos");
    }
};
