import { RouteHandler } from "fastify";
import type { ListShipmentsQuery } from "../../schemas";
import { listShipmentsService } from "../../services/backoffice";
import { handleShipmentError } from "../../errors";

interface Handler extends RouteHandler<{
    Querystring: ListShipmentsQuery;
}> {}

export const listShipmentsHandler: Handler = async (request, reply) => {
    try {
        const { msg, data } = await listShipmentsService(request.query);

        return reply.send({ success: true, msg, ...data });
    } catch (error) {
        return handleShipmentError(error, reply, request, "listar envios");
    }
};
