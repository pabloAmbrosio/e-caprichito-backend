import { FastifyRequest, FastifyReply } from "fastify";
import { getOrderByIdBackofficeService } from "../../services";
import { OrderIdInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
    Params: OrderIdInput;
}> {}

export const getOrderByIdHandler = async (request: HandlerRequest, reply: FastifyReply) => {
    try {
        const { orderId } = request.params;
        const { msg, data } = await getOrderByIdBackofficeService(orderId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "obtener orden");
    }
};
