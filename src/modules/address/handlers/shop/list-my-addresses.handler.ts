import { RouteHandler } from "fastify";
import { listMyAddressesService } from "../../services/shop";
import { handleAddressError } from "../../errors/handle-address.errors";

interface Handler extends RouteHandler {}

export const listMyAddressesHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await listMyAddressesService(userId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleAddressError(error, reply, request, "listar direcciones");
    }
};
