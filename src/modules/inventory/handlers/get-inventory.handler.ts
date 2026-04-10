import { RouteHandler } from "fastify";
import { getInventoryService } from "../services";
import { ProductIdParamInput } from "../schemas";
import { handleInventoryError } from "../errors";

interface Handler extends RouteHandler<{
    Params: ProductIdParamInput
}> {}

export const getInventoryHandler: Handler = async (request, reply) => {
    try {
        const { productId } = request.params;
        const { msg, data } = await getInventoryService(productId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleInventoryError(error, reply, request, "consultar inventario");
    }
};
