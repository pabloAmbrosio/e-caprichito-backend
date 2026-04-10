import { FastifyRequest, FastifyReply } from "fastify";
import { getPaymentInfoService } from "../../services";
import { OrderIdInput } from "../../schemas";
import { handleOrderError } from "../../errors";

interface HandlerRequest extends FastifyRequest<{
    Params: OrderIdInput;
}> {}

export const getPaymentInfoHandler = async (request: HandlerRequest, reply: FastifyReply) => {
    try {
        const { userId } = request.user;
        const { msg, data } = await getPaymentInfoService(request.params.orderId, userId);

        return reply.send({ success: true, msg, data });
    } catch (error) {
        return handleOrderError(error, reply, request, "obtener info de pago");
    }
};
