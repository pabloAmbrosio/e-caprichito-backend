import { RouteHandler } from "fastify";
import { listUserAddressesService } from "../../services/backoffice";
import { ListUserAddressesInput } from "../../schemas";
import { handleAddressError } from "../../errors/handle-address.errors";

interface Handler extends RouteHandler<{
    Querystring: ListUserAddressesInput;
}> {}

export const listUserAddressesHandler: Handler = async (request, reply) => {
    try {
        const { userId } = request.query;
        const { msg, data } = await listUserAddressesService(userId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleAddressError(error, reply, request, "listar direcciones del usuario");
    }
};
