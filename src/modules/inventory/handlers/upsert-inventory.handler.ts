import { RouteHandler } from "fastify";
import { upsertInventoryService } from "../services";
import { CreateInventoryInput } from "../schemas";
import { handleInventoryError } from "../errors";

interface Handler extends RouteHandler<{
    Body: CreateInventoryInput
}> {}

export const upsertInventoryHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await upsertInventoryService(request.body);

        request.log.info({
            action: "UPSERT_INVENTORY",
            userId: request.user?.userId,
            productId: request.body.productId,
            physicalStock: request.body.physicalStock
        }, "Inventario actualizado");

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleInventoryError(error, reply, request, "actualizar inventario");
    }
};
