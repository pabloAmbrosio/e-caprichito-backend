import { RouteHandler } from "fastify";
import { addProductLikeService } from "../../../services/shop/like/add-product-like.service";
import { handleProductError } from "../../../errors";
import { AddProductLikeRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<AddProductLikeRouteSpec> {}

export const addProductLikeHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { id } = request.params;
        const { msg, data } = await addProductLikeService(id, userId);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "dar like");
    }
};
