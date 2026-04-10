import { RouteHandler } from "fastify";
import { removeProductLikeService } from "../../../services/shop/like/remove-product-like.service";
import { handleProductError } from "../../../errors";
import { RemoveProductLikeRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<RemoveProductLikeRouteSpec> {}

export const removeProductLikeHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { id } = request.params;
        const { msg, data } = await removeProductLikeService(id, userId);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "quitar like");
    }
};
