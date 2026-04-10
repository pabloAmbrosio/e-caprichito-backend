import { RouteHandler } from "fastify";
import { reserveStockService } from "../services";
import { StockOperationInput } from "../schemas";
import { handleInventoryError } from "../errors";

interface Handler extends RouteHandler<{
    Body: StockOperationInput
}> {}

export const reserveStockHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await reserveStockService(request.body);

        request.log.info({
            action: "RESERVE_STOCK",
            userId: request.user?.userId,
            productId: request.body.productId,
            quantity: request.body.quantity
        }, "Stock reservado");

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleInventoryError(error, reply, request, "reservar stock");
    }
};
