import { FastifyRequest, FastifyReply } from "fastify";
import { listOrdersBackofficeService } from "../../services";
import { OrderSearchInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
    Querystring: OrderSearchInput;
}> {}

export const listOrdersHandler = async (request: HandlerRequest, reply: FastifyReply) => {
    try {
        const { msg, data } = await listOrdersBackofficeService(request.query);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "listar ordenes");
    }
};
