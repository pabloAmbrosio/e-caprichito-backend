import { RouteHandler } from "fastify";
import { deleteProductService } from "../../../services/backoffice/product/delete-product.service";
import { handleProductError } from "../../../errors";
import { DeleteProductRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<DeleteProductRouteSpec> {}

export const deleteProductHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await deleteProductService(id);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "eliminar producto");
    }
};
