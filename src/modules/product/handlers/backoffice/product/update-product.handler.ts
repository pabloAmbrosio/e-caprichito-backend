import { RouteHandler } from "fastify";
import { updateProductService } from "../../../services/backoffice/product/update-product.service";
import { handleProductError } from "../../../errors";
import { UpdateProductRouteSpec } from "../../../product-route-specs";

interface Handler extends RouteHandler<UpdateProductRouteSpec> {}

export const updateProductHandler: Handler = async (request, reply) => {
    try {
        const { id } = request.params;
        const { msg, data } = await updateProductService(id, request.body);
        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleProductError(error, reply, request, "actualizar producto");
    }
};
