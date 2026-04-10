import { RouteHandler } from "fastify";
import { listInventoryService } from "../services";
import { ListInventoryQueryInput } from "../schemas";
import { handleInventoryError } from "../errors";

interface Handler extends RouteHandler<{
    Querystring: ListInventoryQueryInput
}> {}

export const listInventoryHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await listInventoryService(request.query);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleInventoryError(error, reply, request, "listar inventario");
    }
};
