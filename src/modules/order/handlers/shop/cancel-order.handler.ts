import { FastifyRequest, FastifyReply } from "fastify";
import { cancelOrderService } from "../../services";
import { OrderIdInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
    Params: OrderIdInput;
}> {}

export const cancelOrderHandler = async (request: HandlerRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user;
        const { orderId } = request.params;
        const { msg, data } = await cancelOrderService({ userId, orderId });

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "cancelar la orden");
    }
};
