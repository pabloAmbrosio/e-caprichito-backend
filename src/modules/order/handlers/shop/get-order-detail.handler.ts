import { FastifyRequest, FastifyReply } from "fastify";
import { getOrderDetailService } from "../../services";
import { OrderIdInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
    Params: OrderIdInput;
}> {}

export const getOrderDetailHandler = async (request: HandlerRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await getOrderDetailService(request.params.orderId, userId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "obtener detalle de orden");
    }
};
