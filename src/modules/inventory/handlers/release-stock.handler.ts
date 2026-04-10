import { RouteHandler } from "fastify";
import { releaseStockService } from "../services";
import { StockOperationInput } from "../schemas";
import { handleInventoryError } from "../errors";

interface Handler extends RouteHandler<{
    Body: StockOperationInput
}> {}

export const releaseStockHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await releaseStockService(request.body);

        request.log.info({
            action: "RELEASE_STOCK",
            userId: request.user?.userId,
            productId: request.body.productId,
            quantity: request.body.quantity
        }, "Stock liberado");

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleInventoryError(error, reply, request, "liberar stock");
    }
};
