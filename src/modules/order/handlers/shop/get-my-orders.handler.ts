import { FastifyRequest, FastifyReply } from "fastify";
import { listCustomerOrdersService } from "../../services";
import { ShopOrderPaginationInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
    Querystring: ShopOrderPaginationInput;
}> {}

export const getMyOrdersHandler = async (request: HandlerRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await listCustomerOrdersService({ userId, ...request.query });

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "obtener las ordenes");
    }
};
